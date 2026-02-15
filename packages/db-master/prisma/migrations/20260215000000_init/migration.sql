-- Create required extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('provisioning', 'active', 'suspended', 'deleting', 'deleted');

-- CreateEnum
CREATE TYPE "TenantService" AS ENUM ('postgres', 'mongodb', 'qdrant');

-- CreateTable
CREATE TABLE "Tenant" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "realmName" TEXT NOT NULL,
  "postgresDb" TEXT NOT NULL,
  "mongoDb" TEXT NOT NULL,
  "qdrantCollection" TEXT NOT NULL,
  "status" "TenantStatus" NOT NULL DEFAULT 'provisioning',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_name_key" ON "Tenant"("name");

-- CreateTable
CREATE TABLE "TenantProvisionLog" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "step" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "message" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "TenantProvisionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TenantProvisionLog_tenantId_idx" ON "TenantProvisionLog"("tenantId");

-- CreateTable
CREATE TABLE "TenantConnection" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "service" "TenantService" NOT NULL,
  "dbName" TEXT NOT NULL,
  "host" TEXT,
  "port" INTEGER,
  "username" TEXT,
  "secretRef" TEXT,
  "options" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TenantConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantConnection_tenantId_service_key" ON "TenantConnection"("tenantId", "service");

-- CreateIndex
CREATE INDEX "TenantConnection_dbName_idx" ON "TenantConnection"("dbName");

-- AddForeignKey
ALTER TABLE "TenantProvisionLog" ADD CONSTRAINT "TenantProvisionLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantConnection" ADD CONSTRAINT "TenantConnection_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
