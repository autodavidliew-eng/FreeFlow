import { Injectable } from '@nestjs/common';
import { NgsiLdClient } from '@freeflow/ngsi-ld-client';
import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const CORE_CONTEXT = 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.9.jsonld';

export type SmartMeterReading = {
  ts: string;
  powerW: number;
  energyKWh: number;
  meterId: string;
  siteId: string;
};

@Injectable()
export class IngestService {
  private readonly client: NgsiLdClient;
  private readonly defaultTenant: string;
  private readonly contextUrl: string;
  private readonly defaultMeterId: string;
  private readonly defaultSiteId: string;
  private readonly samplePath: string;

  constructor() {
    this.defaultTenant = process.env.DEFAULT_TENANT || 'alpha';
    this.contextUrl =
      process.env.CONTEXT_URL || 'http://localhost:8090/context/freeflow-energy.jsonld';
    this.defaultMeterId = process.env.DEFAULT_METER_ID || 'emeter-001';
    this.defaultSiteId = process.env.DEFAULT_SITE_ID || 'site-001';
    this.samplePath =
      process.env.SAMPLE_DATA_PATH ||
      path.resolve(process.cwd(), '..', '..', 'data', 'samples', 'smartmeter_week_5min.csv');

    const baseUrl = process.env.SCORPIO_URL || 'http://localhost:9090';
    this.client = new NgsiLdClient({
      baseUrl,
    });
  }

  async ingestReading(reading: SmartMeterReading, tenant?: string) {
    const scopedTenant = tenant || this.defaultTenant;

    const smartMeter = {
      id: `urn:ngsi-ld:SmartMeter:${scopedTenant}:${reading.meterId}`,
      type: 'SmartMeter',
      meterId: { type: 'Property', value: reading.meterId },
      tenant: { type: 'Property', value: scopedTenant },
      siteId: { type: 'Property', value: reading.siteId },
      '@context': [this.contextUrl, CORE_CONTEXT],
    };

    const measurement = {
      id: `urn:ngsi-ld:SmartMeterMeasurement:${scopedTenant}:${reading.meterId}:${reading.ts}`,
      type: 'SmartMeterMeasurement',
      meter: {
        type: 'Relationship',
        object: smartMeter.id,
      },
      powerW: {
        type: 'Property',
        value: reading.powerW,
        observedAt: reading.ts,
      },
      energyKWh: {
        type: 'Property',
        value: reading.energyKWh,
        observedAt: reading.ts,
      },
      timestamp: {
        type: 'Property',
        value: reading.ts,
      },
      tenant: {
        type: 'Property',
        value: scopedTenant,
      },
      '@context': [this.contextUrl, CORE_CONTEXT],
    };

    await this.client.upsertEntity(smartMeter, { tenant: scopedTenant });
    await this.client.upsertEntity(measurement, { tenant: scopedTenant });
  }

  async startReplay(speed: 'real' | 'fast', tenant?: string, meterId?: string) {
    const readings = await this.loadSampleCsv(meterId);
    const delayMs = speed === 'real' ? 5 * 60 * 1000 : 100;

    void this.replayLoop(readings, delayMs, tenant);

    return { status: 'started', count: readings.length, speed };
  }

  private async replayLoop(readings: SmartMeterReading[], delayMs: number, tenant?: string) {
    for (const reading of readings) {
      await this.ingestReading(reading, tenant);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  private async loadSampleCsv(meterId?: string): Promise<SmartMeterReading[]> {
    let raw: string;
    try {
      raw = await fs.readFile(this.samplePath, 'utf-8');
    } catch (error) {
      throw new Error(
        `Sample CSV not found at ${this.samplePath}. Run scripts/data/build_smartmeter_week_5min.py first.`,
      );
    }
    const rows: Array<{ ts_iso: string; powerW: string; energyKWh: string }> = parse(raw, {
      columns: true,
      skip_empty_lines: true,
    });

    const resolvedMeterId = meterId || this.defaultMeterId;
    return rows.map((row) => ({
      ts: row.ts_iso,
      powerW: Number(row.powerW),
      energyKWh: Number(row.energyKWh),
      meterId: resolvedMeterId,
      siteId: this.defaultSiteId,
    }));
  }
}
