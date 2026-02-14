import { Controller, Get, Param } from '@nestjs/common';
import type { HealthResponse } from '@freeflow/shared';
import type { DashboardLayoutDto } from './dto/dashboard-layout.dto';
import { AuditService } from './audit.service';
import { AppService } from './app.service';
import { DashboardService } from './dashboard.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dashboardService: DashboardService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  getStatus(): string {
    return this.appService.getStatus();
  }

  @Get('health')
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'dashboard-service',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('layout/:userId')
  async getLayoutForUser(
    @Param('userId') userId: string,
  ): Promise<DashboardLayoutDto | null> {
    const layout = await this.dashboardService.getLayoutForUser(userId);

    if (layout) {
      await this.auditService.logLayoutAccess(userId);
    }

    return layout;
  }
}
