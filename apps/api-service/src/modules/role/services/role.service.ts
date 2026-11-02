import { Injectable } from '@nestjs/common';

import { type Filter } from 'common/models';
import { SupabaseService } from 'modules/common';
import {
  type CrudPayload,
  type CrudResourceMap,
  type CrudRow,
  type FindManyResult,
  type SelectFields,
} from 'modules/common';

import { RoleCreateSchema, RoleUpdateSchema } from '../dtos';

const ROLE_RESOURCE_KEY = 'roles';

const roleResources: CrudResourceMap = {
  [ROLE_RESOURCE_KEY]: {
    key: ROLE_RESOURCE_KEY,
    table: 'roles',
    createSchema: RoleCreateSchema,
    updateSchema: RoleUpdateSchema,
    softDelete: true,
    searchable: true,
  },
};

@Injectable()
export default class RoleService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async list(
    filter?: Filter,
    selectFields?: SelectFields,
  ): Promise<FindManyResult> {
    return this.supabaseService.listResource(
      roleResources,
      ROLE_RESOURCE_KEY,
      filter,
      selectFields,
    );
  }

  async findById(id: string, selectFields?: SelectFields): Promise<CrudRow> {
    return this.supabaseService.findResourceById(
      roleResources,
      ROLE_RESOURCE_KEY,
      id,
      selectFields,
    );
  }

  async create(payload: CrudPayload): Promise<CrudRow> {
    return this.supabaseService.createResource(
      roleResources,
      ROLE_RESOURCE_KEY,
      payload,
    );
  }

  async update(id: string, payload: CrudPayload): Promise<CrudRow> {
    return this.supabaseService.updateResource(
      roleResources,
      ROLE_RESOURCE_KEY,
      id,
      payload,
    );
  }

  async delete(id: string): Promise<CrudRow> {
    return this.supabaseService.deleteResource(
      roleResources,
      ROLE_RESOURCE_KEY,
      id,
    );
  }
}
