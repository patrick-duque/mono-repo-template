import { describe, expect, it, jest } from '@jest/globals';

import { BadRequestException } from 'common/exceptions';
import { SupabaseService } from 'modules/common';

import PermissionService from './permission.service';
import {
  PERMISSION_KEYS,
  PERMISSION_MODULE_TYPES,
} from '../decorators/permission.decorator';

const currentPermission = {
  id: 'permission-id',
  module: PERMISSION_MODULE_TYPES.TEAM,
  key: 'TEAM_ROLES',
};

const createService = () => {
  const supabaseService = {
    createResource: jest.fn(
      async (_resources: unknown, _key: string, payload) => ({
        id: 'permission-id',
        ...(payload as Record<string, unknown>),
      }),
    ),
    deleteResource: jest.fn(),
    findResourceById: jest.fn(async () => currentPermission),
    listResource: jest.fn(),
    updateResource: jest.fn(
      async (_resources: unknown, _key: string, _id: string, payload) => ({
        ...currentPermission,
        ...(payload as Record<string, unknown>),
      }),
    ),
  };

  return {
    service: new PermissionService(
      supabaseService as unknown as SupabaseService,
    ),
    supabaseService,
  };
};

describe('PermissionService', () => {
  it('stores composed permission keys on create', async () => {
    const { service, supabaseService } = createService();

    await expect(
      service.create({
        module: PERMISSION_MODULE_TYPES.AUTH,
        key: PERMISSION_KEYS.USERS,
        name: 'Users',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        module: PERMISSION_MODULE_TYPES.AUTH,
        key: 'AUTH_USERS',
      }),
    );
    expect(supabaseService.createResource).toHaveBeenCalledWith(
      expect.any(Object),
      'permissions',
      expect.objectContaining({ key: 'AUTH_USERS' }),
    );
  });

  it('normalizes partial updates with current row module and key', async () => {
    const { service, supabaseService } = createService();

    await service.update('permission-id', { name: 'Roles' });

    expect(supabaseService.updateResource).toHaveBeenCalledWith(
      expect.any(Object),
      'permissions',
      'permission-id',
      expect.objectContaining({
        module: PERMISSION_MODULE_TYPES.TEAM,
        key: 'TEAM_ROLES',
      }),
    );
  });

  it('rejects payloads without a valid module/key pair', async () => {
    const { service } = createService();

    await expect(
      service.create({ key: PERMISSION_KEYS.USERS }),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.create({ module: PERMISSION_MODULE_TYPES.AUTH }),
    ).rejects.toThrow(BadRequestException);
  });
});
