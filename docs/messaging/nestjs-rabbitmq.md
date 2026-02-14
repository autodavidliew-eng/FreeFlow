# NestJS RabbitMQ Integration

This doc describes the shared RabbitMQ module and a consumer example in the alarm service.

## Shared Publisher Module

The shared package lives at `packages/messaging-rabbitmq` and provides:

- `RabbitMqModule` for client registration
- `RabbitMqPublisher` for emitting events with standard headers
- `ackMessage` / `nackMessage` helpers

### Usage

```ts
import { Module } from '@nestjs/common';
import { RabbitMqModule } from '@freeflow/messaging-rabbitmq';

@Module({
  imports: [
    RabbitMqModule.register({
      urls: ['amqp://freeflow:freeflow_dev_password@localhost:5672/freeflow'],
      queue: 'freeflow.alarms.queue',
      exchange: 'freeflow.events',
      prefetchCount: 5,
    }),
  ],
})
export class AppModule {}
```

## Alarm Service Consumer Example

`alarm-service` consumes `alarm.raised` events and publishes `alarm.acknowledged`.
It uses a no-hot-loop strategy:

- On failure, publish to `freeflow.events.retry` using a delay key
- After max retries, reject with `requeue=false` to send to DLQ
- Idempotency check prevents duplicate processing per consumer

```ts
@EventPattern('alarm.raised')
async handleAlarmRaised(@Payload() payload: any, @Ctx() context: RmqContext) {
  try {
    await this.publisher.publish('alarm.acknowledged', {...});
    ackMessage(context);
  } catch (error) {
    // publish to retry exchange, then ack original
    // or send to DLQ with nack(false)
  }
}
```

## Required Headers

The publisher injects (or preserves) these headers:

- `eventId`
- `correlationId`

Consumers should preserve these when re-publishing.

## Environment Variables

The alarm service supports:

- `RABBITMQ_URL`
- `RABBITMQ_QUEUE`
- `RABBITMQ_EXCHANGE`
- `RABBITMQ_PREFETCH`

Defaults are set for local docker-compose.

## Retry Strategy

See `docs/messaging/retry-dlx.md` for the TTL-based retry flow.
