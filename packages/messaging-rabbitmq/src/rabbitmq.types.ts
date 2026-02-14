import type { RmqOptions } from '@nestjs/microservices';

export type RabbitMqModuleOptions = {
  urls: string[];
  queue: string;
  exchange?: string;
  prefetchCount?: number;
  noAck?: boolean;
  queueOptions?: NonNullable<RmqOptions['options']>['queueOptions'];
  clientName?: string;
};

export type PublishHeaders = Record<
  string,
  string | number | boolean | undefined
>;
export type RmqHeaders = Record<string, string>;
