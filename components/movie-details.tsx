"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClassificationBadge } from "@/components/classification-badge"
import { CastList } from "@/components/cast-list"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { WatchTracker } from "@/lib/watch-tracking"
import { IframeModal } from "@/components/iframe-modal"
import { TrailerModal } from "@/components/trailer-modal"
import { AddToListSelector } from "@/components/add-to-list-selector"
import {
  Star,
  Calendar,
  Clock,
  Check,
  Play,
  Download,
  Youtube,
  ThumbsUp,
  ThumbsDown,
  Film,
  User,
  ExternalLink,
} from "lucide-react"
import { WatchProviders } from "@/components/watch-providers"

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
  const [similarMovies, setSimilarMovies] = useState<any[]>([])
  const [collection, setCollection] = useState<any>(null)
  const [userRating, setUserRating] = useState<"like" | "dislike" | null>(null)
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null)
  const [certification, setCertification] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

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

  useEffect(() => {
    const fetchCertification = async () => {
      try {
        const response = await fetch(`/api/tmdb/movie/${movie.id}/release-dates`)
        if (response.ok) {
          const data = await response.json()
          // Find US or FR certification
          const usRelease = data.results?.find((r: any) => r.iso_3166_1 === "US")
          const frRelease = data.results?.find((r: any) => r.iso_3166_1 === "FR")

          const cert = frRelease?.release_dates?.[0]?.certification || usRelease?.release_dates?.[0]?.certification
          if (cert) {
            setCertification(cert)
          }
        }
      } catch (error) {
        console.error("Error fetching certification:", error)
      }
    }

    fetchCertification()
  }, [movie.id])

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

  const getReleaseStatus = () => {
    const releaseDate = new Date(movie.release_date)
    const today = new Date()

    if (releaseDate > today) {
      return { status: "coming-soon", label: "À venir", color: "bg-blue-600" }
    } else {
      return { status: "released", label: "Disponible", color: "bg-green-600" }
    }
  }

  const releaseStatus = getReleaseStatus()

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
            <div className="relative aspect-[2/3] w-full max-w-[200px] mx-auto lg:max-w-none rounded-lg overflow-hidden">
              <Image src={posterUrl || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
            </div>
            <div className="mt-4 flex justify-center">
              <Badge className={`${releaseStatus.color} text-white px-4 py-1.5 text-sm font-medium`}>
                {releaseStatus.label}
              </Badge>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-3 space-y-8">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-xl md:text-3xl lg:text-5xl font-bold text-white leading-tight text-center md:text-left">
                  {movie.title}
                </h1>
                <a
                  href={`https://www.themoviedb.org/movie/${movie.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#01b4e4] hover:bg-[#0299c5] text-white rounded-lg transition-colors self-center md:self-auto"
                  title="Voir sur TMDB"
                >
                  <svg className="w-8 h-8" viewBox="0 0 190.24 81.52">
                    <defs>
                      <linearGradient
                        id="linear-gradient"
                        y1="40.76"
                        x2="190.24"
                        y2="40.76"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0" stopColor="#90cea1" />
                        <stop offset=".56" stopColor="#3cbec9" />
                        <stop offset="1" stopColor="#00b3e5" />
                      </linearGradient>
                    </defs>
                    <path
                      fill="url(#linear-gradient)"
                      d="M105.67,36.06h66.9A17.67,17.67,0,0,0,190.24,18.4h0A17.67,17.67,0,0,0,172.57.73h-66.9A17.67,17.67,0,0,0,88,18.4h0A17.67,17.67,0,0,0,105.67,36.06Zm-88,45h76.9A17.67,17.67,0,0,0,112.24,63.4h0A17.67,17.67,0,0,0,94.57,45.73H17.67A17.67,17.67,0,0,0,0,63.4H0A17.67,17.67,0,0,0,17.67,81.06ZM10.41,35.42h7.8V6.92h10.1V0H.31v6.9h10.1Zm28.1,0h7.8V8.25h.1l9,27.15h6l9.3-27.15h.1V35.4h7.8V0H66.76l-8.2,23.1h-.1L50.31,0H38.51ZM152.43,55.67a15.07,15.07,0,0,0-4.52-5.52,18.57,18.57,0,0,0-6.68-3.08,33.54,33.54,0,0,0-8.07-1h-11.7v35.4h12.75a24.58,24.58,0,0,0,7.55-1.15A19.34,19.34,0,0,0,148.11,77a16.27,16.27,0,0,0,4.37-5.5,16.91,16.91,0,0,0,1.63-7.58A18.5,18.5,0,0,0,152.43,55.67Zm-8.31,11.92a8.94,8.94,0,0,1-1.87,3.31,9.49,9.49,0,0,1-3.25,2.35,11.92,11.92,0,0,1-4.73.9H128.7v-21h5.3a17,17,0,0,1,4.58.65,10.24,10.24,0,0,1,3.43,1.95,8.09,8.09,0,0,1,2.13,3.23,11.94,11.94,0,0,1,.74,4.29A13.38,13.38,0,0,1,144.12,67.59Zm29.19-20.66a10.07,10.07,0,0,0-4.18,3.57,15.48,15.48,0,0,0-2.37,5.16,23.93,23.93,0,0,0-.77,6.24,19.16,19.16,0,0,0,.87,6.08A14.77,14.77,0,0,0,169.3,73a10.21,10.21,0,0,0,4.18,3.5,14.35,14.35,0,0,0,12.08,0,10.21,10.21,0,0,0,4.18-3.5,14.77,14.77,0,0,0,2.44-5.06,19.16,19.16,0,0,0,.87-6.08,23.93,23.93,0,0,0-.77-6.24,15.48,15.48,0,0,0-2.37-5.16,10.07,10.07,0,0,0-4.18-3.57,13.77,13.77,0,0,0-6.07-1.33A13.89,13.89,0,0,0,173.31,46.93Zm8.16,19.65a8.18,8.18,0,0,1-1.08,3.07,5.1,5.1,0,0,1-2,2,6.12,6.12,0,0,1-3.06.73,6.12,6.12,0,0,1-3.06-.73,5.1,5.1,0,0,1-2-2,8.18,8.18,0,0,1-1.08-3.07,18.94,18.94,0,0,1-.33-3.77,21.07,21.07,0,0,1,.33-3.87,8.59,8.59,0,0,1,1.08-3.15,5.1,5.1,0,0,1,2-2.12,6.12,6.12,0,0,1,3.06-.73,6.12,6.12,0,0,1,3.06.73,5.1,5.1,0,0,1,2,2.12,8.59,8.59,0,0,1,1.08,3.15,21.07,21.07,0,0,1,.33,3.87A18.94,18.94,0,0,1,181.47,66.58Z"
                    />
                  </svg>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Info Bar */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-gray-300">
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

              {/* Director */}
              {director && (
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-300">
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
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
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

              {/* Synopsis */}
              <p className="text-base md:text-xl text-gray-200 leading-relaxed text-center md:text-left">
                {movie.overview}
              </p>

              {/* Watch Providers Section - Mobile */}
              {movie["watch/providers"] && (
                <div className="md:hidden">
                  <WatchProviders providers={movie["watch/providers"]} />
                </div>
              )}

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

              {/* Watch Providers Section for desktop */}
              {movie["watch/providers"] && (
                <div className="hidden md:block">
                  <WatchProviders providers={movie["watch/providers"]} />
                </div>
              )}
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
    </div>
  )
}
