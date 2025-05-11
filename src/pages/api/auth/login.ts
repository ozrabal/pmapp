import type { APIRoute } from "astro";
import { z } from "zod";

export const prerender = false;

// Schema for validating login data
const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.format();
      return new Response(
        JSON.stringify({
          error: {
            message: "Invalid login data",
            errors,
          },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Attempt to sign in with Supabase Auth
    const { error } = await locals.supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Invalid email or password",
            details: error.message,
          },
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Important: Always validate user authentication by calling getUser
    // Do NOT rely solely on session data
    const {
      data: { user },
    } = await locals.supabase.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({
          error: {
            message: "An error occurred during login",
          },
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Record login in user_sessions table if needed
    try {
      await locals.supabase.from("user_sessions").insert({
        user_id: user.id,
        is_active: true,
      });
    } catch (sessionError) {
      // eslint-disable-next-line no-console
      console.error("Error recording session:", sessionError);
      // Don't interrupt the login process for session recording errors
    }

    return new Response(
      JSON.stringify({
        message: "Logged in successfully",
        user: {
          id: user.id,
          email: user.email,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: {
          message: "An error occurred during login. Please try again later.",
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
