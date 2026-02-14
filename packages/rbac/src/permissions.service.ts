import { Injectable } from '@nestjs/common';
import { loadPermissions } from './permissions-loader';

@Injectable()
export class PermissionsService {
  async getRolePermissions(role: string): Promise<string[]> {
    const permissions = await loadPermissions();
    return permissions.roles?.[role]?.permissions ?? [];
  }

  async getUserPermissions(roles: string[]): Promise<string[]> {
    const rolePermissions = await Promise.all(
      roles.map((role) => this.getRolePermissions(role)),
    );

    return rolePermissions.flat();
  }

  async hasPermission(userRoles: string[], required: string[]): Promise<boolean> {
    if (required.length === 0) {
      return true;
    }

    const userPermissions = await this.getUserPermissions(userRoles);

    return required.some((permission) =>
      userPermissions.some((candidate) =>
        this.matchesPermission(candidate, permission),
      ),
    );
  }

  private matchesPermission(candidate: string, required: string): boolean {
    if (candidate === '*' || candidate === 'system:*') {
      return true;
    }

    if (candidate === required) {
      return true;
    }

    if (candidate.endsWith(':*')) {
      const scope = candidate.slice(0, candidate.length - 2);
      return required.startsWith(`${scope}:`);
    }

    return false;
  }
}
