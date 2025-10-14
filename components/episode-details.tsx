"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IframeModal } from "@/components/iframe-modal"
import { BugReportDialog } from "@/components/bug-report-dialog"
import { TrailerModal } from "@/components/trailer-modal"
import { AddToListSelector } from "@/components/add-to-list-selector"
import {
  Play,
  Download,
  Star,
  Clock,
  Calendar,
  Check,
  ArrowLeft,
  AlertTriangle,
  Youtube,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { WatchTracker } from "@/lib/watch-tracking"
import { useUserPreferences } from "@/hooks/use-user-preferences"

interface EpisodeDetailsProps {
  episode: {
    id?: number
    name?: string
    overview?: string
    still_path?: string | null
    air_date?: string
    episode_number?: number
    runtime?: number | null
    vote_average?: number
    vote_count?: number
  }
  showId: number
  seasonNumber: number
  showData?: {
    name?: string
    poster_path?: string | null
  }
  isAnime?: boolean
}

export function EpisodeDetails({ episode, showId, seasonNumber, showData, isAnime = false }: EpisodeDetailsProps) {
  const [showStreamingModal, setShowStreamingModal] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [showTrailerModal, setShowTrailerModal] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isWatched, setIsWatched] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showBugReportDialog, setShowBugReportDialog] = useState(false)
  const [userRating, setUserRating] = useState<"like" | "dislike" | null>(null)
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const { preferences } = useUserPreferences()

  // Valeurs par défaut pour éviter les erreurs
  const episodeName = episode?.name || "Épisode sans titre"
  const episodeOverview = episode?.overview || "Aucun synopsis disponible pour cet épisode."
  const episodeNumber = episode?.episode_number || 1
  const voteAverage = episode?.vote_average || 0
  const airDate = episode?.air_date || ""
  const runtime = episode?.runtime || null
  const stillPath = episode?.still_path || null

  // Simuler les votes totaux basés sur l'ID
  const getTotalVotes = (showId: number, season: number, episode: number, type: "like" | "dislike") => {
    const seed = (showId * 1000 + season * 100 + episode) * (type === "like" ? 7 : 11)
    return Math.floor((seed % 500) + 20)
  }

  const totalLikes = getTotalVotes(showId, seasonNumber, episodeNumber, "like")
  const totalDislikes = getTotalVotes(showId, seasonNumber, episodeNumber, "dislike")

  // Vérifier les états au chargement
  useEffect(() => {
    const episodeId = `${showId}-${seasonNumber}-${episodeNumber}`
    setIsInWishlist(WatchTracker.isInWishlist("episode", episodeId))
    setIsWatched(WatchTracker.isWatched("episode", episodeId))
    setIsFavorite(WatchTracker.isFavorite("episode", episodeId))
    setUserRating(WatchTracker.getRating("episode", episodeId))
  }, [showId, seasonNumber, episodeNumber])

  const backdropUrl = stillPath
    ? `https://image.tmdb.org/t/p/original${stillPath}`
    : "/placeholder.svg?height=1080&width=1920"

  const streamingUrl = `https://embed.wavewatch.xyz/embed/series?tmdb=${showId}&sea=${seasonNumber}&epi=${episodeNumber}`
  const downloadUrl = `https://embed.wavewatch.xyz/download/series?tmdb=${showId}&sea=${seasonNumber}&epi=${episodeNumber}`

  const handleWatch = () => {
    if (user && !isWatched && preferences.autoMarkWatched) {
      const episodeId = `${showId}-${seasonNumber}-${episodeNumber}`
      WatchTracker.markAsWatched("episode", episodeId, episodeName, runtime || 45, {
        showName: showData?.name,
        season: seasonNumber,
        episode: episodeNumber,
        posterPath: stillPath,
      })

      setIsWatched(true)
      toast({
        title: "Épisode marqué comme vu",
        description: `${episodeName} a été ajouté à votre historique.`,
      })
    }
    setShowStreamingModal(true)
  }

  const handleDownload = () => {
    setShowDownloadModal(true)
  }

  const handleWatchTrailer = async () => {
    const url = await getTrailerEmbedUrl()
    setTrailerUrl(url)
    setShowTrailerModal(true)
  }

  const getTrailerEmbedUrl = async () => {
    // Fallback vers une recherche générique pour les épisodes
    const trailerQuery = encodeURIComponent(`${showData?.name} season ${seasonNumber} episode ${episodeNumber} trailer`)
    return `https://www.youtube.com/embed?listType=search&list=${trailerQuery}&autoplay=1`
  }

  const handleLike = () => {
    const episodeId = `${showId}-${seasonNumber}-${episodeNumber}`
    const newRating = WatchTracker.toggleLike("episode", episodeId, episodeName, {
      posterPath: stillPath,
      showId,
      season: seasonNumber,
      episode: episodeNumber,
    })
    setUserRating(newRating)
    toast({
      title: newRating ? "Épisode liké !" : "Like retiré",
      description: newRating ? `Vous avez liké ${episodeName}` : `Like retiré de ${episodeName}`,
    })
  }

  const handleDislike = () => {
    const episodeId = `${showId}-${seasonNumber}-${episodeNumber}`
    const newRating = WatchTracker.toggleDislike("episode", episodeId, episodeName, {
      posterPath: stillPath,
      showId,
      season: seasonNumber,
      episode: episodeNumber,
    })
    setUserRating(newRating)
    toast({
      title: newRating ? "Épisode disliké" : "Dislike retiré",
      description: newRating ? `Vous avez disliké ${episodeName}` : `Dislike retiré de ${episodeName}`,
    })
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
      const episodeId = `${showId}-${seasonNumber}-${episodeNumber}`
      const newState = WatchTracker.toggleFavorite("episode", episodeId, episodeName, stillPath)
      setIsFavorite(newState)
      toast({
        title: newState ? "Ajouté aux favoris" : "Retiré des favoris",
        description: `${episodeName} a été ${newState ? "ajouté à" : "retiré de"} vos favoris.`,
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

    try {
      const episodeId = `${showId}-${seasonNumber}-${episodeNumber}`
      WatchTracker.markAsWatched("episode", episodeId, episodeName, runtime || 45, {
        showName: showData?.name,
        season: seasonNumber,
        episode: episodeNumber,
      })

      const newState = WatchTracker.isWatched("episode", episodeId)
      setIsWatched(newState)

      toast({
        title: newState ? "Marqué comme vu" : "Marqué comme non vu",
        description: `${episodeName} a été marqué comme ${newState ? "vu" : "non vu"}.`,
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date inconnue"
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return "Date inconnue"
    }
  }

  const backUrl = isAnime ? `/anime/${showId}/season/${seasonNumber}` : `/tv-shows/${showId}/season/${seasonNumber}`
  const showUrl = isAnime ? `/anime/${showId}` : `/tv-shows/${showId}`

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
      <div className="container mx-auto px-4 -mt-20 md:-mt-32 lg:-mt-40 relative z-10 mobile-hero-spacing">
        {/* Navigation */}
        <div className="mb-6">
          <Button asChild variant="ghost" className="text-white hover:text-blue-300">
            <Link href={backUrl}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la saison {seasonNumber}
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mobile-grid">
          {/* Still Image */}
          <div className="lg:col-span-1">
            <div className="relative aspect-video w-2/3 sm:w-1/2 md:w-full mx-auto rounded-lg overflow-hidden">
              <Image
                src={
                  stillPath ? `https://image.tmdb.org/t/p/w500${stillPath}` : "/placeholder.svg?height=300&width=500"
                }
                alt={episodeName}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-3 space-y-8">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <Badge variant="secondary" className="bg-gray-800 text-gray-300 border-gray-700">
                    {isAnime ? "Animé" : "Série"} • Saison {seasonNumber} • Épisode {episodeNumber}
                  </Badge>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight text-center md:text-left">
                    {episodeName}
                  </h1>
                  {showData?.name && (
                    <Link
                      href={showUrl}
                      className="text-lg md:text-xl text-blue-400 hover:text-blue-300 block text-center md:text-left"
                    >
                      {showData.name}
                    </Link>
                  )}
                </div>
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
                {voteAverage > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{voteAverage.toFixed(1)}/10</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                  <span>{formatDate(airDate)}</span>
                </div>
                {runtime && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 md:w-5 md:h-5" />
                    <span>{runtime} min</span>
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

              {/* Synopsis */}
              <p className="text-base md:text-lg lg:text-xl text-gray-200 leading-relaxed text-center md:text-left">
                {episodeOverview}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mobile-slider">
                <div className="flex gap-2">
                  {episodeNumber > 1 && (
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800 px-4 py-3 bg-transparent"
                    >
                      <Link
                        href={`${isAnime ? `/anime/${showId}` : `/tv-shows/${showId}`}/season/${seasonNumber}/episode/${episodeNumber - 1}`}
                      >
                        ← Épisode {episodeNumber - 1}
                      </Link>
                    </Button>
                  )}
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 px-4 py-3 bg-transparent"
                  >
                    <Link
                      href={`${isAnime ? `/anime/${showId}` : `/tv-shows/${showId}`}/season/${seasonNumber}/episode/${episodeNumber + 1}`}
                    >
                      Épisode {episodeNumber + 1} →
                    </Link>
                  </Button>
                </div>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-900/20 px-8 py-3 bg-transparent"
                  onClick={handleWatch}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Regarder
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-blue-600 text-blue-400 hover:bg-blue-900/20 px-8 py-3 bg-transparent"
                  onClick={handleDownload}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Télécharger
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-orange-600 text-orange-400 hover:bg-orange-900/20 px-8 py-3 bg-transparent"
                  onClick={handleWatchTrailer}
                >
                  <Youtube className="w-5 h-5 mr-2" />
                  Bande-annonce
                </Button>
                <AddToListSelector
                  content={{
                    id: showId,
                    name: episodeName,
                    poster_path: stillPath,
                    vote_average: voteAverage,
                    first_air_date: airDate,
                  }}
                  contentType="tv"
                  className="px-6 py-3"
                />
                <Button
                  size="lg"
                  variant="outline"
                  className={`border-yellow-600 text-yellow-400 hover:bg-yellow-900/20 px-6 py-3 ${
                    isFavorite ? "bg-yellow-900/20" : ""
                  }`}
                  onClick={handleAddToFavorites}
                >
                  <Star className={`w-5 h-5 mr-2 ${isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
                  {isFavorite ? "Favori" : "Favoris"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={`border-green-600 text-green-400 hover:bg-green-900/20 px-6 py-3 ${
                    isWatched ? "bg-green-900/20" : ""
                  }`}
                  onClick={handleMarkAsWatched}
                >
                  <Check className={`w-5 h-5 mr-2 ${isWatched ? "text-green-500" : ""}`} />
                  {isWatched ? "Vu" : "Marquer vu"}
                </Button>
              </div>

              {/* Navigation Links */}
              <div className="flex gap-4 pt-4">
                <Button
                  asChild
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
                >
                  <Link href={backUrl}>Voir tous les épisodes</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
                >
                  <Link href={showUrl}>Retour à la série</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <IframeModal
        isOpen={showStreamingModal}
        onClose={() => setShowStreamingModal(false)}
        src={streamingUrl}
        title={`Streaming - ${episodeName}`}
      />

      <IframeModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        src={downloadUrl}
        title={`Téléchargement - ${episodeName}`}
      />

      <TrailerModal
        isOpen={showTrailerModal}
        onClose={() => setShowTrailerModal(false)}
        title={`${episodeName} - ${showData?.name}`}
        trailerUrl={trailerUrl}
      />

      <BugReportDialog
        isOpen={showBugReportDialog}
        onClose={() => setShowBugReportDialog(false)}
        contentType="episode"
        contentId={`${showId}-${seasonNumber}-${episodeNumber}`}
        contentTitle={episodeName}
      />
    </div>
  )
}
