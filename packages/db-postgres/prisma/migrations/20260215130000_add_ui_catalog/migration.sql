-- CreateTable
CREATE TABLE "WidgetCatalog" (
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "defaultConfig" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WidgetCatalog_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "WidgetCatalog_type_idx" ON "WidgetCatalog"("type");

-- CreateTable
CREATE TABLE "RoleDashboardLayout" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "role" TEXT NOT NULL,
  "name" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "layout" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RoleDashboardLayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoleDashboardLayout_role_key" ON "RoleDashboardLayout"("role");
