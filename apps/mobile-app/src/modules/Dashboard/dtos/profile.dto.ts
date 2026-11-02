import { UserSchema } from '@white-label/shared';
import { z } from 'zod';

export const ProfileResponseSchema = z.object({
  data: UserSchema,
});

export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;
