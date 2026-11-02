# Permissions

White Label Studio uses resource permissions with action grants. A user has one role, and that role
grants actions on permission resources through `role_permissions.actions`.

## Actions

| Action | Meaning |
|--------|---------|
| `READ` | View or list the resource. |
| `CREATE` | Create the resource. |
| `UPDATE` | Edit the resource or perform an update-style operation. |
| `DELETE` | Soft-delete or remove the resource. |

## Permission Modules And Keys

Retained `permissions.module` values are `AUTH` and `TEAM`.

| Module | Key | Composed key | Description |
|--------|-----|--------------|-------------|
| `AUTH` | `USERS` | `AUTH_USERS` | Create, invite, edit, activate, deactivate, and delete users. |
| `TEAM` | `ROLES` | `TEAM_ROLES` | Manage roles, permission resources, and role permission grants. |

Backend route metadata should build composed values from `PERMISSION_MODULE_TYPES` and
`PERMISSION_KEYS` instead of raw string literals. Permission create/update requests may send the
resource segment such as `USERS`; the API stores the composed key.

## Backend Enforcement

Private routes are authenticated with `JwtAuthGuard`. Routes that also require role grants attach
`RolePermissionGuard` and `@Permission({ actions }, composedKey)`.

```ts
@Permission(
  { actions: PERMISSION_ACTIONS.READ },
  `${PERMISSION_MODULE_TYPES.AUTH}_${PERMISSION_KEYS.USERS}`,
)
```

Current backend enforcement:

| Route area | Enforcement |
|------------|-------------|
| Auth profile | JWT only. |
| Users | `AUTH_USERS` actions. |
| Roles, permission resources, and role-permission grants | `TEAM_ROLES` actions. |

## Permission Presets

The seeder migration grants the Super Admin role every action on every starter permission:

| Permission | super_admin |
|------------|-------------|
| `AUTH_USERS` | R, C, U, D |
| `TEAM_ROLES` | R, C, U, D |

New roles and permission resources should start with `READ` through the database-maintained matrix,
then admins can expand or remove actions.
