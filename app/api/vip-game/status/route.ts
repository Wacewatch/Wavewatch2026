import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ canPlay: false, hasPlayedToday: false })
    }

    const now = new Date()
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const tomorrowUTC = new Date(todayUTC)
    tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1)

    // Check if user already played today
    const { data: existingPlay, error } = await supabase
      .from("vip_game_plays")
      .select("*")
      .eq("user_id", user.id)
      .gte("played_at", todayUTC.toISOString())
      .lt("played_at", tomorrowUTC.toISOString())
      .maybeSingle()

    if (error) {
      console.error("[v0] Error checking VIP game status:", error)
    }

    const canPlay = !existingPlay
    console.log("[v0] VIP game status check:", { userId: user.id, canPlay, hasPlayedToday: !!existingPlay })

    return NextResponse.json({
      canPlay,
      hasPlayedToday: !!existingPlay,
    })
  } catch (error) {
    console.error("[v0] Error in VIP game status route:", error)
    return NextResponse.json({ canPlay: false, hasPlayedToday: false, error: "Internal server error" }, { status: 500 })
  }
}
