import { Module } from '@nestjs/common';
import { RabbitMqModule } from '@freeflow/messaging-rabbitmq';
import { OutboxModule } from './outbox.module';

@Module({
  imports: [
    OutboxModule,
    RabbitMqModule.register({
      urls: [
        process.env.RABBITMQ_URL ??
          'amqp://freeflow:freeflow_dev_password@localhost:5672/freeflow',
      ],
      queue: process.env.RABBITMQ_QUEUE ?? 'freeflow.audit.queue',
      exchange: process.env.RABBITMQ_EXCHANGE ?? 'freeflow.events',
      prefetchCount: Number(process.env.RABBITMQ_PREFETCH ?? 10),
    }),
  ],
})
export class OutboxWorkerModule {}
