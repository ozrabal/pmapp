import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
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
            message: "Wystąpił błąd podczas wylogowania",
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
        console.error("Error updating session records:", sessionError);
        // Don't interrupt the logout process for session recording errors
      }
    }

    return new Response(
      JSON.stringify({
        message: "Wylogowano pomyślnie",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Logout error:", error);

    return new Response(
      JSON.stringify({
        error: {
          message: "Wystąpił nieoczekiwany błąd podczas wylogowania",
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
