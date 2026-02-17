# Wishlist Central Enhancement Status

**Date:** 2026-02-16
**Focus:** Beyond-MVP navigation, guided onboarding, activity intelligence, performance hardening, and e2e reliability

## Current State

### Product Direction
- Navigation-first UX: clear entry points for Dashboard, Collections, Folders, Activity.
- Tracking-first workflow: activity timeline + availability history visibility.
- Reliability-first backend: RLS insert policies for history + updated_at triggers + performance indexes.

### Completed

1. **App Navigation Overhaul**
- Desktop primary nav + mobile bottom nav.
- New routes:
  - `/dashboard`
  - `/collections`
  - `/folders`
  - `/activity`
  - `/collections/:listId` (with `/lists/:listId` compatibility)
- Root behavior:
  - `/?sharedUrl=...` stays in collection-import flow.
  - plain `/` redirects to `/dashboard`.

2. **New Pages**
- `Dashboard` page with key metrics and quick links.
- `Folders` page with grouped collections + unassigned section.
- `Activity` page with filterable timeline (All / Price / Availability).

3. **Collection Management Improvements**
- Collection-level folder reassignment directly from collection cards.
- Existing search/sort + stats retained and integrated.

4. **Tracking UX Improvements**
- Availability history modal on item cards.
- Last-checked freshness labels on item cards.

5. **Backend/Data Improvements**
- Added migration `002_history_insert_policies.sql`:
  - INSERT policies for `price_history` and `availability_history`.
- Added migration `003_updated_at_and_perf_indexes.sql`:
  - `updated_at` triggers for folders/lists/items.
  - New indexes for dashboard/activity queries.
- Added strict error handling for history writes in tracking flows.

6. **Guided Onboarding UX (Completed)**
- Added persistent first-run walkthrough state:
  - Dashboard -> Collections -> Add Item -> Check Prices.
- Added reusable guided card with step progress + next best action CTA.
- Added onboarding persistence per user via `localStorage`.
- Added intent-driven deep links:
  - `/collections?intent=create-collection`
  - `/collections/:listId?intent=add-item`
- Added onboarding-aware cards to:
  - Dashboard
  - Collections
  - Collection Detail
  - Folders
  - Activity
- Added onboarding tests for state transitions and action routing.

7. **Activity Intelligence (Completed)**
- Added `Today / Yesterday / Earlier` grouping for activity timeline.
- Added merchant + collection filters in Activity.
- Added per-event jump actions to deep-link into collection item context (`focusItem` query).
- Added activity model metadata (`itemId`, `listId`, `merchant`) for richer filtering/navigation.

8. **Collection IA Refinement (Completed)**
- Added collection view modes: `Grid` and `Table` with persisted preference.
- Added bulk selection mode + `Select visible` + bulk move-to-folder workflow.
- Added selection affordances in cards and table rows.
- Hardened list state updates for concurrent operations (functional state updates in `useLists`).

9. **Performance / Bundle (Completed)**
- Added route-level lazy loading for `Folders`, `Activity`, and `ListDetail`.
- Added lazy loading for `PriceHistoryChart` and `AvailabilityHistoryModal`.
- Reduced main entry chunk and split heavy `recharts` chart code into separate async chunk.

10. **Authenticated E2E Harness + Coverage (Completed)**
- Added deterministic e2e authenticated mode (runtime localStorage flag):
  - test-only auth bypass in `useAuth`
  - local mock data store for lists/folders/items/activity
  - no production behavior changes unless the bypass flag is set.
- Added Playwright authenticated specs:
  - app shell navigation visibility
  - collections table/grid + bulk move flow
  - activity merchant filter + jump-to-item flow.

### Test/Build Status
- Unit tests: passing (`38` tests).
- Build: passing.
- Playwright e2e (expanded suite): passing (`7/7`).

