import { NestFactory } from '@nestjs/core';
import { Transport, type RmqOptions } from '@nestjs/microservices';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const rabbitmqUrl =
    process.env.RABBITMQ_URL ??
    'amqp://freeflow:freeflow_dev_password@localhost:5672/%2Ffreeflow';
  const rabbitmqQueue = process.env.RABBITMQ_QUEUE ?? 'freeflow.alarms.queue';
  const rabbitmqExchange = process.env.RABBITMQ_EXCHANGE ?? 'freeflow.events';
  const rabbitmqPrefetch = Number(process.env.RABBITMQ_PREFETCH ?? 5);
  const rabbitmqDlx = process.env.RABBITMQ_DLX ?? 'freeflow.events.dlx';
  const rabbitmqDlxRouting = process.env.RABBITMQ_DLX_ROUTING_KEY ?? 'dlq';

  const rmqOptions = {
    urls: [rabbitmqUrl],
    queue: rabbitmqQueue,
    queueOptions: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': rabbitmqDlx,
        'x-dead-letter-routing-key': rabbitmqDlxRouting,
      },
    },
    exchange: rabbitmqExchange,
    prefetchCount: rabbitmqPrefetch,
    noAck: false,
  } as RmqOptions['options'] & { exchange?: string };

  app.connectMicroservice<RmqOptions>({
    transport: Transport.RMQ,
    options: rmqOptions,
  });

  await app.startAllMicroservices();

  const port = process.env.PORT || 4102;
  const host = process.env.HOST || '127.0.0.1';
  await app.listen(port, host);

  console.log(`🚀 Alarm service running on http://${host}:${port}`);
}

bootstrap();
