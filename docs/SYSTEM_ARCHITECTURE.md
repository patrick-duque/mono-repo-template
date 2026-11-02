# White Label Studio - System Architecture

This document defines the retained technical architecture, data conventions, authorization model,
and backend boundaries for the white-label starter.

## System Components

- **React + TanStack Router SPA** - responsive authenticated shell and feature routes.
- **NestJS API** - custom JWT auth, permission guard, response envelope, validation, and database
  boundary.
- **Supabase PostgreSQL** - application data accessed by the API through `SupabaseService`.
- **Supabase Storage** - available for profile images and future file workflows.
- **Shared package** - Zod schemas and derived TypeScript types for API trust-boundary contracts.

The browser must not query private Supabase tables directly. Private reads and writes go through
the NestJS API.

## Migration Status

The checked-in `supabase/migrations/` files contain only the retained auth/access schema
(`roles`, `permissions`, `role_permissions`, `users`, `user_tokens`) and its seed.

## Conventions

- **Primary key:** `id uuid` with `gen_random_uuid()`.
- **Timestamps:** `created_at timestamptz`, `updated_at timestamptz`.
- **Soft delete:** `deleted_at timestamptz NULL` for mutable application tables.
- **Search:** searchable tables can expose an internal `search_vector tsvector` maintained by
  triggers and queried through the shared list `search` parameter.
- **Naming:** `snake_case` tables/columns; foreign keys are `<entity>_id`.
- **Uniqueness with soft deletes:** active uniqueness uses partial unique indexes scoped to
  `WHERE deleted_at IS NULL`.
- **Enums:** static sets use `varchar` plus `CHECK`; avoid native Postgres enum types.
- **Contracts:** use Zod at API and shared-package boundaries, exporting TypeScript types with
  `z.infer`.

## Retained Data Model

```txt
Auth & access
─────────────
users
user_tokens
roles
permissions
role_permissions
```

### users

Each user has one role. Auth is custom NestJS + JWT; Supabase Auth is not used.

| Column | Notes |
|--------|-------|
| `email_address` | Unique email login. |
| `first_name`, `last_name` | Editable profile identity. |
| `role_id` | Required FK to `roles.id`. |
| `password` | Bcrypt hash; never returned by API responses. |
| `status` | `PENDING`, `ACTIVE`, or `INACTIVE`; only active users can log in. |
| `invited_by` | Optional FK to another user. |
| `avatar_url` | Optional profile image URL. |
| `last_login_at` | Updated after successful login. |

### user_tokens

Stores hashed refresh tokens for remembered sessions. Raw refresh tokens are returned only to the
login or refresh caller and are never stored.

### roles

Roles are named access profiles assigned to users.

### permissions

A permission row represents a resource. Retained module values are `AUTH` and `TEAM`.

| Module | Key | Composed key | Covers |
|--------|-----|--------------|--------|
| `AUTH` | `USERS` | `AUTH_USERS` | User create/read/update/delete. |
| `TEAM` | `ROLES` | `TEAM_ROLES` | Roles, permission resources, and grants. |

### role_permissions

For a given role + permission resource, `actions` defines allowed CRUD verbs: `READ`, `CREATE`,
`UPDATE`, `DELETE`.

## Permission Model

A user's access comes from exactly one place: the user's `role_id`. Groups, boards, clients, and
other product-specific access layers are not part of the retained starter.

Protected routes use `JwtAuthGuard`; resource/action routes add `RolePermissionGuard` and
`@Permission()` metadata built from `PERMISSION_MODULE_TYPES`, `PERMISSION_KEYS`, and
`PERMISSION_ACTIONS`.

## API Boundary

Controllers own routing, guards, validation pipes, and response delegation. Services own
orchestration, validation, permissions, and persistence rules. Database access flows through
`SupabaseService`.

```txt
Controller -> Domain Service -> SupabaseService -> Supabase PostgreSQL
```

Future product modules should follow the same boundary and live under
`apps/api-service/src/modules/<domain>/`.
