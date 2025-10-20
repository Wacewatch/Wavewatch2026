// app/api/vip-game/status/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ canPlay: false, playedAt: null })
    }

    // Vérifie la dernière partie
    const { data: lastPlay, error } = await supabase
      .from("vip_game_plays")
      .select("played_at")
      .eq("user_id", user.id)
      .order("played_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("Error fetching last play:", error)
      return NextResponse.json({ canPlay: false, playedAt: null })
    }

    let canPlay = true
    let playedAt: string | null = null

    if (lastPlay) {
      playedAt = lastPlay.played_at
      const lastPlayTime = new Date(playedAt)
      const now = new Date()
      const nextPlayTime = new Date(lastPlayTime.getTime() + 24 * 60 * 60 * 1000)

      if (now < nextPlayTime) {
        canPlay = false
      }
    }

    return NextResponse.json({ canPlay, playedAt })
  } catch (err) {
    console.error("VIP game status error:", err)
    return NextResponse.json({ canPlay: false, playedAt: null }, { status: 500 })
  }
}
