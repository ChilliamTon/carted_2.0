import { Suspense, lazy, useState, useEffect, useMemo, useRef } from 'react'
import { Routes, Route, Navigate, NavLink, useSearchParams, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useNotifications } from './hooks/useNotifications'
import { getUnreadCount } from './lib/notifications'
import { Auth } from './pages/Auth'
import { Lists } from './pages/Lists'
import { Dashboard } from './pages/Dashboard'
import { Settings } from './pages/Settings'

const LazyListDetail = lazy(() =>
  import('./pages/ListDetail').then((module) => ({ default: module.ListDetail })),
)
const LazyFolders = lazy(() =>
  import('./pages/Folders').then((module) => ({ default: module.Folders })),
)
const LazyActivity = lazy(() =>
  import('./pages/Activity').then((module) => ({ default: module.Activity })),
)
const LazyItemDetail = lazy(() =>
  import('./pages/ItemDetail').then((module) => ({ default: module.ItemDetail })),
)
const LazyNotifications = lazy(() =>
  import('./pages/Notifications').then((module) => ({ default: module.Notifications })),
)
const LazySearch = lazy(() =>
  import('./pages/Search').then((module) => ({ default: module.Search })),
)

interface NavItem {
  to: string
  label: string
  shortLabel: string
  icon: 'dashboard' | 'collections' | 'folders' | 'activity'
}

interface QuickCommand {
  id: string
  label: string
  hint: string
  to: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', shortLabel: 'Home', icon: 'dashboard' },
  { to: '/collections', label: 'Collections', shortLabel: 'Collections', icon: 'collections' },
  { to: '/folders', label: 'Folders', shortLabel: 'Folders', icon: 'folders' },
  { to: '/activity', label: 'Activity', shortLabel: 'Activity', icon: 'activity' },
]

function getRouteLabel(pathname: string): string {
  if (pathname === '/dashboard') return 'Dashboard'
  if (pathname === '/collections') return 'Collections'
  if (pathname.startsWith('/collections/')) return 'Collection Detail'
  if (pathname === '/folders') return 'Folders'
  if (pathname === '/activity') return 'Activity'
  if (pathname === '/search') return 'Search'
  if (pathname === '/notifications') return 'Notifications'
  if (pathname === '/settings') return 'Settings'
  if (pathname.startsWith('/items/')) return 'Item Detail'
  return 'Workspace'
}

