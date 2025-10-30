import { Hono } from "hono";
import { zValidator } from "@/api/middlewares/validator.middleware";
import { createErrorResponse, createResponse } from "@/api/utils/response";
import { chatSessionService } from "@/lib/services/chatSession.service";
import { deleteSessionSchema } from "../../schemas";

const app = new Hono();

export default app.delete("/:id", zValidator("param", deleteSessionSchema), async (c) => {
  const { id } = c.req.valid("param");

  const session = await chatSessionService.getSessionById(id);

  if (!session) {
    return createErrorResponse({
      status: 404,
      message: "Session not found",
      code: "not_found",
    });
  }

  await chatSessionService.deleteSession(id);

  return createResponse("", 204);
});
