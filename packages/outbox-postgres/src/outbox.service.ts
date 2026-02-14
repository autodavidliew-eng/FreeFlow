import { Injectable } from '@nestjs/common';
import { prisma, type PrismaClient } from '@freeflow/db-postgres';
import type { OutboxEventInput, TransactionClient } from './outbox.types';

@Injectable()
export class OutboxService {
  constructor(private readonly client: PrismaClient = prisma) {}

  async enqueue(event: OutboxEventInput) {
    return this.client.outboxEvent.create({
      data: {
        eventType: event.eventType,
        payload: event.payload,
        headers: event.headers ?? undefined,
        availableAt: event.availableAt ?? undefined,
      },
    });
  }

  async enqueueTx(tx: TransactionClient, event: OutboxEventInput) {
    return tx.outboxEvent.create({
      data: {
        eventType: event.eventType,
        payload: event.payload,
        headers: event.headers ?? undefined,
        availableAt: event.availableAt ?? undefined,
      },
    });
  }
}
