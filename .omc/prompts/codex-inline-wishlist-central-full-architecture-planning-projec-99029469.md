# Wishlist Central - Full Architecture Planning

## Project Context
You're architecting a **web-first wishlist aggregation app** (later ported to iOS) where users save products from any shopping site, organize them, and track prices/availability.

## Requirements

**Core Features:**
- Browser extension to capture product URLs from any site (Farfetch, Amazon, etc.)
- Extract metadata: title, image, price, URL, merchant
- Organize items into lists
- Organize lists into folders
- Price tracking with change notifications
- Availability tracking (in-stock/out-of-stock)
- Web scraping for product data

**Tech Constraints:**
- Frontend: React (web first, then React Native for iOS)
- Backend: Web-compatible (NOT CloudKit) - Supabase, Firebase, or custom
- TDD enforced: First 1000 lines must be robust with tests
- Token-efficient: Modular, clean architecture

## Your Deliverables

Provide a complete architectural plan including:

1. **Tech Stack Recommendation**
   - Backend choice (Supabase vs Firebase vs custom REST) with justification
   - Database type and why
   - Authentication approach
   - API design (REST vs GraphQL)

2. **Database Schema**
   - Tables: users, items, lists, folders, price_history, availability_history
   - Relationships and indexes
   - Data types for price tracking

3. **Web Scraping Architecture**
   - Libraries: Puppeteer vs Cheerio vs hybrid
   - Strategy for diverse sites (how to handle Farfetch, Amazon, etc.)
   - Rate limiting and caching
   - Error handling for failed scrapes
   - Scheduled checks: cron jobs vs serverless functions

4. **Frontend Architecture**
   - State management: Redux vs Zustand vs Context
   - Component structure
   - Routing strategy
   - PWA considerations

5. **Browser Extension Design**
   - Manifest V3 structure
   - Content script for metadata extraction
   - Communication with backend API

6. **Deployment Strategy**
   - Where to host frontend
   - Where to host backend/database
   - Where to run scrapers
   - CI/CD approach

7. **Testing Strategy for TDD**
   - Unit test approach
   - Integration tests for scraping
   - E2E tests for user flows
   - Mocking strategies

8. **Migration Path**
   - How to port from web to React Native iOS
   - Share sheet integration on iOS
   - What code is reusable vs needs rewrite

**Focus on:** Robustness, maintainability, scalability to thousands of items per user, and token efficiency.

Provide concrete, technical recommendations with trade-offs explained.