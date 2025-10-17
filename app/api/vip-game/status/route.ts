import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ canPlay: false, hasPlayedToday: false })
    }

    // Check if user already played today
    const today = new Date().toISOString().split("T")[0]
    const { data: existingPlay } = await supabase
      .from("vip_game_plays")
      .select("*")
      .eq("user_id", user.id)
      .gte("played_at", `${today}T00:00:00`)
      .lte("played_at", `${today}T23:59:59`)
      .single()

    return NextResponse.json({
      canPlay: !existingPlay,
      hasPlayedToday: !!existingPlay,
    })
  } catch (error) {
    console.error("Error checking VIP game status:", error)
    return NextResponse.json({ canPlay: false, hasPlayedToday: false })
  }
}
