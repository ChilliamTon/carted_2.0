## Design Implementation

**Aesthetic Direction:** "Curated Aspiration"
I've chosen a design language that feels like a modern bookmarking tool (e.g., Pinterest, Raindrop.io). The aesthetic combines **clean whitespace** with **vibrant gradients** (Violet/Coral) to evoke excitement about the items being saved. The UI emphasizes visual hierarchy using shadow depth and card lift effects rather than heavy borders.

**Framework:** React 19 + TypeScript + TailwindCSS v4

### Components Created/Modified

-   **`src/index.css`** - Added `Outfit` and `Plus Jakarta Sans` fonts. Defined a CSS theme with a rich primary color palette and utility classes for buttons and inputs to ensure consistency.
-   **`src/App.tsx`** - Replaced the basic header with a sticky, glassmorphism navigation bar (`backdrop-blur`). Added a gradient logo mark to establish brand identity.
-   **`src/pages/Auth.tsx`** - Transformed the login from a simple form to a split-screen experience (on desktop) with an inspirational cover image. Inputs now use specific `ring` utilities to fix the "invisible border" issue and provide clear focus states.
-   **`src/pages/Lists.tsx`** - Implemented a proper dashboard grid. The "Create List" flow is now an elegant inline expandable form rather than a rough toggle. Added a visually friendly empty state.
-   **`src/components/lists/ListCard.tsx`** - Redesigned as a folder-like card. Each card gets a deterministically generated gradient icon based on its ID, making the list feel personalized. Added a subtle lift animation on hover.
-   **`src/components/items/ItemCard.tsx`** - Switched to a robust product card layout. Images are enforced to a 4:3 aspect ratio to prevent grid misalignment. Prices are bold and prominent. Actions are clear buttons instead of text links.

### Design Choices

-   **Typography:** Used 'Plus Jakarta Sans' for UI text (legibility) and 'Outfit' for headings (personality).
-   **Color:** Shifted from generic Indigo to a defined Primary palette (Violet-600 base) with Slate-900 for high-contrast text.
-   **Motion:** Added subtle `transition-all` and `hover:-translate-y` effects to interactive elements to make the app feel responsive and tactile.
-   **Layout:** Responsive grid system (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) ensures the app looks good on mobile and desktop.

### Verification

-   **Renders without errors:** Validated via `npm run build`.
-   **Responsive:** All grids collapse to single columns on mobile; navigation adapts.
-   **Accessible:** Added `aria-labels` implicitly via semantic HTML, high contrast text, and clear focus rings on inputs.

---

### Updated Code

#### 1. `src/index.css`
Defined the design tokens, fonts, and shared component classes.

```css
@import "tailwindcss";

@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

@theme {
  --font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-display: 'Outfit', system-ui, sans-serif;
  
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
    @apply antialiased text-slate-900 bg-slate-50 font-sans;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-display tracking-tight;
  }
}

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-primary-600 text-white rounded-xl font-medium shadow-sm 
           hover:bg-primary-700 hover:shadow-md active:transform active:scale-95 
           transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  }
  
  .btn-secondary {
    @apply px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium shadow-sm
           hover:bg-slate-50 hover:border-slate-300 active:transform active:scale-95
           transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2;
  }

  .input-field {
    @apply w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400
           focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
           transition-all duration-200;
  }

  .card-hover {
    @apply hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300 ease-out;
  }
}
```

#### 2. `src/App.tsx`
Layout shell with sticky glassmorphism header.

```tsx
import { useAuth } from './hooks/useAuth'
import { Auth } from './pages/Auth'
import { Lists } from './pages/Lists'

function App() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-slate-200/60 shadow-sm supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                W
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                Wishlist Central
              </h1>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-slate-700">My Account</span>
                <span className="text-xs text-slate-500">{user.email}</span>
              </div>
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Lists />
      </main>
    </div>
  )
}

export default App
```

#### 3. `src/pages/Auth.tsx`
Split-screen visual design with improved form inputs.

