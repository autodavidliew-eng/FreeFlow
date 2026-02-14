import type { Prisma } from '@prisma/client';

export type TransactionClient = Prisma.TransactionClient;

export type OutboxEventInput = {
  eventType: string;
  payload: Record<string, unknown>;
  headers?: Record<string, unknown>;
  availableAt?: Date;
};

export type OutboxProcessResult = {
  processed: number;
  published: number;
  failed: number;
};
