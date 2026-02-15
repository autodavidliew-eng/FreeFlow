import { JwtAuthGuard } from '@freeflow/auth';
import { FgaGuard, RequireFga } from '@freeflow/authz-fga';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { AddonsService } from './addons.service';
import {
  AddonHandoffRequestDto,
  AddonHandoffResponseDto,
} from './dto/addon-handoff.dto';

@Controller('addons')
export class AddonsController {
  constructor(private readonly addonsService: AddonsService) {}

  @Post('handoff')
  @UseGuards(JwtAuthGuard, FgaGuard)
  @RequireFga('app', 'body.appKey', 'launch')
  handoff(@Body() payload: AddonHandoffRequestDto): AddonHandoffResponseDto {
    return this.addonsService.handoff(payload);
  }
}
