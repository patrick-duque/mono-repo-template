import { describe, expect, it, jest } from '@jest/globals';

import { BadRequestException, NotFoundException } from 'common/exceptions';
import { SupabaseService } from 'modules/common';

import RolePermissionService from './rolePermission.service';

type QueryResult<TData> = {
  data: TData | null;
  error: { message: string } | null;
};

type MockQueryBuilder = {
  select: jest.MockedFunction<(fields: string) => MockQueryBuilder>;
  eq: jest.MockedFunction<(field: string, value: unknown) => MockQueryBuilder>;
  is: jest.MockedFunction<(field: string, value: null) => MockQueryBuilder>;
  in: jest.MockedFunction<
    (field: string, values: string[]) => MockQueryBuilder
  >;
  maybeSingle: jest.MockedFunction<() => Promise<QueryResult<unknown>>>;
  returns: jest.MockedFunction<() => Promise<QueryResult<unknown[]>>>;
};

const role = {
  id: 'role-1',
  name: 'Super Admin',
  description: 'Full access',
  created_at: '2026-06-12T02:00:00.000Z',
  updated_at: '2026-06-12T02:00:00.000Z',
  deleted_at: null,
};

const grant = {
  id: 'grant-1',
  role_id: role.id,
  permission_id: 'permission-1',
  actions: ['READ', 'UPDATE'],
  created_at: '2026-06-12T02:00:00.000Z',
  updated_at: '2026-06-12T02:00:00.000Z',
  deleted_at: null,
};

const permission = {
  id: grant.permission_id,
  module: 'AUTH',
  name: 'Users',
  key: 'AUTH_USERS',
  description: 'Manage users.',
  created_at: '2026-06-12T02:00:00.000Z',
  updated_at: '2026-06-12T02:00:00.000Z',
  deleted_at: null,
};

const createBuilder = (
  result: QueryResult<unknown> | QueryResult<unknown[]>,
): MockQueryBuilder => {
  const builder = {} as MockQueryBuilder;

  builder.select = jest.fn(() => builder);
  builder.eq = jest.fn(() => builder);
  builder.is = jest.fn(() => builder);
  builder.in = jest.fn(() => builder);
  builder.maybeSingle = jest.fn(async () => result as QueryResult<unknown>);
  builder.returns = jest.fn(async () => result as QueryResult<unknown[]>);

  return builder;
};

const createService = (builders: Record<string, MockQueryBuilder[]>) => {
  const client = {
    from: jest.fn((table: string) => builders[table].shift()),
  };
  const supabaseService = {
    getClient: jest.fn(() => client),
    validateId: jest.fn((id: string) => id),
  };

  return {
    service: new RolePermissionService(
      supabaseService as unknown as SupabaseService,
    ),
    client,
  };
};

describe('RolePermissionService.getProfileRolesPermissions', () => {
  it('returns the active role with active permission grants', async () => {
    const roleBuilder = createBuilder({ data: role, error: null });
    const grantsBuilder = createBuilder({ data: [grant], error: null });
    const permissionsBuilder = createBuilder({
      data: [permission],
      error: null,
    });
    const { service, client } = createService({
      roles: [roleBuilder],
      role_permissions: [grantsBuilder],
      permissions: [permissionsBuilder],
    });

    await expect(service.getProfileRolesPermissions(role.id)).resolves.toEqual({
      role,
      permissions: [
        {
          ...permission,
          grant,
        },
      ],
    });
    expect(client.from).toHaveBeenCalledWith('roles');
    expect(client.from).toHaveBeenCalledWith('role_permissions');
    expect(client.from).toHaveBeenCalledWith('permissions');
    expect(roleBuilder.is).toHaveBeenCalledWith('deleted_at', null);
    expect(grantsBuilder.is).toHaveBeenCalledWith('deleted_at', null);
    expect(permissionsBuilder.is).toHaveBeenCalledWith('deleted_at', null);
  });

  it('returns an empty permissions array when the role has no active grants', async () => {
    const { service, client } = createService({
      roles: [createBuilder({ data: role, error: null })],
      role_permissions: [createBuilder({ data: [], error: null })],
      permissions: [],
    });

    await expect(service.getProfileRolesPermissions(role.id)).resolves.toEqual({
      role,
      permissions: [],
    });
    expect(client.from).not.toHaveBeenCalledWith('permissions');
  });

  it('omits grants whose permission resource is not active', async () => {
    const { service } = createService({
      roles: [createBuilder({ data: role, error: null })],
      role_permissions: [createBuilder({ data: [grant], error: null })],
      permissions: [createBuilder({ data: [], error: null })],
    });

    await expect(service.getProfileRolesPermissions(role.id)).resolves.toEqual({
      role,
      permissions: [],
    });
  });

  it('throws not found when the role is missing or soft-deleted', async () => {
    const { service } = createService({
      roles: [createBuilder({ data: null, error: null })],
      role_permissions: [],
      permissions: [],
    });

    await expect(service.getProfileRolesPermissions(role.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('surfaces Supabase errors as bad requests', async () => {
    const { service } = createService({
      roles: [
        createBuilder({
          data: null,
          error: { message: 'database unavailable' },
        }),
      ],
      role_permissions: [],
      permissions: [],
    });

    await expect(service.getProfileRolesPermissions(role.id)).rejects.toThrow(
      BadRequestException,
    );
  });
});

describe('RolePermissionService.hasPermission', () => {
  it('returns true when an active role grant contains any required action', async () => {
    const { service } = createService({
      permissions: [
        createBuilder({ data: { id: permission.id }, error: null }),
      ],
      role_permissions: [
        createBuilder({
          data: { actions: ['READ', 'UPDATE'] },
          error: null,
        }),
      ],
    });

    await expect(
      service.hasPermission(role.id, 'AUTH_USERS', ['DELETE', 'UPDATE']),
    ).resolves.toBe(true);
  });

  it('returns false when the permission row or role grant is missing', async () => {
    const missingPermission = createService({
      permissions: [createBuilder({ data: null, error: null })],
      role_permissions: [],
    });
    const missingGrant = createService({
      permissions: [
        createBuilder({ data: { id: permission.id }, error: null }),
      ],
      role_permissions: [createBuilder({ data: null, error: null })],
    });

    await expect(
      missingPermission.service.hasPermission(role.id, 'AUTH_USERS', 'READ'),
    ).resolves.toBe(false);
    await expect(
      missingGrant.service.hasPermission(role.id, 'AUTH_USERS', 'READ'),
    ).resolves.toBe(false);
  });

  it('allows metadata with no required actions when a role grant exists', async () => {
    const { service } = createService({
      permissions: [
        createBuilder({ data: { id: permission.id }, error: null }),
      ],
      role_permissions: [
        createBuilder({
          data: { actions: ['READ'] },
          error: null,
        }),
      ],
    });

    await expect(service.hasPermission(role.id, 'AUTH_USERS')).resolves.toBe(
      true,
    );
  });
});
