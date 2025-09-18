"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Globe, Lock, Calendar, Film, Trash2 } from "lucide-react"
import { usePlaylists } from "@/hooks/use-playlists"
import { createClient } from "@/lib/supabase"
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
  const [isOwner, setIsOwner] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && id) {
      loadPlaylistData(id as string)
    }
  }, [mounted, id, user?.id])

  const loadPlaylistData = async (playlistId: string) => {
    try {
      const { data: playlistData, error: playlistError } = await supabase
        .from("playlists")
        .select(`
          *,
          user_profiles!inner(username)
        `)
        .eq("id", playlistId)
        .single()

      if (playlistError || !playlistData) {
        console.error("Playlist not found:", playlistError)
        router.push("/playlists")
        return
      }

      const canAccess = playlistData.is_public || (user?.id && playlistData.user_id === user.id)

      if (!canAccess) {
        toast({
          title: "Accès refusé",
          description: "Cette playlist est privée.",
          variant: "destructive",
        })
        router.push("/playlists")
        return
      }

      setPlaylist({
        ...playlistData,
        username: playlistData.user_profiles?.username || "Utilisateur",
      })
      setIsOwner(user?.id === playlistData.user_id)

      // Load playlist items
      const { data: itemsData, error: itemsError } = await supabase
        .from("playlist_items")
        .select("*")
        .eq("playlist_id", playlistId)
        .order("position", { ascending: true })

      if (!itemsError && itemsData) {
        const processedItems = itemsData.map((item) => ({
          ...item,
          content_type: item.media_type,
          content_id: item.tmdb_id,
        }))
        setPlaylistItems(processedItems)
      }
    } catch (error) {
      console.error("Error loading playlist:", error)
      router.push("/playlists")
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (!playlist || !isOwner) return

    try {
      await removeFromPlaylist(playlist.id, itemId)
      // Reload playlist items
      await loadPlaylistData(playlist.id)
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

  if (!playlist) {
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
    <div className="min-h-screen text-white" style={{ backgroundColor: `${playlist.theme_color}10` }}>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
            style={{ borderColor: playlist.theme_color, color: playlist.theme_color }}
          >
            <Link href={isOwner ? "/playlists" : "/discover/playlists"}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isOwner ? "Retour aux playlists" : "Retour aux playlists publiques"}
            </Link>
          </Button>
        </div>

        {/* Playlist Info */}
        <Card
          className="border-gray-700"
          style={{ backgroundColor: `${playlist.theme_color}20`, borderColor: playlist.theme_color }}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-white text-2xl flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full shadow-lg" style={{ backgroundColor: playlist.theme_color }} />
                  {playlist.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  {playlist.is_public ? (
                    <Badge
                      variant="secondary"
                      className="text-sm"
                      style={{ backgroundColor: playlist.theme_color, color: "white" }}
                    >
                      <Globe className="w-3 h-3 mr-1" />
                      Public
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-sm"
                      style={{ borderColor: playlist.theme_color, color: playlist.theme_color }}
                    >
                      <Lock className="w-3 h-3 mr-1" />
                      Privé
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="text-sm"
                    style={{ borderColor: playlist.theme_color, color: playlist.theme_color }}
                  >
                    <Film className="w-3 h-3 mr-1" />
                    {playlistItems.length} éléments
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-sm"
                    style={{ borderColor: playlist.theme_color, color: playlist.theme_color }}
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(playlist.updated_at).toLocaleDateString()}
                  </Badge>
                </div>
                {!isOwner && <p className="text-gray-300 text-sm mt-2">Créée par {playlist.username}</p>}
              </div>
            </div>
            {playlist.description && (
              <CardDescription className="text-gray-300 mt-3">{playlist.description}</CardDescription>
            )}
          </CardHeader>
        </Card>

        {/* Playlist Content */}
        <Card
          className="border-gray-700"
          style={{ backgroundColor: `${playlist.theme_color}15`, borderColor: playlist.theme_color }}
        >
          <CardHeader>
            <CardTitle className="text-white">Contenu de la playlist</CardTitle>
            <CardDescription className="text-gray-400">Films et séries dans cette playlist</CardDescription>
          </CardHeader>
          <CardContent>
            {playlistItems.length === 0 ? (
              <div className="text-center py-12">
                <Film className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">Cette playlist est vide</p>
                <p className="text-gray-500 text-sm">
                  {isOwner
                    ? "Ajoutez des films et séries depuis leurs pages de détails."
                    : "Cette playlist ne contient aucun élément pour le moment."}
                </p>
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
                          {isOwner && (
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
                          )}
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
