import { Injectable } from '@nestjs/common';
import type { AlarmListResponseDto } from './dto/alarm.dto';

@Injectable()
export class AlarmsService {
  getAlarms(): AlarmListResponseDto {
    const items = [
      {
        id: 'alarm_001',
        label: 'Cooling loop pressure low',
        severity: 'High',
        status: 'active',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: 'alarm_002',
        label: 'Generator A maintenance due',
        severity: 'Medium',
        status: 'acknowledged',
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      },
      {
        id: 'alarm_003',
        label: 'Network latency spike',
        severity: 'Low',
        status: 'active',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return {
      items,
      total: items.length,
    };
  }
}
