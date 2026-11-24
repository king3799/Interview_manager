import { config } from "dotenv";
import { existsSync } from "fs";

// Load environment files in order of priority
if (existsSync(".env.development.local")) {
  config({ path: ".env.development.local", override: true });
} else if (existsSync(".env.local")) {
  config({ path: ".env.local", override: true });
} else {
  config({ path: ".env" });
}

export default {
  schema: "./prisma/schema.prisma",
};
