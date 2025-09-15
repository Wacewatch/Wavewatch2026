import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function trackUserLogin(userId: string, request?: Request) {
  const cookieStore = cookies()

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

  try {
    const ipAddress = request?.headers.get("x-forwarded-for") || request?.headers.get("x-real-ip") || "unknown"

    const userAgent = request?.headers.get("user-agent") || "unknown"

    await supabase.from("user_login_history").insert({
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      login_at: new Date().toISOString(),
    })

    console.log("✅ Login tracked for user:", userId)
  } catch (error) {
    console.error("❌ Error tracking login:", error)
  }
}
