import { existsSync } from "fs";
import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load environment variables - prefer .env.local, fallback to .env
const envPath = existsSync(".env.local") ? ".env.local" : ".env";
dotenv.config({ path: envPath });

export default defineConfig({
  out: "./migrations",
  schema: "./src/db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      (() => {
        throw new Error("DATABASE_URL is not defined");
      })(),
  },
  schemaFilter: ["public"],
  migrations: {
    schema: "public",
  },
  // Exclude external schemas from migration generation
  tablesFilter: ["!auth.*"],
});
