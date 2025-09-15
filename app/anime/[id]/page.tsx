import { getTVShowDetails, getTVShowCredits } from "@/lib/tmdb"
import { TVShowDetails } from "@/components/tv-show-details"
import { notFound } from "next/navigation"

interface AnimePageProps {
  params: {
    id: string
  }
}

export default async function AnimePage({ params }: AnimePageProps) {
  try {
    const [show, credits] = await Promise.all([
      getTVShowDetails(Number.parseInt(params.id)),
      getTVShowCredits(Number.parseInt(params.id)),
    ])

    if (!show) {
      notFound()
    }

    return <TVShowDetails show={show} credits={credits} isAnime />
  } catch (error) {
    console.error("Error fetching anime details:", error)
    notFound()
  }
}
