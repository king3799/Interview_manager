import { Pool } from "pg";
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

async function addNoteColumn() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }

  console.log("🔗 Connecting to database...");

  const pool = new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 1,
  });

  try {
    console.log("\n📝 Adding note column to interviews table...");
    
    await pool.query(`
      ALTER TABLE interviews 
      ADD COLUMN IF NOT EXISTS note TEXT;
    `);
    
    console.log("✅ Note column added successfully!");
    console.log("\n✨ Database migration complete!");
    
  } catch (error: any) {
    console.error("\n❌ Error adding column:");
    console.error(error.message);
    if (error.detail) console.error("Detail:", error.detail);
    throw error;
  } finally {
    await pool.end();
  }
}

addNoteColumn()
  .then(() => {
    console.log("\n🚀 Ready to use!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Migration failed:", error.message);
    process.exit(1);
  });
