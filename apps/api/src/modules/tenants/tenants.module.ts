import { Module } from '@nestjs/common';

import { TenantContextService } from './tenant-context';
import {
  TenantMongoFactory,
  TenantPostgresFactory,
  TenantQdrantFactory,
} from './tenant-data.factory';
import { TenantRegistryService } from './tenant-registry.service';
import { TenantResolverMiddleware } from './tenant-resolver.middleware';
import { TenantResolverService } from './tenant-resolver.service';
import { TenantsController } from './tenants.controller';

@Module({
  controllers: [TenantsController],
  providers: [
    TenantRegistryService,
    TenantResolverService,
    TenantResolverMiddleware,
    TenantContextService,
    TenantPostgresFactory,
    TenantMongoFactory,
    TenantQdrantFactory,
  ],
  exports: [
    TenantResolverService,
    TenantResolverMiddleware,
    TenantContextService,
    TenantPostgresFactory,
    TenantMongoFactory,
    TenantQdrantFactory,
  ],
})
export class TenantsModule {}
