import { Controller, Get, Param } from '@nestjs/common';
import type { DashboardLayoutDto } from './dto/dashboard-layout.dto';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get(':userId/layout')
  async getLayout(
    @Param('userId') userId: string,
  ): Promise<DashboardLayoutDto | null> {
    return this.dashboardService.getLayoutForUser(userId);
  }
}
