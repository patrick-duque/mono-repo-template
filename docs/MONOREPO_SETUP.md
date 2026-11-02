# Monorepo Setup

White Label Studio uses an npm workspace monorepo. This document owns workspace layout, root
commands, and local database workflow. App-specific implementation rules live in the workspace
guides.

## Workspace Layout

```txt
apps/web-app       React + Vite frontend
apps/api-service   NestJS API service
apps/mobile-app    Expo + Expo Router mobile app
packages/shared    Shared contracts, types, and utilities
supabase           Local Supabase config, schema, and seed migrations
docs               Product, architecture, design, setup, API, and web docs
```

Supabase is not a Node package. It is managed from the repository root with Supabase CLI scripts.

## App Entry Points

Frontend source is under `apps/web-app/src`. Feature modules, routes, UI, utilities, assets, and
frontend conventions are documented in `apps/web-app/docs/FRONTEND_GUIDE.md`.

API source is under `apps/api-service/src`. The Nest bootstrap is `main.ts`, app composition lives
in `modules/app`, and feature domains live under `modules/<domain>`. Backend module layout,
controller/service boundaries, DTO conventions, and environment rules are documented in
`apps/api-service/docs/BACKEND_GUIDE.md`.

Mobile source is under `apps/mobile-app/src`. Expo Router routes live in `src/app`, feature modules
in `src/modules`, and the API client and session provider in `src/utils`. Mobile conventions, auth
flow, and device setup are documented in `apps/mobile-app/docs/MOBILE_GUIDE.md`.

## Root Commands

```bash
npm install
npm run dev:web-app
npm run dev:api-service
npm run dev:mobile-app
npm run build
npm run lint
npm run test
npm run pre-commit
npm run supabase:start
npm run supabase:stop
npm run supabase:reset
```

Target one app when needed:

```bash
npm --workspace @white-label/web-app run start:dev
npm --workspace @white-label/api-service run start:dev
npm --workspace @white-label/mobile-app run start
```

`npm run test` dispatches to workspace test scripts with `npm --workspaces --if-present run test`.
`npm run pre-commit` runs `lint`, `build`, and `test`. Root `lint` includes the mobile app's
`expo lint` and `tsc --noEmit`; the mobile app has no `build` step in `pre-commit`.

## Toolchain

- Node 26 LTS, pinned in `.nvmrc` and enforced as `engines.node` in the root `package.json`.
  NestJS 12 is ESM-only; Jest loads it through `require(esm)`, which needs Node 24.9 or newer.
- npm, pinned in `packageManager`. There is one lockfile: the root `package-lock.json`.

## Dependency Rules

Keep dependencies in the package that uses them. Put reusable app-independent types and utilities in
a shared package only when more than one workspace needs them. Add mobile dependencies with
`npx expo install` so versions match the Expo SDK.

## Updating Dependencies

Dependabot (`.github/dependabot.yml`) opens grouped weekly PRs for npm and GitHub Actions. For a
manual update pass:

1. `nvm use` so you are on the pinned Node version.
2. Web, API, root, and `packages/shared`: run `npx npm-check-updates -u` in each folder, then
   `npm install` at the root. Do this one workspace at a time, then read the changelog of each
   major version bump.
3. Mobile: never bump Expo-managed packages by hand. Run `npx expo install expo@latest` and then
   `npx expo install --fix` in `apps/mobile-app`, then `npx expo-doctor`.
4. React: the root `overrides` pins `react` and `react-dom` to the version the Expo SDK requires,
   and `apps/web-app` uses the same exact version. When Expo moves React, update all three.
5. Run `npm run pre-commit` and `npx expo-doctor`, and boot the API once (`npm run dev:api-service`):
   dependency-injection errors only show up at runtime.
6. If installs leave duplicate versions behind (for example two `@nestjs/core` copies), delete
   `node_modules` folders and `package-lock.json`, then run `npm install` again.

Known holds (also encoded as Dependabot ignores):

| Package | Held at | Reason |
|---------|---------|--------|
| `typescript` | 6.0 | `typescript-eslint` and `ts-jest` do not support TypeScript 7 yet. |
| `eslint`, `@eslint/js` | 9 | `eslint-plugin-import` does not support ESLint 10 yet. |
| `react`, `react-dom` | Expo SDK version | Expo pins React; web and mobile share one copy. |

`npm audit` reports some remaining moderate and high advisories in dev tooling (glob/minimatch under
ESLint, Jest, and the Nest CLI) and in Expo CLI's bundled `zod` 3. Their only suggested fixes are
downgrades, so they are tracked rather than forced.

## Database Workflow

The baseline migration creates the retained auth/access tables and the seeder migration adds the
Super Admin role, the `AUTH_USERS` and `TEAM_ROLES` permissions, and the seed admin user. Add new
schema changes as new timestamped files under `supabase/migrations/`.
