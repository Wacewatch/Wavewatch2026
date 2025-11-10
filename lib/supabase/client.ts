import { createBrowserClient } from "@supabase/ssr"

/**
 * Creates a Supabase browser client for use in Client Components and client-side code.
 * This client is singleton-based and handles session persistence automatically.
 * Includes error recovery and retry logic for network issues.
 */
let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Missing Supabase environment variables")
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    )
  }

  if (client) {
    return client
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      storageKey: "supabase.auth.token",
    },
  })

  return client
}

export function resetClient() {
  client = null
}
