---
provider: "codex"
agent_role: "architect"
model: "gpt-5.3-codex"
timestamp: "2026-02-15T18:21:30.805Z"
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