import { createSupabaseServerInstance } from "@/db/supabase.client";
import type { AstroCookies } from "astro";
import type { HonoRequest } from "hono";
import type { User } from "@supabase/supabase-js";

export async function getUserFromRequest(request: HonoRequest): Promise<User | null> {
  const header = new Headers(request.header());

  const supabase = createSupabaseServerInstance({
    cookies: request.header("cookie") as unknown as AstroCookies,
    headers: header,
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
