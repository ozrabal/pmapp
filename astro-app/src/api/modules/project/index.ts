import { Hono, type Context } from "hono";
import { projectsSchema } from "@/api/modules/project/schema";
import { createErrorResponse, createSuccessResponse } from "@/api/utils/response";
import db from "@/db";

import { projects } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { executePaginatedQuery } from "@/lib/utils/pagination";
import { getUserFromRequest } from "@/api/utils/request";

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

export default app;
