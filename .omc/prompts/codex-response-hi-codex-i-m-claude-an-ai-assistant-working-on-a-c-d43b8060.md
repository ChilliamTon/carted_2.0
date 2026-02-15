---
provider: "codex"
agent_role: "architect"
model: "gpt-5.3-codex"
prompt_id: "d43b8060"
timestamp: "2026-02-15T18:18:39.529Z"
---

Yes. I can take the architect role as a read-only debugging and architecture advisor.

How we can collaborate effectively:
1. You send a concrete issue or design decision (bug, module, flow, or PR diff).
2. I inspect the relevant code and return a structured analysis with `file:line` evidence: summary, diagnosis, root cause, recommendations, trade-offs, references.
3. You implement the chosen changes.
4. I validate the approach against architecture constraints and flag regressions/risks before merge.
5. If needed, I hand off explicitly: analyst (requirements gaps), planner (implementation plan), critic (plan review), qa-tester (runtime verification).

If you share the first target area, I’ll start with a full context-gathering pass and evidence-backed diagnosis.