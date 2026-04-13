/**
 * Server-side Supabase client helpers using @supabase/auth-helpers-nextjs v0.15+
 * which uses the @supabase/ssr API (createServerClient / createBrowserClient).
 */
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

/**
 * Create a Supabase client for Server Components and Route Handlers.
 * Uses `cookies()` from next/headers.
 * Called at request time — not at module init time — so env vars are available.
 */
export function createServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = cookies();

  return createServerClient(supabaseUrl || "placeholder", supabaseAnonKey || "placeholder", {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });
}
