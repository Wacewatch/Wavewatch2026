import { getDirectorDetails, getDirectorCredits } from "@/lib/tmdb"
import { DirectorDetails } from "@/components/director-details"
import { notFound } from "next/navigation"

interface DirectorPageProps {
  params: {
    id: string
  }
}

export default async function DirectorPage({ params }: DirectorPageProps) {
  try {
    const [director, credits] = await Promise.all([
      getDirectorDetails(Number.parseInt(params.id)),
      getDirectorCredits(Number.parseInt(params.id)),
    ])

    if (!director) {
      notFound()
    }

    return <DirectorDetails director={director} credits={credits} />
  } catch (error) {
    console.error("Error fetching director details:", error)
    notFound()
  }
}
