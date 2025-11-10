import { type NextRequest, NextResponse } from "next/server"

const API_KEY = process.env.FOOTBALL_API_KEY || "test"
const API_HOST = "v3.football.api-sports.io"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Fetching live football matches")

    const response = await fetch(`https://${API_HOST}/fixtures?live=all&timezone=Europe/Paris`, {
      method: "GET",
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": API_HOST,
      },
      next: { revalidate: 60 }, // Cache 1 minute pour les matchs en direct
    })

    if (!response.ok) {
      console.error("[v0] Football live API error:", response.status)
      return NextResponse.json({ fixtures: [], error: null }, { status: 200 })
    }

    const data = await response.json()
    console.log("[v0] Live football matches:", data.response?.length || 0)

    return NextResponse.json({
      fixtures: data.response || [],
      error: null,
    })
  } catch (error: any) {
    console.error("[v0] Error fetching live matches:", error)
    return NextResponse.json({ fixtures: [], error: null }, { status: 200 })
  }
}
