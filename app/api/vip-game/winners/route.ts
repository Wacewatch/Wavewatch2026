import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createClient()

    const { data: winners, error } = await supabase
      .from("vip_game_winners")
      .select("*")
      .order("won_at", { ascending: false })
      .limit(20)

    if (error) throw error

    return NextResponse.json({ winners: winners || [] })
  } catch (error) {
    console.error("Error fetching winners:", error)
    return NextResponse.json({ winners: [] })
  }
}
