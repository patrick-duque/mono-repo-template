# White Label Studio - API Reference

This document tracks the currently implemented NestJS REST surface. Exact request validation lives
in API DTOs under `apps/api-service/src/modules/*/dtos`.

## Common Contracts

### Mount Points

| Surface | Base path | Notes |
|---------|-----------|-------|
| Root health/version | `/` | Public root controller. |
| Public API | `/api/public` | Unauthenticated routes such as login. |
| Private API v1 | `/api/v1` | JWT-authenticated app routes. |

### Authentication And Authorization

Private routes require:

```http
Authorization: Bearer <access_token>
```

Route tables use these auth labels:

| Auth value | Meaning |
|------------|---------|
| `Public` | No bearer token required. |
| `Public + refresh token` | No bearer token required, but a valid refresh token is required in the body. |
| `JWT only` | Requires a valid bearer token; no route-specific permission metadata. |
| `<KEY>:<ACTION>` | Requires a valid bearer token and the listed role permission action. |

Permission keys and action meanings are defined in `docs/PERMISSION.md`.

### Response Envelope

Normal JSON responses use the shared `Response` envelope. Successful responses usually omit
`statusCode`; errors include it.

```json
{
  "data": {},
  "meta": {
    "page": 1,
    "total": 25,
    "totalPages": 3,
    "perPage": 10
  },
  "message": "Operation completed successfully."
}
```

### Shared Query And Path Shapes

List endpoints use the shared `FilterSchema` from `common/models`. Path identifiers are UUID
strings unless a route explicitly says otherwise.

## Source Contracts

| Area | DTO source |
|------|------------|
| Auth | `apps/api-service/src/modules/auth/dtos` |
| Users | `apps/api-service/src/modules/user/dtos` |
| Roles and permissions | `apps/api-service/src/modules/role/dtos` |

## Implemented Routes

### Root And Auth

| Method | Path | Auth | Purpose | Body / Query |
|--------|------|------|---------|--------------|
| `GET` | `/` | `Public` | Returns API version and welcome message. | None |
| `POST` | `/api/public/auth/login` | `Public` | Authenticates an active user and returns `data.access_token`; remembered logins also return `data.refresh_token`. | `AuthLoginSchema` |
| `POST` | `/api/v1/auth/refresh-token` | `Public + refresh token` | Rotates a valid refresh token and returns fresh `data.access_token` and `data.refresh_token`. | `AuthRefreshTokenSchema` |
| `GET` | `/api/v1/auth/profile` | `JWT only` | Returns the authenticated user profile with embedded `role`. | None |
| `GET` | `/api/v1/auth/profile/roles/permissions` | `JWT only` | Returns the authenticated role's resolved permission grants. | None |
| `PATCH` | `/api/v1/auth/profile` | `JWT only` | Updates the authenticated user's editable profile fields. | `AuthProfileUpdateSchema` |
| `PATCH` | `/api/v1/auth/profile/change-password` | `JWT only` | Changes the authenticated user's password after validating the old password. | `AuthProfileChangePasswordSchema` |

### Users

| Method | Path | Auth | Purpose | Body / Query |
|--------|------|------|---------|--------------|
| `GET` | `/api/v1/users` | `AUTH_USERS:READ` | List users. | List query |
| `GET` | `/api/v1/users/:id` | `AUTH_USERS:READ` | Get one user. | None |
| `POST` | `/api/v1/users` | `AUTH_USERS:CREATE` | Create a pending user. | `UserCreateSchema` |
| `PATCH` | `/api/v1/users/:id` | `AUTH_USERS:UPDATE` | Update a user. | `UserUpdateSchema` |
| `DELETE` | `/api/v1/users/:id` | `AUTH_USERS:DELETE` | Soft-delete a user. | None |

### Roles And Permissions

| Method | Path | Auth | Purpose | Body / Query |
|--------|------|------|---------|--------------|
| `GET` | `/api/v1/roles` | `TEAM_ROLES:READ` | List roles. | List query |
| `GET` | `/api/v1/roles/:id` | `TEAM_ROLES:READ` | Get one role. | None |
| `POST` | `/api/v1/roles` | `TEAM_ROLES:CREATE` | Create a role. | `RoleCreateSchema` |
| `PATCH` | `/api/v1/roles/:id` | `TEAM_ROLES:UPDATE` | Update a role. | `RoleUpdateSchema` |
| `DELETE` | `/api/v1/roles/:id` | `TEAM_ROLES:DELETE` | Soft-delete a role. | None |
| `GET` | `/api/v1/permissions` | `TEAM_ROLES:READ` | List permission resources. | List query |
| `GET` | `/api/v1/permissions/:id` | `TEAM_ROLES:READ` | Get one permission resource. | None |
| `POST` | `/api/v1/permissions` | `TEAM_ROLES:CREATE` | Create a permission resource. | `PermissionCreateSchema` |
| `PATCH` | `/api/v1/permissions/:id` | `TEAM_ROLES:UPDATE` | Update a permission resource. | `PermissionUpdateSchema` |
| `DELETE` | `/api/v1/permissions/:id` | `TEAM_ROLES:DELETE` | Soft-delete a permission resource. | None |
| `GET` | `/api/v1/roles/:roleId/permissions` | `TEAM_ROLES:READ` | List role-permission grants. | List query |
| `GET` | `/api/v1/roles/:roleId/permissions/:id` | `TEAM_ROLES:READ` | Get one role-permission grant. | None |
| `POST` | `/api/v1/roles/:roleId/permissions` | `TEAM_ROLES:CREATE` | Create a role-permission grant. | `RolePermissionCreateSchema` |
| `PATCH` | `/api/v1/roles/:roleId/permissions/:id` | `TEAM_ROLES:UPDATE` | Update a role-permission grant's actions. | `RolePermissionUpdateSchema` |
| `DELETE` | `/api/v1/roles/:roleId/permissions/:id` | `TEAM_ROLES:DELETE` | Soft-delete a role-permission grant. | None |

## Maintenance Checklist

- Keep every implemented route listed exactly once.
- Update auth labels when controller guards or `@Permission()` metadata change.
- Update the Postman collection whenever API controllers or this reference change.
