import { Hono } from "hono";
import startPlanningRoute from "@/api/modules/planning/routes/start";
import messagePlanningRoute from "@/api/modules/planning/routes/message";
import { type ChatSession } from "@/api/types/chat";

const chatRoutes = new Hono();

chatRoutes.route("/start", startPlanningRoute);
chatRoutes.route("/message", messagePlanningRoute);

const sessions = new Map<string, ChatSession>();

export { sessions };

export default chatRoutes;
