# API Agent Instructions

This file is a compatibility entry point for coding agents working in `apps/api-service/`. The engineer-facing source of truth is `docs/BACKEND_GUIDE.md`.

## Read First

1. `../../README.md`
2. `../../docs/PROJECT_OVERVIEW.md`
3. `../../docs/SYSTEM_ARCHITECTURE.md`
4. `../../docs/CONTENT_AND_FEATURES.md`
5. `../../docs/LIFECYCLE_AND_INTEGRATION.md`
6. `docs/BACKEND_GUIDE.md`
7. Module-level docs under `src/modules/<domain>/` when editing that module.

Use `../../docs/API_REFERENCE.md` when checking implemented route behavior. Update
`../../docs/postman/White Label Studio API.postman_collection.json` whenever API controllers or API route
documentation changes.

## Rule Priority

1. Module-level documentation under `src/modules/<domain>/`.
2. `docs/BACKEND_GUIDE.md`.
3. Root `docs/`.
4. Root `AGENTS.md`.
5. Existing source code patterns.

## Local Reminders

- Keep private data access behind the NestJS API.
- Keep controllers thin and put orchestration/business rules in services.
- Use the shared Zod validation pipe for controller body, query, and params.
- Keep `../../docs/API_REFERENCE.md` and the Postman collection in sync with API controller changes.
- Keep feature domains under `src/modules/<domain>/`.
- Keep database schema changes in root `supabase/migrations/`.
