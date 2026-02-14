import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import {
  RabbitMqPublisher,
  ackMessage,
  getHeaders,
  nackMessage,
  withEventHeaders,
} from '@freeflow/messaging-rabbitmq';
import { IdempotencyService } from '@freeflow/messaging-idempotency';

const RETRY_DELAYS = ['30s', '5m', '30m'] as const;

@Controller()
export class AlarmEventsConsumer {
  private readonly logger = new Logger(AlarmEventsConsumer.name);

  constructor(
    private readonly publisher: RabbitMqPublisher,
    private readonly idempotency: IdempotencyService,
  ) {}

  @EventPattern('alarm.raised')
  async handleAlarmRaised(@Payload() payload: any, @Ctx() context: RmqContext) {
    const headers = getHeaders(context);
    const eventId = headers.eventId as string | undefined;
    const consumer = 'alarm-service';

    if (!eventId) {
      this.logger.error('Missing eventId header; sending to DLQ');
      nackMessage(context, false);
      return;
    }

    const registered = await this.idempotency.register({
      eventId,
      consumer,
    });

    if (!registered) {
      ackMessage(context);
      return;
    }

    try {
      this.logger.log(
        `Received alarm.raised (eventId=${eventId})`,
      );

      await this.publisher.publish(
        'alarm.acknowledged',
        {
          alarmId: payload.alarmId ?? 'unknown',
          acknowledgedBy: 'system',
          acknowledgedAt: new Date().toISOString(),
          note: 'Auto-acknowledged by alarm-service',
        },
        {
          correlationId: headers.correlationId as string | undefined,
        },
      );

      ackMessage(context);
    } catch (error) {
      await this.idempotency.release({ eventId, consumer });
      const retryCount = Number(headers['x-retry-count'] ?? 0);

      if (retryCount < RETRY_DELAYS.length) {
        const delay = RETRY_DELAYS[retryCount];
        const channel = context.getChannelRef();
        const message = context.getMessage() as any;

        const retryHeaders = {
          ...withEventHeaders(headers),
          'x-retry-count': retryCount + 1,
          'x-original-routing-key': message.fields?.routingKey,
          'x-original-exchange': message.fields?.exchange,
        };

        channel.publish(
          'freeflow.events.retry',
          `alarm.${delay}`,
          Buffer.from(JSON.stringify(payload)),
          {
            contentType: 'application/json',
            persistent: true,
            headers: retryHeaders,
          },
        );

        ackMessage(context);
        return;
      }

      this.logger.error(
        'Exceeded retry attempts; sending message to DLQ',
        error as Error,
      );
      nackMessage(context, false);
    }
  }
}
