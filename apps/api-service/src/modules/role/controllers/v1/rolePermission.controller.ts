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
import { z } from 'zod';

import { type Filter, FilterSchema, type Response } from 'common/models';
import { zodValidationPipe } from 'common/pipes';
import { JwtAuthGuard } from 'modules/auth/guards';
import { type CrudPayload } from 'modules/common';

import { RoleController } from './role.controller';
import {
  PERMISSION_ACTIONS,
  PERMISSION_KEYS,
  PERMISSION_MODULE_TYPES,
  Permission,
} from '../../decorators';
import {
  RolePermissionCreateSchema,
  RolePermissionUpdateSchema,
} from '../../dtos';
import { RolePermissionGuard } from '../../guards';
import { RolePermissionService } from '../../services';

const RolePermissionsRequestSchema = z.object({
  roleId: z.uuid(),
});

const RolePermissionRequestSchema = RolePermissionsRequestSchema.extend({
  id: z.uuid(),
});

const RolePermissionCreateBodySchema = RolePermissionCreateSchema.omit({
  role_id: true,
});

const RolePermissionUpdateBodySchema = RolePermissionUpdateSchema.omit({
  role_id: true,
});

type RolePermissionsRequest = z.infer<typeof RolePermissionsRequestSchema>;
type RolePermissionRequest = z.infer<typeof RolePermissionRequestSchema>;

@UseGuards(JwtAuthGuard, RolePermissionGuard)
@ExtendedController({
  parent: RoleController,
  path: ':roleId/permissions',
})
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  @Get()
  @Permission(
    { actions: PERMISSION_ACTIONS.READ },
    `${PERMISSION_MODULE_TYPES.TEAM}_${PERMISSION_KEYS.ROLES}`,
  )
  async list(
    @Param(zodValidationPipe(RolePermissionsRequestSchema))
    params: RolePermissionsRequest,
    @Query(zodValidationPipe(FilterSchema)) filter: Filter,
  ): Promise<Response> {
    const result = await this.rolePermissionService.list(params.roleId, filter);

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
    @Param(zodValidationPipe(RolePermissionRequestSchema))
    params: RolePermissionRequest,
  ): Promise<Response> {
    return {
      data: await this.rolePermissionService.findById(params.roleId, params.id),
    };
  }

  @Post()
  @Permission(
    { actions: PERMISSION_ACTIONS.UPDATE },
    `${PERMISSION_MODULE_TYPES.TEAM}_${PERMISSION_KEYS.ROLES}`,
  )
  async create(
    @Param(zodValidationPipe(RolePermissionsRequestSchema))
    params: RolePermissionsRequest,
    @Body(zodValidationPipe(RolePermissionCreateBodySchema))
    payload: CrudPayload,
  ): Promise<Response> {
    return {
      data: await this.rolePermissionService.create(params.roleId, payload),
      message: 'Role permission created successfully.',
    };
  }

  @Patch(':id')
  @Permission(
    { actions: PERMISSION_ACTIONS.UPDATE },
    `${PERMISSION_MODULE_TYPES.TEAM}_${PERMISSION_KEYS.ROLES}`,
  )
  async update(
    @Param(zodValidationPipe(RolePermissionRequestSchema))
    params: RolePermissionRequest,
    @Body(zodValidationPipe(RolePermissionUpdateBodySchema))
    payload: CrudPayload,
  ): Promise<Response> {
    return {
      data: await this.rolePermissionService.update(
        params.roleId,
        params.id,
        payload,
      ),
      message: 'Role permission updated successfully.',
    };
  }

  @Delete(':id')
  @Permission(
    { actions: PERMISSION_ACTIONS.UPDATE },
    `${PERMISSION_MODULE_TYPES.TEAM}_${PERMISSION_KEYS.ROLES}`,
  )
  async delete(
    @Param(zodValidationPipe(RolePermissionRequestSchema))
    params: RolePermissionRequest,
  ): Promise<Response> {
    return {
      data: await this.rolePermissionService.delete(params.roleId, params.id),
      message: 'Role permission deleted successfully.',
    };
  }
}
