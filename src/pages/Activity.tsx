import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useActivityFeed } from '../hooks/useActivityFeed'
import { useLists } from '../hooks/useLists'
import { useOnboarding } from '../hooks/useOnboarding'
import { getNextBestAction } from '../lib/onboarding'
import { GuidedOnboardingCard } from '../components/onboarding/GuidedOnboardingCard'
import { formatRelativeTime } from '../lib/time'
import {
  groupActivityEventsByCollection,
  groupActivityEventsByDay,
  groupActivityEventsByMerchant,
} from '../lib/activity'

type ActivityTypeFilter = 'all' | 'price' | 'availability'
type ActivityGroupBy = 'day' | 'merchant' | 'collection'

export function Activity() {
  const { user } = useAuth()
  const { events, loading, error, refetch } = useActivityFeed(user?.id || null)
  const { lists, loading: listsLoading } = useLists(user?.id || null)
  const { state: onboardingState, nextStep, progress, isGuideVisible, dismissGuide } = useOnboarding(user?.id || null)
  const [typeFilter, setTypeFilter] = useState<ActivityTypeFilter>('all')
  const [listFilter, setListFilter] = useState<string>('all')
  const [merchantFilter, setMerchantFilter] = useState<string>('all')
  const [groupBy, setGroupBy] = useState<ActivityGroupBy>('day')

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (typeFilter !== 'all' && event.type !== typeFilter) {
        return false
      }

      if (listFilter !== 'all' && event.listId !== listFilter) {
        return false
      }

      if (merchantFilter !== 'all' && event.merchant !== merchantFilter) {
        return false
      }

      return true
    })
  }, [events, listFilter, merchantFilter, typeFilter])

  const groupedEvents = useMemo(() => {
    if (groupBy === 'merchant') {
      return groupActivityEventsByMerchant(filteredEvents)
    }

    if (groupBy === 'collection') {
      return groupActivityEventsByCollection(filteredEvents)
    }

    return groupActivityEventsByDay(filteredEvents)
  }, [filteredEvents, groupBy])

  const merchantOptions = useMemo(() => {
    return [...new Set(events.map((event) => event.merchant).filter((value): value is string => Boolean(value)))]
      .sort((a, b) => a.localeCompare(b))
  }, [events])

  const nextBestAction = getNextBestAction({
    page: 'activity',
    state: onboardingState,
    hasCollections: lists.length > 0,
    hasItems: false,
    primaryCollectionId: lists[0]?.id || null,
  })

  const hasActiveFilter = typeFilter !== 'all' || listFilter !== 'all' || merchantFilter !== 'all'

  if (loading || listsLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-white" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {isGuideVisible && (
        <GuidedOnboardingCard
          action={nextBestAction}
          nextStep={nextStep}
          completedSteps={onboardingState.completedSteps}
          progressLabel={`${progress.completed}/${progress.total} steps complete`}
          onDismissGuide={dismissGuide}
        />
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Activity Timeline</h2>
            <p className="mt-1 text-slate-600">
              Track every price and availability check across your collections and jump directly to the affected item.
            </p>
          </div>

          <button onClick={() => void refetch()} className="btn-secondary !px-3 !py-1.5 text-sm">
            Refresh
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-[auto_auto_1fr_auto]">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-1.5">
            <TypeFilterButton active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
              All
            </TypeFilterButton>
            <TypeFilterButton active={typeFilter === 'price'} onClick={() => setTypeFilter('price')}>
              Price
            </TypeFilterButton>
            <TypeFilterButton active={typeFilter === 'availability'} onClick={() => setTypeFilter('availability')}>
              Availability
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

          <select
            value={merchantFilter}
            onChange={(event) => setMerchantFilter(event.target.value)}
            className="input-field !py-2"
            aria-label="Filter by merchant"
          >
            <option value="all">All merchants</option>
            {merchantOptions.map((merchant) => (
              <option key={merchant} value={merchant}>
                {merchant}
              </option>
            ))}
          </select>

          {hasActiveFilter && (
            <button
              onClick={() => {
                setTypeFilter('all')
                setListFilter('all')
                setMerchantFilter('all')
              }}
              className="btn-ghost text-sm"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-2">
          <span className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Group by
          </span>
          <TypeFilterButton active={groupBy === 'day'} onClick={() => setGroupBy('day')}>
            Day
          </TypeFilterButton>
          <TypeFilterButton active={groupBy === 'merchant'} onClick={() => setGroupBy('merchant')}>
            Merchant
          </TypeFilterButton>
          <TypeFilterButton active={groupBy === 'collection'} onClick={() => setGroupBy('collection')}>
            Collection
          </TypeFilterButton>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : groupedEvents.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No events match the selected filters.
        </div>
      ) : (
        <div className="space-y-6">
          {groupedEvents.map((group) => (
            <section key={group.label} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3
                  className={`text-sm font-bold tracking-wide text-slate-500 ${
                    groupBy === 'day' ? 'uppercase' : ''
                  }`}
                >
                  {group.label}
                </h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {group.events.length}
                </span>
              </div>

              <div className="space-y-3">
                {group.events.map((event) => (
                  <article key={event.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{event.itemTitle}</p>
                          {event.merchant && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                              {event.merchant}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">{event.message}</p>
                        <p className="mt-1 text-xs text-slate-400">{event.listName}</p>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2 text-right">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            event.type === 'price'
                              ? 'bg-primary-100 text-primary-700'
                              : event.tone === 'good'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {event.type === 'price' ? 'Price' : 'Availability'}
                        </span>
                        <p className="text-[11px] text-slate-400">{formatRelativeTime(event.checkedAt)}</p>

                        {event.listId ? (
                          <Link
                            to={event.itemId ? `/collections/${event.listId}?focusItem=${event.itemId}` : `/collections/${event.listId}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                          >
                            Jump
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400">No linked collection</span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
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
      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
        active ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  )
}
