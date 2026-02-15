---
provider: "codex"
agent_role: "architect"
model: "gpt-5.3-codex"
prompt_id: "e4c67d4f"
timestamp: "2026-02-15T17:55:17.736Z"
---

Use a minimal stack: `React` (frontend) + `Node.js` with `Express` (backend) + static deployment on `Vercel` or `Netlify` for simplicity. Keep the app as a single page that calls one `/api/hello` endpoint returning `"Hello World"` JSON, so frontend/backend boundaries are clear from day one. For local development, use `Vite` for fast startup and `npm` scripts to run both services.