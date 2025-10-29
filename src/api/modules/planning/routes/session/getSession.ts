import { Hono } from "hono";
import { zValidator } from "@/api/middlewares/validator.middleware";
import { createErrorResponse, createResponse } from "@/api/utils/response";
import { chatSessionService } from "@/lib/services/chatSession.service";
import { getSessionSchema } from "../../schemas";
import { calculateProgress, getCurrentStepIndex } from "../../utils";
import { STEP_ORDER, STEP_PROMPTS } from "../../consts";

const app = new Hono();

export default app.get("/:id", zValidator("param", getSessionSchema), async (c) => {
  const { id } = c.req.valid("param");

  // Fetch the session data from the database using chatSessionService
  const session = await chatSessionService.getSessionById(id);

  if (!session) {
    return createErrorResponse({
      status: 404,
      message: "Session not found",
      code: "not_found",
    });
  }

  const overallProgress = calculateProgress(session, STEP_PROMPTS);

  return createResponse({
    ...session,
    progress: {
      currentStep: getCurrentStepIndex(session.currentStep) + 1,
      totalSteps: STEP_ORDER.length,
      completionPercentage: Math.round(overallProgress),
    },
  });
});
