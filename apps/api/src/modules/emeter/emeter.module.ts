import { Module } from '@nestjs/common';

import { AccessModule } from '../access/access.module';
import { TenantsModule } from '../tenants/tenants.module';

import { EmeterController } from './emeter.controller';
import { EmeterService } from './emeter.service';

@Module({
  imports: [TenantsModule, AccessModule],
  controllers: [EmeterController],
  providers: [EmeterService],
})
export class EmeterModule {}
