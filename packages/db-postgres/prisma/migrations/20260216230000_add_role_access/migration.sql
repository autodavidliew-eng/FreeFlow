-- CreateTable
CREATE TABLE "RoleWidgetAccess" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "widgetKey" TEXT NOT NULL,
    "actions" TEXT[] NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleWidgetAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleAppAccess" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "appKey" TEXT NOT NULL,
    "actions" TEXT[] NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleAppAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoleWidgetAccess_role_widgetKey_key" ON "RoleWidgetAccess"("role", "widgetKey");

-- CreateIndex
CREATE INDEX "RoleWidgetAccess_role_idx" ON "RoleWidgetAccess"("role");

-- CreateIndex
CREATE UNIQUE INDEX "RoleAppAccess_role_appKey_key" ON "RoleAppAccess"("role", "appKey");

-- CreateIndex
CREATE INDEX "RoleAppAccess_role_idx" ON "RoleAppAccess"("role");
