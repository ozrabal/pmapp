import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ locals }) => {
  try {
    // Get user data before signing out to update session records
    const {
      data: { user },
    } = await locals.supabase.auth.getUser();

    // Sign out using Supabase Auth
    const { error } = await locals.supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({
          error: {
            message: "An error occurred during logout",
            details: error.message,
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

    // Update user_sessions table if needed
    if (user) {
      try {
        await locals.supabase
          .from("user_sessions")
          .update({
            is_active: false,
            end_time: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .eq("is_active", true);
      } catch (sessionError) {
        // eslint-disable-next-line no-console
        console.error("Error updating session records:", sessionError);
        // Don't interrupt the logout process for session recording errors
      }
    }

    return new Response(
      JSON.stringify({
        message: "Logged out successfully",
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
          message: "An unexpected error occurred during logout",
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
