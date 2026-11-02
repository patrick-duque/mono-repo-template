# White Label Studio

White Label Studio is a neutral full-stack starter monorepo. It keeps the auth, user, role,
permission, profile, API, and responsive web-app foundation from the original project while removing
the prior product-specific clients, boards, tickets, portal, notification, and workflow domains.

Current implementation status: the API implements the reusable auth/access foundation and generic
CRUD scaffolding patterns. The web app implements login, account profile, a generic authenticated
dashboard, a settings placeholder, shared UI primitives, and responsive app chrome. The Expo mobile
app implements login, a profile dashboard, and secure token refresh against the same API.

## Quick Start

Requires Node 26 (see `.nvmrc`). With nvm: `nvm install && nvm use`.

```bash
npm install
npm run dev:web-app
npm run dev:api-service
npm run dev:mobile-app
```

Run the main checks from the repository root:

```bash
npm run build
npm run lint
npm run test
npm run pre-commit
```

`npm run test` runs every workspace test script that exists. `npm run pre-commit` runs lint, build,
then test. Workspace lint scripts currently run ESLint with `--fix`, so lint can modify files.

## Workspaces

```txt
apps/web-app       React + Vite frontend
apps/api-service   NestJS API for auth, users, roles, permissions, and backend conventions
apps/mobile-app    Expo + Expo Router mobile app
packages/shared    Shared Zod contracts, types, and utilities
supabase           Local Supabase config, auth/access schema, and seed migrations
docs               Product, architecture, design, setup, and API documentation
```

Private application reads and writes go through the NestJS API; browser code must not query private
Supabase tables directly, and neither may the mobile app.

## Documentation

Start here:

1. `docs/PROJECT_OVERVIEW.md` - starter purpose, users, core concepts, and scope.
2. `docs/SYSTEM_ARCHITECTURE.md` - retained data model, permissions, conventions, and API boundaries.
3. `docs/PERMISSION.md` - retained permission modules, keys, descriptions, and seed expectations.
4. `docs/CONTENT_AND_FEATURES.md` - retained feature workflows and expected behavior.
5. `docs/DESIGN_OVERVIEW.md` - neutral UI direction, responsive behavior, and accessibility.
6. `docs/LIFECYCLE_AND_INTEGRATION.md` - auth/session flows and future integration boundaries.
7. `docs/MONOREPO_SETUP.md` - workspace layout, commands, and database workflow.
8. `docs/WEB_REFERENCE.md` - currently implemented frontend routes and runtime behavior.
9. `docs/API_REFERENCE.md` - currently implemented REST routes.

Implementation guides:

- `apps/web-app/docs/FRONTEND_GUIDE.md`
- `apps/api-service/docs/BACKEND_GUIDE.md`
- `apps/mobile-app/docs/MOBILE_GUIDE.md`

## Common Commands

```bash
npm --workspace @white-label/web-app run start:dev
npm --workspace @white-label/web-app run build
npm --workspace @white-label/web-app run lint

npm --workspace @white-label/api-service run start:dev
npm --workspace @white-label/api-service run build
npm --workspace @white-label/api-service run lint
npm --workspace @white-label/api-service run test

npm --workspace @white-label/mobile-app run start
npm --workspace @white-label/mobile-app run lint
npm --workspace @white-label/mobile-app run typecheck

npm run pre-commit
npm run supabase:start
npm run supabase:stop
npm run supabase:reset
```