function App() {
  const { user, loading, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { notifications } = useNotifications(user?.id || null)
  const unreadCount = useMemo(() => getUnreadCount(notifications), [notifications])
  const [scrolled, setScrolled] = useState(false)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  const [paletteQuery, setPaletteQuery] = useState('')
  const [activeCommandIndex, setActiveCommandIndex] = useState(0)
  const paletteInputRef = useRef<HTMLInputElement | null>(null)

  const currentRouteLabel = useMemo(() => getRouteLabel(location.pathname), [location.pathname])
  const quickCommands = useMemo<QuickCommand[]>(() => ([
    { id: 'dashboard', label: 'Open Dashboard', hint: 'Overview and progress', to: '/dashboard' },
    { id: 'collections', label: 'Open Collections', hint: 'Manage tracked products', to: '/collections' },
    { id: 'new-collection', label: 'Create Collection', hint: 'Start a new list instantly', to: '/collections?intent=create-collection' },
    { id: 'activity', label: 'Open Activity Timeline', hint: 'Recent price and stock changes', to: '/activity' },
    { id: 'folders', label: 'Open Folders', hint: 'Organize collections', to: '/folders' },
    { id: 'search', label: 'Search Items', hint: 'Find products and collections', to: '/search' },
    { id: 'notifications', label: 'View Notifications', hint: `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}`, to: '/notifications' },
    { id: 'settings', label: 'Open Settings', hint: 'Preferences and account', to: '/settings' },
  ]), [unreadCount])

  const filteredCommands = useMemo(() => {
    const normalized = paletteQuery.trim().toLowerCase()
    if (!normalized) return quickCommands

    return quickCommands.filter((command) =>
      `${command.label} ${command.hint}`.toLowerCase().includes(normalized),
    )
  }, [paletteQuery, quickCommands])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsPaletteOpen((previous) => !previous)
      }

      if (event.key === 'Escape') {
        setIsPaletteOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyboardShortcut)
    return () => window.removeEventListener('keydown', handleKeyboardShortcut)
  }, [])

  useEffect(() => {
    if (!isPaletteOpen) return

    setActiveCommandIndex(0)
    window.setTimeout(() => {
      paletteInputRef.current?.focus()
    }, 10)
  }, [isPaletteOpen])

  useEffect(() => {
    setIsPaletteOpen(false)
  }, [location.pathname])

  const runCommand = (command: QuickCommand) => {
    setIsPaletteOpen(false)
    setPaletteQuery('')
    navigate(command.to)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-primary-100 animate-ping absolute inset-0"></div>
          <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg relative z-10">
            <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div className="relative min-h-screen app-background selection:bg-primary-100 overflow-x-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 left-[-12rem] h-[28rem] w-[28rem] rounded-full bg-primary-300/25 blur-3xl" />
        <div className="absolute top-[20%] right-[-10rem] h-[24rem] w-[24rem] rounded-full bg-amber-300/20 blur-3xl" />
      </div>

      <header className={`sticky top-0 z-50 w-full glass-panel border-b transition-shadow duration-300 ${scrolled ? 'border-slate-200 shadow-lg shadow-slate-200/40' : 'border-slate-200/80'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <NavLink to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform duration-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Wishlist Central</h1>
                <span className="text-xs font-medium text-slate-500 tracking-wide">SHOP SMARTER, TOGETHER</span>
              </div>
            </NavLink>

            <div className="flex items-center gap-4 sm:gap-6">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-900">Signed in</span>
                <span className="text-xs text-slate-500 font-medium">{user.email}</span>
              </div>

              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

              <NavLink
                to="/search"
                className={({ isActive }) =>
                  `btn-ghost text-sm transition ${
                    isActive ? 'text-primary-700 bg-primary-50' : 'hover:text-slate-900'
                  }`
                }
                title="Search"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </NavLink>

              <NavLink
                to="/notifications"
                className={({ isActive }) =>
                  `relative btn-ghost text-sm transition ${
                    isActive ? 'text-primary-700 bg-primary-50' : 'hover:text-slate-900'
                  }`
                }
                title="Notifications"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `btn-ghost text-sm ${isActive ? 'text-primary-700 bg-primary-50' : 'hover:text-slate-900'}`
                }
              >
                Settings
              </NavLink>

              <button
                onClick={() => setIsPaletteOpen(true)}
                className="hidden md:inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-primary-200 hover:text-slate-900"
                title="Open Quick Actions"
              >
                Quick Actions
                <kbd className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                  ⌘K
                </kbd>
              </button>

              <button
                onClick={signOut}
                className="btn-ghost text-sm hover:text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          </div>

          <nav className="hidden sm:flex items-center gap-2 pb-3" aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${
                    isActive
                      ? 'border-primary-300 bg-primary-50 text-primary-700'
                      : 'border-slate-200 bg-white/60 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`
                }
              >
                <NavIcon kind={item.icon} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center justify-between border-t border-amber-100/70 py-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span className="text-primary-700">Workspace</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-700">{currentRouteLabel}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="rounded-lg border border-amber-200 bg-white px-2 py-1 font-semibold">
                Try: Create Collection
              </span>
              <button
                onClick={() => setIsPaletteOpen(true)}
                className="font-semibold text-primary-700 hover:text-primary-800"
              >
                Open commands
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-24 sm:pb-8 page-enter">
        <Routes>
          <Route path="/" element={<HomeEntry />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/collections" element={<Lists />} />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="/folders"
            element={(
              <Suspense fallback={<RouteLoadingFallback />}>
                <LazyFolders />
              </Suspense>
            )}
          />
          <Route
            path="/activity"
            element={(
              <Suspense fallback={<RouteLoadingFallback />}>
                <LazyActivity />
              </Suspense>
            )}
          />
          <Route
            path="/notifications"
            element={(
              <Suspense fallback={<RouteLoadingFallback />}>
                <LazyNotifications />
              </Suspense>
            )}
          />
          <Route
            path="/search"
            element={(
              <Suspense fallback={<RouteLoadingFallback />}>
                <LazySearch />
              </Suspense>
            )}
          />
          <Route
            path="/lists/:listId"
            element={(
              <Suspense fallback={<RouteLoadingFallback />}>
                <LazyListDetail />
              </Suspense>
            )}
          />
          <Route
            path="/collections/:listId"
            element={(
              <Suspense fallback={<RouteLoadingFallback />}>
                <LazyListDetail />
              </Suspense>
            )}
          />
          <Route
            path="/items/:itemId"
            element={(
              <Suspense fallback={<RouteLoadingFallback />}>
                <LazyItemDetail />
              </Suspense>
            )}
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      <aside className="pointer-events-none fixed bottom-5 right-5 z-40 hidden xl:flex">
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-amber-200 bg-white/95 p-2 shadow-xl shadow-primary-200/30 backdrop-blur">
          <button
            onClick={() => setIsPaletteOpen(true)}
            className="btn-secondary !px-3 !py-2 !text-xs"
          >
            Quick Actions
          </button>
          <NavLink to="/collections?intent=create-collection" className="btn-primary !px-3 !py-2 !text-xs">
            + Collection
          </NavLink>
        </div>
      </aside>

      <nav className="sm:hidden fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur" aria-label="Mobile primary">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center rounded-lg py-1.5 text-[11px] font-semibold ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-500'
                }`
              }
            >
              <NavIcon kind={item.icon} />
              {item.shortLabel}
            </NavLink>
          ))}
        </div>
      </nav>

      {isPaletteOpen && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center bg-slate-900/40 p-4 pt-24 backdrop-blur-sm animate-overlay-in">
          <div className="w-full max-w-xl rounded-2xl border border-amber-200 bg-white p-3 shadow-2xl shadow-primary-300/30 animate-modal-in">
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={paletteInputRef}
                type="text"
                value={paletteQuery}
                onChange={(event) => {
                  setPaletteQuery(event.target.value)
                  setActiveCommandIndex(0)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    setActiveCommandIndex((previous) => Math.min(previous + 1, filteredCommands.length - 1))
                  }

                  if (event.key === 'ArrowUp') {
                    event.preventDefault()
                    setActiveCommandIndex((previous) => Math.max(previous - 1, 0))
                  }

                  if (event.key === 'Enter' && filteredCommands[activeCommandIndex]) {
                    event.preventDefault()
                    runCommand(filteredCommands[activeCommandIndex])
                  }
                }}
                placeholder="Search actions or pages..."
                className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button onClick={() => setIsPaletteOpen(false)} className="btn-ghost !px-2 !py-1 text-xs">
                Esc
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-1 p-1">
              {filteredCommands.length === 0 ? (
                <p className="rounded-lg border border-amber-100 bg-amber-50/40 px-3 py-2 text-sm text-slate-600">
                  No actions found for "{paletteQuery}".
                </p>
              ) : (
                filteredCommands.map((command, index) => (
                  <button
                    key={command.id}
                    onClick={() => runCommand(command)}
                    className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                      index === activeCommandIndex
                        ? 'border-primary-200 bg-primary-50'
                        : 'border-transparent hover:border-amber-200 hover:bg-amber-50/40'
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">{command.label}</p>
                    <p className="text-xs text-slate-500">{command.hint}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function HomeEntry() {
  const [searchParams] = useSearchParams()

  if (searchParams.get('sharedUrl')) {
    return <Lists />
  }

  return <Navigate to="/dashboard" replace />
}

function RouteLoadingFallback() {
  return (
    <div className="space-y-4">
      <div className="h-24 animate-pulse rounded-2xl bg-white" />
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    </div>
  )
}

function NavIcon({ kind }: { kind: NavItem['icon'] }) {
  if (kind === 'dashboard') {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 13h8V3H3v10zm10 8h8V3h-8v18zM3 21h8v-6H3v6z" />
      </svg>
    )
  }

  if (kind === 'collections') {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V7a2 2 0 00-2-2h-3l-2-2H6a2 2 0 00-2 2v2m16 6v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4m16 0H4" />
      </svg>
    )
  }

  if (kind === 'folders') {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
    )
  }

  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 8h10M7 12h6m-6 4h10M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
    </svg>
  )
}

export default App
