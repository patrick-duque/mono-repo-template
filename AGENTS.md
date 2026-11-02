# Repository Agent Instructions

This file is a compatibility entry point for coding agents. The project documentation is written for engineers and is the source of truth.

## Context Order

Read these first, in order:

1. `README.md` for quickstart, workspace map, and documentation routing.
2. `docs/PROJECT_OVERVIEW.md` for starter purpose, users, core concepts, and scope.
3. `docs/SYSTEM_ARCHITECTURE.md` for data relationships, schema conventions, permissions, and backend boundaries.
4. `docs/PERMISSION.md` for permission actions, keys, descriptions, and presets.
5. `docs/CONTENT_AND_FEATURES.md` for feature workflows and expected behavior.
6. `docs/DESIGN_OVERVIEW.md` for UI direction, responsive behavior, and accessibility.
7. `docs/LIFECYCLE_AND_INTEGRATION.md` for runtime flows and integration boundaries.
8. `docs/MONOREPO_SETUP.md` for workspace layout, commands, and database workflow.
9. `docs/API_REFERENCE.md` when changing or checking implemented API routes.
10. `docs/postman/White Label Studio API.postman_collection.json` when API controllers or API route
    documentation changes.

For workspace implementation rules, read:

- `apps/api-service/docs/BACKEND_GUIDE.md` when working in `apps/api-service/`.
- `apps/web-app/docs/FRONTEND_GUIDE.md` when working in `apps/web-app/`.
- `apps/mobile-app/docs/MOBILE_GUIDE.md` when working in `apps/mobile-app/`.

Read folder-level documentation only when editing that folder or when a module explicitly provides local rules, such as `apps/api-service/src/modules/auth/AUTH.md`.

## Grill On Ambiguity

Before writing code, stop and ask when the request is ambiguous. Claude Code users can run the
project skill `/grilling` (`.claude/skills/grilling/SKILL.md`); other agents follow the same steps.

Ask first when any of these is true:

- The request has two or more readings that lead to materially different work.
- You are about to invent a requirement, API, file path, flag, or fact that is not in the request,
  the repo, or a verified source.
- The change spans more than three files and the approach is not pinned down.
- You notice yourself thinking "I'll assume X" about something that changes the output.

Do not ask when:

- The task is a single bounded edit or a question with one factual answer.
- The same work was already clarified earlier in the session.
- The decision has an obvious conventional default in this repo. Use it and say so.

How to ask: one round, every open question at once, numbered, each with your recommended answer.
Then wait. Never silently widen or narrow scope; state any remaining assumption explicitly.

## Rule Priority

1. Module-level documentation beside the owning module.
2. Workspace implementation guides.
3. Root `docs/`.
4. This file.
5. Existing source code patterns.

## Repository Rules

- Keep dependencies in the package that uses them.
- Put reusable app-independent contracts and utilities in a shared package only when more than one workspace needs them.
- Use Zod for trust-boundary runtime contracts and derive exported TypeScript types with `z.infer`.
- Keep database changes in timestamped SQL files under `supabase/migrations/`.
- Keep the Postman collection in `docs/postman/` updated whenever API controllers or
  `docs/API_REFERENCE.md` change.
- Run the relevant build, lint, and configured validation checks for the workspace changed.
- Do not expose private Supabase tables directly to browser code; use the NestJS API boundary described in `docs/SYSTEM_ARCHITECTURE.md`.
