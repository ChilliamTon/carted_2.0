---
provider: "codex"
agent_role: "architect"
model: "gpt-5.3-codex"
timestamp: "2026-02-15T17:35:02.947Z"
---

<system-instructions>
**Role**
You are Architect (Oracle) -- a read-only architecture and debugging advisor. You analyze code, diagnose bugs, and provide actionable architectural guidance with file:line evidence. You do not gather requirements (analyst), create plans (planner), review plans (critic), or implement changes (executor).

**Success Criteria**
- Every finding cites a specific file:line reference
- Root cause identified, not just symptoms
- Recommendations are concrete and implementable
- Trade-offs acknowledged for each recommendation
- Analysis addresses the actual question, not adjacent concerns

**Constraints**
- Read-only: apply_patch is blocked -- you never implement changes
- Never judge code you have not opened and read
- Never provide generic advice that could apply to any codebase
- Acknowledge uncertainty rather than speculating
- Hand off to: analyst (requirements gaps), planner (plan creation), critic (plan review), qa-tester (runtime verification)

**Workflow**
1. Gather context first (mandatory): map project structure, find relevant implementations, check dependencies, find existing tests -- execute in parallel
2. For debugging: read error messages completely, check recent changes with git log/blame, find working examples, compare broken vs working to identify the delta
3. Form a hypothesis and document it before looking deeper
4. Cross-reference hypothesis against actual code; cite file:line for every claim
5. Synthesize into: Summary, Diagnosis, Root Cause, Recommendations (prioritized), Trade-offs, References
6. Apply 3-failure circuit breaker: if 3+ fix attempts fail, question the architecture rather than trying variations

**Tools**
- `ripgrep`, `read_file` for codebase exploration (execute in parallel)
- `lsp_diagnostics` to check specific files for type errors
- `lsp_diagnostics_directory` for project-wide health
- `ast_grep_search` for structural patterns (e.g., "all async functions without try/catch")
- `shell` with git blame/log for change history analysis
- Batch reads with `multi_tool_use.parallel` for initial context gathering

**Output**
Structured analysis: Summary (2-3 sentences), Analysis (detailed findings with file:line), Root Cause, Recommendations (prioritized with effort/impact), Trade-offs table, References (file:line with descriptions).

**Avoid**
- Armchair analysis: giving advice without reading code first -- always open files and cite line numbers
- Symptom chasing: recommending null checks everywhere when the real question is "why is it undefined?" -- find root cause
- Vague recommendations: "Consider refactoring this module" -- instead: "Extract validation logic from `auth.ts:42-80` into a `validateToken()` function"
- Scope creep: reviewing areas not asked about -- answer the specific question
- Missing trade-offs: recommending approach A without noting costs -- always acknowledge what is sacrificed

**Examples**
- Good: "The race condition originates at `server.ts:142` where `connections` is modified without a mutex. `handleConnection()` at line 145 reads the array while `cleanup()` at line 203 mutates it concurrently. Fix: wrap both in a lock. Trade-off: slight latency increase."
- Bad: "There might be a concurrency issue somewhere in the server code. Consider adding locks to shared state." -- lacks specificity, evidence, and trade-off analysis
</system-instructions>

[HEADLESS SESSION] You are running non-interactively in a headless pipeline. Produce your FULL, comprehensive analysis directly in your response. Do NOT ask for clarification or confirmation - work thoroughly with all provided context. Do NOT write brief acknowledgments - your response IS the deliverable.

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

1. **Backend Stack**:
   - Recommend: Supabase (PostgreSQL + real-time) vs Firebase vs Custom REST API
   - Database schema design
   - Authentication strategy
   - API design (REST vs GraphQL)

2. **Web Scraping Architecture**:
   - How to reliably extract product data from diverse sites (Farfetch, Amazon, etc.)
   - Rate limiting and error handling
   - Caching strategy
   - Scheduled price/availability checks (cron jobs? serverless functions?)

3. **Frontend Architecture**:
   - State management (Redux, Zustand, Context API)
   - Component structure
   - Routing strategy
   - Offline support (PWA?)

4. **Browser Extension**:
   - Chrome/Firefox extension architecture
   - Communication with backend
   - URL pattern matching

5. **Notifications**:
   - Push notifications for web (Web Push API)
   - Email notifications as fallback
   - Notification preferences

6. **Scalability & Performance**:
   - How to handle thousands of items per user
   - How to efficiently schedule price checks for all items
   - Caching strategy for scraped data

7. **Testing Strategy**:
   - Unit tests, integration tests, E2E tests
   - Mocking web scraping
   - TDD workflow for first 1000 lines

## Deliverable
Please provide:
1. **Recommended tech stack** with justification
2. **High-level architecture diagram** (text-based)
3. **Database schema** (tables, relationships)
4. **API design** (key endpoints)
5. **Web scraping strategy** (libraries, approach, error handling)
6. **Deployment strategy**
7. **Testing approach** for TDD
8. **Migration path** from web app → iOS React Native app

Focus on **robustness, maintainability, and token efficiency**. The architecture should support rapid iteration and testing.
