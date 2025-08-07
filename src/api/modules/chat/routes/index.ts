import { Hono } from "hono";
import chatStartRoute from "./start";
import chatGetSessionRoute from "./getSession";
import chatDeleteSessionRoute from "./deleteSession";
import type { ChatSession } from "@/api/types/chat";

const chatRoutes = new Hono();
chatRoutes.route("/", chatStartRoute);
chatRoutes.route("/", chatGetSessionRoute);
chatRoutes.route("/", chatDeleteSessionRoute);

const sessions = new Map<string, ChatSession>();

export { sessions };

export default chatRoutes;
