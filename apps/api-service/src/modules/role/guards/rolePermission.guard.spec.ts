import { describe, expect, it, jest } from '@jest/globals';
import { Reflector } from '@nestjs/core';

import {
  PERMISSION_ACTIONS,
  PERMISSION_KEYS,
  PERMISSION_MODULE_TYPES,
  type PermissionConfig,
} from '../decorators';
import { RolePermissionService } from '../services';
import RolePermissionGuard from './rolePermission.guard';

const createContext = (request: Record<string, unknown> = {}) =>
  ({
    getClass: () => class TestController {},
    getHandler: () => () => undefined,
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  }) as never;

describe('RolePermissionGuard', () => {
  it('allows routes with no permission metadata', async () => {
    const reflector = {
      getAllAndOverride: jest.fn(() => undefined),
    };
    const service = { hasPermission: jest.fn() };
    const guard = new RolePermissionGuard(
      reflector as unknown as Reflector,
      service as unknown as RolePermissionService,
    );

    await expect(guard.canActivate(createContext())).resolves.toBe(true);
    expect(service.hasPermission).not.toHaveBeenCalled();
  });

  it('denies metadata-protected routes without a role id', async () => {
    const metadata: PermissionConfig = {
      key: `${PERMISSION_MODULE_TYPES.AUTH}_${PERMISSION_KEYS.USERS}`,
      permission: { actions: PERMISSION_ACTIONS.READ },
    };
    const guard = new RolePermissionGuard(
      { getAllAndOverride: jest.fn(() => metadata) } as unknown as Reflector,
      { hasPermission: jest.fn() } as unknown as RolePermissionService,
    );

    await expect(guard.canActivate(createContext({ user: {} }))).resolves.toBe(
      false,
    );
  });

  it('checks configured keys and attaches granted metadata to the request', async () => {
    const metadata: PermissionConfig = {
      key: [
        `${PERMISSION_MODULE_TYPES.AUTH}_${PERMISSION_KEYS.USERS}`,
        `${PERMISSION_MODULE_TYPES.TEAM}_${PERMISSION_KEYS.ROLES}`,
      ],
      permission: { actions: PERMISSION_ACTIONS.UPDATE },
    };
    const request = {
      user: {
        user_id: '613c32db-e808-4f0f-9c79-6ea9eae95001',
        email_address: 'admin@tristanahumada.com',
        role_id: 'role-id',
      },
    };
    const service = {
      hasPermission: jest.fn(async (_roleId: string, key: string) =>
        key.endsWith('ROLES'),
      ),
    };
    const guard = new RolePermissionGuard(
      { getAllAndOverride: jest.fn(() => metadata) } as unknown as Reflector,
      service as unknown as RolePermissionService,
    );

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(service.hasPermission).toHaveBeenCalledTimes(2);
    expect(request).toEqual(
      expect.objectContaining({
        rolePermission: {
          key: `${PERMISSION_MODULE_TYPES.TEAM}_${PERMISSION_KEYS.ROLES}`,
          actions: PERMISSION_ACTIONS.UPDATE,
        },
      }),
    );
  });
});
