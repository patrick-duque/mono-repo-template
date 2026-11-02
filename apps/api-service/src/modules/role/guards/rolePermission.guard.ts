import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { type JwtPayload } from 'modules/auth/dtos';

import {
  PERMISSION_KEY,
  type PermissionActionValue,
  type PermissionConfig,
  type PermissionRouteKeyValue,
} from '../decorators/permission.decorator';
import { RolePermissionService } from '../services';

type AuthenticatedRequest = {
  user?: JwtPayload;
  rolePermission?: {
    key: PermissionRouteKeyValue;
    actions?: PermissionActionValue | PermissionActionValue[];
  };
};

@Injectable()
export default class RolePermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.getAllAndOverride<PermissionConfig>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!metadata) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const roleId = request.user?.role_id;

    if (!roleId) return false;

    const keys = Array.isArray(metadata.key) ? metadata.key : [metadata.key];

    for (const key of keys) {
      const hasPermission = await this.rolePermissionService.hasPermission(
        roleId,
        key,
        metadata.permission.actions,
      );

      if (hasPermission) {
        request.rolePermission = {
          key,
          actions: metadata.permission.actions,
        };

        return true;
      }
    }

    return false;
  }
}
