import type { HealthResponse } from '@freeflow/shared';
import { Controller, Get, Param } from '@nestjs/common';

import type { AppService } from './app.service';
import type { AuditService } from './audit.service';
import type { DashboardService } from './dashboard.service';
import type { DashboardLayoutDto } from './dto/dashboard-layout.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dashboardService: DashboardService,
    private readonly auditService: AuditService
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

  @Get('healthz')
  getHealthz(): HealthResponse {
    return this.getHealth();
  }

  @Get('readyz')
  getReadyz(): HealthResponse {
    return this.getHealth();
  }

  @Get('layout/:userId')
  async getLayoutForUser(
    @Param('userId') userId: string
  ): Promise<DashboardLayoutDto | null> {
    const layout = await this.dashboardService.getLayoutForUser(userId);

    if (layout) {
      await this.auditService.logLayoutAccess(userId);
    }

    return layout;
  }
}
