import { PermissionGuard, PermissionsService } from '@freeflow/rbac';
import { Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, PermissionGuard, PermissionsService, Reflector],
})
export class DashboardModule {}
