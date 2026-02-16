-- CreateTable
CREATE TABLE "SmartMeterMeasurement" (
  "id" TEXT NOT NULL,
  "tenant" TEXT NOT NULL,
  "meterId" TEXT NOT NULL,
  "ts" TIMESTAMP(3) NOT NULL,
  "powerW" DOUBLE PRECISION NOT NULL,
  "energyKWh" DOUBLE PRECISION NOT NULL,
  "rawJson" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SmartMeterMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SmartMeterMeasurement_tenant_meterId_ts_key" ON "SmartMeterMeasurement"("tenant", "meterId", "ts");

-- CreateIndex
CREATE INDEX "SmartMeterMeasurement_tenant_meterId_ts_idx" ON "SmartMeterMeasurement"("tenant", "meterId", "ts");
