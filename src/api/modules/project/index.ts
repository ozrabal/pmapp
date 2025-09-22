import { Hono } from "hono";
import { zValidator } from "@/api/middlewares/validator.middleware";

import { projectsSchema } from "./schema";

const app = new Hono();

app.get("/", zValidator("query", projectsSchema), async (c) => {
  const validParams = c.req.valid("query");

  return c.json({ message: "GET / project module!", validParams });
});

export default app;
