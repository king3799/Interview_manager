import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Connecting to database...");
  
  // Test connection
  try {
    await prisma.$connect();
    console.log("✅ Connected to database");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }

  // Create admin user
  console.log("Creating admin user...");
  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      name: "Administrator",
      location: "System",
      note: "Default admin account",
      role: "ADMIN",
      passwordHash,
    },
  });

  console.log("✅ Seed data created successfully");
  console.log("Admin user:", {
    username: admin.username,
    name: admin.name,
    role: admin.role,
    password: "admin123",
  });
}

main()
  .catch((e) => {
    console.error("Error seeding database:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
