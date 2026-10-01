-- CreateEnum
CREATE TYPE "UsageEventType" AS ENUM ('ACTIVITY_CREATED', 'GENERATION_SUCCESS', 'GENERATION_FAILED', 'PAGE_VIEW');

-- CreateTable
CREATE TABLE "UsageEvent" (
    "id" SERIAL NOT NULL,
    "eventType" "UsageEventType" NOT NULL,
    "activityType" "ActivityType",
    "page" TEXT,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageEvent_pkey" PRIMARY KEY ("id")
);
