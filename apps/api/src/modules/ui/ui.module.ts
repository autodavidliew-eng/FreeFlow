import { Module } from '@nestjs/common';

import { TenantsModule } from '../tenants/tenants.module';

import { UiController } from './ui.controller';
import { UiService } from './ui.service';

@Module({
  imports: [TenantsModule],
  controllers: [UiController],
  providers: [UiService],
})
export class UiModule {}
