import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@/db/schema";
import type { DrizzleConfig } from "drizzle-orm";

const config = {
  casing: "snake_case",
  schema,
} satisfies DrizzleConfig<typeof schema>;

function createDb() {
  const client = postgres(process.env.DATABASE_URL!, {
    prepare: false,
    max: 1, // Single connection for serverless
    idle_timeout: 10,
    max_lifetime: 60 * 30,
    debug: true,
  });

  return drizzle({ client, ...config });
}
const db = createDb;

export default db;
