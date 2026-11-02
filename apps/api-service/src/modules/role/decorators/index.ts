import Permission from './permission.decorator';

export {
  PERMISSION_ACTIONS,
  PERMISSION_KEY,
  PERMISSION_KEYS,
  PERMISSION_MODULE_TYPES,
  composePermissionKey,
  parsePermissionKey,
} from './permission.decorator';
export type {
  ComposedPermissionKeyValue,
  ParsedPermissionKey,
  PermissionActionValue,
  PermissionConfig,
  PermissionKeyValue,
  PermissionMetadata,
  PermissionModuleValue,
  PermissionRouteKeyValue,
} from './permission.decorator';
export { Permission };
export default Permission;
