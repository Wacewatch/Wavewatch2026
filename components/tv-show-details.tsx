"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { IframeModal } from "@/components/iframe-modal"
import { BugReportDialog } from "@/components/bug-report-dialog"
import { TrailerModal } from "@/components/trailer-modal"
import { AddToListSelector } from "@/components/add-to-list-selector"
import { ClassificationBadge } from "@/components/classification-badge"
import {
  Star,
  Calendar,
  Check,
  Play,
  Download,
  AlertTriangle,
  Youtube,
  ThumbsUp,
  ThumbsDown,
  Shuffle,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { WatchTracker } from "@/lib/watch-tracking"
import { CastList } from "@/components/cast-list"
import { useRouter } from "next/navigation"
import { useUserPreferences } from "@/hooks/use-user-preferences"

interface TVShowDetailsProps {
  show: any
  credits: any
  isAnime?: boolean
}

export function TVShowDetails({ show, credits, isAnime = false }: TVShowDetailsProps) {
  const [showStreamingModal, setShowStreamingModal] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [showTrailerModal, setShowTrailerModal] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isWatched, setIsWatched] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showBugReportDialog, setShowBugReportDialog] = useState(false)
  const [similarShows, setSimilarShows] = useState<any[]>([])
  const [isMarkingWatched, setIsMarkingWatched] = useState(false)
  const [userRating, setUserRating] = useState<"like" | "dislike" | null>(null)
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null)
  const [certification, setCertification] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [scrollPosition, setScrollPosition] = useState(0)
  const similarShowsRef = useRef<HTMLDivElement>(null)
  const { preferences } = useUserPreferences()

  // Simuler les votes totaux basés sur l'ID
  const getTotalVotes = (id: number, type: "like" | "dislike") => {
    const seed = id * (type === "like" ? 7 : 11)
    return Math.floor((seed % 1000) + 50)
  }

  const totalLikes = getTotalVotes(show.id, "like")
  const totalDislikes = getTotalVotes(show.id, "dislike")

  // Vérifier les états au chargement
  useEffect(() => {
    setIsInWishlist(WatchTracker.isInWishlist("tv", show.id))
    setIsWatched(WatchTracker.isWatched("tv", show.id))
    setIsFavorite(WatchTracker.isFavorite("tv", show.id))
    setUserRating(WatchTracker.getRating("tv", show.id))
  }, [show.id])

  // Fetch similar shows
  useEffect(() => {
    const fetchSimilarShows = async () => {
      try {
        const response = await fetch(`/api/tmdb/similar/tv/${show.id}`)
        if (response.ok) {
          const similarData = await response.json()
          setSimilarShows(similarData.results.slice(0, 12))
        }
      } catch (error) {
        console.error("Error fetching similar shows:", error)
      }
    }

    fetchSimilarShows()
  }, [show.id])

  useEffect(() => {
    const fetchCertification = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/${show.id}/content_ratings?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
        )
        if (response.ok) {
          const data = await response.json()
          // Find US or FR rating
          const usRating = data.results?.find((r: any) => r.iso_3166_1 === "US")
          const frRating = data.results?.find((r: any) => r.iso_3166_1 === "FR")

          const cert = frRating?.rating || usRating?.rating
          if (cert) {
            setCertification(cert)
          }
        }
      } catch (error) {
        console.error("Error fetching certification:", error)
      }
    }

    fetchCertification()
  }, [show.id])

  const posterUrl = show.poster_path
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : "/placeholder.svg?height=750&width=500"

  const backdropUrl = show.backdrop_path
    ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
    : "/placeholder.svg?height=1080&width=1920"

  const streamingUrl = `https://embed.wavewatch.xyz/embed/series?tmdb=${show.id}`
  const downloadUrl = `https://embed.wavewatch.xyz/download/series?tmdb=${show.id}`

  const handleRandomEpisode = () => {
    if (show.seasons && show.seasons.length > 0) {
      const availableSeasons = show.seasons.filter(
        (season: any) => season.season_number > 0 && season.episode_count > 0,
      )
      if (availableSeasons.length > 0) {
        const randomSeason = availableSeasons[Math.floor(Math.random() * availableSeasons.length)]
        const randomEpisode = Math.floor(Math.random() * randomSeason.episode_count) + 1
        const episodePath = `/${isAnime ? "anime" : "tv-shows"}/${show.id}/season/${randomSeason.season_number}/episode/${randomEpisode}`

        toast({
          title: "Épisode aléatoire sélectionné !",
          description: `${randomSeason.name} - Épisode ${randomEpisode}`,
        })

        router.push(episodePath)
      } else {
        toast({
          title: "Aucun épisode disponible",
          description: "Cette série n'a pas d'épisodes disponibles.",
          variant: "destructive",
        })
      }
    }
  }

  const handleWatch = async () => {
    // Marquer seulement le premier épisode de la première saison comme vu si l'utilisateur a activé cette préférence
    if (user && !isWatched && preferences.autoMarkWatched) {
      setIsMarkingWatched(true)
      try {
        // Trouver la première saison valide
        const firstSeason = show.seasons.find((season: any) => season.season_number === 1)

        if (firstSeason) {
          // Marquer seulement le premier épisode
          WatchTracker.markEpisodeAsWatched(
            show.id,
            show.name,
            1, // season number
            1, // episode number
            "Episode 1",
            45, // runtime
            {
              genre: show.genres[0]?.name,
              rating: Math.round(show.vote_average),
              posterPath: show.poster_path,
            },
          )

          toast({
            title: "Premier épisode marqué comme vu",
            description: `${show.name} S01E01 a été ajouté à votre historique.`,
          })
        }
      } catch (error) {
        console.error("Error marking as watched:", error)
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors du marquage.",
          variant: "destructive",
        })
      } finally {
        setIsMarkingWatched(false)
      }
    }
    setShowStreamingModal(true)
  }

  const handleDownload = () => {
    setShowDownloadModal(true)
  }

  const handleLike = () => {
    const newRating = WatchTracker.toggleLike("tv", show.id, show.name, {
      posterPath: show.poster_path,
    })
    setUserRating(newRating)
    toast({
      title: newRating ? "Série likée !" : "Like retiré",
      description: newRating ? `Vous avez liké ${show.name}` : `Like retiré de ${show.name}`,
    })
  }

  const handleDislike = () => {
    const newRating = WatchTracker.toggleDislike("tv", show.id, show.name, {
      posterPath: show.poster_path,
    })
    setUserRating(newRating)
    toast({
      title: newRating ? "Série dislikée" : "Dislike retiré",
      description: newRating ? `Vous avez disliké ${show.name}` : `Dislike retiré de ${show.name}`,
    })
  }

  const handleAddToWishlist = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour ajouter à votre wishlist.",
        variant: "destructive",
      })
      return
    }

    try {
      const newState = WatchTracker.toggleWishlist("tv", show.id, show.name, show.poster_path)
      setIsInWishlist(newState)
      toast({
        title: newState ? "Ajouté à la wishlist" : "Retiré de la wishlist",
        description: `${show.name} a été ${newState ? "ajouté à" : "retiré de"} votre wishlist.`,
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue.",
        variant: "destructive",
      })
    }
  }

  const handleAddToFavorites = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour ajouter aux favoris.",
        variant: "destructive",
      })
      return
    }

    try {
      const newState = WatchTracker.toggleFavorite("tv", show.id, show.name, {
        posterPath: show.poster_path,
      })
      setIsFavorite(newState)
      toast({
        title: newState ? "Ajouté aux favoris" : "Retiré des favoris",
        description: `${show.name} a été ${newState ? "ajouté à" : "retiré de"} vos favoris.`,
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue.",
        variant: "destructive",
      })
    }
  }

  const handleMarkAsWatched = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour marquer comme vu.",
        variant: "destructive",
      })
      return
    }

    setIsMarkingWatched(true)

    try {
      console.log("Début du marquage de la série:", show.name)
      console.log("Saisons disponibles:", show.seasons)

      // Utiliser les données déjà disponibles pour éviter les appels API
      const validSeasons = show.seasons.filter((season: any) => season.season_number > 0)
      console.log("Saisons valides:", validSeasons)

      // Créer une structure d'épisodes basée sur episode_count de chaque saison
      const seasonsWithEpisodes = validSeasons.map((season: any) => {
        const episodeCount = season.episode_count || 10 // Fallback à 10 épisodes
        const episodes = Array.from({ length: episodeCount }, (_, index) => ({
          id: season.id * 1000 + index + 1,
          episode_number: index + 1,
          name: `Episode ${index + 1}`,
          runtime: 45, // Durée moyenne d'un épisode
          still_path: null,
        }))

        console.log(`Saison ${season.season_number}: ${episodes.length} épisodes créés`)

        return {
          ...season,
          episodes,
        }
      })

      // Calculer le nombre total d'épisodes et la durée
      const totalEpisodes = seasonsWithEpisodes.reduce((sum, season) => sum + season.episodes.length, 0)
      const totalDuration = totalEpisodes * 45 // 45 minutes par épisode

      console.log(`Total épisodes calculé: ${totalEpisodes}, Durée totale: ${totalDuration} minutes`)

      // Marquer la série et tous ses épisodes comme vus
      WatchTracker.markAsWatched("tv", show.id, show.name, totalDuration, {
        genre: show.genres[0]?.name,
        rating: Math.round(show.vote_average),
        posterPath: show.poster_path,
        seasons: seasonsWithEpisodes,
      })

      const newState = WatchTracker.isWatched("tv", show.id)
      setIsWatched(newState)

      // Compter les épisodes marqués pour vérification
      const watchedItems = WatchTracker.getWatchedItems()
      const episodesMarked = watchedItems.filter((item) => item.type === "episode" && item.showId === show.id).length

      console.log(`Épisodes marqués dans le tracker: ${episodesMarked}`)

      toast({
        title: newState ? "Série marquée comme vue" : "Série marquée comme non vue",
        description: newState
          ? `${show.name} et ses ${totalEpisodes} épisodes ont été marqués comme vus.`
          : `${show.name} et tous ses épisodes ont été marqués comme non vus.`,
      })

      // Forcer la mise à jour des statistiques
      window.dispatchEvent(new Event("watchlist-updated"))
    } catch (error) {
      console.error("Error marking as watched:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du marquage.",
        variant: "destructive",
      })
    } finally {
      setIsMarkingWatched(false)
    }
  }

  const handleWatchTrailer = async () => {
    const url = await getTrailerEmbedUrl()
    setTrailerUrl(url)
    setShowTrailerModal(true)
  }

  const getTrailerEmbedUrl = async () => {
    try {
      if (show.videos && show.videos.results && show.videos.results.length > 0) {
        // Find the first trailer or teaser
        const trailer =
          show.videos.results.find((video: any) => video.type === "Trailer" && video.site === "YouTube") ||
          show.videos.results.find((video: any) => video.type === "Teaser" && video.site === "YouTube") ||
          show.videos.results.find((video: any) => video.site === "YouTube")

        if (trailer && trailer.key) {
          return `https://www.youtube.com/embed/${trailer.key}?autoplay=1`
        }
      }
    } catch (error) {
      console.error("Error getting TMDB trailer:", error)
    }

    // Fallback vers une recherche générique si pas de vidéo TMDB
    const trailerQuery = encodeURIComponent(`${show.name} ${new Date(show.first_air_date).getFullYear()} trailer`)
    return `https://www.youtube.com/embed?listType=search&list=${trailerQuery}&autoplay=1`
  }

  const scrollLeft = () => {
    if (similarShowsRef.current) {
      similarShowsRef.current.scrollBy({
        left: -500,
        behavior: "smooth",
      })
      setScrollPosition(similarShowsRef.current.scrollLeft - 500)
    }
  }

  const scrollRight = () => {
    if (similarShowsRef.current) {
      similarShowsRef.current.scrollBy({
        left: 500,
        behavior: "smooth",
      })
      setScrollPosition(similarShowsRef.current.scrollLeft + 500)
    }
  }

  return (
    <div className="min-h-screen bg-black no-horizontal-scroll">
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-20 md:-mt-32 lg:-mt-40 mobile-hero-spacing relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 mobile-grid">
          {/* Poster */}
          <div className="lg:col-span-1">
            <div className="relative aspect-[2/3] w-2/3 sm:w-1/2 md:w-full mx-auto rounded-lg overflow-hidden">
              <Image src={posterUrl || "/placeholder.svg"} alt={show.name} fill className="object-cover" />
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-3 space-y-8">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight text-center md:text-left w-full md:w-auto">
                  {show.name}
                </h1>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-red-600 text-red-500 hover:bg-red-900/20 bg-transparent flex-shrink-0 ml-2"
                  onClick={() => setShowBugReportDialog(true)}
                >
                  <AlertTriangle className="w-5 h-5" />
                </Button>
              </div>

              {/* Info Bar */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-6 text-gray-300 text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{show.vote_average.toFixed(1)}/10</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                  <span>{new Date(show.first_air_date).getFullYear()}</span>
                </div>
                <div>
                  <span>
                    {show.number_of_seasons} saison{show.number_of_seasons > 1 ? "s" : ""}
                  </span>
                </div>
                <div>
                  <span>{show.number_of_episodes} épisodes</span>
                </div>
                <ClassificationBadge certification={certification} />
                {/* Votes compacts */}
                <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-1 h-auto ${
                      userRating === "like"
                        ? "text-green-500 hover:text-green-400"
                        : "text-gray-400 hover:text-green-500"
                    }`}
                    onClick={handleLike}
                  >
                    <ThumbsUp className={`w-4 h-4 ${userRating === "like" ? "fill-current" : ""}`} />
                  </Button>
                  <span className="text-green-500 text-sm font-medium">
                    {totalLikes + (userRating === "like" ? 1 : 0)}
                  </span>
                  <div className="w-px h-4 bg-gray-600 mx-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-1 h-auto ${
                      userRating === "dislike" ? "text-red-500 hover:text-red-400" : "text-gray-400 hover:text-red-500"
                    }`}
                    onClick={handleDislike}
                  >
                    <ThumbsDown className={`w-4 h-4 ${userRating === "dislike" ? "fill-current" : ""}`} />
                  </Button>
                  <span className="text-red-500 text-sm font-medium">
                    {totalDislikes + (userRating === "dislike" ? 1 : 0)}
                  </span>
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {show.genres.map((genre: any) => (
                  <Badge key={genre.id} variant="secondary" className="bg-gray-800 text-gray-300 border-gray-700">
                    {genre.name}
                  </Badge>
                ))}
              </div>

              <p className="text-base md:text-lg lg:text-xl text-gray-200 leading-relaxed text-center md:text-left">
                {show.overview}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-900/20 px-4 md:px-6 py-3 bg-transparent"
                  onClick={handleWatch}
                  disabled={isMarkingWatched}
                >
                  <Play className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  {isMarkingWatched ? "Marquage..." : "Regarder"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-blue-600 text-blue-400 hover:bg-blue-900/20 px-4 md:px-6 py-3 bg-transparent"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Télécharger
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-purple-600 text-purple-400 hover:bg-purple-900/20 px-4 md:px-6 py-3 bg-transparent"
                  onClick={handleRandomEpisode}
                >
                  <Shuffle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Épisode aléatoire
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-orange-600 text-orange-400 hover:bg-orange-900/20 px-4 md:px-6 py-3 bg-transparent"
                  onClick={handleWatchTrailer}
                >
                  <Youtube className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Bande-annonce
                </Button>
              </div>

              {/* Secondary Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <AddToListSelector
                  content={{
                    id: show.id,
                    name: show.name,
                    poster_path: show.poster_path,
                    vote_average: show.vote_average,
                    first_air_date: show.first_air_date,
                  }}
                  contentType="tv"
                  className="w-full sm:w-auto"
                />
                <Button
                  size="lg"
                  variant="outline"
                  className={`border-yellow-600 text-yellow-400 hover:bg-yellow-900/20 px-4 md:px-6 py-3 ${
                    isFavorite ? "bg-yellow-900/20" : ""
                  }`}
                  onClick={handleAddToFavorites}
                >
                  <Star
                    className={`w-4 h-4 md:w-5 md:h-5 mr-2 ${isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`}
                  />
                  {isFavorite ? "Favori" : "Favoris"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={`border-green-600 text-green-400 hover:bg-green-900/20 px-4 md:px-6 py-3 ${
                    isWatched ? "bg-green-900/20" : ""
                  }`}
                  onClick={handleMarkAsWatched}
                  disabled={isMarkingWatched}
                >
                  <Check className={`w-4 h-4 md:w-5 md:h-5 mr-2 ${isWatched ? "text-green-500" : ""}`} />
                  {isMarkingWatched ? "Marquage..." : isWatched ? "Série vue" : "Marquer série vue"}
                </Button>
              </div>
            </div>

            {/* Seasons */}
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Saisons</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {show.seasons
                  .filter((season: any) => season.season_number > 0)
                  .map((season: any) => (
                    <Link
                      key={season.id}
                      href={`/${isAnime ? "anime" : "tv-shows"}/${show.id}/season/${season.season_number}`}
                    >
                      <Card className="group overflow-hidden hover:scale-105 transition-transform duration-200 border-gray-800 bg-gray-900/50">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className="relative w-16 h-24 flex-shrink-0">
                              <Image
                                src={
                                  season.poster_path
                                    ? `https://image.tmdb.org/t/p/w200${season.poster_path}`
                                    : "/placeholder.svg?height=120&width=80"
                                }
                                alt={season.name}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                {season.name}
                              </h3>
                              <p className="text-sm text-gray-400 mt-1">{season.episode_count} épisodes</p>
                              {season.air_date && (
                                <p className="text-sm text-gray-400">{new Date(season.air_date).getFullYear()}</p>
                              )}
                              <div className="flex items-center mt-2">
                                <Play className="w-4 h-4 mr-1 text-blue-400" />
                                <span className="text-sm text-blue-400">Voir les épisodes</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
              </div>
            </div>

            {/* Cast */}
            {credits.cast && credits.cast.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white">Casting</h2>
                <CastList cast={credits.cast} />
              </div>
            )}

            {/* Similar Shows Section */}
            {similarShows.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white">Séries similaires</h2>

                <div className="mobile-slider">
                  <div className="flex gap-3 md:gap-4 pb-4 overflow-x-auto md:grid md:grid-cols-4 lg:grid-cols-6 md:overflow-visible">
                    {similarShows.map((similarShow: any) => (
                      <Link key={similarShow.id} href={`/${isAnime ? "anime" : "tv-shows"}/${similarShow.id}`}>
                        <div className="space-y-2 group cursor-pointer w-40 md:w-auto flex-shrink-0">
                          <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                            <Image
                              src={
                                similarShow.poster_path
                                  ? `https://image.tmdb.org/t/p/w300${similarShow.poster_path}`
                                  : "/placeholder.svg?height=450&width=300"
                              }
                              alt={similarShow.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                              sizes="(max-width: 768px) 160px, (max-width: 1200px) 25vw, 16vw"
                            />
                          </div>
                          <div className="px-1">
                            <p className="text-sm font-medium line-clamp-2 group-hover:text-blue-400 text-white">
                              {similarShow.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {similarShow.first_air_date ? new Date(similarShow.first_air_date).getFullYear() : "N/A"}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <IframeModal
        isOpen={showStreamingModal}
        onClose={() => setShowStreamingModal(false)}
        src={streamingUrl}
        title={`Streaming - ${show.name}`}
      />

      <IframeModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        src={downloadUrl}
        title={`Téléchargement - ${show.name}`}
      />

      <TrailerModal
        isOpen={showTrailerModal}
        onClose={() => setShowTrailerModal(false)}
        title={show.name}
        trailerUrl={trailerUrl}
      />

      <BugReportDialog
        isOpen={showBugReportDialog}
        onClose={() => setShowBugReportDialog(false)}
        contentType={isAnime ? "anime" : "tv"}
        contentId={show.id}
        contentTitle={show.name}
      />
    </div>
  )
}
