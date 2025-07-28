import { Hono, type Context } from "hono";
import { projectsSchema } from "./schema";
import { createErrorResponse } from "../utils";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import type { AstroCookies } from "astro";
import db from "@/db";
import { projects } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { executePaginatedQuery } from "@/lib/utils/pagination";

const app = new Hono();

app.get("/", async (c: Context) => {
  try {
    const queryParams = c.req.query();
    const parsedQuery = projectsSchema.safeParse(queryParams);

    if (!parsedQuery.success) {
      return createErrorResponse({
        status: 400,
        code: "validation_error",
        message: "Invalid query parameters",
        details: parsedQuery.error.format(),
      });
    }

    const header = new Headers(c.req.header());

    const supabase = createSupabaseServerInstance({
      cookies: c.req.header("cookie") as unknown as AstroCookies,
      headers: header,
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return createErrorResponse({
        status: 401,
        code: "unauthorized",
        message: "Authentication required",
      });
    }

    const baseQuery = db.select().from(projects).where(eq(projects.userId, user.id));
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(eq(projects.userId, user.id));

    // Get paginated result using our utility
    const response = await executePaginatedQuery<typeof projects.$inferSelect>({
      baseQuery,
      countQuery,
      options: {
        page: parsedQuery.data.page,
        limit: parsedQuery.data.limit,
      },
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching projects:", error);

    return createErrorResponse({
      status: 500,
      message: "Failed to fetch projects",
      code: "server_error",
    });
  }
});

// app.post("/", async (c: Context) => {
//   try {
//     return c.json({ status: "project post" }, 200);
//   } catch (err) {
//     // eslint-disable-next-line no-console
//     console.error("Error fetching projects:", err);
//     return c.json({ error: "Failed to fetch projects" }, 500);
//   }
// });

export default app;
