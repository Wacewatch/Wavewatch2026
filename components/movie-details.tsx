"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { IframeModal } from "@/components/iframe-modal"
import { BugReportDialog } from "@/components/bug-report-dialog"
import { TrailerModal } from "@/components/trailer-modal"
import { AddToListSelector } from "@/components/add-to-list-selector"
import {
  Star,
  Calendar,
  Clock,
  Check,
  Play,
  Download,
  AlertTriangle,
  Youtube,
  ThumbsUp,
  ThumbsDown,
  Film,
  User,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { WatchTracker } from "@/lib/watch-tracking"
import { CastList } from "@/components/cast-list"
import { useUserPreferences } from "@/hooks/use-user-preferences"

interface MovieDetailsProps {
  movie: any
  credits: any
}

export function MovieDetails({ movie, credits }: MovieDetailsProps) {
  const [showStreamingModal, setShowStreamingModal] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [showTrailerModal, setShowTrailerModal] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isWatched, setIsWatched] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showBugReportDialog, setShowBugReportDialog] = useState(false)
  const [similarMovies, setSimilarMovies] = useState<any[]>([])
  const [collection, setCollection] = useState<any>(null)
  const [userRating, setUserRating] = useState<"like" | "dislike" | null>(null)
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const { preferences } = useUserPreferences()

  // Get director from credits
  const director = credits?.crew?.find((person: any) => person.job === "Director")

  // Simuler les votes totaux basés sur l'ID
  const getTotalVotes = (id: number, type: "like" | "dislike") => {
    const seed = id * (type === "like" ? 7 : 11)
    return Math.floor((seed % 1000) + 50)
  }

  const totalLikes = getTotalVotes(movie.id, "like")
  const totalDislikes = getTotalVotes(movie.id, "dislike")

  // Vérifier les états au chargement
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsInWishlist(WatchTracker.isInWishlist("movie", movie.id))
      setIsWatched(WatchTracker.isWatched("movie", movie.id))
      setIsFavorite(WatchTracker.isFavorite("movie", movie.id))
      setUserRating(WatchTracker.getRating("movie", movie.id))
    }
  }, [movie.id])

  // Fetch similar movies and collection
  useEffect(() => {
    const fetchData = async () => {
      try {
        const similarResponse = await fetch(`/api/tmdb/similar/movies/${movie.id}`)
        if (similarResponse.ok) {
          const similarData = await similarResponse.json()
          setSimilarMovies(similarData.results.slice(0, 12))
        }

        if (movie.belongs_to_collection) {
          const collectionResponse = await fetch(`/api/tmdb/collection/${movie.belongs_to_collection.id}`)
          if (collectionResponse.ok) {
            const collectionData = await collectionResponse.json()
            setCollection(collectionData)
          }
        }
      } catch (error) {
        console.error("Error fetching movie data:", error)
      }
    }

    fetchData()
  }, [movie.id, movie.belongs_to_collection])

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder.svg?height=750&width=500"

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : "/placeholder.svg?height=1080&width=1920"

  const streamingUrl = `https://embed.wavewatch.xyz/embed/movie?tmdb=${movie.id}`
  const downloadUrl = `https://embed.wavewatch.xyz/download/movie?tmdb=${movie.id}`

  const handleWatch = async () => {
    if (user) {
      try {
        console.log("[v0] Tracking watch for movie:", movie.title)
        WatchTracker.markAsWatched("movie", movie.id, movie.title, movie.runtime || 120, {
          genre: movie.genres[0]?.name,
          rating: Math.round(movie.vote_average),
          posterPath: movie.poster_path,
        })

        // Only update the UI state if auto-mark is enabled
        if (preferences.autoMarkWatched) {
          setIsWatched(true)
        }

        toast({
          title: "Ajouté à l'historique",
          description: `${movie.title} a été ajouté à votre historique.`,
        })
      } catch (error) {
        console.error("Error tracking watch:", error)
      }
    }
    setShowStreamingModal(true)
  }

  const handleDownload = () => {
    setShowDownloadModal(true)
  }

  const handleLike = () => {
    if (typeof window === "undefined") return

    const newRating = WatchTracker.toggleLike("movie", movie.id, movie.title, {
      posterPath: movie.poster_path,
    })
    setUserRating(newRating)
    toast({
      title: newRating ? "Film liké !" : "Like retiré",
      description: newRating ? `Vous avez liké ${movie.title}` : `Like retiré de ${movie.title}`,
    })
  }

  const handleDislike = () => {
    if (typeof window === "undefined") return

    const newRating = WatchTracker.toggleDislike("movie", movie.id, movie.title, {
      posterPath: movie.poster_path,
    })
    setUserRating(newRating)
    toast({
      title: newRating ? "Film disliké" : "Dislike retiré",
      description: newRating ? `Vous avez disliké ${movie.title}` : `Dislike retiré de ${movie.title}`,
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

    if (typeof window === "undefined") return

    try {
      const newState = WatchTracker.toggleWishlist("movie", movie.id, movie.title, movie.poster_path)
      setIsInWishlist(newState)
      toast({
        title: newState ? "Ajouté à la wishlist" : "Retiré de la wishlist",
        description: `${movie.title} a été ${newState ? "ajouté à" : "retiré de"} votre wishlist.`,
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

    if (typeof window === "undefined") return

    try {
      const newState = WatchTracker.toggleFavorite("movie", movie.id, movie.title, {
        posterPath: movie.poster_path,
      })
      setIsFavorite(newState)
      toast({
        title: newState ? "Ajouté aux favoris" : "Retiré des favoris",
        description: `${movie.title} a été ${newState ? "ajouté à" : "retiré de"} vos favoris.`,
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

    if (typeof window === "undefined") return

    try {
      // Use the existing markAsWatched method which handles toggling internally
      WatchTracker.markAsWatched("movie", movie.id, movie.title, movie.runtime || 120, {
        genre: movie.genres[0]?.name,
        rating: Math.round(movie.vote_average),
        posterPath: movie.poster_path,
      })

      // Update the state based on the new watched status
      const newWatchedState = WatchTracker.isWatched("movie", movie.id)
      setIsWatched(newWatchedState)

      toast({
        title: newWatchedState ? "Film marqué comme vu" : "Film marqué comme non vu",
        description: newWatchedState
          ? `${movie.title} a été ajouté à votre historique.`
          : `${movie.title} a été retiré de votre historique.`,
      })

      // Forcer la mise à jour des statistiques
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("watchlist-updated"))
      }
    } catch (error) {
      console.error("Error toggling watched status:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du marquage.",
        variant: "destructive",
      })
    }
  }

  const handleWatchTrailer = async () => {
    const url = await getTrailerEmbedUrl()
    setTrailerUrl(url)
    setShowTrailerModal(true)
  }

  const getTrailerEmbedUrl = async () => {
    try {
      if (movie.videos && movie.videos.results && movie.videos.results.length > 0) {
        // Find the first trailer or teaser
        const trailer =
          movie.videos.results.find((video: any) => video.type === "Trailer" && video.site === "YouTube") ||
          movie.videos.results.find((video: any) => video.type === "Teaser" && video.site === "YouTube") ||
          movie.videos.results.find((video: any) => video.site === "YouTube")

        if (trailer && trailer.key) {
          return `https://www.youtube.com/embed/${trailer.key}?autoplay=1`
        }
      }
    } catch (error) {
      console.error("Error getting TMDB trailer:", error)
    }

    // Fallback vers une recherche générique si pas de vidéo TMDB
    const trailerQuery = encodeURIComponent(`${movie.title} ${new Date(movie.release_date).getFullYear()} trailer`)
    return `https://www.youtube.com/embed?listType=search&list=${trailerQuery}&autoplay=1`
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
            <Card className="overflow-hidden border-gray-800 bg-gray-900/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="relative aspect-[2/3]">
                  <Image src={posterUrl || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details */}
          <div className="lg:col-span-3 space-y-8">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold text-white leading-tight">{movie.title}</h1>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-red-600 text-red-500 hover:bg-red-900/20 bg-transparent"
                  onClick={() => setShowBugReportDialog(true)}
                >
                  <AlertTriangle className="w-5 h-5" />
                </Button>
              </div>

              {/* Info Bar */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-gray-300">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-medium">{movie.vote_average.toFixed(1)}/10</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                </div>
                {movie.runtime && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{movie.runtime} min</span>
                  </div>
                )}
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

              {/* Director */}
              {director && (
                <div className="flex items-center gap-2 text-gray-300">
                  <User className="w-5 h-5" />
                  <span>Réalisé par</span>
                  <Link
                    href={`/directors/${director.id}`}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    {director.name}
                  </Link>
                </div>
              )}

              {/* Genres - Now clickable */}
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre: any) => (
                  <Link key={genre.id} href={`/movies?genre=${genre.id}`}>
                    <Badge
                      variant="secondary"
                      className="bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white transition-colors cursor-pointer"
                    >
                      {genre.name}
                    </Badge>
                  </Link>
                ))}
              </div>

              <p className="text-lg md:text-xl text-gray-200 leading-relaxed">{movie.overview}</p>

              {/* Action Buttons - Responsive Fix */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-900/20 w-full sm:w-auto bg-transparent"
                  onClick={handleWatch}
                >
                  <Play className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Regarder
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-blue-600 text-blue-400 hover:bg-blue-900/20 w-full sm:w-auto bg-transparent"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Télécharger
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-orange-600 text-orange-400 hover:bg-orange-900/20 w-full sm:w-auto bg-transparent"
                  onClick={handleWatchTrailer}
                >
                  <Youtube className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Bande-annonce
                </Button>
                <AddToListSelector content={movie} contentType="movie" className="w-full sm:w-auto" />
                <Button
                  size="lg"
                  variant="outline"
                  className={`border-yellow-600 text-yellow-400 hover:bg-yellow-900/20 w-full sm:w-auto ${
                    isFavorite ? "bg-yellow-900/20" : ""
                  }`}
                  onClick={handleAddToFavorites}
                >
                  <Star
                    className={`w-4 h-4 md:w-5 md:h-5 mr-2 ${isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`}
                  />
                  Favoris
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={`border-green-600 text-green-400 hover:bg-green-900/20 w-full sm:w-auto ${
                    isWatched ? "bg-green-900/20" : ""
                  }`}
                  onClick={handleMarkAsWatched}
                >
                  <Check className={`w-4 h-4 md:w-5 md:h-5 mr-2 ${isWatched ? "text-green-500" : ""}`} />
                  {isWatched ? "Film vu" : "Marquer comme vu"}
                </Button>
              </div>
            </div>

            {/* Cast */}
            {credits.cast && credits.cast.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white">Casting</h2>
                <CastList cast={credits.cast} />
              </div>
            )}

            {/* Collection/Saga Section */}
            {collection && collection.parts && collection.parts.length > 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                  <Film className="w-6 h-6" />
                  Saga : {collection.name}
                </h2>

                <div className="mobile-slider">
                  <div className="flex gap-3 md:gap-4 pb-4 overflow-x-auto md:grid md:grid-cols-4 lg:grid-cols-6 md:overflow-visible">
                    {collection.parts
                      .sort(
                        (a: any, b: any) =>
                          new Date(a.release_date || "").getTime() - new Date(b.release_date || "").getTime(),
                      )
                      .map((collectionMovie: any) => (
                        <Link key={collectionMovie.id} href={`/movies/${collectionMovie.id}`}>
                          <div className="space-y-2 group cursor-pointer w-40 md:w-auto flex-shrink-0">
                            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                              <Image
                                src={
                                  collectionMovie.poster_path
                                    ? `https://image.tmdb.org/t/p/w300${collectionMovie.poster_path}`
                                    : "/placeholder.svg?height=450&width=300"
                                }
                                alt={collectionMovie.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                                sizes="(max-width: 768px) 160px, (max-width: 1200px) 25vw, 16vw"
                              />
                              {collectionMovie.id === movie.id && (
                                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                  Actuel
                                </div>
                              )}
                            </div>
                            <div className="px-1">
                              <p className="text-sm font-medium line-clamp-2 group-hover:text-blue-400 text-white">
                                {collectionMovie.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {collectionMovie.release_date
                                  ? new Date(collectionMovie.release_date).getFullYear()
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Similar Movies Section */}
            {similarMovies.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white">Films similaires</h2>

                <div className="mobile-slider">
                  <div className="flex gap-3 md:gap-4 pb-4 overflow-x-auto md:grid md:grid-cols-4 lg:grid-cols-6 md:overflow-visible">
                    {similarMovies.map((similarMovie: any) => (
                      <Link key={similarMovie.id} href={`/movies/${similarMovie.id}`}>
                        <div className="space-y-2 group cursor-pointer w-40 md:w-auto flex-shrink-0">
                          <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                            <Image
                              src={
                                similarMovie.poster_path
                                  ? `https://image.tmdb.org/t/p/w300${similarMovie.poster_path}`
                                  : "/placeholder.svg?height=450&width=300"
                              }
                              alt={similarMovie.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                              sizes="(max-width: 768px) 160px, (max-width: 1200px) 25vw, 16vw"
                            />
                          </div>
                          <div className="px-1">
                            <p className="text-sm font-medium line-clamp-2 group-hover:text-blue-400 text-white">
                              {similarMovie.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {similarMovie.release_date ? new Date(similarMovie.release_date).getFullYear() : "N/A"}
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
        title={`Streaming - ${movie.title}`}
      />

      <IframeModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        src={downloadUrl}
        title={`Téléchargement - ${movie.title}`}
      />

      <TrailerModal
        isOpen={showTrailerModal}
        onClose={() => setShowTrailerModal(false)}
        title={movie.title}
        trailerUrl={trailerUrl}
      />

      <BugReportDialog
        isOpen={showBugReportDialog}
        onClose={() => setShowBugReportDialog(false)}
        contentType="movie"
        contentId={movie.id}
        contentTitle={movie.title}
      />
    </div>
  )
}
