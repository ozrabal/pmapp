import { type Context, Hono } from "hono";

const app = new Hono();

app.get("/", async (c: Context) => {
  return c.json({ message: "GET / project module!" });
});

export default app;
