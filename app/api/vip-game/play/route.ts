// app/api/vip-game/play/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    console.log("[v0] VIP Game: Starting play request")
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] VIP Game: User not authenticated")
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    console.log("[v0] VIP Game: User attempting to play:", user.id)

    // Vérifie si l'utilisateur a déjà joué aujourd'hui
    const now = new Date()
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const tomorrowUTC = new Date(todayUTC)
    tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1)

    console.log(
      "[v0] VIP Game: Checking if user played today between",
      todayUTC.toISOString(),
      "and",
      tomorrowUTC.toISOString(),
    )

    const { data: existingPlay, error: checkError } = await supabase
      .from("vip_game_plays")
      .select("*")
      .eq("user_id", user.id)
      .gte("played_at", todayUTC.toISOString())
      .lt("played_at", tomorrowUTC.toISOString())
      .maybeSingle()

    if (checkError) {
      console.error("[v0] VIP Game: Error checking existing play:", checkError)
      return NextResponse.json({ error: `Erreur de vérification: ${checkError.message}` }, { status: 500 })
    }

    if (existingPlay) {
      console.log("[v0] VIP Game: User already played today")
      return NextResponse.json({ error: "Vous avez déjà joué aujourd'hui" }, { status: 400 })
    }

    console.log("[v0] VIP Game: User can play, determining prize...")

    // Détermine le prix selon les probabilités
    const random = Math.random() * 100
    let prize = "none"
    let vipDuration = 0

    if (random < 2.5) {
      prize = "vip_1_month"
      vipDuration = 30 * 24 * 60 * 60 * 1000
    } else if (random < 9.5) {
      prize = "vip_1_week"
      vipDuration = 7 * 24 * 60 * 60 * 1000
    } else if (random < 29.5) {
      prize = "vip_1_day"
      vipDuration = 24 * 60 * 60 * 1000
    }

    console.log("[v0] VIP Game: Prize determined:", prize, "Duration:", vipDuration)

    // Enregistre la partie
    const playedAtDate = new Date().toISOString()
    console.log("[v0] VIP Game: Recording play at:", playedAtDate)

    const { error: playError } = await supabase.from("vip_game_plays").insert({
      user_id: user.id,
      prize,
      played_at: playedAtDate,
    })

    if (playError) {
      console.error("[v0] VIP Game: Error recording play:", playError)
      return NextResponse.json({ error: `Erreur d'enregistrement: ${playError.message}` }, { status: 500 })
    }

    console.log("[v0] VIP Game: Play recorded successfully")

    if (prize !== "none") {
      console.log("[v0] VIP Game: User won! Fetching profile...")

      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("username, email, vip_expires_at")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        console.error("[v0] VIP Game: Error fetching profile:", profileError)
        return NextResponse.json({ error: `Erreur de profil: ${profileError.message}` }, { status: 500 })
      }

      const username = profile?.username || (profile?.email ? profile.email.split("@")[0] : "Utilisateur")

      console.log("[v0] VIP Game: Activating VIP for:", username)

      // Calcule la nouvelle date d'expiration
      const currentExpiry = profile?.vip_expires_at ? new Date(profile.vip_expires_at) : new Date()
      const now = new Date()

      // Si l'expiration actuelle est dans le futur, on ajoute à partir de cette date
      // Sinon, on ajoute à partir de maintenant
      const baseDate = currentExpiry > now ? currentExpiry : now
      const newExpiry = new Date(baseDate.getTime() + vipDuration)

      console.log("[v0] VIP Game: New VIP expiry:", newExpiry.toISOString())

      // Met à jour le profil utilisateur avec le statut VIP
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          is_vip: true,
          vip_expires_at: newExpiry.toISOString(),
        })
        .eq("id", user.id)

      if (updateError) {
        console.error("[v0] VIP Game: Error updating VIP status:", updateError)
        return NextResponse.json({ error: `Erreur de mise à jour VIP: ${updateError.message}` }, { status: 500 })
      }

      console.log("[v0] VIP Game: VIP status updated in database")

      // Enregistre le gagnant
      const { error: winnerError } = await supabase.from("vip_game_winners").insert({
        user_id: user.id,
        username: username,
        prize,
      })

      if (winnerError) {
        console.error("[v0] VIP Game: Error recording winner:", winnerError)
        // Ne pas retourner d'erreur ici, le VIP est déjà activé
      } else {
        console.log("[v0] VIP Game: Winner recorded successfully")
      }
    } else {
      console.log("[v0] VIP Game: No prize won this time")
    }

    console.log("[v0] VIP Game: Returning success response")
    // Renvoie prize ET playedAt pour le front
    return NextResponse.json({ prize, playedAt: playedAtDate })
  } catch (error: any) {
    console.error("[v0] VIP Game: Unexpected error during play:", error)
    return NextResponse.json({ error: `Erreur inattendue: ${error.message || "Erreur inconnue"}` }, { status: 500 })
  }
}
