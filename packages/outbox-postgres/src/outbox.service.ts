import { prisma, type PrismaClient } from '@freeflow/db-postgres';
import { Injectable } from '@nestjs/common';

import type { OutboxEventInput, TransactionClient } from './outbox.types';

@Injectable()
export class OutboxService {
  constructor(private readonly client: PrismaClient = prisma) {}

  async enqueue(event: OutboxEventInput) {
    const outboxEvent = (this.client as unknown as { outboxEvent: any })
      .outboxEvent;
    return outboxEvent.create({
      data: {
        eventType: event.eventType,
        payload: event.payload,
        headers: event.headers ?? undefined,
        availableAt: event.availableAt ?? undefined,
      },
    });
  }

  async enqueueTx(tx: TransactionClient, event: OutboxEventInput) {
    const outboxEvent = (tx as unknown as { outboxEvent: any }).outboxEvent;
    return outboxEvent.create({
      data: {
        eventType: event.eventType,
        payload: event.payload,
        headers: event.headers ?? undefined,
        availableAt: event.availableAt ?? undefined,
      },
    });
  }
}
