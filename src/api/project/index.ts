import { Hono, type Context } from "hono";
import { projectsSchema } from "./schema";
import { createErrorResponse } from "../utils";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import type { AstroCookies } from "astro";
import { ProjectService } from "@/lib/services/project.service";
import type { ListProjectsResponseDto } from "@/types";

const app = new Hono();

app.get("/", async (c: Context) => {
  try {
    const queryParams = c.req.query();
    const parsedQuery = projectsSchema.safeParse(queryParams);

    if (!parsedQuery.success) {
      return createErrorResponse({
        status: 400,
        code: "validation_error",
        message: "Invalid query parameters",
        details: parsedQuery.error.format(),
      });
    }

    const header = new Headers(c.req.header());

    const supabase = createSupabaseServerInstance({
      cookies: c.req.header("cookie") as unknown as AstroCookies,
      headers: header,
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return createErrorResponse({
        status: 401,
        code: "unauthorized",
        message: "Authentication required",
      });
    }

    const projectService = new ProjectService(supabase);
    const response: ListProjectsResponseDto = await projectService.listProjects(user.id, parsedQuery.data);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching projects:", error);

    return createErrorResponse({
      status: 500,
      message: "Failed to fetch projects",
      code: "server_error",
    });
  }
});

// app.post("/", async (c: Context) => {
//   try {
//     return c.json({ status: "project post" }, 200);
//   } catch (err) {
//     // eslint-disable-next-line no-console
//     console.error("Error fetching projects:", err);
//     return c.json({ error: "Failed to fetch projects" }, 500);
//   }
// });

export default app;
