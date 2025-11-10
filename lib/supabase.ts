import { createClient as createBrowserClient } from "@/lib/supabase/client"

/**
 * @deprecated Use createClient from @/lib/supabase/client instead
 */
export function createClient() {
  return createBrowserClient()
}

// Re-export for backwards compatibility
export const supabase = createBrowserClient()

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
