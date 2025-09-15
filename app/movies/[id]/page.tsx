import { getMovieDetails, getMovieCredits } from "@/lib/tmdb"
import { MovieDetails } from "@/components/movie-details"
import { notFound } from "next/navigation"

interface MoviePageProps {
  params: {
    id: string
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  try {
    const [movie, credits] = await Promise.all([
      getMovieDetails(Number.parseInt(params.id)),
      getMovieCredits(Number.parseInt(params.id)),
    ])

    if (!movie) {
      notFound()
    }

    return <MovieDetails movie={movie} credits={credits} />
  } catch (error) {
    console.error("Error fetching movie details:", error)
    notFound()
  }
}
