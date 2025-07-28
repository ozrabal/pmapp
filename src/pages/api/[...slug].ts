import { Hono } from "hono";
import projectRoutes from "@/api/project";
import type { APIRoute } from "astro";

const app = new Hono().basePath("/api");

app.route("/project", projectRoutes);

export const maxDuration = 30;

export const ALL: APIRoute = (context) => app.fetch(context.request);

export type App = typeof app;
