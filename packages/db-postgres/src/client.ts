import { PrismaClient } from '@prisma/client';

type PrismaGlobal = typeof globalThis & {
  prisma?: PrismaClient;
};

const globalForPrisma = globalThis as PrismaGlobal;

export type PrismaLogLevel = 'error' | 'warn' | 'info' | 'query';

export type PrismaClientFactoryOptions = {
  url?: string;
  log?: PrismaLogLevel[];
};

export function createPrismaClient(options?: PrismaClientFactoryOptions) {
  const log = options?.log ?? ['error', 'warn'];

  return new PrismaClient({
    log,
    ...(options?.url
      ? {
          datasources: {
            db: {
              url: options.url,
            },
          },
        }
      : {}),
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export { PrismaClient } from '@prisma/client';
