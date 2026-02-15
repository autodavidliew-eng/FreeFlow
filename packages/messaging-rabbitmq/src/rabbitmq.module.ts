import { Module } from '@nestjs/common';
import type { Provider, DynamicModule } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { RabbitMqPublisher } from './rabbitmq.publisher';
import { RABBITMQ_CLIENT } from './rabbitmq.tokens';
import type { RabbitMqModuleOptions } from './rabbitmq.types';

@Module({})
export class RabbitMqModule {
  static register(options: RabbitMqModuleOptions): DynamicModule {
    const clientName = options.clientName ?? RABBITMQ_CLIENT;
    const providers: Provider[] = [RabbitMqPublisher];

    if (clientName !== RABBITMQ_CLIENT) {
      providers.unshift({
        provide: RABBITMQ_CLIENT,
        useExisting: clientName,
      });
    }

    return {
      module: RabbitMqModule,
      imports: [
        ClientsModule.register([
          {
            name: clientName,
            transport: Transport.RMQ,
            options: {
              urls: options.urls,
              queue: options.queue,
              queueOptions: options.queueOptions ?? { durable: true },
              exchange: options.exchange,
              prefetchCount: options.prefetchCount ?? 1,
              noAck: options.noAck ?? false,
            },
          },
        ]),
      ],
      providers,
      exports: [RabbitMqPublisher, ClientsModule],
    };
  }
}
