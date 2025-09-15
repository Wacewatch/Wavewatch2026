import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("user_watch_history")
      .select("*")
      .eq("user_id", user.id)
      .order("last_watched_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ history: data })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { contentId, contentType, contentTitle, metadata } = await request.json()

    const { data, error } = await supabase.from("user_watch_history").upsert(
      {
        user_id: user.id,
        content_id: contentId,
        content_type: contentType,
        content_title: contentTitle,
        metadata: metadata || {},
        last_watched_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,content_id,content_type",
      },
    )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
