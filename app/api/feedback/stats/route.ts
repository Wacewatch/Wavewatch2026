import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
        },
      }
    )

    // Get all feedback data
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

    // Get guestbook messages with user info
    const { data: feedbackMessages, error: feedbackError } = await supabase
      .from("user_feedback")
      .select("guestbook_message, created_at, user_id")
      .not("guestbook_message", "is", null)
      .neq("guestbook_message", "")
      .order("created_at", { ascending: false })
      .limit(20)

    if (feedbackError) {
      console.error("[v0] Error fetching guestbook messages:", feedbackError)
      return NextResponse.json({
        stats: {
          content: contentAvg,
          functionality: functionalityAvg,
          design: designAvg,
          totalFeedback,
        },
        guestbookMessages: [],
      })
    }

    console.log("[v0] Found", feedbackMessages?.length || 0, "guestbook messages")

    // Get unique user IDs
    const userIds = [...new Set((feedbackMessages || []).map((f) => f.user_id).filter(Boolean))]
    
    console.log("[v0] Loading profiles for", userIds.length, "users")

    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("id, username, email")
      .in("id", userIds)

    if (profilesError) {
      console.error("[v0] Error loading user profiles:", profilesError)
    }

    console.log("[v0] Loaded", profiles?.length || 0, "user profiles")

    const usernameMap = new Map(
      (profiles || []).map((p) => {
        const displayName = p.username || (p.email ? p.email.split("@")[0] : "Utilisateur")
        console.log("[v0] Mapping user", p.id, "to", displayName)
        return [p.id, displayName]
      })
    )

    // Map messages with usernames
    const guestbookMessages = (feedbackMessages || [])
      .filter((f) => f.guestbook_message && f.guestbook_message.trim() !== "")
      .map((f) => {
        const username = usernameMap.get(f.user_id) || "Utilisateur anonyme"
        console.log("[v0] Message from user_id", f.user_id, "-> username:", username)
        return {
          message: f.guestbook_message,
          username: username,
          created_at: f.created_at,
        }
      })

    console.log("[v0] Guestbook messages processed:", guestbookMessages.length)
    console.log("[v0] Sample messages:", guestbookMessages.slice(0, 2))

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
