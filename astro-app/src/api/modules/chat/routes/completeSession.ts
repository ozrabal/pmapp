import { Hono } from "hono";
import { createErrorResponse, createSuccessResponse } from "@/api/utils/response";
import { sessionSchema } from "@/api/modules/chat/schema";
import { sessions } from ".";
import { CompletionStatus, PlanningStep } from "@/api/modules/chat/consts";
import { generateProjectSpecification } from "@/api/modules/chat/utils";

const chatCompleteSessionRoute = new Hono();

export default chatCompleteSessionRoute.post("/complete/:id", async (c) => {
  try {
    const queryParams = c.req.param();
    const parsedQuery = sessionSchema.safeParse(queryParams);

    if (!parsedQuery.success) {
      return createErrorResponse({
        status: 400,
        message: "Invalid session ID",
        code: "invalid_request",
        details: parsedQuery.error.format(),
      });
    }

    const { id } = parsedQuery.data;

    const session = sessions.get(id);

    if (!session) {
      return createErrorResponse({
        status: 404,
        message: "Session not found",
        code: "not_found",
      });
    }

    session.completionStatus = CompletionStatus.COMPLETED;
    session.currentStep = PlanningStep.COMPLETION;
    session.updatedAt = new Date();

    const specification = await generateProjectSpecification(session.collectedData);

    return createSuccessResponse({
      collectedData: session.collectedData,
      specification,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error starting chat:", error);
    return createErrorResponse({
      status: 500,
      message: "Failed to start chat",
      code: "server_error",
    });
  }
});