## Key Files Added (this phase)
- `src/pages/Dashboard.tsx`
- `src/pages/Folders.tsx`
- `src/pages/Activity.tsx`
- `src/hooks/useActivityFeed.ts`
- `src/lib/activity.ts`
- `src/lib/activity.test.ts`
- `src/hooks/useAvailabilityTracking.ts`
- `src/components/items/AvailabilityHistoryModal.tsx`
- `src/lib/availability.ts`
- `src/lib/availability.test.ts`
- `src/lib/onboarding.ts`
- `src/lib/onboarding.test.ts`
- `src/hooks/useOnboarding.ts`
- `src/components/onboarding/GuidedOnboardingCard.tsx`
- `src/lib/e2eMode.ts`
- `src/lib/e2eStore.ts`
- `supabase/migrations/002_history_insert_policies.sql`
- `supabase/migrations/003_updated_at_and_perf_indexes.sql`
- `tests/e2e/app-authenticated.spec.ts`

## Key Files Updated
- `src/App.tsx`
- `src/pages/Lists.tsx`
- `src/pages/ListDetail.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/Folders.tsx`
- `src/pages/Activity.tsx`
- `src/components/lists/ListCard.tsx`
- `src/components/items/ItemCard.tsx`
- `src/hooks/usePriceTracking.ts`
- `src/hooks/useAuth.ts`
- `src/hooks/useItems.ts`
- `src/hooks/useLists.ts`
- `src/hooks/useFolders.ts`
- `src/hooks/useActivityFeed.ts`
- `src/lib/priceChecker.ts`
- `src/lib/share.ts`
- `src/lib/share.test.ts`
- `src/lib/activity.test.ts`
- `src/index.css`
- `README.md`

## What To Do Next (High Impact)

1. **Activity Drilldown**
- Add item-level anchor highlighting dismissal and clear-focus action.
- Add optional grouping by merchant and by collection for dense timelines.

2. **Backend-Integrated E2E Track**
- Add a second Playwright profile that uses real Supabase auth/session and seeded DB rows.
- Keep current deterministic local harness as fast smoke/UX regression lane.

3. **Data-Dense QA**
- Add UI states for very large activity timelines (pagination or virtualization).
- Add bulk move undo feedback and error drilldown.

## Session Update - 2026-02-17

### Commit Batches Completed
1. `1788a21` - `feat(collection-detail): improve activity drilldown focus controls`
- Added explicit focus/highlight UX when deep-linking from activity.
- Added clear-highlight and back-to-activity actions.
- Added missing-focused-item recovery state with clear action.

2. `895b8b0` - `feat(activity): add merchant and collection grouping modes`
- Added optional grouping mode in Activity: `Day`, `Merchant`, `Collection`.
- Added reusable grouping helpers in `src/lib/activity.ts`.
- Added tests for grouping behavior and fallbacks.

3. `ab77a5f` - `feat(navigation): add reusable page headers and breadcrumbs`
- Added shared `PageHeader` layout component.
- Integrated headers/breadcrumbs into Search, Notifications, and Settings.
- Added component test coverage for header rendering and breadcrumb links.

4. `d8de918` - `feat(collections): add undo and retry flow for bulk moves`
- Added bulk-move undo support with persisted change-set context.
- Added partial failure drilldown with retry-focused selection retention.
- Added post-action banner with `Undo Bulk Move` and dismiss actions.

5. `6ababfa` - `feat(dashboard): add guided continuation and jump links`
- Added dynamic guided CTA in dashboard hero using onboarding next action.
- Added direct jump links from dashboard activity cards to focused item context.
- Added search shortcut from dashboard hero actions.

6. `8e3bbab` - `feat(search): add direct item-detail navigation from results`
- Added direct `Open Item` action for each item result.
- Kept collection-level navigation as a secondary action.

### Validation
- Unit tests: `69/69` passing.
- Build: passing.

### Remaining High-Impact Queue
1. Add large-timeline handling in Activity (pagination or virtualization).
2. Add optional real-Supabase e2e lane alongside deterministic harness.
3. Tighten notification-to-item drilldown consistency (edge cases when items are deleted/moved).
