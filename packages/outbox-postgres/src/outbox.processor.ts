import { prisma, type PrismaClient } from '@freeflow/db-postgres';
import type { RabbitMqPublisher } from '@freeflow/messaging-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';

import type { OutboxProcessResult } from './outbox.types';

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);

  constructor(
    private readonly publisher: RabbitMqPublisher,
    private readonly client: PrismaClient = prisma
  ) {}

  async processBatch(batchSize = 20): Promise<OutboxProcessResult> {
    const now = new Date();
    const outboxEvent = (this.client as unknown as { outboxEvent: any })
      .outboxEvent;
    const events = await outboxEvent.findMany({
      where: {
        status: 'PENDING',
        availableAt: { lte: now },
      },
      orderBy: { createdAt: 'asc' },
      take: batchSize,
    });

    let processed = 0;
    let published = 0;
    let failed = 0;

    for (const event of events) {
      const claim = await outboxEvent.updateMany({
        where: { id: event.id, status: 'PENDING' },
        data: { status: 'PROCESSING' },
      });

      if (claim.count === 0) {
        continue;
      }

      processed += 1;

      try {
        await this.publisher.publish(event.eventType, event.payload as any, {
          ...(event.headers as Record<string, any> | null),
          eventId: event.id,
        });

        await outboxEvent.update({
          where: { id: event.id },
          data: {
            status: 'PUBLISHED',
            processedAt: new Date(),
          },
        });

        published += 1;
      } catch (error) {
        failed += 1;
        const attempts = event.attempts + 1;
        const maxAttempts = Number(process.env.OUTBOX_MAX_ATTEMPTS ?? 5);
        const retryDelayMs = Number(process.env.OUTBOX_RETRY_DELAY_MS ?? 30000);

        if (attempts >= maxAttempts) {
          await outboxEvent.update({
            where: { id: event.id },
            data: {
              status: 'FAILED',
              attempts,
              lastError: (error as Error).message,
            },
          });
        } else {
          await outboxEvent.update({
            where: { id: event.id },
            data: {
              status: 'PENDING',
              attempts,
              availableAt: new Date(Date.now() + retryDelayMs),
              lastError: (error as Error).message,
            },
          });
        }

        this.logger.error(
          `Failed to publish outbox event ${event.id}`,
          error as Error
        );
      }
    }

    return { processed, published, failed };
  }
}
