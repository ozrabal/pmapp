import { Hono } from "hono";
import chatStartRoute from "@/api/modules/chat/routes/start";
import chatGetSessionRoute from "@/api/modules/chat/routes/getSession";
import chatDeleteSessionRoute from "@/api/modules/chat/routes/deleteSession";
import chatCompleteSessionRoute from "@/api/modules/chat/routes/completeSession";
import chatMessageRoute from "@/api/modules/chat/routes/message";
import type { ChatSession } from "@/api/types/chat";

const chatRoutes = new Hono();
chatRoutes.route("/", chatStartRoute);
chatRoutes.route("/", chatGetSessionRoute);
chatRoutes.route("/", chatDeleteSessionRoute);
chatRoutes.route("/", chatCompleteSessionRoute);
chatRoutes.route("/", chatMessageRoute);

const sessions = new Map<string, ChatSession>();

export { sessions };

export default chatRoutes;
