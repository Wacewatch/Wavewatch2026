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

    if (error) throw error

    // Calculate averages
    const totalFeedback = data.length
    const contentAvg = totalFeedback > 0 ? data.reduce((sum, f) => sum + (f.content_rating || 0), 0) / totalFeedback : 0
    const functionalityAvg =
      totalFeedback > 0 ? data.reduce((sum, f) => sum + (f.functionality_rating || 0), 0) / totalFeedback : 0
    const designAvg = totalFeedback > 0 ? data.reduce((sum, f) => sum + (f.design_rating || 0), 0) / totalFeedback : 0

    const { data: feedbackWithUsers, error: feedbackError } = await supabase
      .from("user_feedback")
      .select(`
        guestbook_message,
        created_at,
        user_id,
        user_profiles!user_feedback_user_id_fkey(username)
      `)
      .not("guestbook_message", "is", null)
      .neq("guestbook_message", "")
      .order("created_at", { ascending: false })
      .limit(20)

    if (feedbackError) {
      console.error("Error fetching feedback with users:", feedbackError)
    }

    const guestbookMessages = (feedbackWithUsers || [])
      .filter((f) => f.guestbook_message && f.guestbook_message.trim() !== "")
      .map((f) => ({
        message: f.guestbook_message,
        username: (f.user_profiles as any)?.username || "Utilisateur",
        created_at: f.created_at,
      }))

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
    console.error("Error fetching feedback stats:", error)
    return NextResponse.json({ error: "Failed to fetch feedback stats" }, { status: 500 })
  }
}
