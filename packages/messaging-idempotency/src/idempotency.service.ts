import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { prisma, type PrismaClient } from '@freeflow/db-postgres';
import type { IdempotencyRecord } from './idempotency.types';

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);

  constructor(private readonly client: PrismaClient = prisma) {}

  async register(record: IdempotencyRecord): Promise<boolean> {
    if (!record.eventId) {
      throw new Error('eventId is required for idempotency');
    }
    if (!record.consumer) {
      throw new Error('consumer is required for idempotency');
    }

    try {
      await this.client.processedEvent.create({
        data: {
          eventId: record.eventId,
          consumer: record.consumer,
          payloadHash: record.payloadHash,
        },
      });
      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Duplicate event detected for ${record.consumer} (${record.eventId})`,
        );
        return false;
      }
      throw error;
    }
  }

  async release(record: Pick<IdempotencyRecord, 'eventId' | 'consumer'>) {
    if (!record.eventId || !record.consumer) {
      return;
    }

    await this.client.processedEvent.deleteMany({
      where: {
        eventId: record.eventId,
        consumer: record.consumer,
      },
    });
  }
}
