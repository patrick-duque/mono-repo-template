import { Injectable } from '@nestjs/common';
import {
  type AuthProfileRolesPermissions,
  type PermissionModule,
} from '@white-label/shared';

import { BadRequestException, NotFoundException } from 'common/exceptions';
import { type Filter } from 'common/models';
import { SupabaseService } from 'modules/common';
import {
  type CrudPayload,
  type CrudResourceMap,
  type CrudRow,
  type FindManyResult,
  type SelectFields,
} from 'modules/common';

import {
  parsePermissionKey,
  type PermissionActionValue,
  type PermissionRouteKeyValue,
} from '../decorators';
import {
  RolePermissionCreateSchema,
  RolePermissionUpdateSchema,
} from '../dtos';

const ROLE_PERMISSION_RESOURCE_KEY = 'role_permissions';

const rolePermissionResources: CrudResourceMap = {
  [ROLE_PERMISSION_RESOURCE_KEY]: {
    key: ROLE_PERMISSION_RESOURCE_KEY,
    table: 'role_permissions',
    createSchema: RolePermissionCreateSchema,
    updateSchema: RolePermissionUpdateSchema,
    softDelete: true,
  },
};

type PermissionLookupRow = {
  id: string;
};

type ProfilePermissionRow = {
  id: string;
  module: PermissionModule;
  name: string;
  key: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type ProfileRoleRow = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type ProfileRolePermissionRow = {
  id: string;
  role_id: string;
  permission_id: string;
  actions: PermissionActionValue[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type RolePermissionLookupRow = {
  actions: PermissionActionValue[];
};

@Injectable()
export default class RolePermissionService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async hasPermission(
    roleId: string,
    permissionKey: PermissionRouteKeyValue,
    actions?: PermissionActionValue | PermissionActionValue[],
  ): Promise<boolean> {
    const parsedPermissionKey = parsePermissionKey(permissionKey);
    const client = this.supabaseService.getClient();
    const { data: permission, error: permissionError } = await client
      .from('permissions')
      .select('id')
      .eq('key', parsedPermissionKey.composedKey)
      .is('deleted_at', null)
      .maybeSingle<PermissionLookupRow>();

    if (permissionError) {
      throw new BadRequestException(permissionError.message);
    }

    if (!permission) return false;

    const { data: rolePermission, error: rolePermissionError } = await client
      .from('role_permissions')
      .select('actions')
      .eq('role_id', roleId)
      .eq('permission_id', permission.id)
      .is('deleted_at', null)
      .maybeSingle<RolePermissionLookupRow>();

    if (rolePermissionError) {
      throw new BadRequestException(rolePermissionError.message);
    }

    if (!rolePermission) return false;

    const requiredActions = Array.isArray(actions)
      ? actions
      : actions
        ? [actions]
        : [];

    if (!requiredActions.length) return true;

    return requiredActions.some((action) =>
      rolePermission.actions.includes(action),
    );
  }

  async getProfileRolesPermissions(
    roleId: string,
  ): Promise<AuthProfileRolesPermissions> {
    const validatedRoleId = this.supabaseService.validateId(roleId);
    const client = this.supabaseService.getClient();
    const { data: role, error: roleError } = await client
      .from('roles')
      .select('*')
      .eq('id', validatedRoleId)
      .is('deleted_at', null)
      .maybeSingle<ProfileRoleRow>();

    if (roleError) {
      throw new BadRequestException(roleError.message);
    }

    if (!role) {
      throw new NotFoundException({
        collection: 'roles',
        id: validatedRoleId,
      });
    }

    const { data: grants, error: grantsError } = await client
      .from('role_permissions')
      .select('*')
      .eq('role_id', validatedRoleId)
      .is('deleted_at', null)
      .returns<ProfileRolePermissionRow[]>();

    if (grantsError) {
      throw new BadRequestException(grantsError.message);
    }

    const activeGrants = grants ?? [];
    const permissionIds = activeGrants.map((grant) => grant.permission_id);

    if (!permissionIds.length) {
      return {
        role,
        permissions: [],
      };
    }

    const { data: permissions, error: permissionsError } = await client
      .from('permissions')
      .select('*')
      .in('id', permissionIds)
      .is('deleted_at', null)
      .returns<ProfilePermissionRow[]>();

    if (permissionsError) {
      throw new BadRequestException(permissionsError.message);
    }

    const grantsByPermissionId = new Map(
      activeGrants.map((grant) => [grant.permission_id, grant]),
    );

    return {
      role,
      permissions: (permissions ?? [])
        .sort((left, right) => {
          const moduleCompare = left.module.localeCompare(right.module);

          return moduleCompare || left.key.localeCompare(right.key);
        })
        .flatMap((permission) => {
          const grant = grantsByPermissionId.get(permission.id);

          return grant ? [{ ...permission, grant }] : [];
        }),
    };
  }

  async list(
    roleId: string,
    filter?: Filter,
    selectFields?: SelectFields,
  ): Promise<FindManyResult> {
    return this.supabaseService.listResource(
      rolePermissionResources,
      ROLE_PERMISSION_RESOURCE_KEY,
      {
        ...filter,
        role_id: roleId,
      },
      selectFields,
    );
  }

  async findById(
    roleId: string,
    id: string,
    selectFields?: SelectFields,
  ): Promise<CrudRow> {
    return this.supabaseService.findById(
      rolePermissionResources[ROLE_PERMISSION_RESOURCE_KEY],
      {
        id,
        role_id: roleId,
      },
      selectFields,
    );
  }

  async create(roleId: string, payload: CrudPayload): Promise<CrudRow> {
    return this.supabaseService.createResource(
      rolePermissionResources,
      ROLE_PERMISSION_RESOURCE_KEY,
      {
        ...payload,
        role_id: roleId,
      },
    );
  }

  async update(
    roleId: string,
    id: string,
    payload: CrudPayload,
  ): Promise<CrudRow> {
    await this.findById(roleId, id);

    return this.supabaseService.updateResource(
      rolePermissionResources,
      ROLE_PERMISSION_RESOURCE_KEY,
      id,
      payload,
    );
  }

  async delete(roleId: string, id: string): Promise<CrudRow> {
    await this.findById(roleId, id);

    return this.supabaseService.deleteResource(
      rolePermissionResources,
      ROLE_PERMISSION_RESOURCE_KEY,
      id,
    );
  }
}
