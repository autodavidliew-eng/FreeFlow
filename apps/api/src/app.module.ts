import { JwtAuthGuard } from '@freeflow/auth';
import { FgaGuard } from '@freeflow/authz-fga';
import { PermissionGuard, PermissionsService } from '@freeflow/rbac';
import { Module } from '@nestjs/common';
import type { NestModule, MiddlewareConsumer } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AddonsModule } from './modules/addons/addons.module';
import { AlarmsModule } from './modules/alarms/alarms.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { InboxModule } from './modules/inbox/inbox.module';
import { TenantResolverMiddleware } from './modules/tenants/tenant-resolver.middleware';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UiModule } from './modules/ui/ui.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    DashboardModule,
    AddonsModule,
    AlarmsModule,
    InboxModule,
    TenantsModule,
    UiModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtAuthGuard,
    PermissionGuard,
    PermissionsService,
    FgaGuard,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantResolverMiddleware).forRoutes('*');
  }
}
