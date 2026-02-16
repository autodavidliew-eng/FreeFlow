import { prisma, type PrismaClient } from '@freeflow/db-postgres';
import { Injectable, Logger } from '@nestjs/common';

import type { IdempotencyRecord } from './idempotency.types';

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);
  private readonly client: PrismaClient;

  constructor() {
    this.client = prisma;
  }

  async register(record: IdempotencyRecord): Promise<boolean> {
    if (!record.eventId) {
      throw new Error('eventId is required for idempotency');
    }
    if (!record.consumer) {
      throw new Error('consumer is required for idempotency');
    }

    const inserted = await this.client.$executeRaw`
      INSERT INTO "ProcessedEvent" ("eventId", "consumer", "payloadHash")
      VALUES (${record.eventId}, ${record.consumer}, ${record.payloadHash})
      ON CONFLICT ("eventId", "consumer") DO NOTHING
    `;

    if (!inserted) {
      this.logger.warn(
        `Duplicate event detected for ${record.consumer} (${record.eventId})`
      );
      return false;
    }

    return true;
  }

  async release(record: Pick<IdempotencyRecord, 'eventId' | 'consumer'>) {
    if (!record.eventId || !record.consumer) {
      return;
    }

    await this.client.$executeRaw`
      DELETE FROM "ProcessedEvent"
      WHERE "eventId" = ${record.eventId} AND "consumer" = ${record.consumer}
    `;
  }
}
