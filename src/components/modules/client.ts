import { createBrowserClient } from "@supabase/ssr";

import { SUPABASE_CLIENT_KEY, SUPABASE_CLIENT_URL } from "astro:env/client";

export function createClient() {
  return createBrowserClient(SUPABASE_CLIENT_URL, SUPABASE_CLIENT_KEY);
}
