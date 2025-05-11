import type { APIRoute } from "astro";
import { z } from "zod";

// Schema for validating registration input
const registerSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[0-9]/, "Password must contain at least one digit")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter"),
  firstName: z.string().min(1, "First name is required"),
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
            message: "Invalid form data",
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
        message: "Account has been created. Check your email inbox to activate your account.",
      }),
      { status: 201 }
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Return generic error for unexpected issues
    return new Response(
      JSON.stringify({
        error: {
          message: "An unexpected error occurred during registration. Please try again later.",
        },
      }),
      { status: 500 }
    );
  }
};
