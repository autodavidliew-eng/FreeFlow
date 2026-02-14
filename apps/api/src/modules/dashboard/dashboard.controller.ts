import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@freeflow/auth';
import { PermissionGuard, RequirePermission } from '@freeflow/rbac';
import type { DashboardLayoutDto } from './dto/dashboard-layout.dto';
import type { WidgetCatalogResponseDto } from './dto/widget-catalog.dto';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('analytics:read')
  @Get('layout')
  getLayout(): DashboardLayoutDto {
    return this.dashboardService.getLayout();
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('analytics:read')
  @Get('widgets')
  getWidgets(): WidgetCatalogResponseDto {
    return this.dashboardService.getWidgetCatalog();
  }
}
