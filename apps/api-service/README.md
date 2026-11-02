# White Label Studio API

NestJS API workspace for the white-label starter. It owns private application access for auth,
users, roles, permissions, profile management, and reusable backend infrastructure.

## Commands

Run from the repository root:

```bash
npm --workspace @white-label/api-service run start:dev
npm --workspace @white-label/api-service run build
npm --workspace @white-label/api-service run lint
npm --workspace @white-label/api-service run test
```

The API lint command runs ESLint with `--fix`, so it can modify files. The root shortcut for local
API development is:

```bash
npm run dev:api-service
```

## Documentation

- Project and architecture context: `../../docs/PROJECT_OVERVIEW.md` and `../../docs/SYSTEM_ARCHITECTURE.md`
- Implemented routes: `../../docs/API_REFERENCE.md`
- Backend implementation guide: `docs/BACKEND_GUIDE.md`
- Agent compatibility entry point: `AGENTS.md`

## Local Shape

```txt
src/main.ts          Nest bootstrap; imports ./modules/app
src/common/          Cross-module constants, models, pipes, requests, and exceptions
src/modules/app/     App composition, configuration, and route namespace controllers
src/modules/auth/    Login, refresh tokens, profile routes, JWT guard/strategy
src/modules/common/  Shared Nest providers, including Supabase and CRUD helper types
src/modules/role/    Roles, permission resources, grants, and guards
src/modules/user/    User CRUD and password hashing orchestration
src/utils/           Small app-independent helpers
```

Follow `docs/BACKEND_GUIDE.md` for module layout, controller/service boundaries, DTO conventions,
environment variables, validation, and testing expectations.
