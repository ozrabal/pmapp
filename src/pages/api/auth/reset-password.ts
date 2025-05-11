import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { z } from "zod";

const resetPasswordSchema = z.object({
  email: z.string().email("Wprowadź poprawny adres email"),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Validate incoming request data
    const data = await request.json();
    const validationResult = resetPasswordSchema.safeParse(data);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Nieprawidłowy format danych",
            issues: validationResult.error.issues,
          },
        }),
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Create Supabase server instance
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Explicitly set the redirect URL to the new-password page
    // This ensures the user lands on the correct page when clicking the email link
    const resetPasswordURL = new URL("/auth/new-password", request.url).toString();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetPasswordURL,
    });

    if (error) {
      return new Response(JSON.stringify({ error: { message: error.message } }), { status: 400 });
    }

    // Always return success, even if email doesn't exist (security best practice)
    return new Response(JSON.stringify({ success: true }), { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: { message: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później." },
      }),
      { status: 500 }
    );
  }
};
