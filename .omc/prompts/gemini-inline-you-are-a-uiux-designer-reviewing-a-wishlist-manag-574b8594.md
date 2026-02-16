You are a UI/UX designer reviewing a wishlist management web app called "Wishlist Central". The user reports:
1. The UI is confusing
2. Textbox borders are invisible (despite having border classes defined)
3. Overall UX needs improvement

CURRENT STACK:
- React 19 + TypeScript + Vite
- TailwindCSS v4 (using @import "tailwindcss" syntax)
- Components: Auth page, Lists page, ListCard, ItemCard

CURRENT UI COMPONENTS:

**App.tsx** - Main layout with header
```tsx
<div className="min-h-screen bg-gray-50">
  <header className="bg-white shadow">
    <h1 className="text-3xl font-bold text-gray-900">Wishlist Central</h1>
    <button onClick={signOut}>Sign Out</button>
  </header>
  <main><Lists /></main>
</div>
```

**Auth.tsx** - Sign in/up form
```tsx
<input
  type="email"
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
/>
<button className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
  Sign In
</button>
```

**Lists.tsx** - Lists management
```tsx
<button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">+ New List</button>
<input
  type="text"
  placeholder="List name..."
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
/>
```

**ListCard.tsx** - Individual list card
```tsx
<div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 cursor-pointer">
  <h3 className="text-lg font-semibold">{list.name}</h3>
  <button className="text-red-500 hover:text-red-700">Delete</button>
</div>
```

**ItemCard.tsx** - Product item card
```tsx
<div className="bg-white rounded-lg shadow p-4">
  <img className="w-24 h-24 object-cover rounded" />
  <h4 className="font-semibold">{item.title}</h4>
  <p className="text-lg font-bold text-indigo-600">${price}</p>
  <span className="text-xs px-2 py-1 rounded bg-green-100">In Stock</span>
</div>
```

YOUR TASK:
1. **Fix the invisible borders issue** - Provide proper TailwindCSS v4 classes or custom CSS
2. **Redesign the UI/UX** with:
   - Modern, clean aesthetic (consider gradient accents, better spacing)
   - Clear visual hierarchy
   - Better form input styling (visible borders, better focus states)
   - Improved button designs with clear CTAs
   - Better color scheme (current: indigo primary, consider alternatives)
   - Card designs with better hover states
   - Empty states and loading states
   - Mobile-responsive grid layouts

3. **Provide complete updated code** for ALL components:
   - App.tsx
   - Auth.tsx
   - Lists.tsx
   - ListCard.tsx
   - ItemCard.tsx
   - index.css (if custom CSS needed for TailwindCSS v4)

4. **Design principles to follow**:
   - Clean, modern e-commerce aesthetic
   - High contrast for accessibility
   - Smooth transitions and micro-interactions
   - Clear affordances (what's clickable, what's editable)
   - Professional but friendly tone

OUTPUT FORMAT:
For each file, provide the complete updated code with clear comments explaining the design choices. Make it production-ready and visually stunning!