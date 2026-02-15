import {
  CurrentUser,
  JwtAuthGuard,
  type AuthenticatedUser,
} from '@freeflow/auth';
import { FgaGuard, RequireFga } from '@freeflow/authz-fga';
import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';

import { DashboardLayoutUpdateDto } from './dto/dashboard-layout.dto';
import type {
  DashboardLayoutDto,
  DashboardLayoutUpdateResponseDto,
} from './dto/dashboard-layout.dto';
import type { WidgetCatalogResponseDto } from './dto/widget-catalog.dto';
import { UiService } from './ui.service';

@Controller('ui')
export class UiController {
  constructor(private readonly uiService: UiService) {}

  @Get('widgets')
  @UseGuards(JwtAuthGuard)
  getWidgetCatalog(
    @CurrentUser() user: AuthenticatedUser
  ): Promise<WidgetCatalogResponseDto> {
    return this.uiService.getWidgetCatalog(user);
  }

  @Get('dashboard/layout')
  @UseGuards(JwtAuthGuard)
  getDashboardLayout(
    @CurrentUser() user: AuthenticatedUser
  ): Promise<DashboardLayoutDto> {
    return this.uiService.getDashboardLayout(user);
  }

  @Put('dashboard/layout')
  @UseGuards(JwtAuthGuard, FgaGuard)
  @RequireFga('dashboard', 'body.layoutId', 'edit')
  updateDashboardLayout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: DashboardLayoutUpdateDto
  ): Promise<DashboardLayoutUpdateResponseDto> {
    return this.uiService.updateDashboardLayout(user, payload);
  }
}
