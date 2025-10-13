import { type NextRequest, NextResponse } from "next/server"
import { contentUpdater } from "@/lib/content-updater"
import { getPopularTVShows } from "@/lib/tmdb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const useCache = searchParams.get("cache") !== "false"

    let data
    if (useCache) {
      // Utiliser le cache pour la première page
      if (page === 1) {
        data = await contentUpdater.getTrendingTVShowsCache()
      } else {
        // Pour les autres pages, appeler directement l'API
        data = await getPopularTVShows(page)
      }
    } else {
      data = await getPopularTVShows(page)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching TV shows:", error)
    return NextResponse.json({ error: "Failed to fetch TV shows" }, { status: 500 })
  }
}
