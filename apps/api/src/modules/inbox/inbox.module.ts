import { PermissionGuard, PermissionsService } from '@freeflow/rbac';
import { Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { InboxController } from './inbox.controller';
import { InboxService } from './inbox.service';

@Module({
  controllers: [InboxController],
  providers: [InboxService, PermissionGuard, PermissionsService, Reflector],
})
export class InboxModule {}
