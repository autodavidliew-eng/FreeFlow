import { NestFactory } from '@nestjs/core';
import { Transport, type RmqOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const rabbitmqUrl =
    process.env.RABBITMQ_URL ??
    'amqp://freeflow:freeflow_dev_password@localhost:5672/freeflow';
  const rabbitmqQueue =
    process.env.RABBITMQ_QUEUE ?? 'freeflow.alarms.queue';
  const rabbitmqExchange =
    process.env.RABBITMQ_EXCHANGE ?? 'freeflow.events';
  const rabbitmqPrefetch = Number(process.env.RABBITMQ_PREFETCH ?? 5);

  app.connectMicroservice<RmqOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: rabbitmqQueue,
      queueOptions: { durable: true },
      exchange: rabbitmqExchange,
      prefetchCount: rabbitmqPrefetch,
      noAck: false,
    },
  });

  await app.startAllMicroservices();

  const port = process.env.PORT || 4102;
  const host = process.env.HOST || '127.0.0.1';
  await app.listen(port, host);

  console.log(`🚀 Alarm service running on http://${host}:${port}`);
}

bootstrap();
