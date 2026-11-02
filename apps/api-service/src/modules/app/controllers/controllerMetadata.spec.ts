import { describe, expect, it } from '@jest/globals';
import { GUARDS_METADATA } from '@nestjs/common/constants';

import {
  AuthController,
  AuthProfileController,
  AuthTokenController,
  PublicAuthController,
} from 'modules/auth/controllers';
import { JwtAuthGuard } from 'modules/auth/guards';
import {
  PermissionController,
  RoleController,
  RolePermissionController,
} from 'modules/role/controllers';
import {
  PERMISSION_ACTIONS,
  PERMISSION_KEY,
  PERMISSION_KEYS,
  PERMISSION_MODULE_TYPES,
  type PermissionConfig,
} from 'modules/role/decorators';
import { RolePermissionGuard } from 'modules/role/guards';
import { UserController } from 'modules/user/controllers';

type ControllerClass = {
  prototype: object;
};

const getGuards = (controller: ControllerClass): unknown[] =>
  Reflect.getMetadata(GUARDS_METADATA, controller) ?? [];

const getPermission = (
  controller: ControllerClass,
  methodName: string,
): PermissionConfig | undefined =>
  Reflect.getMetadata(
    PERMISSION_KEY,
    Reflect.get(controller.prototype, methodName),
  );

const expectClassGuards = (
  controller: ControllerClass,
  expectedGuards: unknown[],
) => {
  const guards = getGuards(controller);

  expectedGuards.forEach((guard) => {
    expect(guards).toContain(guard);
  });
};

const expectPermission = (
  controller: ControllerClass,
  methodName: string,
  key: string,
  actions: PERMISSION_ACTIONS,
) => {
  expect(getPermission(controller, methodName)).toEqual({
    key,
    permission: { actions },
  });
};

describe('controller route metadata', () => {
  it('keeps public auth routes free of JWT and role-permission guards', () => {
    expect(getGuards(PublicAuthController)).not.toContain(JwtAuthGuard);
    expect(getGuards(PublicAuthController)).not.toContain(RolePermissionGuard);
    expect(getGuards(AuthTokenController)).not.toContain(JwtAuthGuard);
    expect(getGuards(AuthTokenController)).not.toContain(RolePermissionGuard);
    expectClassGuards(AuthController, [JwtAuthGuard]);
    expectClassGuards(AuthProfileController, [JwtAuthGuard]);
  });

  it('protects permission-gated private controllers with JWT and role guards', () => {
    [
      UserController,
      RoleController,
      PermissionController,
      RolePermissionController,
    ].forEach((controller) => {
      expectClassGuards(controller, [JwtAuthGuard, RolePermissionGuard]);
    });
  });

  it('stores composed permission keys for representative protected mutations', () => {
    expectPermission(
      UserController,
      'create',
      `${PERMISSION_MODULE_TYPES.AUTH}_${PERMISSION_KEYS.USERS}`,
      PERMISSION_ACTIONS.CREATE,
    );
    expectPermission(
      RolePermissionController,
      'update',
      `${PERMISSION_MODULE_TYPES.TEAM}_${PERMISSION_KEYS.ROLES}`,
      PERMISSION_ACTIONS.UPDATE,
    );
  });
});
