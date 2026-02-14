import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@freeflow/auth';
import { PermissionGuard, RequirePermission } from '@freeflow/rbac';
import type { HealthResponse } from '@freeflow/shared';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('documents:read')
  @Get('documents')
  getDocuments() {
    return {
      items: [],
      message: 'RBAC-protected endpoint placeholder.',
    };
  }
}
