import { Inject, Injectable } from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import { RmqRecordBuilder } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

import { RABBITMQ_CLIENT } from './rabbitmq.tokens';
import type { PublishHeaders } from './rabbitmq.types';
import { normalizeHeaders, withEventHeaders } from './rabbitmq.utils';

@Injectable()
export class RabbitMqPublisher {
  constructor(@Inject(RABBITMQ_CLIENT) private readonly client: ClientProxy) {}

  async publish<T>(routingKey: string, payload: T, headers?: PublishHeaders) {
    const enrichedHeaders = withEventHeaders(headers);
    const record = new RmqRecordBuilder(payload)
      .setOptions({
        headers: normalizeHeaders(enrichedHeaders),
        persistent: true,
        contentType: 'application/json',
      })
      .build();

    return lastValueFrom(this.client.emit(routingKey, record));
  }
}
