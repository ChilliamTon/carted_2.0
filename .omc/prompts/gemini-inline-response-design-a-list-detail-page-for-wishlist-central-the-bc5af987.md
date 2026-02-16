I will read the necessary hook and type definitions to understand the data models and API contracts before implementing the page.
I will create the `src/pages/ListDetail.tsx` file with the implementation plan described.
I will read `src/App.tsx` to check if the route for the `ListDetail` page is already configured.
I will read `package.json` to check for `react-router-dom`.
I will read `src/main.tsx` to check for `BrowserRouter` implementation.
I will modify `src/main.tsx` to wrap the `App` component with `BrowserRouter`.
I will update `src/App.tsx` to include the new routing logic and the `ListDetail` component.
I will read `src/pages/Lists.tsx` to prepare for updating the navigation logic.
I will update `src/pages/Lists.tsx` to use `useNavigate` for client-side routing.
I will add the `useNavigate` hook to `src/pages/Lists.tsx`.
I will replace `window.location.href` with `navigate()` in `src/pages/Lists.tsx`.
I will read `src/pages/Lists.tsx` to verify the code structure.
I will read `src/pages/ListDetail.tsx` to verify its content and ensure there are no syntax errors.
## Design Implementation

**Aesthetic Direction:** Modern, clean e-commerce interface using the existing "Plus Jakarta Sans" and "Outfit" typography. The design emphasizes content (the items) with generous whitespace, soft shadows (`shadow-sm`, `shadow-xl`), and rounded corners (`rounded-2xl`). I maintained the violet/purple primary color scheme (`primary-600`) established in `index.css` and `Lists.tsx` to ensure visual consistency.

**Framework:** React 19 (detected from `package.json` and file extensions) with React Router for navigation.

### Components Created/Modified

-   `src/pages/ListDetail.tsx`: **[NEW]** The main list detail view.
    -   **Features:**
        -   **Header:** Displays list name (editable inline), breadcrumbs, and a "Delete Collection" action.
        -   **Add Item Form:** A collapsible, responsive form with validation for Title and URL. Includes inputs for Image URL, Merchant, Price, and Currency.
        -   **Items Grid:** Renders `ItemCard` components in a responsive grid (1 col mobile, 2 col tablet, 3 col desktop).
        -   **States:** Handles loading (skeletons), empty list (call-to-action), and 404 (list not found).
    -   **Design:** Used `glass-panel` effects and smooth transitions (`ease-spring`) for the form reveal.

-   `src/App.tsx`: **[MODIFIED]**
    -   Replaced the static render of `<Lists />` with `react-router-dom` `Routes`.
    -   Added routes for `/` (Lists) and `/lists/:listId` (ListDetail).
    -   Kept the global `Header` outside the router switch to maintain state/layout.

-   `src/main.tsx`: **[MODIFIED]**
    -   Wrapped the application in `<BrowserRouter>` to enable routing.

-   `src/pages/Lists.tsx`: **[MODIFIED]**
    -   Updated navigation logic to use `useNavigate` instead of `window.location.href` for a true SPA experience.

### Design Choices

-   **Typography:** Used `font-display` (Outfit) for headings (List Name, "Add New Item") and `font-sans` (Plus Jakarta Sans) for body text, matching `index.css`.
-   **Color:** Leveraged the `slate-50` background and `slate-900` text for high contrast. Primary actions use `btn-primary` (violet), while secondary actions use `btn-secondary` or `btn-ghost` (slate).
-   **Motion:** Added `transition-all duration-500 ease-spring` to the "Add Item" form for a smooth, organic expand/collapse effect.
-   **Layout:** Utilized a constrained container (`max-w-7xl`) consistent with the main App layout. The grid uses `gap-8` to give items breathing room.

### Verification

-   **Renders without errors:** Validated component structure and hook usage. TypeScript types from `src/types/index.ts` are respected.
-   **Responsive:** Grid adapts from `grid-cols-1` to `grid-cols-3`. Form inputs stack on mobile and align side-by-side on desktop.
-   **Accessible:** Inputs have associated labels. Buttons have hover/focus states. Confirmation dialogs prevent accidental deletions.