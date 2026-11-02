import { z } from 'zod';

const DateTimeSchema = z.string().min(1);
const NullableDateTimeSchema = DateTimeSchema.nullable();
const NullableStringSchema = z.string().nullable();
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const UuidSchema = z.uuid();
export const PasswordSchema = z
  .string()
  .regex(
    PASSWORD_REGEX,
    'Password must contain at least 8 characters including a number and a letter.',
  );

export const BaseRowSchema = z.object({
  id: UuidSchema,
  created_at: DateTimeSchema,
  updated_at: DateTimeSchema,
  deleted_at: NullableDateTimeSchema,
});

export const PermissionActionSchema = z.enum([
  'READ',
  'CREATE',
  'UPDATE',
  'DELETE',
]);
export const PermissionModuleSchema = z.enum(['AUTH', 'TEAM']);
export const UserStatusSchema = z.enum(['PENDING', 'ACTIVE', 'INACTIVE']);

export const RoleSchema = BaseRowSchema.extend({
  name: z.string().min(1),
  description: NullableStringSchema,
});
export const RoleCreateSchema = z.object({
  name: z.string().min(1),
  description: NullableStringSchema.optional(),
});
export const RoleUpdateSchema = RoleCreateSchema.partial();

export const PermissionSchema = BaseRowSchema.extend({
  module: PermissionModuleSchema,
  name: z.string().min(1),
  key: z.string().min(1),
  description: NullableStringSchema,
});
export const PermissionCreateSchema = z.object({
  module: PermissionModuleSchema,
  name: z.string().min(1),
  key: z.string().min(1),
  description: NullableStringSchema.optional(),
});
export const PermissionUpdateSchema = PermissionCreateSchema.partial();

const UserBaseSchema = BaseRowSchema.extend({
  email_address: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  role_id: UuidSchema,
  role: RoleSchema.optional(),
  status: UserStatusSchema,
  invited_by: UuidSchema.nullable(),
  avatar_url: NullableStringSchema,
  last_login_at: NullableDateTimeSchema,
});

export type User = z.infer<typeof UserBaseSchema> & {
  invited_by_user?: User;
};

export const UserSchema: z.ZodType<User> = UserBaseSchema.extend({
  invited_by_user: z.lazy((): z.ZodType<User> => UserSchema).optional(),
});
export const UserCreateSchema = z.object({
  email_address: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  role_id: UuidSchema,
  password: PasswordSchema,
  status: UserStatusSchema.optional(),
  invited_by: UuidSchema.nullable().optional(),
  avatar_url: NullableStringSchema.optional(),
  last_login_at: NullableDateTimeSchema.optional(),
});
export const UserUpdateSchema = UserCreateSchema.partial();

export const RolePermissionSchema = BaseRowSchema.extend({
  role_id: UuidSchema,
  role: RoleSchema.optional(),
  permission_id: UuidSchema,
  permission: PermissionSchema.optional(),
  actions: z.array(PermissionActionSchema).min(1),
});
export const RolePermissionCreateSchema = z.object({
  role_id: UuidSchema,
  permission_id: UuidSchema,
  actions: z.array(PermissionActionSchema).min(1),
});
export const RolePermissionUpdateSchema = RolePermissionCreateSchema.partial();

export const AuthProfilePermissionGrantSchema = PermissionSchema.extend({
  grant: RolePermissionSchema,
});
export const AuthProfileRolesPermissionsSchema = z.object({
  role: RoleSchema,
  permissions: z.array(AuthProfilePermissionGrantSchema),
});

export type Role = z.infer<typeof RoleSchema>;
export type PermissionAction = z.infer<typeof PermissionActionSchema>;
export type PermissionModule = z.infer<typeof PermissionModuleSchema>;
export type Permission = z.infer<typeof PermissionSchema>;
export type RolePermission = z.infer<typeof RolePermissionSchema>;
export type AuthProfilePermissionGrant = z.infer<
  typeof AuthProfilePermissionGrantSchema
>;
export type AuthProfileRolesPermissions = z.infer<
  typeof AuthProfileRolesPermissionsSchema
>;
