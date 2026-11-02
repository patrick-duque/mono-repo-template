import { Injectable } from '@nestjs/common';

import { BadRequestException } from 'common/exceptions';
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
  composePermissionKey,
  parsePermissionKey,
  PERMISSION_MODULE_TYPES,
  type PermissionKeyValue,
  type PermissionModuleValue,
} from '../decorators';
import { PermissionCreateSchema, PermissionUpdateSchema } from '../dtos';

const PERMISSION_RESOURCE_KEY = 'permissions';

const permissionResources: CrudResourceMap = {
  [PERMISSION_RESOURCE_KEY]: {
    key: PERMISSION_RESOURCE_KEY,
    table: 'permissions',
    createSchema: PermissionCreateSchema,
    updateSchema: PermissionUpdateSchema,
    softDelete: true,
    searchable: true,
  },
};

const permissionModules = new Set<string>(
  Object.values(PERMISSION_MODULE_TYPES),
);

type PermissionRow = CrudRow & {
  module: PermissionModuleValue;
  key: string;
};

const isPermissionModuleValue = (
  value: unknown,
): value is PermissionModuleValue =>
  typeof value === 'string' && permissionModules.has(value);

const getPermissionResourceKey = (value: unknown): PermissionKeyValue => {
  if (typeof value !== 'string') {
    throw new BadRequestException('Permission key is required.');
  }

  const parsedPermissionKey = parsePermissionKey(value as PermissionKeyValue);

  return parsedPermissionKey.key;
};

@Injectable()
export default class PermissionService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private normalizePayload(
    payload: CrudPayload,
    current?: PermissionRow,
  ): CrudPayload {
    const moduleValue = payload.module ?? current?.module;

    if (!isPermissionModuleValue(moduleValue)) {
      throw new BadRequestException('Permission module is required.');
    }

    const rawKey = payload.key ?? current?.key;
    const resourceKey = getPermissionResourceKey(rawKey);

    return {
      ...payload,
      module: moduleValue,
      key: composePermissionKey(moduleValue, resourceKey),
    };
  }

  async list(
    filter?: Filter,
    selectFields?: SelectFields,
  ): Promise<FindManyResult> {
    return this.supabaseService.listResource(
      permissionResources,
      PERMISSION_RESOURCE_KEY,
      filter,
      selectFields,
    );
  }

  async findById(id: string, selectFields?: SelectFields): Promise<CrudRow> {
    return this.supabaseService.findResourceById(
      permissionResources,
      PERMISSION_RESOURCE_KEY,
      id,
      selectFields,
    );
  }

  async create(payload: CrudPayload): Promise<CrudRow> {
    return this.supabaseService.createResource(
      permissionResources,
      PERMISSION_RESOURCE_KEY,
      this.normalizePayload(payload),
    );
  }

  async update(id: string, payload: CrudPayload): Promise<CrudRow> {
    const current = (await this.findById(id)) as PermissionRow;

    return this.supabaseService.updateResource(
      permissionResources,
      PERMISSION_RESOURCE_KEY,
      id,
      this.normalizePayload(payload, current),
    );
  }

  async delete(id: string): Promise<CrudRow> {
    return this.supabaseService.deleteResource(
      permissionResources,
      PERMISSION_RESOURCE_KEY,
      id,
    );
  }
}
