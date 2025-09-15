"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shuffle, Film, Tv, Zap, Clock, Star, Sparkles, ChevronDown, ChevronUp } from "lucide-react"
import { getTrendingMovies, getTrendingTVShows, getTrendingAnime } from "@/lib/tmdb"
import { useRouter } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"

export function RandomContent() {
  const [isExpanded, setIsExpanded] = useState(false)
  const isMobile = useMobile()

  // Ajouter un useEffect pour gérer l'état initial selon le device
  useEffect(() => {
    if (isMobile !== undefined) {
      setIsExpanded(!isMobile) // Ouvert sur desktop, fermé sur mobile
    }
  }, [isMobile])

  const [step, setStep] = useState(0)
  const [preferences, setPreferences] = useState({
    type: "",
    genre: "",
    duration: "",
    rating: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const contentTypes = [
    { id: "movie", label: "Films", icon: Film, color: "from-red-500 to-pink-500" },
    { id: "tv", label: "Séries", icon: Tv, color: "from-blue-500 to-cyan-500" },
    { id: "anime", label: "Anime", icon: Zap, color: "from-purple-500 to-indigo-500" },
  ]

  const genres = [
    "Action",
    "Aventure",
    "Animation",
    "Comédie",
    "Crime",
    "Documentaire",
    "Drame",
    "Famille",
    "Fantastique",
    "Histoire",
    "Horreur",
    "Musique",
    "Mystère",
    "Romance",
    "Science-Fiction",
    "Thriller",
    "Guerre",
    "Western",
  ]

  const durations = [
    { id: "short", label: "Court", icon: Clock },
    { id: "medium", label: "Moyen", icon: Clock },
    { id: "long", label: "Long", icon: Clock },
  ]

  const ratings = [
    { id: "any", label: "Peu importe", icon: Star },
    { id: "good", label: "Bien noté", icon: Star },
    { id: "excellent", label: "Excellent", icon: Star },
  ]

  const handleSurpriseMe = async () => {
    setIsLoading(true)
    setError("")
    try {
      const randomType = Math.random()
      let content
      let contentData

      if (randomType < 0.33) {
        contentData = await getTrendingMovies()
        if (contentData && contentData.results && contentData.results.length > 0) {
          content = contentData.results[Math.floor(Math.random() * contentData.results.length)]
          if (content && content.id) {
            router.push(`/movies/${content.id}`)
            return
          }
        }
      } else if (randomType < 0.66) {
        contentData = await getTrendingTVShows()
        if (contentData && contentData.results && contentData.results.length > 0) {
          content = contentData.results[Math.floor(Math.random() * contentData.results.length)]
          if (content && content.id) {
            router.push(`/tv-shows/${content.id}`)
            return
          }
        }
      } else {
        contentData = await getTrendingAnime()
        if (contentData && contentData.results && contentData.results.length > 0) {
          content = contentData.results[Math.floor(Math.random() * contentData.results.length)]
          if (content && content.id) {
            router.push(`/anime/${content.id}`)
            return
          }
        }
      }

      setError("Aucun contenu disponible pour le moment.")
    } catch (error) {
      console.error("Error getting random content:", error)
      setError("Erreur lors de la récupération du contenu.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetRecommendation = async () => {
    setIsLoading(true)
    setError("")
    try {
      let content
      let contentData

      if (preferences.type === "movie") {
        contentData = await getTrendingMovies()
        if (contentData && contentData.results && contentData.results.length > 0) {
          content = contentData.results[Math.floor(Math.random() * contentData.results.length)]
          if (content && content.id) {
            router.push(`/movies/${content.id}`)
            return
          }
        }
      } else if (preferences.type === "tv") {
        contentData = await getTrendingTVShows()
        if (contentData && contentData.results && contentData.results.length > 0) {
          content = contentData.results[Math.floor(Math.random() * contentData.results.length)]
          if (content && content.id) {
            router.push(`/tv-shows/${content.id}`)
            return
          }
        }
      } else if (preferences.type === "anime") {
        contentData = await getTrendingAnime()
        if (contentData && contentData.results && contentData.results.length > 0) {
          content = contentData.results[Math.floor(Math.random() * contentData.results.length)]
          if (content && content.id) {
            router.push(`/anime/${content.id}`)
            return
          }
        }
      }

      setError("Aucun contenu disponible pour le moment.")
    } catch (error) {
      console.error("Error getting recommendation:", error)
      setError("Erreur lors de la récupération du contenu.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetPreferences = () => {
    setStep(0)
    setPreferences({ type: "", genre: "", duration: "", rating: "" })
    setError("")
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900/50 to-blue-900/30 border-slate-700">
      {/* Header avec bouton toggle */}
      <div className="p-4 border-b border-slate-600">
        <div
          className={`flex items-center justify-center relative ${isMobile ? "cursor-pointer" : ""}`}
          onClick={isMobile ? () => setIsExpanded(!isExpanded) : undefined}
        >
          <div className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-xl md:text-2xl">
              <Sparkles className="h-6 w-6 text-purple-400" />
              Découverte Aléatoire
              <Sparkles className="h-6 w-6 text-purple-400" />
            </CardTitle>
            <p className="text-sm text-gray-400">Laissez-nous vous surprendre !</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={isMobile ? undefined : () => setIsExpanded(!isExpanded)}
            className={`absolute right-0 text-gray-400 hover:text-white hover:bg-slate-700 ${isMobile ? "hidden" : ""}`}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
              <p className="text-red-400 text-sm">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError("")}
                className="mt-2 text-red-400 hover:text-red-300"
              >
                Fermer
              </Button>
            </div>
          )}

          {step === 0 && (
            <div className="space-y-4">
              <p className="text-center text-gray-300 text-sm md:text-base">Que voulez-vous regarder ?</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                {contentTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <Button
                      key={type.id}
                      variant="outline"
                      className={`h-16 md:h-20 flex flex-col gap-2 bg-gradient-to-r ${type.color} bg-opacity-10 border-opacity-30 hover:bg-opacity-20 transition-all duration-300`}
                      onClick={() => {
                        setPreferences({ ...preferences, type: type.id })
                        setStep(1)
                        setError("")
                      }}
                    >
                      <Icon className="h-6 w-6 md:h-8 md:w-8" />
                      <span className="text-sm md:text-base font-medium">{type.label}</span>
                    </Button>
                  )
                })}
              </div>
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleSurpriseMe}
                  disabled={isLoading}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-base md:text-lg shadow-lg"
                >
                  <Shuffle className="h-5 w-5 mr-2" />
                  {isLoading ? "Recherche..." : "Surprise !"}
                </Button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-300 text-sm md:text-base">Genre préféré ?</p>
                <Badge variant="secondary" className="text-xs">
                  {contentTypes.find((t) => t.id === preferences.type)?.label}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {genres.map((genre) => (
                  <Button
                    key={genre}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 hover:bg-blue-500/20"
                    onClick={() => {
                      setPreferences({ ...preferences, genre })
                      setStep(2)
                      setError("")
                    }}
                  >
                    {genre}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2 justify-center">
                <Button variant="ghost" size="sm" onClick={resetPreferences}>
                  Retour
                </Button>
                <Button
                  onClick={() => {
                    setStep(2)
                    setError("")
                  }}
                  variant="secondary"
                  size="sm"
                >
                  Peu importe
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-300 text-sm md:text-base">Durée souhaitée ?</p>
                <div className="flex gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {contentTypes.find((t) => t.id === preferences.type)?.label}
                  </Badge>
                  {preferences.genre && (
                    <Badge variant="outline" className="text-xs">
                      {preferences.genre}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {durations.map((duration) => {
                  const Icon = duration.icon
                  return (
                    <Button
                      key={duration.id}
                      variant="outline"
                      className="h-12 flex items-center gap-2 hover:bg-green-500/20"
                      onClick={() => {
                        setPreferences({ ...preferences, duration: duration.id })
                        setStep(3)
                        setError("")
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{duration.label}</span>
                    </Button>
                  )
                })}
              </div>
              <div className="flex gap-2 justify-center">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  Retour
                </Button>
                <Button
                  onClick={() => {
                    setStep(3)
                    setError("")
                  }}
                  variant="secondary"
                  size="sm"
                >
                  Peu importe
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-300 text-sm md:text-base">Note minimale ?</p>
                <div className="flex gap-1 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {contentTypes.find((t) => t.id === preferences.type)?.label}
                  </Badge>
                  {preferences.genre && (
                    <Badge variant="outline" className="text-xs">
                      {preferences.genre}
                    </Badge>
                  )}
                  {preferences.duration && (
                    <Badge variant="outline" className="text-xs">
                      {durations.find((d) => d.id === preferences.duration)?.label}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {ratings.map((rating) => {
                  const Icon = rating.icon
                  return (
                    <Button
                      key={rating.id}
                      variant="outline"
                      className="h-12 flex items-center gap-2 hover:bg-yellow-500/20"
                      onClick={() => {
                        setPreferences({ ...preferences, rating: rating.id })
                        handleGetRecommendation()
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{rating.label}</span>
                    </Button>
                  )
                })}
              </div>
              <div className="flex gap-2 justify-center">
                <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                  Retour
                </Button>
                <Button
                  onClick={handleGetRecommendation}
                  disabled={isLoading}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  {isLoading ? "Recherche..." : "Ma recommandation"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
