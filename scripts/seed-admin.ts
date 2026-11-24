import { Pool } from "pg";
import bcrypt from "bcryptjs";

async function seedAdmin() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }

  console.log("🌱 Starting admin user seed...");

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  try {
    // Check if admin already exists
    const existingAdmin = await pool.query(
      `SELECT id FROM users WHERE username = $1`,
      ["admin"]
    );

    if (existingAdmin.rows.length > 0) {
      console.log("⚠️  Admin user already exists. Skipping...");
      return;
    }

    // Create admin user
    const passwordHash = await bcrypt.hash("admin123", 10);
    const generateId = () => {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 15);
      return `user_${timestamp}${randomStr}`;
    };

    await pool.query(
      `INSERT INTO users 
        (id, username, name, role, "passwordHash", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [generateId(), "admin", "Administrator", "ADMIN", passwordHash]
    );

    console.log("✅ Admin user created successfully!");
    console.log("   Username: admin");
    console.log("   Password: admin123");
    console.log("   ⚠️  Please change the password after first login!");
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

seedAdmin()
  .then(() => {
    console.log("✅ Seed completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  });
