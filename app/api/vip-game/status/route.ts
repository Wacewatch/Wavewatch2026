import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ playsRemaining: 0, playsToday: 0, nextResetAt: null })
    }

    const now = new Date()
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const tomorrowStart = new Date(todayStart)
    tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1)

    const { data: plays, error } = await supabase
      .from("vip_game_plays")
      .select("id")
      .eq("user_id", user.id)
      .gte("played_at", todayStart.toISOString())
      .lt("played_at", tomorrowStart.toISOString())

    if (error) {
      console.error("Error fetching plays:", error)
      return NextResponse.json({ playsRemaining: 0, playsToday: 0, nextResetAt: null })
    }

    const playsToday = plays?.length || 0
    const playsRemaining = Math.max(0, 3 - playsToday)

    return NextResponse.json({
      playsRemaining,
      playsToday,
      nextResetAt: tomorrowStart.toISOString(),
    })
  } catch (err) {
    console.error("VIP game status error:", err)
    return NextResponse.json({ playsRemaining: 0, playsToday: 0, nextResetAt: null }, { status: 500 })
  }
}
