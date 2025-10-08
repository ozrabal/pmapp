import { Hono } from "hono";
import startPlanningRoute from "@/api/modules/planning/routes/start";
import messagePlanningRoute from "@/api/modules/planning/routes/message";
import sessionRoutes from "@/api/modules/planning/routes/session";
import { type ChatSession } from "@/api/types/chat";

const chatRoutes = new Hono();

chatRoutes.route("/start", startPlanningRoute);
chatRoutes.route("/message", messagePlanningRoute);
chatRoutes.route("/session", sessionRoutes);

const sessions = new Map<string, ChatSession>();

export { sessions };

export default chatRoutes;
