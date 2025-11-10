import { createBrowserClient } from "@supabase/ssr"

/**
 * Creates a Supabase browser client for use in Client Components and client-side code.
 * This client is singleton-based and handles session persistence automatically.
 */
let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  console.log("[v0] Supabase URL:", supabaseUrl ? "SET" : "MISSING")
  console.log("[v0] Supabase Key:", supabaseAnonKey ? `SET (length: ${supabaseAnonKey.length})` : "MISSING")

  if (supabaseUrl) {
    console.log("[v0] URL starts with:", supabaseUrl.substring(0, 30) + "...")
    console.log("[v0] URL contains .supabase.co:", supabaseUrl.includes(".supabase.co"))
  }

  if (supabaseAnonKey) {
    console.log("[v0] Key starts with:", supabaseAnonKey.substring(0, 20) + "...")
    console.log("[v0] Key looks like JWT:", supabaseAnonKey.split(".").length === 3)
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] ERROR: Missing Supabase environment variables!")
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the Vars section.",
    )
  }

  if (!supabaseUrl.includes(".supabase.co") && !supabaseUrl.includes("localhost")) {
    console.error("[v0] ERROR: Invalid Supabase URL format:", supabaseUrl)
    throw new Error("Invalid NEXT_PUBLIC_SUPABASE_URL. Must be a valid Supabase project URL.")
  }

  if (supabaseAnonKey.split(".").length !== 3) {
    console.error("[v0] ERROR: Supabase anon key doesn't look like a JWT")
    console.error("[v0] Key has", supabaseAnonKey.split(".").length, "parts, expected 3")
    throw new Error("Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY. Must be a valid JWT token.")
  }

  if (client) {
    console.log("[v0] Reusing existing Supabase client")
    return client
  }

  console.log("[v0] Creating new Supabase browser client...")
  client = createBrowserClient(supabaseUrl, supabaseAnonKey)
  console.log("[v0] Supabase client created successfully!")

  return client
}
