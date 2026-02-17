import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import { useLists } from '../hooks/useLists'
import { formatRelativeTime } from '../lib/time'
import { groupNotificationsByDay, getUnreadCount } from '../lib/notifications'
import type { NotificationType } from '../lib/notifications'
import { PageHeader } from '../components/layout/PageHeader'

type NotificationTypeFilter = 'all' | NotificationType

export function Notifications() {
  const { user } = useAuth()
  const { notifications, loading, error, refetch, markAsRead, markAsUnread, clearAll, markAllAsRead } =
    useNotifications(user?.id || null)
  const { lists } = useLists(user?.id || null)
  const [typeFilter, setTypeFilter] = useState<NotificationTypeFilter>('all')
  const [listFilter, setListFilter] = useState<string>('all')

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (typeFilter !== 'all' && notif.type !== typeFilter) {
        return false
      }

      if (listFilter !== 'all' && notif.listId !== listFilter) {
        return false
      }

      return true
    })
  }, [notifications, listFilter, typeFilter])

  const groupedNotifications = useMemo(
    () => groupNotificationsByDay(filteredNotifications),
    [filteredNotifications],
  )

  const unreadCount = useMemo(() => getUnreadCount(notifications), [notifications])
  const hasActiveFilter = typeFilter !== 'all' || listFilter !== 'all'

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-white" />
        ))}
      </div>
    )
  }

  const getNotificationTypeLabel = (type: NotificationType): string => {
    const labels: Record<NotificationType, string> = {
      price_drop: 'Price Drop',
      back_in_stock: 'Back in Stock',
      out_of_stock: 'Out of Stock',
      system: 'System',
    }
    return labels[type]
  }

  const getNotificationTypeBadgeClass = (type: NotificationType): string => {
    const classes: Record<NotificationType, string> = {
      price_drop: 'bg-primary-100 text-primary-700',
      back_in_stock: 'bg-emerald-100 text-emerald-700',
      out_of_stock: 'bg-rose-100 text-rose-700',
      system: 'bg-slate-100 text-slate-600',
    }
    return classes[type]
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Notifications"
        description="Stay updated on price changes and availability across your collections."
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Notifications' },
        ]}
        actions={(
          <>
            <Link to="/activity" className="btn-secondary !px-3 !py-1.5 text-sm whitespace-nowrap">
              Open Activity
            </Link>
            {unreadCount > 0 && (
              <button
                onClick={() => void markAllAsRead()}
                className="btn-secondary !px-3 !py-1.5 text-sm whitespace-nowrap"
              >
                Mark all as read
              </button>
            )}
            <button onClick={() => void refetch()} className="btn-secondary !px-3 !py-1.5 text-sm">
              Refresh
            </button>
          </>
        )}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[auto_1fr_auto]">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-1.5 overflow-x-auto">
            <TypeFilterButton active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
              All
            </TypeFilterButton>
            <TypeFilterButton
              active={typeFilter === 'price_drop'}
              onClick={() => setTypeFilter('price_drop')}
            >
              Price
            </TypeFilterButton>
            <TypeFilterButton
              active={typeFilter === 'back_in_stock'}
              onClick={() => setTypeFilter('back_in_stock')}
            >
              In Stock
            </TypeFilterButton>
            <TypeFilterButton
              active={typeFilter === 'out_of_stock'}
              onClick={() => setTypeFilter('out_of_stock')}
            >
              Out Stock
            </TypeFilterButton>
          </div>

          <select
            value={listFilter}
            onChange={(event) => setListFilter(event.target.value)}
            className="input-field !py-2"
            aria-label="Filter by collection"
          >
            <option value="all">All collections</option>
            {lists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>

          {hasActiveFilter && (
            <button
              onClick={() => {
                setTypeFilter('all')
                setListFilter('all')
              }}
              className="btn-ghost text-sm whitespace-nowrap"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : groupedNotifications.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-3 w-3 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-1.5 w-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No notifications yet</h3>
          <p className="mt-2 text-sm text-slate-600">
            {hasActiveFilter
              ? 'No notifications match your filters. Try adjusting them.'
              : "You're all caught up! Check back later for price changes and availability updates."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedNotifications.map((group) => (
            <section key={group.label} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{group.label}</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {group.notifications.length}
                </span>
              </div>

              <div className="space-y-3">
                {group.notifications.map((notif) => (
                  <article
                    key={notif.id}
                    className={`rounded-xl border p-4 shadow-sm transition ${
                      notif.isRead
                        ? 'border-slate-200 bg-white'
                        : 'border-primary-200 bg-primary-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p
                            className={`text-sm font-semibold ${
                              notif.isRead ? 'text-slate-600' : 'text-slate-900'
                            }`}
                          >
                            {notif.itemTitle}
                          </p>
                          {notif.merchant && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                              {notif.merchant}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${notif.isRead ? 'text-slate-500' : 'text-slate-600'}`}>
                          {notif.message}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">{notif.listName}</p>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2 text-right">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${getNotificationTypeBadgeClass(
                            notif.type,
                          )}`}
                        >
                          {getNotificationTypeLabel(notif.type)}
                        </span>
                        <p className="text-[11px] text-slate-400">{formatRelativeTime(notif.createdAt)}</p>

                        <div className="flex items-center gap-1">
                          {notif.itemId && notif.listId ? (
                            <Link
                              to={`/collections/${notif.listId}?focusItem=${notif.itemId}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                            >
                              Jump
                              <svg
                                className="h-1 w-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </Link>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-400">No item link</span>
                          )}

                          <button
                            onClick={() =>
                              notif.isRead
                                ? void markAsUnread(notif.id)
                                : void markAsRead(notif.id)
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                            title={notif.isRead ? 'Mark as unread' : 'Mark as read'}
                          >
                            {notif.isRead ? (
                              <svg
                                className="h-1 w-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M13 16H5V8m0 0L1 4m4 4l4-4m8 0h8v8m0 0l4 4m-4-4l-4 4"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="h-1 w-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}

          <div className="flex justify-center pt-4">
            <button onClick={() => void clearAll()} className="btn-ghost text-sm text-red-600 hover:bg-red-50">
              Clear all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function TypeFilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors whitespace-nowrap ${
        active ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  )
}
