import { getSeasonDetails, getTVShowDetails } from "@/lib/tmdb"
import { EpisodeDetails } from "@/components/episode-details"
import { notFound } from "next/navigation"

interface EpisodePageProps {
  params: {
    id: string
    season: string
    episode: string
  }
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  try {
    const showId = Number.parseInt(params.id)
    const seasonNumber = Number.parseInt(params.season)
    const episodeNumber = Number.parseInt(params.episode)

    if (isNaN(showId) || isNaN(seasonNumber) || isNaN(episodeNumber)) {
      notFound()
    }

    // Récupérer les détails de la série et de la saison
    const [showData, seasonData] = await Promise.all([getTVShowDetails(showId), getSeasonDetails(showId, seasonNumber)])

    if (!showData || !seasonData?.episodes) {
      notFound()
    }

    // Trouver l'épisode spécifique
    const episode = seasonData.episodes.find((ep: any) => ep.episode_number === episodeNumber)

    if (!episode) {
      notFound()
    }

    return (
      <EpisodeDetails
        episode={episode}
        showId={showId}
        seasonNumber={seasonNumber}
        showData={showData}
        isAnime={false}
      />
    )
  } catch (error) {
    console.error("Error fetching episode details:", error)
    notFound()
  }
}
