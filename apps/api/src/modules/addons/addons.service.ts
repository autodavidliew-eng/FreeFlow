import { Injectable } from '@nestjs/common';

import type {
  AddonHandoffRequestDto,
  AddonHandoffResponseDto,
} from './dto/addon-handoff.dto';

@Injectable()
export class AddonsService {
  handoff(payload: AddonHandoffRequestDto): AddonHandoffResponseDto {
    return {
      appKey: payload.appKey,
      status: 'allowed',
    };
  }
}
