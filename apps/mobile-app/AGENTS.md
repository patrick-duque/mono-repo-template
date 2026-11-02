# Mobile App Agent Instructions

This file is a compatibility entry point for coding agents working in `apps/mobile-app/`. The
engineer-facing source of truth is `docs/MOBILE_GUIDE.md`.

## Read First

1. `../../README.md`
2. `../../docs/PROJECT_OVERVIEW.md`
3. `docs/MOBILE_GUIDE.md`
4. Module-level docs beside a feature module when editing that module.

Use `../../docs/API_REFERENCE.md` when checking API routes consumed by mobile hooks.

## Rule Priority

1. Module-level documentation beside the owning module.
2. `docs/MOBILE_GUIDE.md`.
3. Root `docs/`.
4. Root `AGENTS.md`.
5. Existing source code patterns.

## Local Reminders

- Expo changes every SDK release. Check the versioned docs for the `expo` major in `package.json`
  before using any Expo or React Native API.
- Add dependencies with `npx expo install <package>`, never plain `npm install`.
- Keep route files in `src/app/` thin; compose containers from `src/modules`.
- Keep API calls in React Query hooks and parse responses with Zod.
- Store tokens only through `utils/helpers/authStorage` (SecureStore).
- Do not create or edit `ios/` or `android/` by hand.
- Do not query Supabase directly; use the API.
- Run `npm run lint` and `npm run typecheck` before declaring work done.
- Tests are not configured for this workspace yet, so do not claim mobile tests were run.