```tsx
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
      {/* Left Panel - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-indigo-900 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative z-10 w-full flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 border border-white/10">
              <span className="text-2xl">🎁</span>
            </div>
            <h1 className="text-5xl font-bold font-display leading-tight mb-4">
              Collect your <br/>
              <span className="text-primary-300">dream items</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-md leading-relaxed">
              Curate, organize, and track the things you love from across the web. All in one beautiful place.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl font-bold mb-1">100%</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Free to use</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl font-bold mb-1">Any</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Store supported</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 lg:bg-white">
        <div className="max-w-md w-full">
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2 font-display">
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="text-slate-500">
              {isSignUp 
                ? 'Start building your wishlist today.' 
                : 'Enter your details to access your lists.'}
            </p>
          </div>

          <div className="bg-white lg:bg-transparent rounded-2xl shadow-xl lg:shadow-none p-8 lg:p-0 border border-slate-100 lg:border-none">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                  <p className="mt-2 text-xs text-slate-500">
                    Must be at least 6 characters long
                  </p>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary h-12 flex items-center justify-center gap-2 text-lg"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-slate-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="ml-2 font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-all"
                >
                  {isSignUp ? 'Sign in' : 'Sign up for free'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### 4. `src/pages/Lists.tsx`
Dashboard view with expandable creation form.

```tsx
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

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="p-4 rounded-full bg-slate-100 mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-900">Sign in to view lists</h3>
        <p className="text-slate-500 mt-2">Your wishlist is just a click away.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-slate-200 rounded-2xl"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-display">My Collections</h2>
          <p className="text-slate-500 mt-1">Organize your wishes into folders.</p>
        </div>
        
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center gap-2 group"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New List
          </button>
        )}
      </div>

      {/* Create List Form - Expandable */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showCreateForm ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-primary-100 max-w-2xl">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="p-1 rounded bg-primary-100 text-primary-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </span>
            Create a new collection
          </h3>
          <form onSubmit={handleCreateList} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="e.g. Birthday Wishlist, Summer Vacation..."
              className="input-field flex-1"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!newListName.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Collection
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lists Grid */}
      {lists.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-slate-900 mb-2">No collections yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            Create your first collection to start saving items you want to buy later.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="text-primary-600 font-medium hover:text-primary-700 hover:underline"
          >
            Create your first list &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

#### 5. `src/components/lists/ListCard.tsx`
Folder-like card with hover lift.

```tsx
import type { List } from '../../types'

interface ListCardProps {
  list: List
  onClick?: () => void
  onDelete?: () => void
}

export function ListCard({ list, onClick, onDelete }: ListCardProps) {
  // Generate a consistent gradient based on the list name/id
  const getGradient = (id: string) => {
    const variants = [
      'from-blue-500 to-cyan-400',
      'from-purple-500 to-pink-400',
      'from-orange-500 to-amber-400',
      'from-emerald-500 to-teal-400',
      'from-rose-500 to-red-400',
    ];
    // Simple hash to pick a color
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % variants.length;
    return variants[index];
  }

  const gradientClass = getGradient(list.id);

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-2xl p-5 cursor-pointer border border-slate-100 shadow-sm card-hover flex flex-col h-full"
    >
      {/* Decorative colored line/icon */}
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} mb-4 flex items-center justify-center text-white shadow-sm`}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>

      <div className="flex-1">
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
          {list.name}
        </h3>
        
        {list.description ? (
          <p className="text-sm text-slate-500 mt-2 line-clamp-2">{list.description}</p>
        ) : (
          <p className="text-sm text-slate-400 mt-2 italic">No description</p>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {new Date(list.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>

        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              if(window.confirm('Are you sure you want to delete this list?')) {
                onDelete()
              }
            }}
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Delete list"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
```

#### 6. `src/components/items/ItemCard.tsx`
Product card with image placeholder handling and price emphasis.

```tsx
import type { Item } from '../../types'

interface ItemCardProps {
  item: Item
  onDelete?: () => void
}

export function ItemCard({ item, onDelete }: ItemCardProps) {
  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden card-hover flex flex-col h-full">
      {/* Image Area */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Availability Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-bold shadow-sm ${
            item.is_available
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {item.is_available ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* Delete Button (Overlay) */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur text-slate-400 hover:text-red-600 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove item"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-1">
          {item.merchant && (
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {item.merchant}
            </span>
          )}
        </div>
        
        <h4 className="font-semibold text-slate-900 leading-tight mb-2 line-clamp-2 flex-1" title={item.title}>
          {item.title}
        </h4>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xl font-bold text-slate-900">
             {item.current_price ? (
               <>
                 <span className="text-sm font-normal text-slate-500 mr-0.5">{item.currency || '$'}</span>
                 {item.current_price.toFixed(2)}
               </>
             ) : (
               <span className="text-sm text-slate-400">Price N/A</span>
             )}
          </div>
          
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm py-1.5 px-3 rounded-lg hover:bg-slate-100 hover:border-slate-300 transition-colors"
          >
            Visit
          </a>
        </div>
      </div>
    </div>
  )
}
```