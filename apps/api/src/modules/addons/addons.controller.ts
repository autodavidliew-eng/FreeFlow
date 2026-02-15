import {
  CurrentUser,
  JwtAuthGuard,
  type AuthenticatedUser,
} from '@freeflow/auth';
import { FgaGuard, RequireFga } from '@freeflow/authz-fga';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AddonsService } from './addons.service';
import type { AddonHandoffResponseDto } from './dto/addon-handoff.dto';
import { AddonHandoffRequestDto } from './dto/addon-handoff.dto';
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
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, FgaGuard)
  @RequireFga('app', 'body.appKey', 'launch')
  handoff(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: AddonHandoffRequestDto
  ): Promise<AddonHandoffResponseDto> {
    return this.addonsService.handoff(user, payload);
  }
}
