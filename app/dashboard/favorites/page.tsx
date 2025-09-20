"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star } from "lucide-react"
import { WatchTracker } from "@/lib/watch-tracking"
import Image from "next/image"
import Link from "next/link"

export default function FavoritesPage() {
  const { user } = useAuth()
  const [favoriteItems, setFavoriteItems] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setFavoriteItems(WatchTracker.getFavoriteItems())

    const handleUpdate = () => {
      setFavoriteItems(WatchTracker.getFavoriteItems())
    }

    window.addEventListener("favorites-updated", handleUpdate)
    return () => window.removeEventListener("favorites-updated", handleUpdate)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">Chargement...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-white">Accès refusé</h1>
            <p className="text-gray-300">Vous devez être connecté pour accéder à cette page.</p>
          </div>
        </div>
      </div>
    )
  }

  // Grouper les favoris par type
  const groupedFavorites = favoriteItems.reduce(
    (acc, item) => {
      const type = item.type || "other"
      if (!acc[type]) acc[type] = []
      acc[type].push(item)
      return acc
    },
    {} as Record<string, any[]>,
  )

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "movie":
        return "Films"
      case "tv":
        return "Séries"
      case "tv-channel":
        return "Chaînes TV"
      case "radio":
        return "Radios"
      case "actor":
        return "Acteurs"
      case "playlist":
        return "Playlists"
      default:
        return "Autres"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "movie":
        return "bg-red-600"
      case "tv":
        return "bg-blue-600"
      case "tv-channel":
        return "bg-purple-600"
      case "radio":
        return "bg-green-600"
      case "actor":
        return "bg-orange-600"
      case "playlist":
        return "bg-pink-600"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Mes Favoris</h1>
            <p className="text-gray-400">Vos films, séries, chaînes TV, radios et acteurs préférés</p>
          </div>
        </div>

        {favoriteItems.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-12">
              <Star className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">Aucun favori pour le moment</p>
              <p className="text-gray-500 text-sm">
                Ajoutez des contenus à vos favoris depuis leurs pages de détails pour les retrouver ici.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedFavorites).map(([type, items]) => (
              <Card key={type} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Star className="h-5 w-5 text-yellow-400" />
                    {getTypeLabel(type)} ({items.length})
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Vos {getTypeLabel(type).toLowerCase()} favoris
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {items.map((item) => {
                      let imageUrl = "/placeholder.svg?height=300&width=200"

                      if (item.posterPath) {
                        if (item.posterPath.startsWith("http")) {
                          imageUrl = item.posterPath
                        } else {
                          imageUrl = `https://image.tmdb.org/t/p/w300${item.posterPath}`
                        }
                      } else if (item.profilePath) {
                        imageUrl = `https://image.tmdb.org/t/p/w300${item.profilePath}`
                      } else if (item.logoUrl) {
                        imageUrl = item.logoUrl
                      }

                      const getItemUrl = () => {
                        switch (item.type) {
                          case "movie":
                            return `/movies/${item.tmdbId}`
                          case "tv":
                            return `/tv-shows/${item.tmdbId}`
                          case "tv-channel":
                            return `/tv-channels`
                          case "radio":
                            return `/radio`
                          case "actor":
                            return `/actors/${item.tmdbId}`
                          case "playlist":
                            return `/playlists/${item.id}` // Use item.id instead of tmdbId for playlists
                          default:
                            return `/movies/${item.tmdbId}`
                        }
                      }

                      return (
                        <Link key={item.id} href={getItemUrl()}>
                          <div className="space-y-2 group cursor-pointer">
                            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-700">
                              <Image
                                src={imageUrl || "/placeholder.svg"}
                                alt={item.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 12.5vw"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = "/placeholder.svg?height=300&width=200"
                                }}
                              />
                              <div className="absolute top-2 right-2">
                                <Badge variant="secondary" className="bg-yellow-600 text-white text-xs">
                                  <Star className="w-3 h-3" />
                                </Badge>
                              </div>
                              <div className="absolute bottom-2 left-2">
                                <Badge variant="secondary" className={`text-xs text-white ${getTypeColor(item.type)}`}>
                                  {getTypeLabel(item.type).slice(0, -1)}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium line-clamp-2 group-hover:text-blue-400 text-white">
                                {item.title}
                              </p>
                              <p className="text-xs text-gray-400">{new Date(item.addedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
