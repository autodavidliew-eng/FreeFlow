import {
  CurrentUser,
  JwtAuthGuard,
  type AuthenticatedUser,
} from '@freeflow/auth';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import type { EmeterWeeklyResponseDto } from './dto/emeter-weekly.dto';
import { EmeterService } from './emeter.service';

@Controller('emeter')
export class EmeterController {
  constructor(private readonly emeterService: EmeterService) {}

  @Get('weekly')
  @UseGuards(JwtAuthGuard)
  getWeeklySeries(
    @CurrentUser() user: AuthenticatedUser,
    @Query('meterId') meterId?: string,
    @Query('days') days?: string
  ): Promise<EmeterWeeklyResponseDto> {
    const rangeDays = days ? Number(days) : undefined;
    return this.emeterService.getWeeklySeries(user, meterId, rangeDays);
  }
}
