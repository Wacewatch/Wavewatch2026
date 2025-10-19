import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })

    const { data, error } = await supabase.from("user_feedback").select("*")

    if (error) {
      console.error("[v0] Error fetching feedback:", error)
      return NextResponse.json({
        stats: { content: 0, functionality: 0, design: 0, totalFeedback: 0 },
        guestbookMessages: [],
      })
    }

    // Calculate averages
    const totalFeedback = data.length
    const contentAvg = totalFeedback > 0 ? data.reduce((sum, f) => sum + (f.content_rating || 0), 0) / totalFeedback : 0
    const functionalityAvg =
      totalFeedback > 0 ? data.reduce((sum, f) => sum + (f.functionality_rating || 0), 0) / totalFeedback : 0
    const designAvg = totalFeedback > 0 ? data.reduce((sum, f) => sum + (f.design_rating || 0), 0) / totalFeedback : 0

    const { data: feedbackMessages, error: feedbackError } = await supabase
      .from("user_feedback")
      .select("guestbook_message, created_at, user_id")
      .not("guestbook_message", "is", null)
      .neq("guestbook_message", "")
      .order("created_at", { ascending: false })
      .limit(20)

    if (feedbackError) {
      console.error("[v0] Error fetching guestbook messages:", feedbackError)
    }

    const userIds = (feedbackMessages || []).map((f) => f.user_id).filter(Boolean)
    const { data: profiles } = await supabase.from("user_profiles").select("user_id, username").in("user_id", userIds)

    const usernameMap = new Map((profiles || []).map((p) => [p.user_id, p.username]))

    const guestbookMessages = (feedbackMessages || [])
      .filter((f) => f.guestbook_message && f.guestbook_message.trim() !== "")
      .map((f) => ({
        message: f.guestbook_message,
        username: usernameMap.get(f.user_id) || "Utilisateur",
        created_at: f.created_at,
      }))

    console.log("[v0] Guestbook messages loaded:", guestbookMessages.length)

    return NextResponse.json({
      stats: {
        content: contentAvg,
        functionality: functionalityAvg,
        design: designAvg,
        totalFeedback,
      },
      guestbookMessages,
    })
  } catch (error) {
    console.error("[v0] Error in feedback stats route:", error)
    return NextResponse.json(
      {
        stats: { content: 0, functionality: 0, design: 0, totalFeedback: 0 },
        guestbookMessages: [],
      },
      { status: 500 },
    )
  }
}
