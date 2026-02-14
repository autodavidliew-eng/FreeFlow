import type { PrismaClient } from '@freeflow/db-postgres';
import type { Prisma } from '@prisma/client';

export type TransactionClient = Prisma.TransactionClient;

export type OutboxEventDelegate = {
  findMany: (...args: any[]) => Promise<any>;
  updateMany: (...args: any[]) => Promise<any>;
  update: (...args: any[]) => Promise<any>;
  create: (...args: any[]) => Promise<any>;
};

export type PrismaClientWithOutbox = PrismaClient & {
  outboxEvent: OutboxEventDelegate;
};

export type TransactionClientWithOutbox = TransactionClient & {
  outboxEvent: OutboxEventDelegate;
};

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
