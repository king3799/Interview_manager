import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { existsSync } from "fs";

// Load environment files
if (existsSync(".env.development.local")) {
  config({ path: ".env.development.local", override: true });
} else if (existsSync(".env.local")) {
  config({ path: ".env.local", override: true });
} else {
  config({ path: ".env" });
}

async function setupNeonDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }

  console.log("🔗 Connecting to Neon database...");
  console.log(`📍 ${databaseUrl.split('@')[1]?.split('/')[0] || 'database'}`);

  const pool = new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 1,
  });

  try {
    // Create enums
    console.log("\n📋 Creating enum types...");
    
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE "Role" AS ENUM ('ADMIN', 'BIDDER', 'VIEWER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE "ProgressStatus" AS ENUM ('SCHEDULED', 'PHONE_CALL', 'TEST', 'INITIAL', 'TECHNICAL', 'CEO_CTO', 'REJECTED', 'NOT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    console.log("✅ Enum types created");

    // Create users table
    console.log("\n👥 Creating users table...");
    await pool.query(`
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
    `);
    console.log("✅ Users table created");

    // Create interviews table
    console.log("\n📅 Creating interviews table...");
    await pool.query(`
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
    `);
    console.log("✅ Interviews table created");

    // Create indexes
    console.log("\n🔍 Creating indexes...");
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS "interviews_interviewTime_idx" ON "interviews"("interviewTime");
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS "interviews_createdBy_idx" ON "interviews"("createdBy");
      `);
      console.log("✅ Indexes created");
    } catch (indexError: any) {
      console.log("⚠️  Index creation skipped (might already exist)");
    }

    // Check if admin already exists
    const existingAdmin = await pool.query(
      `SELECT id FROM users WHERE username = $1`,
      ["admin"]
    );

    if (existingAdmin.rows.length > 0) {
      console.log("\n⚠️  Admin user already exists. Skipping...");
    } else {
      // Create admin user
      console.log("\n👤 Creating admin user...");
      const passwordHash = await bcrypt.hash("admin123", 10);
      
      await pool.query(
        `INSERT INTO users 
          (id, username, name, role, "passwordHash", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        ["user_admin_initial", "admin", "Administrator", "ADMIN", passwordHash]
      );

      console.log("✅ Admin user created successfully!");
      console.log("\n📝 Login credentials:");
      console.log("   Username: admin");
      console.log("   Password: admin123");
      console.log("   ⚠️  CHANGE PASSWORD AFTER FIRST LOGIN!");
    }

    console.log("\n✨ Database setup complete!");
    
  } catch (error: any) {
    console.error("\n❌ Error setting up database:");
    console.error(error.message);
    if (error.detail) console.error("Detail:", error.detail);
    throw error;
  } finally {
    await pool.end();
  }
}

setupNeonDatabase()
  .then(() => {
    console.log("\n🚀 Ready to deploy!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Setup failed:", error.message);
    process.exit(1);
  });
