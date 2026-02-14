-- CreateTable
CREATE TABLE "ProcessedEvent" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "eventId" TEXT NOT NULL,
  "consumer" TEXT NOT NULL,
  "payloadHash" TEXT,
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProcessedEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedEvent_eventId_consumer_key" ON "ProcessedEvent"("eventId", "consumer");

-- CreateIndex
CREATE INDEX "ProcessedEvent_consumer_idx" ON "ProcessedEvent"("consumer");
