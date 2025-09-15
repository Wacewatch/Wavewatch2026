"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Star, Film, Tv, ChevronDown, ChevronUp } from "lucide-react"
import { getUpcomingMovies, getUpcomingTVShows } from "@/lib/tmdb"
import Link from "next/link"
import Image from "next/image"
import { useMobile } from "@/hooks/use-mobile"

interface CalendarEvent {
  id: number
  title: string
  type: "movie" | "tv"
  date: string
  poster_path?: string
  vote_average?: number
  overview?: string
}

export function CalendarWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const isMobile = useMobile()

  useEffect(() => {
    if (isMobile !== undefined) {
      setIsExpanded(!isMobile) // Ouvert sur desktop, fermé sur mobile
    }
  }, [isMobile])

  useEffect(() => {
    const fetchUpcomingContent = async () => {
      try {
        setLoading(true)
        setError(null)

        // Récupérer plus de pages pour avoir plus de contenu
        const [moviesResponse1, moviesResponse2, moviesResponse3] = await Promise.all([
          getUpcomingMovies(1),
          getUpcomingMovies(2),
          getUpcomingMovies(3),
        ])

        const [tvResponse1, tvResponse2, tvResponse3] = await Promise.all([
          getUpcomingTVShows(1),
          getUpcomingTVShows(2),
          getUpcomingTVShows(3),
        ])

        // Combiner toutes les pages de films
        const allMovies = [...moviesResponse1.results, ...moviesResponse2.results, ...moviesResponse3.results]

        // Combiner toutes les pages de séries
        const allTVShows = [...tvResponse1.results, ...tvResponse2.results, ...tvResponse3.results]

        const movieEvents: CalendarEvent[] = allMovies
          .filter((movie: any) => {
            const releaseDate = new Date(movie.release_date)
            const today = new Date()
            return releaseDate >= today
          })
          .slice(0, 20) // Augmenter à 20 films
          .map((movie: any) => ({
            id: movie.id,
            title: movie.title,
            type: "movie" as const,
            date: movie.release_date,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            overview: movie.overview,
          }))

        const tvEvents: CalendarEvent[] = allTVShows
          .filter((show: any) => {
            const airDate = new Date(show.first_air_date)
            const today = new Date()
            return airDate >= today
          })
          .slice(0, 20) // Augmenter à 20 séries
          .map((show: any) => ({
            id: show.id,
            title: show.name,
            type: "tv" as const,
            date: show.first_air_date,
            poster_path: show.poster_path,
            vote_average: show.vote_average,
            overview: show.overview,
          }))

        // Combiner et trier par date
        const allEvents = [...movieEvents, ...tvEvents]
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 15) // Afficher 15 événements au lieu de 5

        setEvents(allEvents)
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err)
        setError("Impossible de charger les prochaines sorties")
      } finally {
        setLoading(false)
      }
    }

    fetchUpcomingContent()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return "Demain"
    if (diffDays < 7) return `Dans ${diffDays} jours`

    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: diffDays > 365 ? "numeric" : undefined,
    })
  }

  const getEventLink = (event: CalendarEvent) => {
    return event.type === "movie" ? `/movies/${event.id}` : `/tv-shows/${event.id}`
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-950 to-purple-900 border-blue-700">
        <CardHeader>
          <div
            className={`flex items-center justify-center relative ${isMobile ? "cursor-pointer" : ""}`}
            onClick={isMobile ? () => setIsExpanded(!isExpanded) : undefined}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Calendar className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-white">Prochaines sorties</CardTitle>
              </div>
              <CardDescription className="text-blue-300">Chargement des prochaines sorties...</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={isMobile ? undefined : () => setIsExpanded(!isExpanded)}
              className={`absolute right-0 text-gray-400 hover:text-white hover:bg-blue-800 ${isMobile ? "hidden" : ""}`}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-blue-900/30">
                  <div className="w-12 h-16 bg-blue-800 rounded animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-blue-800 rounded animate-pulse" />
                    <div className="h-3 bg-blue-800 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-blue-950 to-purple-900 border-blue-700">
        <CardHeader>
          <div
            className={`flex items-center justify-center relative ${isMobile ? "cursor-pointer" : ""}`}
            onClick={isMobile ? () => setIsExpanded(!isExpanded) : undefined}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Calendar className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-white">Prochaines sorties</CardTitle>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={isMobile ? undefined : () => setIsExpanded(!isExpanded)}
              className={`absolute right-0 text-gray-400 hover:text-white hover:bg-blue-800 ${isMobile ? "hidden" : ""}`}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent>
            <p className="text-red-300 text-center py-4">{error}</p>
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-blue-950 to-purple-900 border-blue-700">
      <CardHeader>
        <div
          className={`flex items-center justify-center relative ${isMobile ? "cursor-pointer" : ""}`}
          onClick={isMobile ? () => setIsExpanded(!isExpanded) : undefined}
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-white">Prochaines sorties</CardTitle>
            </div>
            <CardDescription className="text-blue-300">Films et séries à venir selon TMDB</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={isMobile ? undefined : () => setIsExpanded(!isExpanded)}
            className={`absolute right-0 text-gray-400 hover:text-white hover:bg-blue-800 ${isMobile ? "hidden" : ""}`}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {events.length === 0 ? (
            <p className="text-blue-300 text-center py-4">Aucune sortie prévue prochainement</p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <Link key={`${event.type}-${event.id}`} href={getEventLink(event)} className="block group">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-900/30 hover:bg-blue-800/50 transition-colors border border-blue-700/50 hover:border-blue-600">
                    <div className="relative w-12 h-16 flex-shrink-0">
                      <Image
                        src={
                          event.poster_path
                            ? `https://image.tmdb.org/t/p/w200${event.poster_path}`
                            : "/placeholder.svg?height=64&width=48"
                        }
                        alt={event.title}
                        fill
                        className="object-cover rounded"
                        sizes="48px"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-white truncate group-hover:text-blue-300 transition-colors">
                          {event.title}
                        </h4>
                        {event.type === "movie" ? (
                          <Film className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Tv className="w-4 h-4 text-green-400" />
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-blue-300">
                        <Badge variant="outline" className="border-blue-600 text-blue-300">
                          {event.type === "movie" ? "Film" : "Série"}
                        </Badge>

                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(event.date)}
                        </div>

                        {event.vote_average && event.vote_average > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            {event.vote_average.toFixed(1)}
                          </div>
                        )}
                      </div>

                      {event.overview && (
                        <p className="text-xs text-blue-200 mt-1 line-clamp-2">
                          {event.overview.length > 100 ? `${event.overview.substring(0, 100)}...` : event.overview}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Bouton pour voir plus */}
          <div className="pt-4 border-t border-blue-700">
            <Button asChild variant="outline" className="w-full border-blue-600 text-white hover:bg-blue-800">
              <Link href="/calendar">
                <Calendar className="w-4 h-4 mr-2" />
                Voir le calendrier complet
              </Link>
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
