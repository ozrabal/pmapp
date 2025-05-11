import type { APIRoute } from "astro";
import { z } from "zod";

// Schema for validating registration input
const registerSchema = z.object({
  email: z.string().email("Wprowadź poprawny adres email"),
  password: z
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków")
    .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę")
    .regex(/[a-zA-Z]/, "Hasło musi zawierać co najmniej jedną literę"),
  firstName: z.string().min(1, "Imię jest wymagane"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  // Get supabase instance from middleware
  const { supabase } = locals;

  try {
    // Parse request body
    const body = await request.json();

    // Validate input data
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Nieprawidłowe dane formularza",
            details: result.error.format(),
          },
        }),
        { status: 400 }
      );
    }

    const { email, password, firstName } = result.data;

    // Register user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
        },
      },
    });

    // Handle registration errors
    if (error) {
      return new Response(
        JSON.stringify({
          error: {
            message: error.message,
          },
        }),
        { status: 400 }
      );
    }

    // Return success response - note that email confirmation is required
    return new Response(
      JSON.stringify({
        user: data.user,
        message: "Konto zostało utworzone. Sprawdź swoją skrzynkę email, aby aktywować konto.",
      }),
      { status: 201 }
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Return generic error for unexpected issues
    return new Response(
      JSON.stringify({
        error: {
          message: "Wystąpił nieoczekiwany błąd podczas rejestracji. Spróbuj ponownie później.",
        },
      }),
      { status: 500 }
    );
  }
};
