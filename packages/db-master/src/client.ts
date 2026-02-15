import { PrismaClient } from '@prisma/client';

type PrismaGlobal = typeof globalThis & {
  masterPrisma?: PrismaClient;
};

const globalForPrisma = globalThis as PrismaGlobal;
const masterDatabaseUrl = process.env.MASTER_DATABASE_URL;

if (!masterDatabaseUrl) {
  throw new Error(
    'MASTER_DATABASE_URL is required for the master tenant database.'
  );
}

export const prisma =
  globalForPrisma.masterPrisma ??
  new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: masterDatabaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.masterPrisma = prisma;
}

export type { PrismaClient } from '@prisma/client';
