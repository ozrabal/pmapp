// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { defineConfig, envField } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 3000 },
  env: {
    schema: {
      // Supabase configuration
      SUPABASE_URL: envField.string({ context: "server", access: "secret" }),
      SUPABASE_KEY: envField.string({ context: "server", access: "secret" }),

      // OpenAI configuration
      OPENAI_API_KEY: envField.string({ context: "server", access: "secret" }),
      OPENAI_DEFAULT_MODEL: envField.string({ context: "server", access: "secret", default: "o4-mini" }),
      OPENAI_FALLBACK_MODEL: envField.string({ context: "server", access: "secret", default: "o4-mini" }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
      // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
      alias: import.meta.env.PROD
        ? {
            "react-dom/server": "react-dom/server.edge",
          }
        : {},
    },
  },
  adapter: cloudflare({
    // Cloudflare specific configuration
    // Pass env vars to the Cloudflare deployment
    envPrefix: ["PUBLIC_", "SUPABASE_", "OPENAI_", "DATABASE_", "SESSION_"],
  }),
  experimental: {
    session: true, // Enable experimental sessions
  },
});
