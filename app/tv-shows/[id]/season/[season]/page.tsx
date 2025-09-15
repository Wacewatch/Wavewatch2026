import { getSeasonDetails } from "@/lib/tmdb"
import { SeasonDetails } from "@/components/season-details"
import { notFound } from "next/navigation"

interface SeasonPageProps {
  params: {
    id: string
    season: string
  }
}

export default async function SeasonPage({ params }: SeasonPageProps) {
  try {
    const seasonData = await getSeasonDetails(Number.parseInt(params.id), Number.parseInt(params.season))

    if (!seasonData) {
      notFound()
    }

    return <SeasonDetails season={seasonData} showId={Number.parseInt(params.id)} />
  } catch (error) {
    console.error("Error fetching season details:", error)
    notFound()
  }
}
