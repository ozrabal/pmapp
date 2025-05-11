import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { z } from "zod";

// Schema that allows either token or code, plus password
const newPasswordSchema = z
  .object({
    token: z.string().optional(),
    code: z.string().optional(),
    password: z
      .string()
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę")
      .regex(/[a-zA-Z]/, "Hasło musi zawierać co najmniej jedną literę"),
  })
  .refine((data) => data.token || data.code, {
    message: "Token lub kod autoryzacyjny jest wymagany",
    path: ["token"],
  });

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Validate incoming request data
    const data = await request.json();
    const validationResult = newPasswordSchema.safeParse(data);

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

    const { token, code, password } = validationResult.data;

    // Create Supabase server instance
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    let error;

    if (code) {
      // Handle the password reset with the OTP code
      // This is the flow when clicking the link from the email
      try {
        // First exchange the code for a session
        const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          error = exchangeError;
        } else if (sessionData) {
          // Then update the user's password
          const { error: updateError } = await supabase.auth.updateUser({
            password: password,
          });

          if (updateError) {
            error = updateError;
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        error = {
          message: "Wystąpił błąd podczas weryfikacji kodu autoryzacyjnego",
        };
      }
    } else if (token) {
      // If we have a token, use it directly to update the password
      // This is the older flow used with hash fragments
      try {
        const { error: updateError } = await supabase.auth.resetPasswordForEmail(
          "", // Email not needed as we have the token
          {
            redirectTo: token, // Pass token as redirectTo which actually works as a recovery token
          }
        );
        // Now use the token to update the password
        const { error: resetError } = await supabase.auth.updateUser({
          password: password,
        });
        error = updateError || resetError;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        error = {
          message: "Wystąpił błąd podczas weryfikacji tokena resetowania hasła",
        };
      }
    }

    if (error) {
      // Handle specific error cases
      if (error.message?.includes("expired") || error.message?.includes("invalid")) {
        return new Response(
          JSON.stringify({
            error: {
              message: "Link resetowania hasła wygasł lub jest nieprawidłowy. Proszę wygenerować nowy.",
            },
          }),
          { status: 400 }
        );
      }

      return new Response(
        JSON.stringify({
          error: {
            message: error.message || "Wystąpił błąd podczas zmiany hasła",
          },
        }),
        { status: 400 }
      );
    }

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
