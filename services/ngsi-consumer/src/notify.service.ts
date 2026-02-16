import { prisma } from '@freeflow/db-postgres';
import { Injectable } from '@nestjs/common';

const DEFAULT_TENANT = 'alpha';

type NgsiLdNotification = {
  data?: Array<Record<string, any>>;
};

@Injectable()
export class NotifyService {
  private static readonly FF_PREFIX = 'https://freeflow.example.com/ontology#';
  private static readonly NGSI_HAS_VALUE =
    'https://uri.etsi.org/ngsi-ld/hasValue';
  private static readonly NGSI_HAS_OBJECT =
    'https://uri.etsi.org/ngsi-ld/hasObject';
  private static readonly NGSI_OBSERVED_AT =
    'https://uri.etsi.org/ngsi-ld/observedAt';

  async handleNotification(payload: NgsiLdNotification, tenantHeader?: string) {
    const data = payload?.data ?? [];
    let processed = 0;

    for (const entity of data) {
      const tenant =
        tenantHeader || this.extractTenant(entity) || DEFAULT_TENANT;
      const meterId = this.extractMeterId(entity);
      const ts = this.extractTimestamp(entity);
      const powerProp = this.getProp(entity, 'powerW');
      const energyProp = this.getProp(entity, 'energyKWh');
      const powerW = this.extractNumber(this.readValue(powerProp));
      const energyKWh = this.extractNumber(this.readValue(energyProp));

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

    if (processed === 0 && data.length > 0) {
      const sample = data[0];
      // Log minimal debug info to understand unexpected notification shapes.
      console.warn(
        'NGSI notification skipped',
        JSON.stringify(
          { keys: Object.keys(sample || {}), sample },
          null,
          2
        ).slice(0, 2000)
      );
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
    const powerProp = this.getProp(entity, 'powerW');
    const energyProp = this.getProp(entity, 'energyKWh');
    const timestampProp = this.getProp(entity, 'timestamp');
    const observedAt =
      this.readObservedAt(powerProp) || this.readObservedAt(energyProp);
    const timestampValue = this.readValue(timestampProp) || entity?.observedAt;
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
    const meterIdProp = this.getProp(entity, 'meterId');
    const meterIdValue = this.readValue(meterIdProp);
    if (meterIdValue !== null) {
      return String(meterIdValue);
    }

    const meterRel = this.readObjectId(this.getProp(entity, 'meter'));
    if (typeof meterRel === 'string') {
      const parts = meterRel.split(':');
      return parts[parts.length - 1];
    }

    return null;
  }

  private extractTenant(entity: Record<string, any>) {
    const tenantProp = this.getProp(entity, 'tenant');
    const tenantValue = this.readValue(tenantProp);
    if (tenantValue !== null) {
      return String(tenantValue);
    }

    const meterRel = this.readObjectId(this.getProp(entity, 'meter'));
    if (typeof meterRel === 'string') {
      const parts = meterRel.split(':');
      return parts.length >= 2 ? parts[parts.length - 2] : null;
    }

    return null;
  }

  private getProp(entity: Record<string, any>, name: string) {
    if (!entity || typeof entity !== 'object') {
      return undefined;
    }
    return entity[name] ?? entity[`${NotifyService.FF_PREFIX}${name}`];
  }

  private normalizeProp(prop: any) {
    if (Array.isArray(prop)) {
      return prop[0];
    }
    return prop;
  }

  private readValue(prop: any) {
    const normalized = this.normalizeProp(prop);
    if (!normalized) {
      return null;
    }
    if (normalized.value !== undefined) {
      return normalized.value;
    }
    const hasValue = normalized[NotifyService.NGSI_HAS_VALUE];
    if (
      Array.isArray(hasValue) &&
      hasValue[0] &&
      hasValue[0]['@value'] !== undefined
    ) {
      return hasValue[0]['@value'];
    }
    if (hasValue && hasValue['@value'] !== undefined) {
      return hasValue['@value'];
    }
    return null;
  }

  private readObservedAt(prop: any) {
    const normalized = this.normalizeProp(prop);
    if (!normalized) {
      return null;
    }
    if (normalized.observedAt !== undefined) {
      return normalized.observedAt;
    }
    const observedAt = normalized[NotifyService.NGSI_OBSERVED_AT];
    if (
      Array.isArray(observedAt) &&
      observedAt[0] &&
      observedAt[0]['@value'] !== undefined
    ) {
      return observedAt[0]['@value'];
    }
    if (observedAt && observedAt['@value'] !== undefined) {
      return observedAt['@value'];
    }
    return null;
  }

  private readObjectId(prop: any) {
    const normalized = this.normalizeProp(prop);
    if (!normalized) {
      return null;
    }
    if (normalized.object !== undefined) {
      return normalized.object;
    }
    if (normalized['@id']) {
      return normalized['@id'];
    }
    const hasObject = normalized[NotifyService.NGSI_HAS_OBJECT];
    if (Array.isArray(hasObject) && hasObject[0] && hasObject[0]['@id']) {
      return hasObject[0]['@id'];
    }
    if (hasObject && hasObject['@id']) {
      return hasObject['@id'];
    }
    return null;
  }
}
