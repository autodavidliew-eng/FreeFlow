import { Module } from '@nestjs/common';
import { IdempotencyModule } from '@freeflow/messaging-idempotency';
import { RabbitMqModule } from '@freeflow/messaging-rabbitmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlarmEventsConsumer } from './consumers/alarm-events.consumer';

@Module({
  imports: [
    IdempotencyModule,
    RabbitMqModule.register({
      urls: [
        process.env.RABBITMQ_URL ??
          'amqp://freeflow:freeflow_dev_password@localhost:5672/freeflow',
      ],
      queue: process.env.RABBITMQ_QUEUE ?? 'freeflow.alarms.queue',
      exchange: process.env.RABBITMQ_EXCHANGE ?? 'freeflow.events',
      prefetchCount: Number(process.env.RABBITMQ_PREFETCH ?? 5),
    }),
  ],
  controllers: [AppController, AlarmEventsConsumer],
  providers: [AppService],
})
export class AppModule {}
