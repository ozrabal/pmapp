/// <reference types="astro/client" />
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";

// For Astro's typed environment variables
/// <reference types="astro/env" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENAI_API_KEY: string;
  readonly OPENAI_DEFAULT_MODEL: string;
  readonly OPENAI_FALLBACK_MODEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Export the App namespace to ensure it's properly recognized
declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      user: User | null;
    }
  }
}
