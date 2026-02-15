-- CreateTable
CREATE TABLE "AppCatalog" (
  "appKey" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "icon" TEXT,
  "launchUrl" TEXT NOT NULL,
  "integrationMode" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AppCatalog_pkey" PRIMARY KEY ("appKey")
);

-- CreateIndex
CREATE INDEX "AppCatalog_enabled_idx" ON "AppCatalog"("enabled");
