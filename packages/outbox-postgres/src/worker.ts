import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { OutboxProcessor } from './outbox.processor';
import { OutboxWorkerModule } from './worker.module';

const logger = new Logger('OutboxWorker');

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(OutboxWorkerModule, {
    logger: ['log', 'error', 'warn'],
  });

  const processor = app.get(OutboxProcessor);
  const intervalMs = Number(process.env.OUTBOX_POLL_INTERVAL ?? 5000);
  const batchSize = Number(process.env.OUTBOX_BATCH_SIZE ?? 20);

  logger.log(`Outbox worker started (interval=${intervalMs}ms, batch=${batchSize})`);

  while (true) {
    try {
      const result = await processor.processBatch(batchSize);
      if (result.processed > 0) {
        logger.log(
          `Outbox processed=${result.processed} published=${result.published} failed=${result.failed}`,
        );
      }
    } catch (error) {
      logger.error('Outbox worker error', error as Error);
    }

    await sleep(intervalMs);
  }
}

bootstrap();
