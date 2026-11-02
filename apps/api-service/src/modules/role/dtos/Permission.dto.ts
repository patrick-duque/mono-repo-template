export {
  PermissionCreateSchema,
  PermissionModuleSchema,
  PermissionSchema,
  PermissionUpdateSchema,
} from '@white-label/shared';

import {
  PermissionCreateSchema,
  PermissionModuleSchema,
  PermissionSchema,
  PermissionUpdateSchema,
} from '@white-label/shared';
import { type z } from 'zod';

export type Permission = z.infer<typeof PermissionSchema>;
export type PermissionCreate = z.infer<typeof PermissionCreateSchema>;
export type PermissionModule = z.infer<typeof PermissionModuleSchema>;
export type PermissionUpdate = z.infer<typeof PermissionUpdateSchema>;
