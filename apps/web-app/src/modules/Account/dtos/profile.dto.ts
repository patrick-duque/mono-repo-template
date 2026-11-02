import { z } from 'zod';

const NullableDateTimeSchema = z.string().min(1).nullable();
const NullableStringSchema = z.string().nullable();
const PasswordSchema = z
  .string()
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
    'Password must contain at least 8 characters including a number and a letter.',
  );
const UserStatusSchema = z.enum(['PENDING', 'ACTIVE', 'INACTIVE']);

export const RoleSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  description: z.string().nullable().optional(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
  deleted_at: NullableDateTimeSchema,
});

export const ProfileSchema = z.object({
  id: z.string().min(1),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
  deleted_at: NullableDateTimeSchema,
  email_address: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  role_id: z.string().min(1),
  role: RoleSchema.nullable().optional(),
  status: UserStatusSchema,
  invited_by: NullableStringSchema,
  avatar_url: NullableStringSchema,
  last_login_at: NullableDateTimeSchema,
});

export const ProfileResponseSchema = z.object({
  data: ProfileSchema,
  message: z.string().optional(),
});

export const ProfileUpdateSchema = z.object({
  avatar_url: z.string().nullable().optional(),
  email_address: z.string().email().optional(),
  first_name: z.string().min(1, 'First name is required.').optional(),
  last_name: z.string().min(1, 'Last name is required.').optional(),
});

export const ProfileDetailsFormSchema = z.object({
  avatar_url: z
    .string()
    .trim()
    .transform((value) => (value ? value : null))
    .nullable(),
  email_address: z.string().email('Enter a valid email address.'),
  first_name: z.string().trim().min(1, 'First name is required.'),
  last_name: z.string().trim().min(1, 'Last name is required.'),
  role_name: z.string(),
});

export const ChangePasswordSchema = z
  .object({
    old_password: z.string().min(1, 'Current password is required.'),
    new_password: PasswordSchema,
    new_password_confirmation: z.string().min(1, 'Retype your new password.'),
  })
  .refine((values) => values.new_password !== values.old_password, {
    message: 'New password should not be the same as the old password.',
    path: ['new_password'],
  })
  .refine(
    (values) => values.new_password === values.new_password_confirmation,
    {
      message: 'New password confirmation does not match.',
      path: ['new_password_confirmation'],
    },
  );

export type Profile = z.infer<typeof ProfileSchema>;
export type ChangePassword = z.infer<typeof ChangePasswordSchema>;
export type ProfileDetailsFormValues = z.infer<typeof ProfileDetailsFormSchema>;
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;
