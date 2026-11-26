import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.development.local") });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

async function addResumeColumns() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  try {
    console.log("Adding resume columns to interviews table...");

    await pool.query(`
      ALTER TABLE interviews 
      ADD COLUMN IF NOT EXISTS resume_url TEXT,
      ADD COLUMN IF NOT EXISTS resume_filename TEXT,
      ADD COLUMN IF NOT EXISTS resume_size INTEGER;
    `);

    console.log("✅ Resume columns added successfully!");
    console.log("   - resume_url: TEXT (URL to Vercel Blob)");
    console.log("   - resume_filename: TEXT (Original filename)");
    console.log("   - resume_size: INTEGER (File size in bytes)");
  } catch (error) {
    console.error("❌ Error adding resume columns:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

addResumeColumns()
  .then(() => {
    console.log("\n🎉 Migration completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Migration failed:", error);
    process.exit(1);
  });
