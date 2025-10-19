import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { VIPSystem } from "@/lib/vip-system"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    console.log("[v0] VIP Game: User attempting to play:", user.id)

    // Check if user already played today
    const now = new Date()
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const tomorrowUTC = new Date(todayUTC)
    tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1)

    const { data: existingPlay } = await supabase
      .from("vip_game_plays")
      .select("*")
      .eq("user_id", user.id)
      .gte("played_at", todayUTC.toISOString())
      .lt("played_at", tomorrowUTC.toISOString())
      .maybeSingle()

    if (existingPlay) {
      console.log("[v0] VIP Game: User already played today")
      return NextResponse.json({ error: "Vous avez déjà joué aujourd'hui" }, { status: 400 })
    }

    // Determine prize based on probabilities
    const random = Math.random() * 100
    let prize = "none"
    let vipDuration = 0

    console.log("[v0] VIP Game: Random roll:", random)

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

    console.log("[v0] VIP Game: Prize determined:", prize)

    // Record the play
    const { error: playError } = await supabase.from("vip_game_plays").insert({
      user_id: user.id,
      prize,
    })

    if (playError) {
      console.error("[v0] VIP Game: Error recording play:", playError)
      throw playError
    }

    console.log("[v0] VIP Game: Play recorded successfully")

    // If won, activate VIP and record winner
    if (prize !== "none") {
      // Get user profile for username
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("username, email")
        .eq("id", user.id)
        .single()

      const username = profile?.username || (profile?.email ? profile.email.split("@")[0] : "Utilisateur")

      console.log("[v0] VIP Game: User won! Activating VIP for:", username)

      // Activate VIP
      VIPSystem.activateVIP(user.id, "vip", vipDuration)

      // Record winner
      const { error: winnerError } = await supabase.from("vip_game_winners").insert({
        user_id: user.id,
        username: username,
        prize,
      })

      if (winnerError) {
        console.error("[v0] VIP Game: Error recording winner:", winnerError)
      } else {
        console.log("[v0] VIP Game: Winner recorded successfully")
      }
    } else {
      console.log("[v0] VIP Game: No prize won this time")
    }

    return NextResponse.json({ prize })
  } catch (error) {
    console.error("[v0] VIP Game: Error during play:", error)
    return NextResponse.json({ error: "Erreur lors du jeu" }, { status: 500 })
  }
}
