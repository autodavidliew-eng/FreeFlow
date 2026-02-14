import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@freeflow/auth';
import { PermissionGuard, RequirePermission } from '@freeflow/rbac';
import type { AlarmListResponseDto } from './dto/alarm.dto';
import { AlarmsService } from './alarms.service';

@Controller('alarms')
export class AlarmsController {
  constructor(private readonly alarmsService: AlarmsService) {}

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('alarms:read')
  @Get()
  getAlarms(): AlarmListResponseDto {
    return this.alarmsService.getAlarms();
  }
}
