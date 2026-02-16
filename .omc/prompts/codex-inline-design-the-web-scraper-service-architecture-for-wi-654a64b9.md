Design the **Web Scraper Service Architecture** for Wishlist Central.

**CONTEXT:**
Wishlist Central is a React + Supabase app where users save wishlist items with URLs. Currently, users manually enter:
- Title, URL, Image URL, Merchant, Price, Currency

**GOAL:**
Build a web scraper that automatically extracts product information from a URL to reduce manual data entry.

**REQUIREMENTS:**

1. **User Experience:**
   - User pastes a product URL (Amazon, eBay, Etsy, etc.)
   - System scrapes: title, price, image, merchant
   - User can edit/confirm before saving

2. **Technical Constraints:**
   - React 19 + TypeScript + Vite frontend
   - Supabase backend (PostgreSQL)
   - Must work with localhost dev (CORS considerations)
   - Should handle failures gracefully (some sites block scrapers)

3. **Sites to Support:**
   - Amazon, eBay, Etsy (priority)
   - Generic fallback for other sites

4. **Performance:**
   - Scrape should complete within 5-10 seconds
   - Don't block the UI during scraping
   - Cache results to avoid re-scraping same URLs

**YOUR TASK:**

Design the architecture including:

1. **Service Location:** Where does scraping happen?
   - Frontend-only (limited, CORS issues)
   - Backend API (Supabase Edge Function?)
   - Separate Node.js service?
   - Third-party API (Puppeteer/Playwright cloud)?

2. **Technology Stack:**
   - Puppeteer vs Cheerio vs Playwright vs Browser APIs
   - Proxy/anti-detection considerations
   - Rate limiting strategy

3. **Data Flow:**
   - User enters URL → scraper → extraction → UI preview → save to DB
   - Error handling at each step
   - Timeout handling

4. **Database Schema:**
   - Any new tables needed?
   - Caching strategy (cache scraped data? for how long?)

5. **API Design:**
   - Endpoint: `POST /api/scrape` with URL
   - Response format
   - Error codes/handling

6. **Future-Proofing:**
   - Price tracking: how does scraper integrate with periodic re-scraping?
   - Browser extension: can extension use same scraper service?

**OUTPUT:**
Concrete architecture recommendation with:
- Component diagram (text-based)
- Technology choices with rationale
- API contract examples
- Migration plan (what to build first)
- Known risks and mitigations

Be opinionated and specific. Recommend ONE clear path forward.