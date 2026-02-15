import type { AuthenticatedUser } from '@freeflow/auth';
import { checkAccess } from '@freeflow/authz-fga';
import { Injectable } from '@nestjs/common';

import type { AlarmDto, AlarmListResponseDto } from './dto/alarm.dto';

@Injectable()
export class AlarmsService {
  async getAlarms(user: AuthenticatedUser): Promise<AlarmListResponseDto> {
    const items: AlarmDto[] = [
      {
        id: 'alarm_001',
        siteId: 'site-a',
        siteName: 'Riverside Primary School',
        label: 'Cooling loop pressure low',
        severity: 'High',
        status: 'active',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: 'alarm_002',
        siteId: 'site-a',
        siteName: 'Riverside Primary School',
        label: 'Generator A maintenance due',
        severity: 'Medium',
        status: 'acknowledged',
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      },
      {
        id: 'alarm_003',
        siteId: 'site-b',
        siteName: 'Hillcrest Campus',
        label: 'Network latency spike',
        severity: 'Low',
        status: 'active',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const allowedSites = await resolveAllowedSites(user, items);
    const filtered = items.filter((item) => allowedSites.has(item.siteId));

    return {
      items: filtered,
      total: filtered.length,
    };
  }
}

async function resolveAllowedSites(
  user: AuthenticatedUser,
  items: AlarmDto[]
): Promise<Set<string>> {
  const siteIds = Array.from(new Set(items.map((item) => item.siteId)));
  const results = await Promise.all(
    siteIds.map(async (siteId) => {
      const allowed = await checkAccess({
        user: `user:${user.sub}`,
        relation: 'view',
        object: `site:${siteId}`,
      });
      return { siteId, allowed };
    })
  );

  return new Set(results.filter((r) => r.allowed).map((r) => r.siteId));
}
