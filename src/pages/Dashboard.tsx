import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLists } from '../hooks/useLists'
import { useFolders } from '../hooks/useFolders'
import { useActivityFeed } from '../hooks/useActivityFeed'
import { formatRelativeTime } from '../lib/time'
import { useOnboarding } from '../hooks/useOnboarding'
import { getNextBestAction } from '../lib/onboarding'
import { GuidedOnboardingCard } from '../components/onboarding/GuidedOnboardingCard'

export function Dashboard() {
  const { user } = useAuth()
  const { lists, loading: listsLoading } = useLists(user?.id || null)
  const { folders, loading: foldersLoading } = useFolders(user?.id || null)
  const { events, loading: activityLoading } = useActivityFeed(user?.id || null)
  const {
    state: onboardingState,
    nextStep,
    progress: onboardingProgress,
    hydrated: onboardingHydrated,
    isGuideVisible,
    dismissGuide,
    completeStep,
    isStepComplete,
  } = useOnboarding(user?.id || null)

  const loading = listsLoading || foldersLoading || activityLoading

  useEffect(() => {
    if (!onboardingHydrated || isStepComplete('dashboard')) return
    completeStep('dashboard')
  }, [completeStep, isStepComplete, onboardingHydrated])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 animate-pulse rounded-2xl bg-white" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      </div>
    )
  }

  const recentLists = [...lists]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 4)
  const primaryCollectionId = recentLists[0]?.id || lists[0]?.id || null
  const nextBestAction = getNextBestAction({
    page: 'dashboard',
    state: onboardingState,
    hasCollections: lists.length > 0,
    hasItems: false,
    primaryCollectionId,
  })

  return (
    <div className="space-y-8">
      {isGuideVisible && (
        <GuidedOnboardingCard
          action={nextBestAction}
          nextStep={nextStep}
          completedSteps={onboardingState.completedSteps}
          progressLabel={`${onboardingProgress.completed}/${onboardingProgress.total} steps complete`}
          onDismissGuide={dismissGuide}
        />
      )}

      <section className="relative overflow-hidden rounded-3xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-200/50 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-amber-200/40 blur-2xl" />
        </div>

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="kicker">Dashboard</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Your shopping control center</h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Review collections, track price movement, and jump straight to what matters next.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={nextBestAction.ctaTo} className="btn-primary">
              {nextBestAction.ctaLabel}
            </Link>
            <Link to="/collections" className="btn-primary">Go to Collections</Link>
            <Link to="/activity" className="btn-secondary">Open Activity</Link>
            <Link to="/search" className="btn-ghost">Open Search</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Link to="/collections?intent=create-collection" className="surface-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Start fast</p>
          <p className="mt-1 text-lg font-bold text-slate-900">Create a collection</p>
          <p className="mt-1 text-sm text-slate-600">Group products by purpose, season, or event.</p>
        </Link>
        <Link to="/search" className="surface-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Explore</p>
          <p className="mt-1 text-lg font-bold text-slate-900">Search everything</p>
          <p className="mt-1 text-sm text-slate-600">Find items instantly across every collection.</p>
        </Link>
        <Link to="/activity" className="surface-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Track changes</p>
          <p className="mt-1 text-lg font-bold text-slate-900">Open activity feed</p>
          <p className="mt-1 text-sm text-slate-600">Watch price and stock updates in one timeline.</p>
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Collections" value={lists.length.toString()} helper="Total active collections" />
        <MetricCard label="Folders" value={folders.length.toString()} helper="Organization groups" />
        <MetricCard
          label="Unassigned"
          value={lists.filter((list) => !list.folder_id).length.toString()}
          helper="Collections not in a folder"
        />
        <MetricCard
          label="Recent Events"
          value={events.slice(0, 24).length.toString()}
          helper="Latest price/stock checks"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recently Updated Collections</h3>
            <Link to="/collections" className="text-sm font-semibold text-primary-700 hover:text-primary-800">View all</Link>
          </div>

          {recentLists.length === 0 ? (
            <p className="text-sm text-slate-500">No collections yet. Create your first one from the Collections page.</p>
          ) : (
            <div className="space-y-2">
              {recentLists.map((list) => (
                <Link
                  key={list.id}
                  to={`/collections/${list.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 transition hover:border-primary-300 hover:bg-primary-50/40"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{list.name}</p>
                    <p className="text-xs text-slate-500">Updated {formatRelativeTime(list.updated_at)}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">Open</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Latest Activity</h3>
            <Link to="/activity" className="text-sm font-semibold text-primary-700 hover:text-primary-800">View timeline</Link>
          </div>

          {events.length === 0 ? (
            <p className="text-sm text-slate-500">No tracking activity yet. Run “Check Prices Now” in a collection.</p>
          ) : (
            <div className="space-y-2">
              {events.slice(0, 6).map((event) => (
                <div key={event.id} className="rounded-xl border border-slate-200 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{event.itemTitle}</p>
                    <span className="text-[11px] font-medium text-slate-400">{formatRelativeTime(event.checkedAt)}</span>
                  </div>
                  <p className="text-xs text-slate-600">{event.message}</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-[11px] text-slate-400">{event.listName}</p>
                    {event.listId && (
                      <Link
                        to={event.itemId ? `/collections/${event.listId}?focusItem=${event.itemId}` : `/collections/${event.listId}`}
                        className="text-[11px] font-semibold text-primary-700 hover:text-primary-800"
                      >
                        Jump
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function MetricCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <article className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </article>
  )
}
