import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permissions';

export enum PERMISSION_ACTIONS {
  READ = 'READ',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum PERMISSION_MODULE_TYPES {
  AUTH = 'AUTH',
  TEAM = 'TEAM',
}

export enum PERMISSION_KEYS {
  USERS = 'USERS',
  ROLES = 'ROLES',
}

export type PermissionActionValue = `${PERMISSION_ACTIONS}`;
export type PermissionModuleValue = `${PERMISSION_MODULE_TYPES}`;
export type PermissionKeyValue = `${PERMISSION_KEYS}`;
export type ComposedPermissionKeyValue =
  `${PermissionModuleValue}_${PermissionKeyValue}`;
export type PermissionRouteKeyValue =
  ComposedPermissionKeyValue | PermissionKeyValue;

export type ParsedPermissionKey = {
  module?: PermissionModuleValue;
  key: PermissionKeyValue;
  composedKey: ComposedPermissionKeyValue | PermissionKeyValue;
};

export type PermissionMetadata = {
  actions?: PermissionActionValue | PermissionActionValue[];
};

export type PermissionConfig = {
  permission: PermissionMetadata;
  key: PermissionRouteKeyValue | PermissionRouteKeyValue[];
};

const permissionModules = new Set<string>(
  Object.values(PERMISSION_MODULE_TYPES),
);
const permissionKeys = new Set<string>(Object.values(PERMISSION_KEYS));

export const composePermissionKey = (
  module: PermissionModuleValue,
  key: PermissionKeyValue,
): ComposedPermissionKeyValue => `${module}_${key}`;

export const parsePermissionKey = (
  value: PermissionRouteKeyValue,
): ParsedPermissionKey => {
  const match = Object.values(PERMISSION_KEYS).find((key) =>
    value.endsWith(`_${key}`),
  );

  if (match) {
    const module = value.slice(0, -(match.length + 1));

    if (permissionModules.has(module)) {
      return {
        module: module as PermissionModuleValue,
        key: match,
        composedKey: value as ComposedPermissionKeyValue,
      };
    }
  }

  if (value === PERMISSION_KEYS.USERS) {
    return {
      module: PERMISSION_MODULE_TYPES.AUTH,
      key: PERMISSION_KEYS.USERS,
      composedKey: composePermissionKey(
        PERMISSION_MODULE_TYPES.AUTH,
        PERMISSION_KEYS.USERS,
      ),
    };
  }

  if (permissionKeys.has(value)) {
    return {
      key: value as PermissionKeyValue,
      composedKey: value as PermissionKeyValue,
    };
  }

  return {
    key: value as PermissionKeyValue,
    composedKey: value as PermissionKeyValue,
  };
};

const Permission = (
  permission: PermissionMetadata,
  key: PermissionRouteKeyValue | PermissionRouteKeyValue[],
): ReturnType<typeof SetMetadata> =>
  SetMetadata(PERMISSION_KEY, { permission, key } satisfies PermissionConfig);

export default Permission;
