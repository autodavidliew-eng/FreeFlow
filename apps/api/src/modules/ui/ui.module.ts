import { Module } from '@nestjs/common';

import { AccessModule } from '../access/access.module';
import { TenantsModule } from '../tenants/tenants.module';

import { UiController } from './ui.controller';
import { UiService } from './ui.service';

@Module({
  imports: [TenantsModule, AccessModule],
  controllers: [UiController],
  providers: [UiService],
})
export class UiModule {}
