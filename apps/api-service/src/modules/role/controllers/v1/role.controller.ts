import {
  Body,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExtendedController } from '@yuriyempty/nestjs-extended-controller';

import { type Filter, FilterSchema, type Response } from 'common/models';
import { zodValidationPipe } from 'common/pipes';
import { IdRequestSchema, type IdRequest } from 'common/requests';
import { VersionControllers } from 'modules/app/controllers';
import { JwtAuthGuard } from 'modules/auth/guards';
import { type CrudPayload } from 'modules/common';

import {
  PERMISSION_ACTIONS,
  PERMISSION_KEYS,
  PERMISSION_MODULE_TYPES,
  Permission,
} from '../../decorators';
import { RoleCreateSchema, RoleUpdateSchema } from '../../dtos';
import { RolePermissionGuard } from '../../guards';
import { RoleService } from '../../services';

@UseGuards(JwtAuthGuard, RolePermissionGuard)
@ExtendedController({
  parent: VersionControllers.v1,
  path: 'roles',
})
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @Permission(
    { actions: PERMISSION_ACTIONS.READ },
    `${PERMISSION_MODULE_TYPES.TEAM}_${PERMISSION_KEYS.ROLES}`,
  )
  async list(
    @Query(zodValidationPipe(FilterSchema)) filter: Filter,
  ): Promise<Response> {
    const result = await this.roleService.list(filter);

    return {
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  @Permission(
    { actions: PERMISSION_ACTIONS.READ },
    `${PERMISSION_MODULE_TYPES.TEAM}_${PERMISSION_KEYS.ROLES}`,
  )
  async findById(
    @Param(zodValidationPipe(IdRequestSchema)) params: IdRequest,
  ): Promise<Response> {
    return {
      data: await this.roleService.findById(params.id),
    };
  }

  @Post()
  @Permission(
    { actions: PERMISSION_ACTIONS.CREATE },
    `${PERMISSION_MODULE_TYPES.TEAM}_${PERMISSION_KEYS.ROLES}`,
  )
  async create(
    @Body(zodValidationPipe(RoleCreateSchema)) payload: CrudPayload,
  ): Promise<Response> {
    return {
      data: await this.roleService.create(payload),
      message: 'Role created successfully.',
    };
  }

  @Patch(':id')
  @Permission(
    { actions: PERMISSION_ACTIONS.UPDATE },
    `${PERMISSION_MODULE_TYPES.TEAM}_${PERMISSION_KEYS.ROLES}`,
  )
  async update(
    @Param(zodValidationPipe(IdRequestSchema)) params: IdRequest,
    @Body(zodValidationPipe(RoleUpdateSchema)) payload: CrudPayload,
  ): Promise<Response> {
    return {
      data: await this.roleService.update(params.id, payload),
      message: 'Role updated successfully.',
    };
  }

  @Delete(':id')
  @Permission(
    { actions: PERMISSION_ACTIONS.DELETE },
    `${PERMISSION_MODULE_TYPES.TEAM}_${PERMISSION_KEYS.ROLES}`,
  )
  async delete(
    @Param(zodValidationPipe(IdRequestSchema)) params: IdRequest,
  ): Promise<Response> {
    return {
      data: await this.roleService.delete(params.id),
      message: 'Role deleted successfully.',
    };
  }
}
