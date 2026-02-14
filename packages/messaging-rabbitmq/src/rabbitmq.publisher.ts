import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { RABBITMQ_CLIENT } from './rabbitmq.tokens';
import type { PublishHeaders } from './rabbitmq.types';
import { withEventHeaders } from './rabbitmq.utils';

@Injectable()
export class RabbitMqPublisher {
  constructor(@Inject(RABBITMQ_CLIENT) private readonly client: ClientProxy) {}

  async publish<T>(routingKey: string, payload: T, headers?: PublishHeaders) {
    const enrichedHeaders = withEventHeaders(headers);
    const record = new RmqRecordBuilder(payload)
      .setOptions({
        headers: enrichedHeaders,
        persistent: true,
        contentType: 'application/json',
      })
      .build();

    return lastValueFrom(this.client.emit(routingKey, record));
  }
}
