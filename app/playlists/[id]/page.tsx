"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Globe, Lock, Calendar, Film, X } from "lucide-react"
import { usePlaylists } from "@/hooks/use-playlists"
import { createClient } from "@/lib/supabase"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const [contentFilter, setContentFilter] = useState<"all" | "movie" | "tv">("all")

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
        .select("*")
        .eq("id", playlistId)
        .single()

      if (playlistError || !playlistData) {
        console.error("Playlist not found:", playlistError)
        router.push("/discover/playlists")
        return
      }

      let username = "Utilisateur"
      if (playlistData.user_id) {
        const { data: userProfile } = await supabase
          .from("user_profiles")
          .select("username")
          .eq("id", playlistData.user_id)
          .single()

        if (userProfile?.username) {
          username = userProfile.username
        }
      }

      const { data: likesData } = await supabase.from("playlist_likes").select("is_like").eq("playlist_id", playlistId)

      const { data: itemsCountData } = await supabase.from("playlist_items").select("id").eq("playlist_id", playlistId)

      const likesCount = likesData?.filter((like) => like.is_like).length || 0
      const dislikesCount = likesData?.filter((like) => !like.is_like).length || 0
      const itemsCount = itemsCountData?.length || 0

      const canAccess = playlistData.is_public || (user?.id && playlistData.user_id === user.id)

      if (!canAccess) {
        toast({
          title: "Accès refusé",
          description: "Cette playlist est privée.",
          variant: "destructive",
        })
        router.push("/discover/playlists")
        return
      }

      const enhancedPlaylist = {
        ...playlistData,
        username: username,
        likes_count: likesCount,
        dislikes_count: dislikesCount,
        items_count: itemsCount,
      }

      setPlaylist(enhancedPlaylist)
      setIsOwner(user?.id === playlistData.user_id)

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
      router.push("/discover/playlists")
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (!playlist || !isOwner) return

    try {
      await removeFromPlaylist(playlist.id, itemId)
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

  const filteredPlaylistItems = playlistItems.filter((item) => {
    if (contentFilter === "all") return true
    const itemType = item.media_type || item.content_type
    return itemType === contentFilter
  })

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
            <Link href="/discover/playlists">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux playlists publiques
            </Link>
          </Button>
        </div>

        {/* Playlist Info */}
        <Card
          className="border-gray-700"
          style={{ backgroundColor: `${playlist.theme_color}20`, borderColor: playlist.theme_color }}
        >
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-white text-2xl flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full shadow-lg" style={{ backgroundColor: playlist.theme_color }} />
                  {playlist.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
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
                    {playlist.items_count} éléments
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
                <p className="text-gray-300 text-sm mt-2">Créée par {playlist.username}</p>
              </div>
              {playlist.is_public && (
                <div className="flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto bg-transparent"
                    style={{ borderColor: playlist.theme_color, color: playlist.theme_color }}
                    onClick={async () => {
                      const shareUrl = `${window.location.origin}/playlists/${playlist.id}`

                      if (navigator.share) {
                        try {
                          await navigator.share({
                            title: playlist.title,
                            text: playlist.description || `Découvrez la playlist "${playlist.title}" sur WaveWatch`,
                            url: shareUrl,
                          })
                        } catch (error) {
                          // User cancelled sharing
                        }
                      } else {
                        try {
                          await navigator.clipboard.writeText(shareUrl)
                          toast({
                            title: "Lien copié",
                            description: "Le lien de la playlist a été copié dans le presse-papiers",
                          })
                        } catch (error) {
                          toast({
                            title: "Erreur",
                            description: "Impossible de copier le lien",
                            variant: "destructive",
                          })
                        }
                      }
                    }}
                  >
                    Partager
                  </Button>
                </div>
              )}
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-white">Contenu de la playlist</CardTitle>
                <CardDescription className="text-gray-400">Films et séries dans cette playlist</CardDescription>
              </div>
              <Tabs value={contentFilter} onValueChange={(value) => setContentFilter(value as any)}>
                <TabsList className="bg-gray-800 border-gray-700">
                  <TabsTrigger value="all" className="data-[state=active]:bg-gray-700 text-gray-300">
                    Tout
                  </TabsTrigger>
                  <TabsTrigger value="movie" className="data-[state=active]:bg-gray-700 text-gray-300">
                    Films
                  </TabsTrigger>
                  <TabsTrigger value="tv" className="data-[state=active]:bg-gray-700 text-gray-300">
                    Séries
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPlaylistItems.length === 0 ? (
              <div className="text-center py-12">
                <Film className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">
                  {playlistItems.length === 0
                    ? "Cette playlist est vide"
                    : `Aucun ${contentFilter === "movie" ? "film" : "série"} dans cette playlist`}
                </p>
                <p className="text-gray-500 text-sm">
                  {isOwner && playlistItems.length === 0
                    ? "Ajoutez des films et séries depuis leurs pages de détails."
                    : contentFilter !== "all"
                      ? "Essayez un autre filtre pour voir plus de contenu."
                      : "Cette playlist ne contient aucun élément pour le moment."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredPlaylistItems.map((item) => {
                  let imageUrl = "/placeholder.svg?height=300&width=200"

                  if (item.poster_path) {
                    if (item.poster_path.startsWith("http")) {
                      imageUrl = item.poster_path
                    } else {
                      imageUrl = `https://image.tmdb.org/t/p/w500${item.poster_path}`
                    }
                  }

                  const getItemUrl = () => {
                    if (item.content_type === "movie") {
                      return `/movies/${item.content_id}`
                    } else if (item.content_type === "tv") {
                      return `/tv-shows/${item.content_id}`
                    }
                    return `/movies/${item.content_id}`
                  }

                  return (
                    <div key={item.id} className="group relative">
                      <Link
                        href={getItemUrl()}
                        className="block relative aspect-[2/3] rounded-lg overflow-hidden bg-muted"
                      >
                        {item.poster_path ? (
                          <Image
                            src={imageUrl || "/placeholder.svg"}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 12.5vw"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg?height=300&width=200"
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>

                      {/* Remove Button */}
                      {isOwner && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}

                      <div className="mt-2">
                        <Link href={getItemUrl()}>
                          <p className="text-sm font-medium line-clamp-2 group-hover:text-blue-400 text-white cursor-pointer">
                            {item.title}
                          </p>
                        </Link>
                        <p className="text-xs text-muted-foreground capitalize">
                          {item.content_type === "movie" ? "Film" : "Série"}
                        </p>
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
