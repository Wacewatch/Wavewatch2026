import { type NextRequest, NextResponse } from "next/server"
import { getTrendingTVShows } from "@/lib/tmdb"
import { createClient } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get user preferences for adult content filtering
    let showAdultContent = true // Default to showing adult content for non-authenticated users

    if (user) {
      const { data: preferences } = await supabase
        .from("user_preferences")
        .select("show_adult_content")
        .eq("user_id", user.id)
        .single()

      showAdultContent = preferences?.show_adult_content ?? true
    }

    const data = await getTrendingTVShows(page)

    if (!showAdultContent && data?.results) {
      data.results = data.results.filter((show: any) => !show.adult)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching trending TV shows:", error)
    return NextResponse.json({ error: "Failed to fetch trending TV shows" }, { status: 500 })
  }
}
