import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";

// Define public paths that don't require authentication
const PUBLIC_PATHS = [
  // Auth pages
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  "/auth/new-password",
  "/auth/activate",
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/reset-password",
  "/api/auth/new-password",
  "/api/auth/session",
  // Public pages
  "/",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, request, url, redirect }, next) => {
  // Check for Supabase auth redirect with code parameter
  const authCode = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorCode = url.searchParams.get("error_code");

  // Handle auth code redirects to root
  if (url.pathname === "/" && authCode) {
    // If we have an auth code at the root URL, redirect to the new-password page with the code
    return redirect(`/auth/new-password?code=${authCode}`);
  }

  // Handle error redirects to root
  if (url.pathname === "/" && error && errorCode) {
    // If we have an error at the root URL, redirect to the appropriate page
    if (errorCode === "otp_expired") {
      return redirect(
        `/auth/reset-password?error=${error}&error_code=${errorCode}&error_description=${url.searchParams.get("error_description") || ""}`
      );
    }
  }

  // Initialize server-side Supabase client with proper cookie handling
  const supabase = createSupabaseServerInstance({
    headers: request.headers,
    cookies,
  });

  // Add the Supabase client to locals for use in routes
  locals.supabase = supabase;

  // Important: Always authenticate the user by contacting Supabase Auth server
  // Do NOT use session directly as it could be insecure
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Add user to locals if authenticated
  if (user) {
    locals.user = user;
  }

  const path = url.pathname;

  // Check if the current path requires authentication
  const isPublicPath = PUBLIC_PATHS.some((publicPath) => path === publicPath || path.startsWith(publicPath + "/"));
  const isAuthPath = path.startsWith("/auth/");
  const isAuthenticated = !!user;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthPath && !path.startsWith("/auth/logout")) {
    return redirect("/dashboard");
  }

  // Redirect unauthenticated users from protected paths to login
  if (!isAuthenticated && !isPublicPath) {
    // Preserve original URL to redirect after login
    return redirect(`/auth/login?redirect=${encodeURIComponent(path)}`);
  }

  // Continue with the requested page
  return next();
});
