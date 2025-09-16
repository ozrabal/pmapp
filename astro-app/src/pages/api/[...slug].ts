import { Hono } from "hono";
import projectRoutes from "@/api/modules/project";
import chatRoutes from "@/api/modules/chat/routes";
import type { APIRoute } from "astro";

const app = new Hono().basePath("/api");

app.route("/project", projectRoutes);
app.route("/chat", chatRoutes);

export const maxDuration = 30;

export const ALL: APIRoute = (context) => app.fetch(context.request);

export type App = typeof app;
