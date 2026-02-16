---
provider: "gemini"
agent_role: "designer"
model: "gemini-3-pro-preview"
prompt_id: "482869a5"
timestamp: "2026-02-16T01:03:34.100Z"
---

## Design Implementation

**Aesthetic Direction:** "Modern Commerce" – Clean, trustworthy, and content-focused.
**Framework:** React 19 + Tailwind CSS v4

I have redesigned the application to address the "invisible border" issue by increasing contrast thresholds and implementing a cohesive design system inspired by modern e-commerce platforms like Shopify and Are.na. The new design uses a refined typography scale (Outfit/Plus Jakarta Sans), high-quality depth effects (shadows + borders), and a focused "Violet & Slate" color palette.

### Components Created/Modified

- `src/index.css` - Defined the design system, fixed input visibility, and added polished utility classes.
- `src/App.tsx` - Created a professional app shell with a blurred, sticky header and improved navigation.
- `src/pages/Auth.tsx` - Designed a split-screen authentication experience with strong visual hierarchy and clear input states.
- `src/pages/Lists.tsx` - Implemented a dashboard layout with smooth transitions and a clear "Create" workflow.
- `src/components/lists/ListCard.tsx` - Redesigned to look like a physical folder/collection with rich gradients and metadata.
- `src/components/items/ItemCard.tsx` - Created a product-first card emphasizing imagery, price, and stock status.

### Design Choices

- **Typography:** `Outfit` for headings (friendly, modern display) and `Plus Jakarta Sans` for UI text (highly legible at small sizes).
- **Color:** Moved from generic blue/indigo to a specific `Violet-600` primary, grounded by `Slate-900` text and `Slate-300` borders for visibility.
- **Layout:** heavily utilizes grid and flexbox with generous whitespace (`gap-6`, `p-6`) to reduce cognitive load.
- **Motion:** Micro-interactions on hover (lift + shadow) and smooth fade-ins for content loading.

### Verification
- **Renders:** Code is standard React/Tailwind.
- **Responsive:** Mobile-first approach using `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
- **Accessible:** Added proper focus rings, high-contrast borders, and semantic HTML structure.

---

### 1. Global Styles & Design System
**Rationale:** Fixed the "invisible border" issue by darkening default borders and defining robust form field styles. Added `@theme` configuration for Tailwind v4.

```css
/* src/index.css */
@import "tailwindcss";

@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

@theme {
  --font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-display: 'Outfit', system-ui, sans-serif;
  
  /* Refined Primary Palette */
  --color-primary-50: #f5f3ff;
  --color-primary-100: #ede9fe;
  --color-primary-200: #ddd6fe;
  --color-primary-300: #c4b5fd;
  --color-primary-400: #a78bfa;
  --color-primary-500: #8b5cf6;
  --color-primary-600: #7c3aed;
  --color-primary-700: #6d28d9;
  --color-primary-800: #5b21b6;
  --color-primary-900: #4c1d95;
  --color-primary-950: #2e1065;
}

@layer base {
  body {
    @apply antialiased text-slate-900 bg-slate-50 font-sans selection:bg-primary-100 selection:text-primary-900;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-display tracking-tight text-slate-900;
  }
}

