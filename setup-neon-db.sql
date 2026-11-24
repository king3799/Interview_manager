-- Setup database for Interview Manager
-- Run this SQL in Neon Console SQL Editor

-- Create Role enum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'BIDDER', 'VIEWER');

-- Create ProgressStatus enum
CREATE TYPE "ProgressStatus" AS ENUM ('SCHEDULED', 'PHONE_CALL', 'TEST', 'INITIAL', 'TECHNICAL', 'CEO_CTO', 'REJECTED', 'NOT');

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "note" TEXT,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create interviews table
CREATE TABLE IF NOT EXISTS "interviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "replyDate" DATE NOT NULL,
    "interviewTime" TIMESTAMPTZ NOT NULL,
    "country" TEXT NOT NULL,
    "suggestedRole" TEXT NOT NULL,
    "profileName" TEXT,
    "intervieweeName" TEXT,
    "mailUrl" TEXT,
    "jobUrl" TEXT,
    "meetingUrl" TEXT,
    "progress" "ProgressStatus" NOT NULL DEFAULT 'NOT',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "interviews_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "interviews_interviewTime_idx" ON "interviews"("interviewTime");
CREATE INDEX IF NOT EXISTS "interviews_createdBy_idx" ON "interviews"("createdBy");

-- Insert admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO "users" ("id", "username", "name", "role", "passwordHash", "createdAt", "updatedAt")
VALUES (
    'user_admin_initial',
    'admin',
    'Administrator',
    'ADMIN',
    '$2a$10$YourPasswordHashWillBeGeneratedByScript',
    NOW(),
    NOW()
)
ON CONFLICT ("username") DO NOTHING;

-- Done!
SELECT 'Database setup complete!' as message;
