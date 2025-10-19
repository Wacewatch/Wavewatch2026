import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ canPlay: false, attemptsLeft: 0, totalAttempts: 2 })
    }

    const now = new Date()
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const tomorrowUTC = new Date(todayUTC)
    tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1)

    const { data: todayPlays, error } = await supabase
      .from("vip_game_plays")
      .select("*")
      .eq("user_id", user.id)
      .gte("played_at", todayUTC.toISOString())
      .lt("played_at", tomorrowUTC.toISOString())

    if (error) {
      console.error("[v0] Error checking VIP game status:", error)
    }

    const playsToday = todayPlays?.length || 0
    const attemptsLeft = Math.max(0, 2 - playsToday)
    const canPlay = attemptsLeft > 0

    console.log("[v0] VIP game status check:", { userId: user.id, canPlay, playsToday, attemptsLeft })

    return NextResponse.json({
      canPlay,
      attemptsLeft,
      totalAttempts: 2,
      playsToday,
    })
  } catch (error) {
    console.error("[v0] Error in VIP game status route:", error)
    return NextResponse.json(
      { canPlay: false, attemptsLeft: 0, totalAttempts: 2, error: "Internal server error" },
      { status: 500 },
    )
  }
}
