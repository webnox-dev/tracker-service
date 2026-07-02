-- CreateEnum
CREATE TYPE "TrackingEventType" AS ENUM ('PAGE_VIEW', 'CLICK', 'FORM_SUBMIT', 'DOWNLOAD', 'VIDEO_PLAY', 'CUSTOM');

-- CreateTable
CREATE TABLE "tracking_events" (
    "id" UUID NOT NULL,
    "anonymousId" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "accountId" VARCHAR(100) NOT NULL,
    "eventType" "TrackingEventType" NOT NULL,
    "url" TEXT NOT NULL,
    "path" VARCHAR(2048) NOT NULL,
    "title" VARCHAR(255),
    "referrer" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "timeOnPage" INTEGER,
    "scrollPercentage" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tracking_events_accountId_idx" ON "tracking_events"("accountId");

-- CreateIndex
CREATE INDEX "tracking_events_sessionId_idx" ON "tracking_events"("sessionId");

-- CreateIndex
CREATE INDEX "tracking_events_timestamp_idx" ON "tracking_events"("timestamp");
