"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, ThumbsUp, ThumbsDown, Heart, Calendar, Film, Globe, TrendingUp, Clock } from "lucide-react"
import { usePublicPlaylists } from "@/hooks/use-public-playlists"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"

export function PublicPlaylistsDiscovery() {
  const { user } = useAuth()
  const { playlists, loading, searchQuery, setSearchQuery, toggleLike, toggleFavorite } = usePublicPlaylists()
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "liked">("recent")

  const sortedPlaylists = [...playlists].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.likes_count - b.dislikes_count - (a.likes_count - a.dislikes_count)
      case "liked":
        return b.likes_count - a.likes_count
      case "recent":
      default:
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Chargement des playlists publiques...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Playlists Publiques</h2>
          <p className="text-gray-400">Découvrez les collections créées par la communauté</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={sortBy === "recent" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("recent")}
            className={sortBy === "recent" ? "bg-blue-600" : "border-gray-600 text-gray-300"}
          >
            <Clock className="w-4 h-4 mr-1" />
            Récentes
          </Button>
          <Button
            variant={sortBy === "popular" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("popular")}
            className={sortBy === "popular" ? "bg-blue-600" : "border-gray-600 text-gray-300"}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Populaires
          </Button>
          <Button
            variant={sortBy === "liked" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("liked")}
            className={sortBy === "liked" ? "bg-blue-600" : "border-gray-600 text-gray-300"}
          >
            <ThumbsUp className="w-4 h-4 mr-1" />
            Les plus likées
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher des playlists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-700 text-white"
        />
      </div>

      {/* Playlists Grid */}
      {sortedPlaylists.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? "Aucun résultat" : "Aucune playlist publique"}
            </h3>
            <p className="text-gray-400 text-center">
              {searchQuery ? "Essayez avec d'autres mots-clés" : "Soyez le premier à créer une playlist publique !"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPlaylists.map((playlist) => (
            <Link key={playlist.id} href={`/playlists/${playlist.id}`}>
              <Card
                className={`border-gray-700 hover:border-opacity-80 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                  playlist.theme_color.includes("gradient") ? "animate-gradient" : ""
                }`}
                style={{
                  backgroundColor: `${playlist.theme_color}15`,
                  borderColor: playlist.theme_color,
                  boxShadow: `0 4px 20px ${playlist.theme_color}20`,
                  ...(playlist.theme_color.includes("gradient") && {
                    background: playlist.theme_color,
                    backgroundSize: "200% 200%",
                  }),
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle
                        className="text-white text-lg line-clamp-1 hover:text-opacity-80 transition-colors"
                        title={playlist.title}
                        style={{ color: playlist.theme_color }}
                      >
                        {playlist.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="w-4 h-4 rounded-full shadow-md"
                          style={{ backgroundColor: playlist.theme_color }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Creator info */}
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback
                        className="text-xs"
                        style={{ backgroundColor: `${playlist.theme_color}30`, color: playlist.theme_color }}
                      >
                        {playlist.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-300">par {playlist.username}</span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  {playlist.description && <p className="text-gray-300 text-sm line-clamp-2">{playlist.description}</p>}

                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Film className="w-3 h-3" style={{ color: playlist.theme_color }} />
                        <span>{playlist.items_count} éléments</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" style={{ color: playlist.theme_color }} />
                      <span>{new Date(playlist.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center justify-between pt-2"
                    style={{ borderTopColor: playlist.theme_color, borderTopWidth: "1px", borderTopStyle: "solid" }}
                  >
                    <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleLike(playlist.id, true)
                        }}
                        className={`text-gray-400 hover:text-green-400 ${playlist.is_liked ? "text-green-400" : ""}`}
                        disabled={!user}
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        {playlist.likes_count}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleLike(playlist.id, false)
                        }}
                        className={`text-gray-400 hover:text-red-400 ${playlist.is_disliked ? "text-red-400" : ""}`}
                        disabled={!user}
                      >
                        <ThumbsDown className="w-4 h-4 mr-1" />
                        {playlist.dislikes_count}
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleFavorite(playlist.id)
                      }}
                      className={`text-gray-400 hover:text-pink-400 ${playlist.is_favorited ? "text-pink-400" : ""}`}
                      disabled={!user}
                    >
                      <Heart className={`w-4 h-4 ${playlist.is_favorited ? "fill-current" : ""}`} />
                    </Button>
                  </div>

                  {!user && (
                    <p className="text-xs text-gray-500 text-center">
                      Connectez-vous pour interagir avec les playlists
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
