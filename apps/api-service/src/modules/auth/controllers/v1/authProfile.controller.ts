import { Body, Get, Patch } from '@nestjs/common';
import { ExtendedController } from '@yuriyempty/nestjs-extended-controller';

import { UnauthorizedException } from 'common/exceptions';
import { type Response } from 'common/models';
import { zodValidationPipe } from 'common/pipes';
import { RolePermissionService } from 'modules/role';
import { UserService } from 'modules/user';

import { AuthController } from './auth.controller';
import { AuthUser } from '../../decorators';
import {
  AuthProfileChangePasswordSchema,
  AuthProfileUpdateSchema,
  type AuthProfileChangePassword,
  type AuthProfileUpdate,
  type JwtPayload,
} from '../../dtos';
import { AuthService } from '../../services';

@ExtendedController({
  parent: AuthController,
  path: 'profile',
})
export class AuthProfileController {
  constructor(
    private readonly userService: UserService,
    private readonly rolePermissionService: RolePermissionService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async profile(@AuthUser() { user_id }: JwtPayload): Promise<Response> {
    return {
      data: await this.userService.findById(user_id, ['*', 'role:roles(*)']),
    };
  }

  @Get('roles/permissions')
  async rolesPermissions(
    @AuthUser() { role_id }: JwtPayload,
  ): Promise<Response> {
    if (!role_id) {
      throw new UnauthorizedException();
    }

    return {
      data: await this.rolePermissionService.getProfileRolesPermissions(
        role_id,
      ),
    };
  }

  @Patch()
  async updateProfile(
    @AuthUser() { user_id }: JwtPayload,
    @Body(zodValidationPipe(AuthProfileUpdateSchema))
    payload: AuthProfileUpdate,
  ): Promise<Response> {
    return {
      data: await this.userService.update(user_id, payload),
      message: 'Profile updated successfully.',
    };
  }

  @Patch('change-password')
  async changePassword(
    @AuthUser() { user_id }: JwtPayload,
    @Body(zodValidationPipe(AuthProfileChangePasswordSchema))
    payload: AuthProfileChangePassword,
  ): Promise<Response> {
    return {
      data: await this.authService.changeProfilePassword(user_id, payload),
      message: 'Password changed successfully.',
    };
  }
}
