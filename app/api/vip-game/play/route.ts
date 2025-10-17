import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { VIPSystem } from "@/lib/vip-system"

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
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

    if (existingPlay) {
      return NextResponse.json({ error: "Vous avez déjà joué aujourd'hui" }, { status: 400 })
    }

    // Determine prize based on probabilities
    const random = Math.random() * 100
    let prize = "none"
    let vipDuration = 0

    if (random < 2.5) {
      prize = "vip_1_month"
      vipDuration = 30 * 24 * 60 * 60 * 1000 // 30 days in ms
    } else if (random < 9.5) {
      // 2.5 + 7
      prize = "vip_1_week"
      vipDuration = 7 * 24 * 60 * 60 * 1000 // 7 days in ms
    } else if (random < 29.5) {
      // 9.5 + 20
      prize = "vip_1_day"
      vipDuration = 24 * 60 * 60 * 1000 // 1 day in ms
    }

    // Record the play
    await supabase.from("vip_game_plays").insert({
      user_id: user.id,
      prize,
    })

    // If won, activate VIP and record winner
    if (prize !== "none") {
      // Get user profile for username
      const { data: profile } = await supabase.from("user_profiles").select("username").eq("id", user.id).single()

      // Activate VIP
      VIPSystem.activateVIP(user.id, "vip", vipDuration)

      // Record winner
      await supabase.from("vip_game_winners").insert({
        user_id: user.id,
        username: profile?.username || "Utilisateur",
        prize,
      })
    }

    return NextResponse.json({ prize })
  } catch (error) {
    console.error("Error playing VIP game:", error)
    return NextResponse.json({ error: "Erreur lors du jeu" }, { status: 500 })
  }
}
