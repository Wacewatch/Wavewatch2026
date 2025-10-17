"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface PublicPlaylist {
  id: string
  user_id: string
  title: string
  description?: string
  theme_color: string
  created_at: string
  updated_at: string
  username: string
  items_count: number
  likes_count: number
  dislikes_count: number
  is_liked?: boolean
  is_disliked?: boolean
  is_favorited?: boolean
}

export function usePublicPlaylists() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [playlists, setPlaylists] = useState<PublicPlaylist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()

  useEffect(() => {
    loadPublicPlaylists()
  }, [user?.id])

  const loadPublicPlaylists = async () => {
    try {
      console.log("[v0] Loading public playlists...")

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn("[v0] Supabase not configured properly")
        setPlaylists([])
        setLoading(false)
        return
      }

      const { data: playlistsData, error: playlistsError } = await supabase
        .from("playlists")
        .select(`
          id,
          user_id,
          title,
          description,
          theme_color,
          created_at,
          updated_at
        `)
        .eq("is_public", true)
        .order("updated_at", { ascending: false })

      if (playlistsError) {
        console.error("Error loading public playlists:", playlistsError)
        setPlaylists([])
        setLoading(false)
        return
      }

      if (!playlistsData) {
        setPlaylists([])
        setLoading(false)
        return
      }

      const userIds = [...new Set(playlistsData.map((p) => p.user_id))]
      const { data: userProfilesData } = await supabase
        .from("user_profiles")
        .select("id, username, email")
        .in("id", userIds)

      // Create a map for quick username lookup with better fallback
      const usernameMap = new Map()
      userProfilesData?.forEach((profile) => {
        const displayName = profile.username || (profile.email ? profile.email.split("@")[0] : null) || "Utilisateur"
        usernameMap.set(profile.id, displayName)
      })

      // For users not found in profiles, try to get from auth.users
      const missingUserIds = userIds.filter((id) => !usernameMap.has(id))
      if (missingUserIds.length > 0) {
        console.log("[v0] Some users not found in profiles, checking auth.users...")
        missingUserIds.forEach((userId) => {
          usernameMap.set(userId, "Utilisateur anonyme")
        })
      }

      const playlistIds = playlistsData.map((p) => p.id)
      const { data: itemsCounts } = await supabase
        .from("playlist_items")
        .select("playlist_id")
        .in("playlist_id", playlistIds)

      const { data: likesData } = await supabase
        .from("playlist_likes")
        .select("playlist_id, is_like")
        .in("playlist_id", playlistIds)

      let userLikes: any[] = []
      let userFavorites: any[] = []

      if (user?.id) {
        const { data: userLikesData } = await supabase
          .from("playlist_likes")
          .select("playlist_id, is_like")
          .eq("user_id", user.id)
          .in("playlist_id", playlistIds)

        const { data: userFavoritesData } = await supabase
          .from("playlist_favorites")
          .select("playlist_id")
          .eq("user_id", user.id)
          .in("playlist_id", playlistIds)

        userLikes = userLikesData || []
        userFavorites = userFavoritesData || []
      }

      const processedPlaylists = playlistsData.map((playlist) => {
        const itemsCount = itemsCounts?.filter((item) => item.playlist_id === playlist.id).length || 0
        const playlistLikes = likesData?.filter((like) => like.playlist_id === playlist.id) || []
        const likesCount = playlistLikes.filter((like) => like.is_like).length
        const dislikesCount = playlistLikes.filter((like) => !like.is_like).length

        const userLike = userLikes.find((like) => like.playlist_id === playlist.id)
        const isFavorited = userFavorites.some((fav) => fav.playlist_id === playlist.id)

        return {
          ...playlist,
          username: usernameMap.get(playlist.user_id) || "Utilisateur inconnu",
          items_count: itemsCount,
          likes_count: likesCount,
          dislikes_count: dislikesCount,
          is_liked: userLike?.is_like === true,
          is_disliked: userLike?.is_like === false,
          is_favorited: isFavorited,
        }
      })

      console.log("[v0] Public playlists loaded successfully:", processedPlaylists.length)
      console.log("[v0] Username mapping:", Object.fromEntries(usernameMap))
      setPlaylists(processedPlaylists)
    } catch (error) {
      console.error("Error loading public playlists:", error)
      setPlaylists([])
    } finally {
      setLoading(false)
    }
  }

  const toggleLike = async (playlistId: string, isLike: boolean) => {
    if (!user?.id) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour liker une playlist",
        variant: "destructive",
      })
      return
    }

    try {
      const currentPlaylist = playlists.find((p) => p.id === playlistId)
      if (!currentPlaylist) return

      const { data: existingLike } = await supabase
        .from("playlist_likes")
        .select("id, is_like")
        .eq("playlist_id", playlistId)
        .eq("user_id", user.id)
        .single()

      if (existingLike) {
        if (existingLike.is_like === isLike) {
          await supabase.from("playlist_likes").delete().eq("id", existingLike.id)

          setPlaylists((prev) =>
            prev.map((playlist) => {
              if (playlist.id === playlistId) {
                return {
                  ...playlist,
                  likes_count: isLike ? playlist.likes_count - 1 : playlist.likes_count,
                  dislikes_count: !isLike ? playlist.dislikes_count - 1 : playlist.dislikes_count,
                  is_liked: false,
                  is_disliked: false,
                }
              }
              return playlist
            }),
          )
        } else {
          await supabase.from("playlist_likes").update({ is_like: isLike }).eq("id", existingLike.id)

          setPlaylists((prev) =>
            prev.map((playlist) => {
              if (playlist.id === playlistId) {
                return {
                  ...playlist,
                  likes_count: isLike ? playlist.likes_count + 1 : playlist.likes_count - 1,
                  dislikes_count: !isLike ? playlist.dislikes_count + 1 : playlist.dislikes_count - 1,
                  is_liked: isLike,
                  is_disliked: !isLike,
                }
              }
              return playlist
            }),
          )
        }
      } else {
        await supabase.from("playlist_likes").insert({
          playlist_id: playlistId,
          user_id: user.id,
          is_like: isLike,
        })

        setPlaylists((prev) =>
          prev.map((playlist) => {
            if (playlist.id === playlistId) {
              return {
                ...playlist,
                likes_count: isLike ? playlist.likes_count + 1 : playlist.likes_count,
                dislikes_count: !isLike ? playlist.dislikes_count + 1 : playlist.dislikes_count,
                is_liked: isLike,
                is_disliked: !isLike,
              }
            }
            return playlist
          }),
        )
      }

      toast({
        title: isLike ? "Playlist likée" : "Playlist dislikée",
        description: isLike ? "Ajoutée à vos likes" : "Ajoutée à vos dislikes",
      })
    } catch (error) {
      console.error("Error toggling like:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre réaction",
        variant: "destructive",
      })
    }
  }

  const toggleFavorite = async (playlistId: string) => {
    if (!user?.id) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour ajouter aux favoris",
        variant: "destructive",
      })
      return
    }

    try {
      const currentPlaylist = playlists.find((p) => p.id === playlistId)
      if (!currentPlaylist) return

      const { WatchTracker } = await import("@/lib/watch-tracking")

      const playlistData = {
        id: playlistId,
        title: currentPlaylist.title,
        type: "playlist" as const,
        posterPath: "/placeholder.svg?key=ywpkd",
        addedAt: new Date(),
        tmdbId: 0, // Not applicable for playlists
      }

      if (currentPlaylist.is_favorited) {
        // Remove from database favorites
        await supabase.from("playlist_favorites").delete().eq("playlist_id", playlistId).eq("user_id", user.id)

        // Remove from WatchTracker favorites
        WatchTracker.removeFromFavorites(playlistId, "playlist")

        setPlaylists((prev) =>
          prev.map((playlist) => (playlist.id === playlistId ? { ...playlist, is_favorited: false } : playlist)),
        )

        toast({
          title: "Retiré des favoris",
          description: "La playlist a été retirée de vos favoris",
        })
      } else {
        // Add to database favorites
        await supabase.from("playlist_favorites").insert({
          playlist_id: playlistId,
          user_id: user.id,
        })

        // Add to WatchTracker favorites
        WatchTracker.addToFavorites(playlistData)

        setPlaylists((prev) =>
          prev.map((playlist) => (playlist.id === playlistId ? { ...playlist, is_favorited: true } : playlist)),
        )

        toast({
          title: "Ajouté aux favoris",
          description: "La playlist a été ajoutée à vos favoris",
        })
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour vos favoris",
        variant: "destructive",
      })
    }
  }

  const filteredPlaylists = playlists.filter(
    (playlist) =>
      playlist.items_count > 0 &&
      (playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        playlist.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        playlist.username.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return {
    playlists: filteredPlaylists,
    loading,
    searchQuery,
    setSearchQuery,
    toggleLike,
    toggleFavorite,
    refreshPlaylists: loadPublicPlaylists,
  }
}
