import { handle } from "hono/vercel";
import { Hono } from "hono";
import projectRoutes from "@/api/modules/project";

const router = new Hono().basePath("/api");

router.route("/project", projectRoutes);

export const maxDuration = 30;

export const GET = handle(router);
export const POST = handle(router);
export const PATCH = handle(router);
export const DELETE = handle(router);
export const OPTIONS = handle(router);
