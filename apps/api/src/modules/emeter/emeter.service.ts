import type { AuthenticatedUser } from '@freeflow/auth';
import { ForbiddenException, Injectable } from '@nestjs/common';

import { RoleAccessService } from '../access/role-access.service';
import { TenantContextService } from '../tenants/tenant-context';
import { TenantPostgresFactory } from '../tenants/tenant-data.factory';

import type { EmeterWeeklyResponseDto } from './dto/emeter-weekly.dto';

const WIDGET_KEY = 'emeter-weekly-widget';
const DEFAULT_METER_ID = 'emeter-001';
const DEFAULT_RANGE_DAYS = 7;
const MAX_RANGE_DAYS = 31;

@Injectable()
export class EmeterService {
  constructor(
    private readonly tenantPostgres: TenantPostgresFactory,
    private readonly tenantContext: TenantContextService,
    private readonly roleAccess: RoleAccessService
  ) {}

  async getWeeklySeries(
    user: AuthenticatedUser,
    meterId?: string,
    rangeDays?: number
  ): Promise<EmeterWeeklyResponseDto> {
    const roles = resolveRoles(user);
    const allowed = await this.roleAccess.getAllowedWidgets(roles);
    if (!allowed.includes(WIDGET_KEY)) {
      throw new ForbiddenException('Widget not allowed by role.');
    }

    const tenant = this.tenantContext.require();
    const resolvedMeterId = meterId?.trim() || DEFAULT_METER_ID;
    const days = clampDays(rangeDays ?? DEFAULT_RANGE_DAYS);

    const now = new Date();
    const from = new Date(now);
    from.setUTCDate(from.getUTCDate() - (days - 1));
    from.setUTCHours(0, 0, 0, 0);

    const prisma = this.getClient();
    const rows = await prisma.$queryRaw<
      Array<{ day: Date; energy_kwh: number | null; power_avg: number | null }>
    >`
      SELECT
        date_trunc('day', "ts") as day,
        SUM("energyKWh") as energy_kwh,
        AVG("powerW") as power_avg
      FROM "SmartMeterMeasurement"
      WHERE tenant = ${tenant.name}
        AND "meterId" = ${resolvedMeterId}
        AND "ts" >= ${from}
      GROUP BY day
      ORDER BY day ASC
    `;

    const dailyMap = new Map<
      string,
      { energyKWh: number; powerAvgW: number }
    >();
    for (const row of rows) {
      const key = row.day.toISOString().slice(0, 10);
      dailyMap.set(key, {
        energyKWh: Number(row.energy_kwh ?? 0),
        powerAvgW: Number(row.power_avg ?? 0),
      });
    }

    const points = [];
    for (let offset = 0; offset < days; offset += 1) {
      const day = addUtcDays(from, offset);
      const key = day.toISOString().slice(0, 10);
      const values = dailyMap.get(key) ?? { energyKWh: 0, powerAvgW: 0 };
      points.push({
        date: day.toISOString(),
        energyKWh: values.energyKWh,
        powerAvgW: values.powerAvgW,
      });
    }

    return {
      meterId: resolvedMeterId,
      from: from.toISOString(),
      to: now.toISOString(),
      points,
    };
  }

  private getClient() {
    return this.tenantPostgres.getClient() as unknown as EmeterPrismaClient;
  }
}

const resolveRoles = (user: AuthenticatedUser): string[] => {
  if (user.freeflowRoles && user.freeflowRoles.length > 0) {
    return user.freeflowRoles;
  }

  return user.roles ?? [];
};

function clampDays(days: number) {
  if (!Number.isFinite(days)) {
    return DEFAULT_RANGE_DAYS;
  }

  return Math.min(Math.max(Math.floor(days), 1), MAX_RANGE_DAYS);
}

function addUtcDays(date: Date, offset: number) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + offset
    )
  );
}

type EmeterPrismaClient = {
  $queryRaw: <T = unknown>(
    query: TemplateStringsArray,
    ...values: unknown[]
  ) => Promise<T>;
};
