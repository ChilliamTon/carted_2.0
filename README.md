# Wishlist Central

A web-first wishlist aggregation app that lets you save products from any shopping site, organize them into lists and folders, and track prices and availability.

## Features (MVP)

✅ **Authentication** - Sign up/sign in with email/password
✅ **Lists Management** - Create, view, and delete wishlists
✅ **Items Management** - Save products with metadata (title, price, image, URL)
✅ **Folders** - Organize lists into folders
⏳ **Price Tracking** - Track price changes over time (coming soon)
⏳ **Browser Extension** - Save products from any site (coming soon)

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Testing**: Vitest + React Testing Library
- **Deployment**: Vercel (frontend) + Supabase (backend)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Create a free Supabase project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor
3. Copy your project URL and anon key

### 3. Configure Environment Variables

Create a `.env` file:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5. Run Tests

```bash
npm test
```

## Database Schema

- **folders** - Organize lists into folders
- **lists** - User wishlists
- **items** - Saved products
- **price_history** - Track price changes
- **availability_history** - Track stock status

All tables have Row Level Security (RLS) enabled for data isolation.

## Development

**Scripts:**
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate coverage report

**Testing Approach:**
- TDD (Test-Driven Development) enforced
- First 1000 lines have comprehensive test coverage
- Unit tests for hooks, integration tests for components

## Next Steps

### Phase 1 (Current - MVP) ✅
- [x] Authentication
- [x] Lists CRUD
- [x] Items CRUD
- [x] Basic UI

### Phase 2 (In Progress)
- [ ] Price tracking with scraper
- [ ] Browser extension for saving products
- [ ] Availability tracking
- [ ] Notifications on price drops

### Phase 3 (Future)
- [ ] Folders implementation
- [ ] Search and filters
- [ ] Price history charts
- [ ] Export/import wishlists
- [ ] Mobile app (React Native port)

## Deployment

### Vercel (Frontend)

```bash
npm run build
vercel --prod
```

### Supabase (Backend)

Already hosted - just configure environment variables in Vercel dashboard.

## Architecture

```
src/
├── components/     # Reusable UI components
│   ├── lists/     # ListCard, etc.
│   └── items/     # ItemCard, etc.
├── hooks/         # Custom React hooks (useAuth, useLists, useItems)
├── lib/           # Third-party integrations (Supabase client)
├── pages/         # Page components (Auth, Lists, ListDetail)
├── types/         # TypeScript type definitions
└── test/          # Test utilities and setup

supabase/
└── migrations/    # Database migrations
```

## Contributing

This is a prototype. For production use:
1. Add proper error boundaries
2. Implement rate limiting on scraping
3. Add email verification
4. Implement proper logging
5. Add analytics

## License

MIT
