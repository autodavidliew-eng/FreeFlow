import {
  CurrentUser,
  JwtAuthGuard,
  type AuthenticatedUser,
} from '@freeflow/auth';
import { PermissionGuard, RequirePermission } from '@freeflow/rbac';
import { Controller, Get, UseGuards } from '@nestjs/common';

import { AlarmsService } from './alarms.service';
import type { AlarmListResponseDto } from './dto/alarm.dto';

@Controller('alarms')
export class AlarmsController {
  constructor(private readonly alarmsService: AlarmsService) {}

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('alarms:read')
  @Get()
  getAlarms(
    @CurrentUser() user: AuthenticatedUser
  ): Promise<AlarmListResponseDto> {
    return this.alarmsService.getAlarms(user);
  }
}
