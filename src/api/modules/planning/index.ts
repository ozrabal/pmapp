import { Hono } from "hono";
import startPlanningRoute from "@/api/modules/planning/start";
import { type ChatSession } from "@/api/types/chat";

const chatRoutes = new Hono();

chatRoutes.route("/", startPlanningRoute);

const sessions = new Map<string, ChatSession>();

export { sessions };

export default chatRoutes;
