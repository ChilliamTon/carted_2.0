You are a UI/UX designer tasked with redesigning "Wishlist Central" - a wishlist management web app.

**CRITICAL ISSUES TO FIX:**
1. ❌ Textbox borders are INVISIBLE (despite having border classes)
2. ❌ UI is confusing and lacks clear visual hierarchy
3. ❌ Need better UX patterns for e-commerce/wishlist context

**TECH STACK:**
- React 19 + TypeScript + Vite
- TailwindCSS v4 (using @import "tailwindcss" - newer syntax)
- Supabase backend

**YOUR MISSION:**
Redesign ALL UI components with a modern, clean, e-commerce-friendly aesthetic. The files provided show the current implementation.

**DESIGN REQUIREMENTS:**

1. **Fix Invisible Borders Issue**
   - Ensure ALL input fields have clearly visible borders
   - Use proper TailwindCSS v4 syntax or add custom CSS if needed
   - High contrast borders (not light gray on white)

2. **Visual Design System**
   - Modern color palette (consider moving beyond basic indigo)
   - Use gradients, shadows, and depth effectively
   - Clear visual hierarchy with typography scale
   - Professional e-commerce aesthetic (think Amazon, Etsy, Pinterest)

3. **Component Improvements**
   - **Auth page**: Beautiful centered form with brand identity
   - **Header**: More polished with user avatar/menu
   - **Lists page**: Better grid layout, clear CTAs, improved empty state
   - **ListCard**: More engaging with icons, better hover states
   - **ItemCard**: Product-focused design with clear price, image, and status
   - **Forms**: Better input styling, labels, validation states

4. **UX Patterns**
   - Clear affordances (what's clickable/editable)
   - Smooth transitions and micro-interactions
   - Better button hierarchy (primary, secondary, danger)
   - Loading and empty states
   - Mobile-responsive design

5. **Accessibility**
   - High contrast text and borders
   - Clear focus states
   - Proper ARIA labels where needed

**OUTPUT FORMAT:**
For each file that needs changes, provide:
1. Brief design rationale (2-3 sentences)
2. Complete updated code
3. Key design decisions explained in comments

Include updated index.css if custom styles are needed for TailwindCSS v4 compatibility.

Make it production-ready and visually stunning! 🎨