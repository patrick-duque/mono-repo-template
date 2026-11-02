import { describe, expect, it } from '@jest/globals';

import {
  PERMISSION_KEYS,
  PERMISSION_MODULE_TYPES,
  composePermissionKey,
  parsePermissionKey,
} from './permission.decorator';

describe('permission key helpers', () => {
  it('composes permission storage keys', () => {
    expect(
      composePermissionKey(
        PERMISSION_MODULE_TYPES.TEAM,
        PERMISSION_KEYS.ROLES,
      ),
    ).toBe('TEAM_ROLES');
  });

  it('parses simple composed permission keys', () => {
    expect(
      parsePermissionKey(
        `${PERMISSION_MODULE_TYPES.AUTH}_${PERMISSION_KEYS.USERS}`,
      ),
    ).toEqual({
      module: PERMISSION_MODULE_TYPES.AUTH,
      key: PERMISSION_KEYS.USERS,
      composedKey: 'AUTH_USERS',
    });
  });

  it('parses another composed permission key', () => {
    expect(
      parsePermissionKey(
        `${PERMISSION_MODULE_TYPES.TEAM}_${PERMISSION_KEYS.ROLES}`,
      ),
    ).toEqual({
      module: PERMISSION_MODULE_TYPES.TEAM,
      key: PERMISSION_KEYS.ROLES,
      composedKey: 'TEAM_ROLES',
    });
  });

  it('maps legacy users permission keys to the composed storage key', () => {
    expect(parsePermissionKey(PERMISSION_KEYS.USERS)).toEqual({
      module: PERMISSION_MODULE_TYPES.AUTH,
      key: PERMISSION_KEYS.USERS,
      composedKey: 'AUTH_USERS',
    });
  });
});
