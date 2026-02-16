Design a **List Detail Page** for Wishlist Central - the page that shows items in a specific wishlist.

**CONTEXT:**
- User clicks a list card from the Lists page
- Should navigate to `/lists/:listId`
- Need to display items in the list using the existing ItemCard component
- Must include an "Add Item" form

**DESIGN REQUIREMENTS:**

1. **Page Header**
   - List name (editable inline or with edit button)
   - Breadcrumb: "My Collections > [List Name]"
   - Back button to return to all lists
   - Delete list button (with confirmation)

2. **Add Item Section**
   - Collapsible/expandable "Add Item" form
   - Fields needed:
     - Title (required)
     - URL (required) 
     - Image URL (optional)
     - Merchant/Store (optional)
     - Price (optional, number input)
     - Currency (optional, dropdown: USD/EUR/GBP)
   - "Add Item" primary button
   - Should match the existing design system (violet/purple primary, slate grays)

3. **Items Grid**
   - Display items using existing ItemCard component (src/components/items/ItemCard.tsx)
   - Responsive grid: 1 col mobile, 2 cols tablet, 3-4 cols desktop
   - Empty state when no items: "No items yet. Add your first item!"
   - Loading state with skeleton cards

4. **Design Consistency**
   - Match the existing Lists page aesthetic
   - Use the same button styles (btn-primary, btn-secondary, btn-ghost)
   - Use input-field class for form inputs
   - Match spacing, shadows, and rounded corners from Lists page

**OUTPUT:**
Provide the complete React component code for `src/pages/ListDetail.tsx` with:
- TypeScript + React 19
- Uses useItems hook: `import { useItems } from '../hooks/useItems'`
- Uses useLists hook for list name/delete: `import { useLists } from '../hooks/useLists'`
- Uses useAuth for user_id: `import { useAuth } from '../hooks/useAuth'`
- Uses React Router: `import { useParams, useNavigate } from 'react-router-dom'`
- Imports ItemCard: `import { ItemCard } from '../components/items/ItemCard'`
- All inline with beautiful, modern e-commerce aesthetic
- Include helpful comments