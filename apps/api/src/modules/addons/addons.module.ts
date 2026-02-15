import { Module } from '@nestjs/common';

import { TenantsModule } from '../tenants/tenants.module';

import { AddonsController } from './addons.controller';
import { AddonsService } from './addons.service';

@Module({
  imports: [TenantsModule],
  controllers: [AddonsController],
  providers: [AddonsService],
})
export class AddonsModule {}
