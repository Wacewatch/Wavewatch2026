import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  })
}

export const supabase = createClient()

export const recoverSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()
    if (error) {
      console.warn("[v0] Session recovery error:", error.message)
      // Clear invalid session
      await supabase.auth.signOut()
      return null
    }
    return session
  } catch (error) {
    console.warn("[v0] Session recovery failed:", error)
    return null
  }
}
