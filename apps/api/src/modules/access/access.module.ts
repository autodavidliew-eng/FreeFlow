import { PermissionGuard, PermissionsService } from '@freeflow/rbac';
import { Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { TenantsModule } from '../tenants/tenants.module';

import { AccessController } from './access.controller';
import { RoleAccessService } from './role-access.service';

@Module({
  imports: [TenantsModule],
  controllers: [AccessController],
  providers: [
    RoleAccessService,
    PermissionGuard,
    PermissionsService,
    Reflector,
  ],
  exports: [RoleAccessService],
})
export class AccessModule {}
