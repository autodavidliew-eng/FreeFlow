import 'reflect-metadata';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import { PermissionGuard } from '../src/guards/permission.guard';
import { PERMISSIONS_KEY } from '../src/decorators/require-permission.decorator';

function createContext(
  handler: () => void,
  user?: { roles: string[]; freeflowRoles: string[] },
): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as ExecutionContext;
}

describe('PermissionGuard', () => {
  it('allows when permissions match', async () => {
    const permissionsService = {
      hasPermission: jest.fn().mockResolvedValue(true),
    };
    const guard = new PermissionGuard(new Reflector(), permissionsService as any);
    const handler = () => undefined;
    Reflect.defineMetadata(PERMISSIONS_KEY, ['documents:read'], handler);

    await expect(
      guard.canActivate(createContext(handler, { roles: ['Admin'], freeflowRoles: [] })),
    ).resolves.toBe(true);
  });

  it('rejects when no user is attached', async () => {
    const permissionsService = {
      hasPermission: jest.fn().mockResolvedValue(true),
    };
    const guard = new PermissionGuard(new Reflector(), permissionsService as any);
    const handler = () => undefined;
    Reflect.defineMetadata(PERMISSIONS_KEY, ['documents:read'], handler);

    await expect(guard.canActivate(createContext(handler))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects when user has no roles', async () => {
    const permissionsService = {
      hasPermission: jest.fn().mockResolvedValue(true),
    };
    const guard = new PermissionGuard(new Reflector(), permissionsService as any);
    const handler = () => undefined;
    Reflect.defineMetadata(PERMISSIONS_KEY, ['documents:read'], handler);

    await expect(
      guard.canActivate(createContext(handler, { roles: [], freeflowRoles: [] })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
