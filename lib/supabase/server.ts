import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

/**
 * Creates a Supabase server client for use in Server Components, Route Handlers, and Server Actions.
 *
 * Important: Don't put this client in a global variable. Always create a new client
 * within each function when using it, especially when using Fluid compute.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  )
}
