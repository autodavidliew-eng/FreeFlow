import { JwtAuthGuard } from '@freeflow/auth';
import { FgaGuard, RequireFga } from '@freeflow/authz-fga';
import { Body, Controller, Put, UseGuards } from '@nestjs/common';

import {
  DashboardLayoutUpdateDto,
  DashboardLayoutUpdateResponseDto,
} from './dto/dashboard-layout.dto';
import { UiService } from './ui.service';

@Controller('ui')
export class UiController {
  constructor(private readonly uiService: UiService) {}

  @Put('dashboard/layout')
  @UseGuards(JwtAuthGuard, FgaGuard)
  @RequireFga('dashboard', 'body.layoutId', 'edit')
  updateDashboardLayout(
    @Body() payload: DashboardLayoutUpdateDto
  ): DashboardLayoutUpdateResponseDto {
    return this.uiService.updateDashboardLayout(payload);
  }
}
