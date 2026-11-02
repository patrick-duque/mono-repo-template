# White Label Studio Web App

React + Vite frontend workspace for the white-label starter.

Current status: the root route renders the unauthenticated `Login` module when no access-token
cookie is present and renders the authenticated dashboard shell when the provider auth state is
true. Account and Settings routes are retained as starter examples.

## Commands

Run from the repository root:

```bash
npm --workspace @white-label/web-app run start:dev
npm --workspace @white-label/web-app run build
npm --workspace @white-label/web-app run lint
npm --workspace @white-label/web-app run pretty
npm --workspace @white-label/web-app run preview
```

The root shortcut for local frontend development is:

```bash
npm run dev:web-app
```

Tests are not configured for this workspace yet.

## Documentation

- Project context: `../../docs/PROJECT_OVERVIEW.md`
- Design system: `../../docs/DESIGN_OVERVIEW.md`
- Current web behavior: `../../docs/WEB_REFERENCE.md`
- Implemented API routes: `../../docs/API_REFERENCE.md`
- Frontend implementation guide: `docs/FRONTEND_GUIDE.md`
- Agent compatibility entry point: `AGENTS.md`

## Local Shape

```txt
src/modules/        Feature modules
src/modules/Login/  Login entry point, API hook, and DTOs
src/routes/         TanStack Router file routes
src/ui/             Shared UI, layouts, and app chrome
src/utils/          Shared helpers, hooks, providers, state, and types
src/assets/         Source assets and global styles
public/             Static browser assets
```

Follow `docs/FRONTEND_GUIDE.md` for routing, module boundaries, data fetching, styling,
accessibility, validation, and build expectations.
