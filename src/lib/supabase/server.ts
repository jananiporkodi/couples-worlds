import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Server-only Supabase client.
 *
 * Deliberately reads non-NEXT_PUBLIC env vars so the key never ships to the
 * browser bundle. All reads/writes happen in Server Components, Server
 * Actions, or Route Handlers, which sit behind the passcode-gated middleware.
 * Row Level Security is enabled on every table with policies scoped to the
 * `anon` role, which is safe here because the anon key never reaches the client.
 */
export function getSupabaseServerClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_ANON_KEY. Copy .env.local.example to .env.local and fill them in."
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false },
  });

  return client;
}
