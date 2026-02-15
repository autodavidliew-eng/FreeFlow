import { prisma } from '@freeflow/db-master';

export type TenantRecord = {
  id: string;
  name: string;
  realmName: string;
  postgresDb: string;
  mongoDb: string;
  qdrantCollection: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TenantConnectionRecord = {
  id: string;
  tenantId: string;
  service: string;
  dbName: string;
  host: string | null;
  port: number | null;
  username: string | null;
  secretRef: string | null;
  options: unknown | null;
  createdAt: Date;
  updatedAt: Date;
};

export const findTenantByName = async (
  name: string
): Promise<TenantRecord | null> => {
  const rows = await prisma.$queryRaw<TenantRecord[]>`
    SELECT
      "id",
      "name",
      "realmName",
      "postgresDb",
      "mongoDb",
      "qdrantCollection",
      "status",
      "createdAt",
      "updatedAt"
    FROM "Tenant"
    WHERE "name" = ${name}
    LIMIT 1;
  `;

  return rows[0] ?? null;
};

export const findTenantById = async (
  id: string
): Promise<TenantRecord | null> => {
  const rows = await prisma.$queryRaw<TenantRecord[]>`
    SELECT
      "id",
      "name",
      "realmName",
      "postgresDb",
      "mongoDb",
      "qdrantCollection",
      "status",
      "createdAt",
      "updatedAt"
    FROM "Tenant"
    WHERE "id" = CAST(${id} AS uuid)
    LIMIT 1;
  `;

  return rows[0] ?? null;
};

export const listTenantsByNamePrefix = async (
  prefix: string
): Promise<TenantRecord[]> => {
  const like = `${prefix}%`;

  return prisma.$queryRaw<TenantRecord[]>`
    SELECT
      "id",
      "name",
      "realmName",
      "postgresDb",
      "mongoDb",
      "qdrantCollection",
      "status",
      "createdAt",
      "updatedAt"
    FROM "Tenant"
    WHERE "name" LIKE ${like}
    ORDER BY "createdAt" DESC;
  `;
};

export const createTenant = async (data: {
  name: string;
  realmName: string;
  postgresDb: string;
  mongoDb: string;
  qdrantCollection: string;
}): Promise<TenantRecord> => {
  const rows = await prisma.$queryRaw<TenantRecord[]>`
    INSERT INTO "Tenant" (
      "name",
      "realmName",
      "postgresDb",
      "mongoDb",
      "qdrantCollection",
      "updatedAt"
    )
    VALUES (
      ${data.name},
      ${data.realmName},
      ${data.postgresDb},
      ${data.mongoDb},
      ${data.qdrantCollection},
      NOW()
    )
    ON CONFLICT ("name") DO UPDATE SET
      "realmName" = EXCLUDED."realmName",
      "postgresDb" = EXCLUDED."postgresDb",
      "mongoDb" = EXCLUDED."mongoDb",
      "qdrantCollection" = EXCLUDED."qdrantCollection",
      "updatedAt" = NOW()
    RETURNING
      "id",
      "name",
      "realmName",
      "postgresDb",
      "mongoDb",
      "qdrantCollection",
      "status",
      "createdAt",
      "updatedAt";
  `;

  return rows[0];
};

export const updateTenantStatus = async (
  tenantId: string,
  status: string
): Promise<void> => {
  await prisma.$executeRaw`
    UPDATE "Tenant"
    SET "status" = CAST(${status} AS "TenantStatus"), "updatedAt" = NOW()
    WHERE "id" = CAST(${tenantId} AS uuid);
  `;
};

export const deleteTenantById = async (
  tenantId: string
): Promise<TenantRecord | null> => {
  const rows = await prisma.$queryRaw<TenantRecord[]>`
    DELETE FROM "Tenant"
    WHERE "id" = CAST(${tenantId} AS uuid)
    RETURNING
      "id",
      "name",
      "realmName",
      "postgresDb",
      "mongoDb",
      "qdrantCollection",
      "status",
      "createdAt",
      "updatedAt";
  `;

  return rows[0] ?? null;
};

export const insertProvisionLog = async (input: {
  tenantId: string;
  step: string;
  status: string;
  message?: string;
}): Promise<void> => {
  await prisma.$transaction([
    prisma.$executeRaw`
      INSERT INTO "TenantProvisionLog" (
        "tenantId",
        "step",
        "status",
        "message"
      )
      VALUES (
        CAST(${input.tenantId} AS uuid),
        ${input.step},
        ${input.status},
        ${input.message ?? null}
      );
    `,
  ]);
};

export const upsertTenantConnection = async (input: {
  tenantId: string;
  service: string;
  dbName: string;
  host?: string | null;
  port?: number | null;
  username?: string | null;
  secretRef?: string | null;
  options?: unknown | null;
}): Promise<void> => {
  await prisma.$executeRaw`
    INSERT INTO "TenantConnection" (
      "tenantId",
      "service",
      "dbName",
      "host",
      "port",
      "username",
      "secretRef",
      "options",
      "updatedAt"
    )
    VALUES (
      CAST(${input.tenantId} AS uuid),
      CAST(${input.service} AS "TenantService"),
      ${input.dbName},
      ${input.host ?? null},
      ${input.port ?? null},
      ${input.username ?? null},
      ${input.secretRef ?? null},
      ${input.options ?? null},
      NOW()
    )
    ON CONFLICT ("tenantId", "service") DO UPDATE SET
      "dbName" = EXCLUDED."dbName",
      "host" = EXCLUDED."host",
      "port" = EXCLUDED."port",
      "username" = EXCLUDED."username",
      "secretRef" = EXCLUDED."secretRef",
      "options" = EXCLUDED."options",
      "updatedAt" = NOW();
  `;
};
