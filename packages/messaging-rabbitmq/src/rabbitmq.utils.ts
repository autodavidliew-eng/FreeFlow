import { randomUUID } from 'node:crypto';

import type { RmqContext } from '@nestjs/microservices';

import type { PublishHeaders, RmqHeaders } from './rabbitmq.types';

export const ensureHeader = (
  headers: PublishHeaders | undefined,
  key: string,
  value: string
) => {
  if (!headers) {
    return { [key]: value } as PublishHeaders;
  }
  if (!headers[key]) {
    return { ...headers, [key]: value } as PublishHeaders;
  }
  return headers;
};

export const withEventHeaders = (headers?: PublishHeaders): PublishHeaders => {
  let next = ensureHeader(headers, 'eventId', randomUUID());
  next = ensureHeader(next, 'correlationId', randomUUID());
  return next;
};

export const normalizeHeaders = (headers?: PublishHeaders): RmqHeaders => {
  if (!headers) {
    return {};
  }
  const normalized: RmqHeaders = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) {
      continue;
    }
    normalized[key] = String(value);
  }
  return normalized;
};

export const ackMessage = (context: RmqContext) => {
  const channel = context.getChannelRef();
  const originalMsg = context.getMessage();
  channel.ack(originalMsg);
};

export const nackMessage = (context: RmqContext, requeue = false) => {
  const channel = context.getChannelRef();
  const originalMsg = context.getMessage();
  channel.nack(originalMsg, false, requeue);
};

export const getHeaders = (context: RmqContext): Record<string, any> => {
  const originalMsg = context.getMessage();
  return (originalMsg?.properties?.headers ?? {}) as Record<string, any>;
};
