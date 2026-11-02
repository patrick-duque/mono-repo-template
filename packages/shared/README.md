# @white-label/shared

Shared types, DTOs, schemas, and utilities for White Label Studio workspaces.

Shared runtime contracts live in `src/schemas.ts` as Zod schemas. Export TypeScript types from
those schemas with `z.infer` so the API and web app consume the same model and DTO contracts.

## Embedded relation fields

Row schemas with foreign-key columns carry a matching **optional** embedded field named after
the singular relation:

```ts
export const UserSchema = BaseRowSchema.extend({
  // ...
  role_id: UuidSchema,
  role: RoleSchema.optional(),   // populated only when projected
  // ...
});
```

The field is populated only when the caller projects the relation via the API's
`selectFields` argument, aliased to the singular form so the response key matches:

```ts
userService.findUserById(id, ['*', 'role:roles(*)']);
```

Without that projection, the field is simply absent — existing default reads remain valid.

`Create*Schema` / `Update*Schema` stay relation-free (write payloads only).

Self-referencing schemas such as `UserSchema.invited_by_user` use a private `XxxBaseSchema` +
`z.lazy()` + explicit `z.ZodType<Xxx>` annotation. Follow that pattern when adding new
self-references.
