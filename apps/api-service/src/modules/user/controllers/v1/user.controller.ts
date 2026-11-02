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
} from 'modules/role/decorators';
import { RolePermissionGuard } from 'modules/role/guards';

import { UserCreateSchema, UserUpdateSchema } from '../../dtos';
import { UserService } from '../../services';

@UseGuards(JwtAuthGuard, RolePermissionGuard)
@ExtendedController({
  parent: VersionControllers.v1,
  path: 'users',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Permission(
    { actions: PERMISSION_ACTIONS.READ },
    `${PERMISSION_MODULE_TYPES.AUTH}_${PERMISSION_KEYS.USERS}`,
  )
  async list(
    @Query(zodValidationPipe(FilterSchema)) filter: Filter,
  ): Promise<Response> {
    const result = await this.userService.list(filter);

    return {
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  @Permission(
    { actions: PERMISSION_ACTIONS.READ },
    `${PERMISSION_MODULE_TYPES.AUTH}_${PERMISSION_KEYS.USERS}`,
  )
  async findById(
    @Param(zodValidationPipe(IdRequestSchema)) params: IdRequest,
  ): Promise<Response> {
    return {
      data: await this.userService.findById(params.id),
    };
  }

  @Post()
  @Permission(
    { actions: PERMISSION_ACTIONS.CREATE },
    `${PERMISSION_MODULE_TYPES.AUTH}_${PERMISSION_KEYS.USERS}`,
  )
  async create(
    @Body(zodValidationPipe(UserCreateSchema)) payload: CrudPayload,
  ): Promise<Response> {
    return {
      data: await this.userService.create(payload),
      message: 'User created successfully.',
    };
  }

  @Patch(':id')
  @Permission(
    { actions: PERMISSION_ACTIONS.UPDATE },
    `${PERMISSION_MODULE_TYPES.AUTH}_${PERMISSION_KEYS.USERS}`,
  )
  async update(
    @Param(zodValidationPipe(IdRequestSchema)) params: IdRequest,
    @Body(zodValidationPipe(UserUpdateSchema)) payload: CrudPayload,
  ): Promise<Response> {
    return {
      data: await this.userService.update(params.id, payload),
      message: 'User updated successfully.',
    };
  }

  @Delete(':id')
  @Permission(
    { actions: PERMISSION_ACTIONS.DELETE },
    `${PERMISSION_MODULE_TYPES.AUTH}_${PERMISSION_KEYS.USERS}`,
  )
  async delete(
    @Param(zodValidationPipe(IdRequestSchema)) params: IdRequest,
  ): Promise<Response> {
    return {
      data: await this.userService.delete(params.id),
      message: 'User deleted successfully.',
    };
  }
}
