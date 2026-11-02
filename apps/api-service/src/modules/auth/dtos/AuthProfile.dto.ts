export {
  AuthProfilePermissionGrantSchema,
  AuthProfileRolesPermissionsSchema,
} from '@white-label/shared';
import {
  AuthProfilePermissionGrantSchema,
  AuthProfileRolesPermissionsSchema,
  PasswordSchema,
} from '@white-label/shared';
import { z } from 'zod';

export const AuthProfileUpdateSchema = z.object({
  email_address: z.string().email().optional(),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  avatar_url: z.string().nullable().optional(),
});

export const AuthProfileChangePasswordSchema = z
  .object({
    old_password: z.string().min(1),
    new_password: PasswordSchema,
    new_password_confirmation: z.string().min(1),
  })
  .refine((payload) => payload.new_password !== payload.old_password, {
    message: 'New password should not be the same as the old password.',
    path: ['new_password'],
  })
  .refine(
    (payload) => payload.new_password === payload.new_password_confirmation,
    {
      message: 'New password confirmation does not match.',
      path: ['new_password_confirmation'],
    },
  );

export type AuthProfileUpdate = z.infer<typeof AuthProfileUpdateSchema>;
export type AuthProfileChangePassword = z.infer<
  typeof AuthProfileChangePasswordSchema
>;
export type AuthProfilePermissionGrant = z.infer<
  typeof AuthProfilePermissionGrantSchema
>;
export type AuthProfileRolesPermissions = z.infer<
  typeof AuthProfileRolesPermissionsSchema
>;
