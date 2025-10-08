import { Hono } from "hono";
import { zValidator } from "@/api/middlewares/validator.middleware";
import { createErrorResponse, createResponse } from "@/api/utils/response";
import { deleteSessionSchema } from "../../schemas";
import { sessions } from "../..";

const app = new Hono();

export default app.delete("/:id", zValidator("param", deleteSessionSchema), async (c) => {
  const { id } = c.req.valid("param");

  // Fetch the session data from the database or any other source
  const session = sessions.get(id);

  if (!session) {
    return createErrorResponse({
      status: 404,
      message: "Session not found",
      code: "not_found",
    });
  }

  sessions.delete(id);

  return createResponse("", 204);
});
