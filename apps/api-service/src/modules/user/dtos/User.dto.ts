export {
  UserCreateSchema,
  UserSchema,
  UserUpdateSchema,
} from '@white-label/shared';

import {
  UserCreateSchema,
  UserSchema,
  UserUpdateSchema,
} from '@white-label/shared';
import { type z } from 'zod';

export type User = z.infer<typeof UserSchema>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
