import { Module } from '@nestjs/common';

import { TenantRegistryService } from './tenant-registry.service';
import { TenantsController } from './tenants.controller';

@Module({
  controllers: [TenantsController],
  providers: [TenantRegistryService],
})
export class TenantsModule {}
