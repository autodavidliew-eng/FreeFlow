import { BadRequestException, Body, Controller, Headers, Post, Query } from '@nestjs/common';
import { IngestService } from './ingest.service';

@Controller()
export class IngestController {
  constructor(private readonly ingestService: IngestService) {}

  @Post('/ingest/smartmeter')
  async ingestSmartMeter(
    @Body() body: { ts?: string; ts_iso?: string; powerW: number; energyKWh?: number; meterId?: string; siteId?: string },
    @Headers('ngsild-tenant') tenantHeader?: string,
    @Headers('x-tenant') xTenant?: string,
  ) {
    const ts = body.ts || body.ts_iso || new Date().toISOString();
    const powerW = Number(body.powerW);
    const energyKWh =
      body.energyKWh !== undefined
        ? Number(body.energyKWh)
        : Number(((powerW / 1000) * (5 / 60)).toFixed(6));

    const reading = {
      ts,
      powerW,
      energyKWh,
      meterId: body.meterId || 'emeter-001',
      siteId: body.siteId || 'site-001',
    };

    await this.ingestService.ingestReading(reading, tenantHeader || xTenant);
    return { status: 'ok' };
  }

  @Post('/replay/smartmeter/week')
  async replaySmartMeter(
    @Query('speed') speed: 'real' | 'fast' = 'fast',
    @Query('tenant') tenant?: string,
    @Query('meterId') meterId?: string,
  ) {
    try {
      return await this.ingestService.startReplay(speed, tenant, meterId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Replay failed';
      throw new BadRequestException(message);
    }
  }
}
