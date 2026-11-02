# Frontend Agent Instructions

This file is a compatibility entry point for coding agents working in `apps/web-app/`. The engineer-facing source of truth is `docs/FRONTEND_GUIDE.md`.

## Read First

1. `../../README.md`
2. `../../docs/PROJECT_OVERVIEW.md`
3. `../../docs/DESIGN_OVERVIEW.md`
4. `docs/FRONTEND_GUIDE.md`
5. Module-level docs beside a feature module when editing that module.

Use `../../docs/API_REFERENCE.md` when checking implemented API routes consumed by frontend hooks.

## Rule Priority

1. Module-level documentation beside the owning module.
2. `docs/FRONTEND_GUIDE.md`.
3. Root `docs/`.
4. Root `AGENTS.md`.
5. Existing source code patterns.

## Local Reminders

- Keep route files thin and compose feature containers from `src/modules`.
- Keep API calls in React Query hooks, not presentational components.
- Use the existing UI, routing, state, HTTP, and styling stack unless a change is intentionally requested.
- Do not query private Supabase tables directly from browser code; use the API.
- Tests are not configured for this workspace yet, so do not claim frontend tests were run.
