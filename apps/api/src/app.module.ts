import { JwtAuthGuard } from '@freeflow/auth';
import { PermissionGuard, PermissionsService } from '@freeflow/rbac';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlarmsModule } from './modules/alarms/alarms.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { InboxModule } from './modules/inbox/inbox.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    DashboardModule,
    AlarmsModule,
    InboxModule,
    TenantsModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtAuthGuard, PermissionGuard, PermissionsService],
})
export class AppModule {}
