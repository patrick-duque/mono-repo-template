# Auth Module

## Purpose

The auth module owns public team-member login, refresh-token rotation, JWT claim DTOs,
authenticated profile routes, and helpers for reading the authenticated JWT payload in controllers.
Auth is custom NestJS auth backed by the `users` and `user_tokens` tables; Supabase Auth is not used.

## Architecture

```txt
PublicAuthController -> AuthService -> UserService -> SupabaseService -> users
AuthTokenController -> AuthService -> SupabaseService -> user_tokens
Bearer token -> JwtAuthGuard -> JwtStrategy -> request user payload
Permission-gated route -> RolePermissionGuard -> RolePermissionService -> role_permissions
```

- `PublicAuthController` is mounted under `/api/public/auth`, validates login request bodies, and
  delegates login work to `AuthService`.
- `AuthController` is mounted under `/api/v1/auth` as the private auth namespace used by scaffolded
  profile routes.
- `AuthTokenController` is mounted under `/api/v1/auth` and exposes `POST /refresh-token` without
  `JwtAuthGuard` so remembered sessions can refresh an expired access token with a refresh token.
- `AuthProfileController` exposes `GET /api/v1/auth/profile`, reads the authenticated JWT payload
  with `@AuthUser()`, and returns the sanitized current user row from `UserService.findById()`.
  It projects `['*', 'role:roles(*)']` so the response embeds the authenticated user's role
  details under the singular `role` field declared on `UserBaseSchema`. Prefer `'*'` over
  re-listing every column when the only intent is to add an embedded relation.
  `PATCH /api/v1/auth/profile` updates only the authenticated user's editable profile fields
  (`email_address`, `first_name`, `last_name`, and `avatar_url`) through `UserService.update()`.
  `PATCH /api/v1/auth/profile/change-password` verifies the authenticated user's old password,
  rejects matching old/new passwords, and writes the new password through `UserService.update()` so
  the existing bcrypt hashing and response sanitization still apply.
  It also exposes `GET /api/v1/auth/profile/roles/permissions`, which returns the authenticated
  user's current role and active permission grants from `RolePermissionService`.
- `AuthService.authUserLogin()` owns credential checks, active-user gating, `last_login_at`
  stamping, access-token creation, and refresh-token creation for remembered logins.
- `AuthService.refreshAccessToken()` validates a hashed refresh token from `user_tokens`, verifies
  the user is still active, rotates the refresh token, and returns a fresh access token.
- `JwtAuthGuard` wraps Passport's `AuthGuard('jwt')` and should be attached to routes that require a
  team-member bearer token.
- Resource/action authorization is handled after JWT authentication by `RolePermissionGuard` from
  the role module. That guard depends on the JWT `role_id` claim and `@Permission()` route metadata.
- `JwtStrategy` reads `Authorization: Bearer <token>`, verifies it with Passport JWT, validates the
  decoded claim shape with `JwtPayloadSchema` from `dtos/JwtPayload.dto.ts`, and returns the payload
  for guarded request handlers.
- `AuthUser` is a controller param decorator that returns `request.user` as the validated
  `JwtPayload`; controllers should destructure `user_id` for the current user's UUID.
- `UserService.findUser()` is the only user lookup that selects the password hash. Public user reads
  by email. `UserService.findUserById()` is the only authenticated profile lookup that selects the
  password hash by user id. Public user reads must continue to omit `password`.
- JWT signing uses Nest `JwtService` configured from `JWT_SECRET` and `JWT_TLL`.

## Login Rules

- Login accepts `email_address`, `password`, and optional `remember_me`.
- A user must exist, have a stored password hash, pass bcrypt validation, and have
  `status = ACTIVE`.
- `PENDING` and `INACTIVE` users receive `401 Unauthorized`.
- Successful login updates `users.last_login_at` and returns the shared response envelope with
  `data.access_token` plus the sanitized `data.user` row. When `remember_me = true`, it also returns
  `data.refresh_token` and stores only a SHA-256 hash of that token in `user_tokens`.
- `POST /api/v1/auth/refresh-token` accepts `refresh_token`, rejects unknown, revoked, expired, or
  inactive-user tokens with `401 Unauthorized`, revokes the used token, and returns a fresh
  `data.access_token` and `data.refresh_token`.
- JWT claims currently include the user's UUID as `user_id`, plus `email_address` and `role_id`. Do not
  introduce mongoose `ObjectId` types; this API uses UUID identifiers.
- Expired bearer tokens fail with `401 Token expired.`; malformed or unexpected claim payloads fail
  with `401 Unauthorized.`.

## Environment

```env
JWT_SECRET=replace-with-local-jwt-secret
JWT_TLL=90d
```

`JWT_TLL` is passed to `JwtModule.signOptions.expiresIn`. Use jsonwebtoken-compatible values such as
seconds or strings like `15m`, `24h`, or `90d`.

## Boundaries

- Keep password hashing and validation in `utils/password`.
- Keep database access in `UserService` or shared infrastructure, not controllers.
- Keep authenticated password changes in `AuthService.changeProfilePassword()` so old-password
  verification and new-password persistence remain outside controllers.
- Keep claim signing/decoding and refresh-token hashing/rotation in `AuthService`.
- Keep the JWT payload Zod contract in `dtos/JwtPayload.dto.ts`.
- Keep bearer token extraction and claim validation in `JwtStrategy`.
- Use `@AuthUser()` from `modules/auth/decorators` when a guarded controller needs the authenticated
  JWT payload. The user id claim is `user_id`, not `id`.
- Keep guarded-route wiring in controllers with `JwtAuthGuard`.
- Controllers that use `@UseGuards(JwtAuthGuard)` must import the guard from
  `modules/auth/guards`, not from the top-level `modules/auth` barrel. The auth barrel re-exports
  controllers and can create a circular import that passes an invalid guard value to Nest at runtime.
- When a route also needs resource/action authorization, add `RolePermissionGuard` after
  `JwtAuthGuard` and attach `@Permission()` metadata using `PERMISSION_MODULE_TYPES`,
  `PERMISSION_KEYS`, and `PERMISSION_ACTIONS`.
- The profile role-permissions route is JWT-only. It uses the token's `role_id` claim so the
  frontend can discover the current user's allowed controls without already knowing a permission
  grant.
- Do not expose password hashes in controller responses, logs, or shared DTOs.
- Do not expose refresh-token hashes in controller responses, logs, or shared DTOs.
