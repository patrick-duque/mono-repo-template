export {
  PermissionActionSchema,
  RolePermissionCreateSchema,
  RolePermissionSchema,
  RolePermissionUpdateSchema,
} from '@white-label/shared';

import {
  PermissionActionSchema,
  RolePermissionCreateSchema,
  RolePermissionSchema,
  RolePermissionUpdateSchema,
} from '@white-label/shared';
import { type z } from 'zod';

export type PermissionAction = z.infer<typeof PermissionActionSchema>;
export type RolePermission = z.infer<typeof RolePermissionSchema>;
export type RolePermissionCreate = z.infer<typeof RolePermissionCreateSchema>;
export type RolePermissionUpdate = z.infer<typeof RolePermissionUpdateSchema>;
