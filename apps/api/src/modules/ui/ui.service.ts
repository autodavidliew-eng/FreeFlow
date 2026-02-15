import { Injectable } from '@nestjs/common';

import type {
  DashboardLayoutUpdateDto,
  DashboardLayoutUpdateResponseDto,
} from './dto/dashboard-layout.dto';

@Injectable()
export class UiService {
  updateDashboardLayout(
    payload: DashboardLayoutUpdateDto
  ): DashboardLayoutUpdateResponseDto {
    return {
      layoutId: payload.layoutId,
      status: 'updated',
    };
  }
}
