import { Hono } from "hono";
import { eq, sql } from "drizzle-orm";
import { zValidator } from "@/api/middlewares/validator.middleware";

import db from "@/db/service";
import { projects } from "@/db/schema";
import { executePaginatedQuery } from "@/api/utils/pagination";
import { projectsSchema } from "./schema";

const app = new Hono();

app.get("/", zValidator("query", projectsSchema), async (c) => {
  const { sub: userId } = c.get("jwtPayload");

  const validParams = c.req.valid("query");

  const baseQuery = db().select().from(projects).where(eq(projects.userId, userId));
  const countQuery = db()
    .select({ count: sql<number>`count(*)` })
    .from(projects)
    .where(eq(projects.userId, userId));

  const response = await executePaginatedQuery<typeof projects.$inferSelect>({
    baseQuery,
    countQuery,
    options: {
      page: validParams.page,
      limit: validParams.limit,
    },
  });

  return c.json(response);
});

export default app;
