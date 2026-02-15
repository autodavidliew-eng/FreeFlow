import {
  CurrentUser,
  JwtAuthGuard,
  type AuthenticatedUser,
} from '@freeflow/auth';
import { FgaGuard, RequireFga } from '@freeflow/authz-fga';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { AddonsService } from './addons.service';
import {
  AddonHandoffRequestDto,
  AddonHandoffResponseDto,
} from './dto/addon-handoff.dto';
import type { AppCatalogResponseDto } from './dto/app-catalog.dto';

@Controller('addons')
export class AddonsController {
  constructor(private readonly addonsService: AddonsService) {}

  @Get('apps')
  @UseGuards(JwtAuthGuard)
  getApps(
    @CurrentUser() user: AuthenticatedUser
  ): Promise<AppCatalogResponseDto> {
    return this.addonsService.getApps(user);
  }

  @Post('handoff')
  @UseGuards(JwtAuthGuard, FgaGuard)
  @RequireFga('app', 'body.appKey', 'launch')
  handoff(@Body() payload: AddonHandoffRequestDto): AddonHandoffResponseDto {
    return this.addonsService.handoff(payload);
  }
}
