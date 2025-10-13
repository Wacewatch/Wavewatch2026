"use client"

import { useState, useEffect } from "react"
import { WatchTracker } from "@/lib/watch-tracking"
import { useToast } from "@/hooks/use-toast"
import { IframeModal } from "@/components/iframe-modal"
import { useRetrogamingSources } from "@/hooks/use-retrogaming-sources"

interface RetrogamingSource {
  id: number
  name: string
  description: string
  url: string
  color: string
  category: string
  is_active?: boolean
}

export default function RetrogamingPage() {
  const { sources: gamingSources, isLoading, error } = useRetrogamingSources()
  const [selectedSource, setSelectedSource] = useState<RetrogamingSource | null>(null)
  const [favorites, setFavorites] = useState<number[]>([])
  const [userRatings, setUserRatings] = useState<Record<number, "like" | "dislike" | null>>({})
  const { toast } = useToast()
  const [showIframe, setShowIframe] = useState(false)

  // Simuler les votes totaux basés sur l'ID
  const getTotalVotes = (id: number, type: "like" | "dislike") => {
    if (!id || typeof id !== "number") return 0
    const seed = id * (type === "like" ? 29 : 31)
    const result = Math.floor((seed % 400) + 50)
    return isNaN(result) ? 0 : result
  }

  useEffect(() => {
    // Charger les favoris et ratings
    const favoriteItems = WatchTracker.getFavoriteItems()
    const gameFavorites = favoriteItems.filter((item) => item.type === "game").map((item) => item.tmdbId)
    setFavorites(gameFavorites)

    // Charger les ratings
    const ratings: Record<number, "like" | "dislike" | null> = {}
    gamingSources.forEach((source) => {
      ratings[source.id] = WatchTracker.getRating("game", source.id)
    })
    setUserRatings(ratings)
  }, [gamingSources])

  const handlePlayGame = (source: RetrogamingSource) => {
    setSelectedSource(source)
    setShowIframe(true)
  }

  const toggleFavorite = (source: RetrogamingSource) => {
    const isCurrentlyFavorite = WatchTracker.isFavorite("game", source.id)
    WatchTracker.toggleFavorite("game", source.id, source.name, {
      logoUrl: source.url,
      url: source.url,
    })

    // Mettre à jour l'état local
    if (isCurrentlyFavorite) {
      setFavorites((prev) => prev.filter((id) => id !== source.id))
    } else {
      setFavorites((prev) => [...prev, source.id])
    }

    toast({
      title: isCurrentlyFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
      description: `${source.name} a été ${isCurrentlyFavorite ? "retiré de" : "ajouté à"} vos favoris.`,
    })
  }

  const handleLike = (source: RetrogamingSource) => {
    const newRating = WatchTracker.toggleLike("game", source.id, source.name, {
      logoUrl: source.url,
    })
    setUserRatings((prev) => ({ ...prev, [source.id]: newRating }))
    toast({
      title: newRating ? "Jeu liké !" : "Like retiré",
      description: newRating ? `Vous avez liké ${source.name}` : `Like retiré de ${source.name}`,
    })
  }

  const handleDislike = (source: RetrogamingSource) => {
    const newRating = WatchTracker.toggleDislike("game", source.id, source.name, {
      logoUrl: source.url,
    })
    setUserRatings((prev) => ({ ...prev, [source.id]: newRating }))
    toast({
      title: newRating ? "Jeu disliké" : "Dislike retiré",
      description: newRating ? `Vous avez disliké ${source.name}` : `Dislike retiré de ${source.name}`,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-300">Chargement des jeux rétro...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
            <span className="text-blue-400">🎮</span>
            Retrogaming
          </h1>
          <p className="text-gray-400">Redécouvrez les jeux classiques directement dans votre navigateur</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gamingSources.map((source) => {
            const isFavorite = favorites.includes(source.id)
            const userRating = userRatings[source.id]
            const totalLikes = getTotalVotes(source.id, "like")
            const totalDislikes = getTotalVotes(source.id, "dislike")

            return (
              <div
                key={source.id}
                className="group overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-700 bg-gray-800 rounded-lg"
              >
                <div className="p-6">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-20 h-20 ${source.color} rounded-2xl flex items-center justify-center`}>
                        <span className="text-3xl">🎮</span>
                      </div>
                      <button
                        onClick={() => toggleFavorite(source)}
                        className={`p-2 rounded-full ${isFavorite ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500"}`}
                      >
                        <span className={`text-xl ${isFavorite ? "❤️" : "🤍"}`}>{isFavorite ? "❤️" : "🤍"}</span>
                      </button>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{source.name}</h3>
                      <p className="text-gray-400 text-sm mb-3">{source.description}</p>
                      <div className="mb-4">
                        <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                          {source.category}
                        </span>
                      </div>
                    </div>

                    {/* Votes compacts */}
                    <div className="flex items-center justify-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2 mb-4">
                      <button
                        className={`p-1 h-auto ${
                          userRating === "like"
                            ? "text-green-500 hover:text-green-400"
                            : "text-gray-400 hover:text-green-500"
                        }`}
                        onClick={() => handleLike(source)}
                      >
                        <span className="text-sm">👍</span>
                      </button>
                      <span className="text-green-500 text-sm font-medium">
                        {Math.max(0, totalLikes + (userRating === "like" ? 1 : 0)) || 0}
                      </span>
                      <div className="w-px h-4 bg-gray-600 mx-1" />
                      <button
                        className={`p-1 h-auto ${
                          userRating === "dislike"
                            ? "text-red-500 hover:text-red-400"
                            : "text-gray-400 hover:text-red-500"
                        }`}
                        onClick={() => handleDislike(source)}
                      >
                        <span className="text-sm">👎</span>
                      </button>
                      <span className="text-red-500 text-sm font-medium">
                        {Math.max(0, totalDislikes + (userRating === "dislike" ? 1 : 0)) || 0}
                      </span>
                    </div>

                    <button
                      className={`w-full ${source.color} hover:opacity-90 text-white py-2 px-4 rounded-lg font-medium`}
                      onClick={() => handlePlayGame(source)}
                    >
                      🎮 Jouer maintenant
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {gamingSources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">Aucun jeu trouvé.</p>
          </div>
        )}
        {selectedSource && (
          <IframeModal
            isOpen={showIframe}
            onClose={() => setShowIframe(false)}
            src={selectedSource.url}
            title={selectedSource.name}
          />
        )}
      </div>
    </div>
  )
}
