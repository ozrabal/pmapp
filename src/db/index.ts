import postgres from "postgres";
import { DATABASE_URL } from "astro:env/server";
import { drizzle } from "drizzle-orm/postgres-js";
import type { DrizzleConfig } from "drizzle-orm";
import * as schema from "./schema";

const client = postgres(DATABASE_URL, { prepare: false });

const config = {
  casing: "snake_case",
  schema,
} satisfies DrizzleConfig<typeof schema>;

const db = drizzle({ client, ...config });
export default db;
