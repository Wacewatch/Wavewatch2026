"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Globe, Lock, Calendar, Film, Trash2 } from "lucide-react"
import { usePlaylists } from "@/hooks/use-playlists"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

export default function PlaylistContentPage() {
  const { user } = useAuth()
  const { id } = useParams()
  const router = useRouter()
  const { playlists, getPlaylistItems, removeFromPlaylist, loading } = usePlaylists()
  const [playlist, setPlaylist] = useState<any>(null)
  const [playlistItems, setPlaylistItems] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && id && playlists.length > 0) {
      const foundPlaylist = playlists.find((p) => p.id === id)
      if (foundPlaylist) {
        setPlaylist(foundPlaylist)
        loadPlaylistItems(id as string)
      } else {
        // Playlist not found, redirect to playlists page
        router.push("/playlists")
      }
    }
  }, [mounted, id, playlists, router])

  const loadPlaylistItems = async (playlistId: string) => {
    try {
      const items = await getPlaylistItems(playlistId)
      setPlaylistItems(items)
    } catch (error) {
      console.error("Error loading playlist items:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger le contenu de la playlist.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (!playlist) return

    try {
      await removeFromPlaylist(playlist.id, itemId)
      // Reload playlist items
      await loadPlaylistItems(playlist.id)
      toast({
        title: "Élément supprimé",
        description: "L'élément a été retiré de la playlist.",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'élément.",
        variant: "destructive",
      })
    }
  }

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

  if (loading || !playlist) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Chargement de la playlist...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
          >
            <Link href="/playlists">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux playlists
            </Link>
          </Button>
        </div>

        {/* Playlist Info */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-white text-2xl flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: playlist.theme_color }} />
                  {playlist.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  {playlist.is_public ? (
                    <Badge variant="secondary" className="text-sm">
                      <Globe className="w-3 h-3 mr-1" />
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-sm border-gray-600">
                      <Lock className="w-3 h-3 mr-1" />
                      Privé
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-sm border-gray-600">
                    <Film className="w-3 h-3 mr-1" />
                    {playlistItems.length} éléments
                  </Badge>
                  <Badge variant="outline" className="text-sm border-gray-600">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(playlist.updated_at).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
            </div>
            {playlist.description && (
              <CardDescription className="text-gray-400 mt-3">{playlist.description}</CardDescription>
            )}
          </CardHeader>
        </Card>

        {/* Playlist Content */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Contenu de la playlist</CardTitle>
            <CardDescription className="text-gray-400">Films et séries dans cette playlist</CardDescription>
          </CardHeader>
          <CardContent>
            {playlistItems.length === 0 ? (
              <div className="text-center py-12">
                <Film className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">Cette playlist est vide</p>
                <p className="text-gray-500 text-sm">Ajoutez des films et séries depuis leurs pages de détails.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {playlistItems.map((item) => {
                  let imageUrl = "/placeholder.svg?height=300&width=200"

                  if (item.poster_path) {
                    if (item.poster_path.startsWith("http")) {
                      imageUrl = item.poster_path
                    } else {
                      imageUrl = `https://image.tmdb.org/t/p/w300${item.poster_path}`
                    }
                  }

                  const getItemUrl = () => {
                    if (item.media_type === "movie" || item.content_type === "movie") {
                      return `/movies/${item.tmdb_id || item.content_id}`
                    } else if (item.media_type === "tv" || item.content_type === "tv") {
                      return `/tv-shows/${item.tmdb_id || item.content_id}`
                    }
                    return `/movies/${item.tmdb_id || item.content_id}`
                  }

                  return (
                    <div key={item.id} className="space-y-2 group">
                      <Link href={getItemUrl()}>
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-700 cursor-pointer">
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
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleRemoveItem(item.id)
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="absolute bottom-2 left-2">
                            <Badge
                              variant="secondary"
                              className="text-xs"
                              style={{ backgroundColor: `${playlist.theme_color}20`, color: playlist.theme_color }}
                            >
                              {item.media_type === "movie" || item.content_type === "movie" ? "Film" : "Série"}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                      <div>
                        <Link href={getItemUrl()}>
                          <p className="text-sm font-medium line-clamp-2 group-hover:text-blue-400 text-white cursor-pointer">
                            {item.title}
                          </p>
                        </Link>
                        <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
