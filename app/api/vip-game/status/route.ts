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

    // Vérifier la dernière partie
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
      const nextPlayTime = new Date(lastPlayTime)
      nextPlayTime.setUTCDate(nextPlayTime.getUTCDate() + 1)

      if (now < nextPlayTime) {
        canPlay = false
      }
    }

    return NextResponse.json({ canPlay, playedAt })
  } catch (err) {
    console.error("VIP game GET error:", err)
    return NextResponse.json({ canPlay: false, playedAt: null }, { status: 500 })
  }
}

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    // Vérifier si l'utilisateur peut jouer
    const { data: lastPlay, error } = await supabase
      .from("vip_game_plays")
      .select("played_at")
      .eq("user_id", user.id)
      .order("played_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("Error fetching last play:", error)
      return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
    }

    if (lastPlay) {
      const lastPlayTime = new Date(lastPlay.played_at)
      const now = new Date()
      const nextPlayTime = new Date(lastPlayTime)
      nextPlayTime.setUTCDate(nextPlayTime.getUTCDate() + 1)

      if (now < nextPlayTime) {
        return NextResponse.json({ success: false, message: "You already played" }, { status: 400 })
      }
    }

    // Enregistrer le jeu
    const { data, error: insertError } = await supabase
      .from("vip_game_plays")
      .insert({ user_id: user.id, played_at: new Date().toISOString() })
      .select()
      .maybeSingle()

    if (insertError) {
      console.error("Error inserting play:", insertError)
      return NextResponse.json({ success: false, message: "Could not record play" }, { status: 500 })
    }

    return NextResponse.json({ success: true, playedAt: data.played_at })
  } catch (err) {
    console.error("VIP game POST error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
} 
