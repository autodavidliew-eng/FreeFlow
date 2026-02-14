import { prisma, type PrismaClient } from '@freeflow/db-postgres';
import { Injectable } from '@nestjs/common';

import type {
  OutboxEventInput,
  PrismaClientWithOutbox,
  TransactionClient,
  TransactionClientWithOutbox,
} from './outbox.types';

@Injectable()
export class OutboxService {
  constructor(private readonly client: PrismaClient = prisma) {}

  async enqueue(event: OutboxEventInput) {
    const outboxEvent = (this.client as PrismaClientWithOutbox).outboxEvent;
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
    const outboxEvent = (tx as TransactionClientWithOutbox).outboxEvent;
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
