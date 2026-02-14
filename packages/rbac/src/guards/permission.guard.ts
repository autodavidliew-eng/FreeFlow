import {
  ForbiddenException,
  Injectable,
  type CanActivate,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedUser } from '@freeflow/auth';

import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator';
import { PermissionsService } from '../permissions.service';

type RequestWithUser = {
  user?: AuthenticatedUser;
};

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Missing authenticated user');
    }

    const roles = user.freeflowRoles.length > 0 ? user.freeflowRoles : user.roles;

    if (roles.length === 0) {
      throw new ForbiddenException('No roles assigned');
    }

    const allowed = await this.permissionsService.hasPermission(
      roles,
      requiredPermissions,
    );

    if (!allowed) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
