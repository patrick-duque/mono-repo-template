# Backend Guide

Implementation rules for the White Label Studio NestJS API. Root docs cover product intent,
architecture, permissions, and route inventory; this guide covers backend structure, coding
conventions, naming, validation, and tests.

## Stack

- NestJS 12 (ESM-only packages; the app compiles to CommonJS and loads them through Node `require(esm)`)
- TypeScript 6 strict mode (`strict` is on by default in TypeScript 6)
- Jest (run with `--experimental-vm-modules` so it can load ESM-only NestJS packages)
- Supabase PostgreSQL as the application database
- Supabase Storage or S3-compatible storage for files
- Zod
- npm package manager

## Commands

Run commands from the repository root unless noted otherwise.

```bash
npm --workspace @white-label/api-service run start:dev
npm --workspace @white-label/api-service run build
npm --workspace @white-label/api-service run lint
npm --workspace @white-label/api-service run test
npm run test
npm run pre-commit
npm run dev:api-service
```

The API lint command runs ESLint with `--fix`, so use it as lint-and-auto-fix rather than a
read-only check.

## Testing

- Keep API unit specs as `.spec.ts` files beside the implementation they cover.
- Prioritize service specs for business rules, validation, permission checks, access scoping, and
  persistence orchestration.
- Thin controllers usually need metadata/delegation coverage rather than one large spec per route
  method.
- When changing service method signatures or forwarded arguments, update the matching `.spec.ts`.
- Run the API test script after API changes; run `npm run pre-commit` for commit readiness.

## Architecture

- Keep the NestJS API as the boundary for private data access.
- Do not expose Supabase tables directly to the browser.
- Controllers handle routing, guards, validation pipes, and response delegation.
- Controllers must not contain business logic or access the database directly.
- Services own orchestration, validation, permissions, and business rules.
- `SupabaseService` owns Supabase client construction, generic query helpers, Zod payload
  validation for scaffolded resource operations, and generic create/update/delete persistence.
- Database schema changes live in root `supabase/migrations/`.
- Use events, services, or exported module APIs for cross-domain behavior.
- Do not create product-module repository folders; domain services inject `SupabaseService` from
  `modules/common` when they need database access.
- Use explicit barrel exports for public TypeScript entrypoints.

Layer flow:

```txt
Controller -> Domain Service -> SupabaseService -> Database
```

Current application layout:

```txt
src/
  main.ts                 Nest bootstrap; imports ./modules/app
  common/                 Cross-module primitives: constants, models, pipes, requests, exceptions
  modules/
    app/                  Application composition module loaded by main.ts
    auth/                 Login, JWT claims, guards, strategies, profile routes
    common/               Shared Nest providers such as Supabase
    role/                 Roles, permission resources, grants, and permission guards
    user/                 Users and password hashing orchestration
  utils/                  Small app-independent runtime helpers
```

The `modules/app` folder owns app-wide imports, app-level configuration, and route namespace
controllers. API route namespaces are composed with app-level controller classes and
`@ExtendedController`.

## Module Shape

Use the same shape for non-trivial domains:

```txt
src/modules/<domain>/
  <domain>.module.ts
  exports.ts              Optional; providers intentionally exported to other modules
  index.ts
  imports.ts
  controllers/
    index.ts
    v1/
      <domain>.controller.ts
      <domain><SubResource>.controller.ts
  dtos/
    index.ts
    <Domain>.dto.ts
    <Domain><SubResource>.dto.ts
  services/
    index.ts
    <domain>.service.ts
    <domain><SubResource>.service.ts
```

Add optional `providers/events/`, `providers/processors/`, `providers/projectors/`, or
`providers/reactors/` folders only when the module owns event-driven behavior.

## Controller Rules

- Product-domain routing is composed with `@ExtendedController`.
- Private module parent controllers should attach `@UseGuards(JwtAuthGuard)`.
- Public controllers, such as `/api/public/auth/login`, remain unguarded unless intentionally
  authenticated.
- Permission-gated routes attach `@UseGuards(JwtAuthGuard, RolePermissionGuard)` and
  `@Permission()` metadata.
- Import `JwtAuthGuard` from `modules/auth/guards`, not from the top-level auth barrel.
- Import `RolePermissionGuard` from `modules/role/guards`.
- Build permission keys with `PERMISSION_MODULE_TYPES`, `PERMISSION_KEYS`, and
  `PERMISSION_ACTIONS`, not raw strings.
- Controller return values should use the shared `Response` type and set only `data`, `meta`, and
  `message` directly.

## DTO And Service Rules

- `dtos/` contains flat resource-specific DTO/Zod schema files used by controllers and services.
- Split sub-resource DTOs into their own files and re-export public schemas/types from
  `dtos/index.ts`.
- `services/` contains orchestration and business rules.
- Role-permission lookups belong in `RolePermissionService`.
- Keep password hashing and verification in `utils/password` and auth/user services, never in
  controllers.
- Use shared package contracts only when both workspaces need the model or DTO.

## Shared Contracts

- Shared runtime contracts live in `packages/shared/src/schemas.ts`.
- Use Zod for trust-boundary runtime contracts and derive exported TypeScript types with `z.infer`.
- Name Zod schemas with PascalCase and a `Schema` suffix.
- Row schemas with embedded relation fields should make embeds optional and relation-free write
  schemas.
- Self-referencing schemas use a private `XxxBaseSchema`, `z.lazy()`, and explicit `z.ZodType<Xxx>`.

## Module Docs

Module guides are optional and should cover only module-specific rules that are more specific than
this guide. Auth currently has `src/modules/auth/AUTH.md`.

## Validation

- Run `npm --workspace @white-label/api-service run test` for API behavior.
- Run `npm --workspace @white-label/api-service run build` for compile validation.
- Run `npm run pre-commit` before finalizing broad changes when feasible.
