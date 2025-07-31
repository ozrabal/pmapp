import { Hono, type Context } from "hono";
import { projectsSchema } from "./schema";
import { createErrorResponse, createSuccessResponse } from "../utils/response";
import db from "@/db";

import { projects } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { executePaginatedQuery } from "@/lib/utils/pagination";
import { getUserFromRequest } from "../utils/request";

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

    const user = await getUserFromRequest(c.req);

    if (!user) {
      return createErrorResponse({
        status: 401,
        code: "unauthorized",
        message: "Authentication required",
      });
    }

    const baseQuery = db().select().from(projects).where(eq(projects.userId, user.id));
    const countQuery = db()
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

    return createSuccessResponse(response);
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
