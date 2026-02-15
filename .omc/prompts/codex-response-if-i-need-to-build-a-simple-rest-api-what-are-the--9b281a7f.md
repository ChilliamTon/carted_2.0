---
provider: "codex"
agent_role: "planner"
model: "gpt-5.3-codex"
prompt_id: "9b281a7f"
timestamp: "2026-02-15T18:16:57.770Z"
---

1. **Routing + Controllers**  
Define endpoints (`GET/POST/...`) and handlers that process requests and return responses.

2. **Business Logic + Data Layer**  
Implement core rules/services and connect to storage (database/repository) for CRUD operations.

3. **Cross-cutting API Infrastructure**  
Include request validation, authentication/authorization, error handling, and consistent JSON response formatting (plus basic logging).