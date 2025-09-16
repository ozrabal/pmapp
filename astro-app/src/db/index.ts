import postgres from "postgres";
import { DATABASE_URL } from "astro:env/server";
import { drizzle } from "drizzle-orm/postgres-js";
import type { DrizzleConfig } from "drizzle-orm";
import * as schema from "./schema";

const config = {
  casing: "snake_case",
  schema,
} satisfies DrizzleConfig<typeof schema>;

// Create a new connection for each request to avoid Cloudflare Workers I/O limitations
function createDb() {
  const client = postgres(DATABASE_URL, {
    prepare: false,
    max: 1, // Single connection for serverless
    idle_timeout: 10,
    max_lifetime: 60 * 30,
    debug: true,
  });

  return drizzle({ client, ...config });
}

// export const db = () => {
//   const client = postgres(DATABASE_URL);
//   console.log("Database connection established");
//   return drizzle({ client, ...config });
// };

const db = createDb;
// console.log("Database initialized with schema:", schema);
export default db;
