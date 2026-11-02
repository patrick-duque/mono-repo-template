export {
  RoleCreateSchema,
  RoleSchema,
  RoleUpdateSchema,
} from '@white-label/shared';

import {
  RoleCreateSchema,
  RoleSchema,
  RoleUpdateSchema,
} from '@white-label/shared';
import { type z } from 'zod';

export type Role = z.infer<typeof RoleSchema>;
export type RoleCreate = z.infer<typeof RoleCreateSchema>;
export type RoleUpdate = z.infer<typeof RoleUpdateSchema>;
