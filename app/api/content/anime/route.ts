import { type NextRequest, NextResponse } from "next/server"
import { contentUpdater } from "@/lib/content-updater"
import { getPopularAnime } from "@/lib/tmdb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const useCache = searchParams.get("cache") !== "false"

    let data
    if (useCache) {
      // Utiliser le cache pour la première page
      if (page === 1) {
        data = await contentUpdater.getTrendingAnimeCache()
      } else {
        // Pour les autres pages, appeler directement l'API
        data = await getPopularAnime(page)
      }
    } else {
      data = await getPopularAnime(page)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching anime:", error)
    return NextResponse.json({ error: "Failed to fetch anime" }, { status: 500 })
  }
}
