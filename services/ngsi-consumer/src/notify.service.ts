import { Injectable } from '@nestjs/common';
import { prisma } from '@freeflow/db-postgres';

const DEFAULT_TENANT = 'alpha';

type NgsiLdNotification = {
  data?: Array<Record<string, any>>;
};

@Injectable()
export class NotifyService {
  async handleNotification(payload: NgsiLdNotification, tenantHeader?: string) {
    const data = payload?.data ?? [];
    let processed = 0;

    for (const entity of data) {
      const tenant = tenantHeader || this.extractTenant(entity) || DEFAULT_TENANT;
      const meterId = this.extractMeterId(entity);
      const ts = this.extractTimestamp(entity);
      const powerW = this.extractNumber(entity?.powerW?.value);
      const energyKWh = this.extractNumber(entity?.energyKWh?.value);

      if (!meterId || !ts || powerW === null || energyKWh === null) {
        continue;
      }

      await prisma.smartMeterMeasurement.upsert({
        where: {
          tenant_meterId_ts: {
            tenant,
            meterId,
            ts,
          },
        },
        update: {
          powerW,
          energyKWh,
          rawJson: entity,
        },
        create: {
          tenant,
          meterId,
          ts,
          powerW,
          energyKWh,
          rawJson: entity,
        },
      });

      processed += 1;
    }

    return processed;
  }

  private extractNumber(value: any) {
    if (value === undefined || value === null) {
      return null;
    }
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  private extractTimestamp(entity: Record<string, any>) {
    const observedAt = entity?.powerW?.observedAt || entity?.energyKWh?.observedAt;
    const timestampValue = entity?.timestamp?.value || entity?.observedAt;
    const candidate = observedAt || timestampValue;

    if (!candidate || typeof candidate !== 'string') {
      return null;
    }

    const parsed = new Date(candidate);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed;
  }

  private extractMeterId(entity: Record<string, any>) {
    if (entity?.meterId?.value) {
      return String(entity.meterId.value);
    }

    const meterRel = entity?.meter?.object;
    if (typeof meterRel === 'string') {
      const parts = meterRel.split(':');
      return parts[parts.length - 1];
    }

    return null;
  }

  private extractTenant(entity: Record<string, any>) {
    if (entity?.tenant?.value) {
      return String(entity.tenant.value);
    }

    const meterRel = entity?.meter?.object;
    if (typeof meterRel === 'string') {
      const parts = meterRel.split(':');
      return parts.length >= 2 ? parts[parts.length - 2] : null;
    }

    return null;
  }
}
