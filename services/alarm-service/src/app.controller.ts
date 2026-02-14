import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from '@freeflow/shared';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getStatus(): string {
    return this.appService.getStatus();
  }

  @Get('health')
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'alarm-service',
      timestamp: new Date().toISOString(),
    };
  }
}
