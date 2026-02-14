-- Create required extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTable
CREATE TABLE "UserProfile" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "externalId" TEXT NOT NULL,
  "email" TEXT,
  "name" TEXT,
  "roles" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_externalId_key" ON "UserProfile"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");

-- CreateTable
CREATE TABLE "DashboardLayout" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT true,
  "version" INTEGER NOT NULL DEFAULT 1,
  "layout" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "DashboardLayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DashboardLayout_userId_idx" ON "DashboardLayout"("userId");

-- CreateTable
CREATE TABLE "WidgetConfig" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "dashboardLayoutId" UUID,
  "widgetId" TEXT NOT NULL,
  "instanceId" TEXT NOT NULL,
  "title" TEXT,
  "size" TEXT,
  "options" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WidgetConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WidgetConfig_userId_idx" ON "WidgetConfig"("userId");

-- CreateIndex
CREATE INDEX "WidgetConfig_dashboardLayoutId_idx" ON "WidgetConfig"("dashboardLayoutId");

-- CreateIndex
CREATE UNIQUE INDEX "WidgetConfig_userId_instanceId_key" ON "WidgetConfig"("userId", "instanceId");

-- AddForeignKey
ALTER TABLE "DashboardLayout" ADD CONSTRAINT "DashboardLayout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WidgetConfig" ADD CONSTRAINT "WidgetConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WidgetConfig" ADD CONSTRAINT "WidgetConfig_dashboardLayoutId_fkey" FOREIGN KEY ("dashboardLayoutId") REFERENCES "DashboardLayout"("id") ON DELETE SET NULL ON UPDATE CASCADE;