@layer components {
  /* High-visibility buttons with clear hierarchy */
  .btn-primary {
    @apply inline-flex items-center justify-center px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold shadow-sm 
           hover:bg-primary-700 hover:shadow-md hover:-translate-y-0.5
           active:translate-y-0 active:scale-95 
           transition-all duration-200 ease-out
           focus:outline-none focus:ring-4 focus:ring-primary-500/20;
  }
  
  .btn-secondary {
    @apply inline-flex items-center justify-center px-5 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-xl font-semibold shadow-sm
           hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 hover:shadow-md hover:-translate-y-0.5
           active:translate-y-0 active:scale-95
           transition-all duration-200 ease-out
           focus:outline-none focus:ring-4 focus:ring-slate-200;
  }

  .btn-ghost {
    @apply inline-flex items-center justify-center px-4 py-2 text-slate-600 rounded-xl font-medium
           hover:bg-slate-100 hover:text-slate-900
           transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-200;
  }

  /* Fixed: High contrast borders for inputs */
  .input-field {
    @apply w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 
           placeholder:text-slate-400 font-medium
           transition-all duration-200
           focus:outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-500/10
           disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .card-hover {
    @apply hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-out border border-slate-200 hover:border-primary-200/50;
  }
  
  .glass-panel {
    @apply bg-white/80 backdrop-blur-xl border border-white/20 shadow-sm;
  }
}
```

---

### 2. App Shell (Layout)
**Rationale:** Implemented a sticky "glassmorphism" header for context preservation. Added a polished user menu and clearer brand identity.

```tsx
/* src/App.tsx */
import { useAuth } from './hooks/useAuth'
import { Auth } from './pages/Auth'
import { Lists } from './pages/Lists'

function App() {
  const { user, loading, signOut } = useAuth()

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
    <div className="min-h-screen bg-slate-50 selection:bg-primary-100">
      {/* Glass Header */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            {/* Logo */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                  Wishlist Central
                </h1>
                <span className="text-xs font-medium text-slate-500 tracking-wide">COLLECTIONS</span>
              </div>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-900">My Account</span>
                <span className="text-xs text-slate-500 font-medium">{user.email}</span>
              </div>
              
              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
              
              <button
                onClick={signOut}
                className="btn-ghost text-sm hover:text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <Lists />
      </main>
    </div>
  )
}

export default App
```

---

### 3. Auth Page
**Rationale:** Redesigned inputs with clearer borders and better focus states. Used a high-quality sidebar visual to establish brand feel immediately.

```tsx
/* src/pages/Auth.tsx */
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password)

    if (error) {
      setError(error.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Brand Visual */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-slate-900 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-primary-950"></div>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        {/* Content Overlay */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-12 text-white">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>

          <div>
            <h1 className="text-4xl lg:text-5xl font-bold font-display leading-[1.1] mb-6 tracking-tight">
              Curate your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-indigo-300">
                digital desires.
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-sm leading-relaxed">
              The smartest way to track prices, organize collections, and share what you really want.
            </p>
          </div>

          <div className="flex gap-4 text-sm font-medium text-slate-500">
            <span>© 2024 Wishlist Central</span>
            <span>•</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 bg-slate-50/50">
        <div className="max-w-[420px] w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-2 font-display">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-slate-500 text-sm">
              {isSignUp 
                ? 'Start building your dream collections in seconds.' 
                : 'Enter your credentials to access your account.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700 ml-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="input-field"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700 ml-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="input-field"
              />
              {isSignUp && (
                <p className="text-xs text-slate-500 ml-1">
                  Must be at least 6 characters long
                </p>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-3 animate-shake">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary h-12 text-base"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-600 text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                }}
                className="ml-2 font-bold text-primary-600 hover:text-primary-700 hover:underline transition-all"
              >
                {isSignUp ? 'Sign in' : 'Sign up for free'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

### 4. Lists Dashboard
**Rationale:** Improved the empty state to be less "error-like" and more inviting. Made the "Create List" form a distinct card with better shadow/elevation separation from the content.

```tsx
/* src/pages/Lists.tsx */
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useLists } from '../hooks/useLists'
import { ListCard } from '../components/lists/ListCard'

export function Lists() {
  const { user } = useAuth()
  const { lists, loading, createList, deleteList } = useLists(user?.id || null)
  const [newListName, setNewListName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newListName.trim()) return

    await createList({
      user_id: user.id,
      name: newListName,
      folder_id: null,
      description: null,
    })

    setNewListName('')
    setShowCreateForm(false)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse">
            <div className="h-2/3 bg-slate-100/50 rounded-t-2xl"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b border-slate-200/60 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-display tracking-tight">My Collections</h2>
          <p className="text-slate-500 mt-2 text-lg">Manage and organize your wishlist items.</p>
        </div>
        
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center gap-2 group shadow-lg shadow-primary-500/20"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Collection</span>
          </button>
        )}
      </div>

      {/* Create List Form */}
      <div className={`transition-all duration-300 ease-spring ${showCreateForm ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none absolute'}`}>
        {showCreateForm && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 max-w-2xl mx-auto ring-4 ring-slate-50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                Create New Collection
              </h3>
              <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateList} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="e.g. Birthday Wishlist, Tech Upgrades..."
                className="input-field flex-1"
                autoFocus
              />
              <div className="flex gap-3 sm:w-auto w-full">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary flex-1 sm:flex-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newListName.trim()}
                  className="btn-primary flex-1 sm:flex-none"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Lists Grid */}
      {lists.length === 0 ? (
        <div className="text-center py-24 px-4">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-lg border border-slate-100 flex items-center justify-center mx-auto mb-6 rotate-3">
            <svg className="w-10 h-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No collections yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8 text-lg">
            Start by creating a collection to organize your favorite items.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            Create your first collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
          {lists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              onClick={() => window.location.href = `/lists/${list.id}`}
              onDelete={() => deleteList(list.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

---

### 5. List Card Component
**Rationale:** Redesigned as a sophisticated "folder" object. The gradient headers serve as visual anchors, making it easy to distinguish lists at a glance.

```tsx
/* src/components/lists/ListCard.tsx */
import type { List } from '../../types'

interface ListCardProps {
  list: List
  onClick?: () => void
  onDelete?: () => void
}

export function ListCard({ list, onClick, onDelete }: ListCardProps) {
  // Deterministic gradient based on list ID
  const getGradient = (id: string) => {
    const gradients = [
      'from-violet-500 to-fuchsia-500',
      'from-cyan-500 to-blue-500',
      'from-emerald-400 to-teal-500',
      'from-orange-400 to-pink-500',
      'from-indigo-500 to-purple-500',
      'from-rose-400 to-red-500'
    ];
    const index = id.charCodeAt(0) % gradients.length;
    return gradients[index];
  }

  const gradient = getGradient(list.id);

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-2xl p-1 cursor-pointer border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out"
    >
      <div className="h-full bg-white rounded-xl overflow-hidden flex flex-col">
        {/* Visual Header */}
        <div className={`h-24 bg-gradient-to-br ${gradient} p-5 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
          
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-lg p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
              {list.name}
            </h3>
          </div>
          
          <p className={`text-sm flex-1 ${list.description ? 'text-slate-500' : 'text-slate-400 italic'}`}>
            {list.description || 'No description provided'}
          </p>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(list.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>

            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if(window.confirm('Delete this collection?')) onDelete()
                }}
                className="text-slate-300 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete collection"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

### 6. Item Card Component
**Rationale:** Moved to a modern "card" style where the image is the hero. Price is large and bold. Added clear visual badges for stock status.

```tsx
/* src/components/items/ItemCard.tsx */
import type { Item } from '../../types'

interface ItemCardProps {
  item: Item
  onDelete?: () => void
}

export function ItemCard({ item, onDelete }: ItemCardProps) {
  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative">
      
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
            <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">No Image</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm backdrop-blur-md ${
            item.is_available
              ? 'bg-emerald-500/90 text-white'
              : 'bg-rose-500/90 text-white'
          }`}>
            {item.is_available ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* Action Overlay (Desktop) */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-end gap-2">
           {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete();
              }}
              className="p-2 bg-white/90 text-slate-600 hover:text-red-600 hover:bg-white rounded-lg shadow-sm transition-colors"
              title="Remove item"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-2 flex items-center gap-2">
          {item.merchant && (
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
              {item.merchant}
            </span>
          )}
        </div>
        
        <h4 className="font-semibold text-slate-900 leading-snug mb-3 line-clamp-2 flex-1 group-hover:text-primary-700 transition-colors" title={item.title}>
          {item.title}
        </h4>
        
        <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Price</span>
            <div className="text-lg font-bold text-slate-900 font-display">
               {item.current_price ? (
                 <>
                   <span className="text-sm font-medium text-slate-500 mr-0.5 align-top">{item.currency || '$'}</span>
                   {item.current_price.toFixed(2)}
                 </>
               ) : (
                 <span className="text-sm text-slate-400">--</span>
               )}
            </div>
          </div>
          
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs px-3 py-1.5 h-8 rounded-lg"
          >
            Visit Store
          </a>
        </div>
      </div>
    </div>
  )
}
```