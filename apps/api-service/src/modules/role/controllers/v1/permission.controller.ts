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
import { PermissionCreateSchema, PermissionUpdateSchema } from '../../dtos';
import { RolePermissionGuard } from '../../guards';
import { PermissionService } from '../../services';

@UseGuards(JwtAuthGuard, RolePermissionGuard)
@ExtendedController({
  parent: VersionControllers.v1,
  path: 'permissions',
})
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @Permission(
    { actions: PERMISSION_ACTIONS.READ },
    `${PERMISSION_MODULE_TYPES.TEAM}_${PERMISSION_KEYS.ROLES}`,
  )
  async list(
    @Query(zodValidationPipe(FilterSchema)) filter: Filter,
  ): Promise<Response> {
    const result = await this.permissionService.list(filter);

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
      data: await this.permissionService.findById(params.id),
    };
  }

  @Post()
  @Permission(
    { actions: PERMISSION_ACTIONS.CREATE },
    `${PERMISSION_MODULE_TYPES.TEAM}_${PERMISSION_KEYS.ROLES}`,
  )
  async create(
    @Body(zodValidationPipe(PermissionCreateSchema)) payload: CrudPayload,
  ): Promise<Response> {
    return {
      data: await this.permissionService.create(payload),
      message: 'Permission created successfully.',
    };
  }

  @Patch(':id')
  @Permission(
    { actions: PERMISSION_ACTIONS.UPDATE },
    `${PERMISSION_MODULE_TYPES.TEAM}_${PERMISSION_KEYS.ROLES}`,
  )
  async update(
    @Param(zodValidationPipe(IdRequestSchema)) params: IdRequest,
    @Body(zodValidationPipe(PermissionUpdateSchema)) payload: CrudPayload,
  ): Promise<Response> {
    return {
      data: await this.permissionService.update(params.id, payload),
      message: 'Permission updated successfully.',
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
      data: await this.permissionService.delete(params.id),
      message: 'Permission deleted successfully.',
    };
  }
}
