import { PermissionGuard, PermissionsService } from '@freeflow/rbac';
import { Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AlarmsController } from './alarms.controller';
import { AlarmsService } from './alarms.service';

@Module({
  controllers: [AlarmsController],
  providers: [AlarmsService, PermissionGuard, PermissionsService, Reflector],
})
export class AlarmsModule {}
