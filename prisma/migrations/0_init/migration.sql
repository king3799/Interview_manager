-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'BIDDER', 'VIEWER');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('PHONE_CALL', 'TEST', 'INITIAL', 'TECHNICAL', 'CEO_CTO', 'NOT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "note" TEXT,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interviews" (
    "id" TEXT NOT NULL,
    "replyDate" DATE NOT NULL,
    "interviewTime" TIMESTAMPTZ NOT NULL,
    "country" TEXT NOT NULL,
    "suggestedRole" TEXT NOT NULL,
    "mailUrl" TEXT,
    "jobUrl" TEXT,
    "meetingUrl" TEXT,
    "progress" "ProgressStatus" NOT NULL DEFAULT 'NOT',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "interviews_interviewTime_idx" ON "interviews"("interviewTime");

-- CreateIndex
CREATE INDEX "interviews_createdBy_idx" ON "interviews"("createdBy");

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
