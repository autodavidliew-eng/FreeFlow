import { PrismaClient, TenantService, TenantStatus } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(value: string) {
  return value.trim().toLowerCase();
}

function buildNames(tenantKey: string) {
  const prefix = `freeflow_${tenantKey}`;
  return {
    realmName: `freeflow-${tenantKey}`,
    postgresDb: prefix,
    mongoDb: prefix,
    qdrantCollection: `${prefix}_vectors`,
  };
}

async function seedTenant() {
  const tenantKey = slugify(process.env.SEED_TENANT_NAME ?? 'demo');
  const names = buildNames(tenantKey);

  const tenant = await prisma.tenant.upsert({
    where: { name: tenantKey },
    update: {
      ...names,
      status: TenantStatus.active,
    },
    create: {
      name: tenantKey,
      ...names,
      status: TenantStatus.active,
    },
  });

  const connections = [
    {
      service: TenantService.postgres,
      dbName: names.postgresDb,
      host: process.env.SEED_POSTGRES_HOST ?? 'localhost',
      port: Number(process.env.SEED_POSTGRES_PORT ?? '5432'),
      username: process.env.SEED_POSTGRES_USER ?? 'freeflow',
    },
    {
      service: TenantService.mongodb,
      dbName: names.mongoDb,
      host: process.env.SEED_MONGO_HOST ?? 'localhost',
      port: Number(process.env.SEED_MONGO_PORT ?? '27017'),
    },
    {
      service: TenantService.qdrant,
      dbName: names.qdrantCollection,
      host: process.env.SEED_QDRANT_HOST ?? 'localhost',
      port: Number(process.env.SEED_QDRANT_PORT ?? '6333'),
    },
  ];

  for (const connection of connections) {
    await prisma.tenantConnection.upsert({
      where: {
        tenantId_service: {
          tenantId: tenant.id,
          service: connection.service,
        },
      },
      update: {
        dbName: connection.dbName,
        host: connection.host,
        port: connection.port,
        username: connection.username,
      },
      create: {
        tenantId: tenant.id,
        service: connection.service,
        dbName: connection.dbName,
        host: connection.host,
        port: connection.port,
        username: connection.username,
      },
    });
  }
}

async function main() {
  await seedTenant();
}

main()
  .catch((error) => {
    console.error('Master seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
