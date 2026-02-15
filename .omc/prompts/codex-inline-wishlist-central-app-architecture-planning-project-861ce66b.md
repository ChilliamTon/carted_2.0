# Wishlist Central App - Architecture Planning

## Project Overview
Design the architecture for a **web-first wishlist aggregation app** (later ported to iOS) that allows users to save items from various shopping sites, organize them into folders, and track prices/availability.

## Core Requirements

### 1. Share Integration (Web)
- **Browser extension** or **bookmarklet** to capture product URLs from any shopping site
- Extract product metadata: title, image, price, URL, merchant
- Send to backend API for storage

### 2. Data Model
- **Items**: saved products with metadata (title, image, price, URL, merchant, timestamps)
- **Lists**: user-created lists containing items
- **Folders**: organize lists into folders/categories
- **Users**: authentication and data ownership
- **Price History**: track price changes over time
- **Availability Status**: track in-stock/out-of-stock status

### 3. Features
- ✅ Save items from shared URLs (via browser extension)
- ✅ Organize items into lists
- ✅ Organize lists into folders
- ✅ Price tracking with notifications
- ✅ Availability tracking
- ✅ Web scraping for product data extraction

### 4. Technical Constraints
- **Frontend**: React (web app, later portable to React Native for iOS)
- **Backend**: Needs to be web-compatible (NOT CloudKit)
- **Price Tracking**: Web scraping approach
- **First 1000 lines must be robust** - TDD enforced
- **Token-efficient**: Clear, modular architecture with good separation of concerns

## Architecture Questions to Address

1. **Backend Stack**: Recommend Supabase vs Firebase vs Custom REST API, database schema, authentication, API design (REST vs GraphQL)
2. **Web Scraping**: Extract data from diverse sites (Farfetch, Amazon), rate limiting, error handling, caching, scheduled checks
3. **Frontend**: State management, component structure, routing, offline support (PWA?)
4. **Browser Extension**: Chrome/Firefox architecture, backend communication, URL pattern matching
5. **Notifications**: Push notifications for web, email fallback, notification preferences
6. **Scalability & Performance**: Handle thousands of items per user, efficient price check scheduling, caching
7. **Testing Strategy**: Unit/integration/E2E tests, mocking web scraping, TDD workflow for first 1000 lines

## Deliverable
Provide:
1. Recommended tech stack with justification
2. High-level architecture diagram (text-based)
3. Database schema (tables, relationships)
4. API design (key endpoints)
5. Web scraping strategy (libraries, approach, error handling)
6. Deployment strategy
7. Testing approach for TDD
8. Migration path from web app → iOS React Native app

Focus on **robustness, maintainability, and token efficiency**. The architecture should support rapid iteration and testing.