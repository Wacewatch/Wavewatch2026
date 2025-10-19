import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ history: [] })
    }

    // Fetch user's play history (last 50 plays)
    const { data: history, error } = await supabase
      .from("vip_game_plays")
      .select("prize, played_at")
      .eq("user_id", user.id)
      .order("played_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("[v0] Error fetching VIP game history:", error)
      return NextResponse.json({ history: [] })
    }

    return NextResponse.json({ history: history || [] })
  } catch (error) {
    console.error("[v0] Error in VIP game history route:", error)
    return NextResponse.json({ history: [], error: "Internal server error" }, { status: 500 })
  }
}
