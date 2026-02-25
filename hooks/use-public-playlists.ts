"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

export type PlaylistSortBy = "recent" | "liked" | "role"

export interface PublicPlaylist {
  id: string
  user_id: string
  title: string
  description?: string
  theme_color: string
  created_at: string
  updated_at: string
  username: string
  avatar_url?: string
  user_role: "admin" | "uploader" | "vip_plus" | "vip" | "member"
  items_count: number
  likes_count: number
  dislikes_count: number
  is_liked?: boolean
  is_disliked?: boolean
  is_favorited?: boolean
}

/** Priority value used for role-based sorting (lower = higher priority) */
function rolePriority(role: PublicPlaylist["user_role"]): number {
  switch (role) {
    case "admin":
      return 0
    case "uploader":
      return 1
    case "vip_plus":
      return 2
    case "vip":
      return 3
    default:
      return 4
  }
}

export function usePublicPlaylists() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [playlists, setPlaylists] = useState<PublicPlaylist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<PlaylistSortBy>("role")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [itemsPerPage] = useState(30)
  const supabase = createClient()
  const isMountedRef = useRef(true)

  const loadPublicPlaylists = useCallback(
    async (page = 1, sort: PlaylistSortBy = "role") => {
      if (!isMountedRef.current) return

      try {
        setLoading(true)

        // ── 1. Count total public playlists ──────────────────────────────────
        const { count } = await supabase
          .from("playlists")
          .select("*", { count: "exact", head: true })
          .eq("is_public", true)

        if (count !== null && isMountedRef.current) {
          setTotalCount(count)
        }

        const offset = (page - 1) * itemsPerPage

        // ── 2. Fetch playlists with embedded item count ───────────────────────
        // Using Supabase embedded count to bypass the 1000-row default limit
        const { data: playlistsData, error: playlistsError } = await supabase
          .from("playlists")
          .select("id, user_id, title, description, theme_color, created_at, updated_at, playlist_items(count)")
          .eq("is_public", true)
          .order("updated_at", { ascending: false })

        if (playlistsError) throw playlistsError
        if (!playlistsData || playlistsData.length === 0) {
          if (isMountedRef.current) {
            setPlaylists([])
            setLoading(false)
          }
          return
        }

        const playlistIds = playlistsData.map((p) => p.id)
        // user_profiles.user_id is the FK that links to auth.users.id
        const userIds = [...new Set(playlistsData.map((p) => p.user_id))]

        // ── 3. Fetch user profiles ────────────────────────────────────────────
        // user_profiles.id IS the auth user UUID (user_profiles.user_id is NULL)
        const { data: userProfilesData } = await supabase
          .from("user_profiles")
          .select("id, username, email, profile_image, is_admin, is_uploader, is_vip, is_vip_plus")
          .in("id", userIds)

        const userProfilesMap = new Map(
          (userProfilesData || []).map((profile) => {
            const displayName =
              profile.username || (profile.email ? profile.email.split("@")[0] : "Utilisateur")
            let role: PublicPlaylist["user_role"] = "member"
            if (profile.is_admin) role = "admin"
            else if (profile.is_uploader) role = "uploader"
            else if (profile.is_vip_plus) role = "vip_plus"
            else if (profile.is_vip) role = "vip"
            return [
              profile.id,
              {
                displayName,
                avatar_url: profile.profile_image ?? undefined,
                role,
              },
            ]
          }),
        )

        // ── 4. Parallel: likes, user interactions ────────────────────────────
        // Items count is already embedded in playlistsData via playlist_items(count)
        const [likesDataResult, userLikesResult, userFavoritesResult] = await Promise.all([
          supabase.from("playlist_likes").select("playlist_id, is_like").in("playlist_id", playlistIds),
          user?.id
            ? supabase
                .from("playlist_likes")
                .select("playlist_id, is_like")
                .eq("user_id", user.id)
                .in("playlist_id", playlistIds)
            : Promise.resolve({ data: [] }),
          user?.id
            ? supabase
                .from("playlist_favorites")
                .select("playlist_id")
                .eq("user_id", user.id)
                .in("playlist_id", playlistIds)
            : Promise.resolve({ data: [] }),
        ])

        const likesData = likesDataResult.data || []
        const userLikes = userLikesResult.data || []
        const userFavorites = userFavoritesResult.data || []

        // ── 5. Build full playlist objects ────────────────────────────────────
        let processedPlaylists: PublicPlaylist[] = playlistsData.map((playlist) => {
          // playlist_items is [{count: N}] when using embedded count syntax
          const itemsCount = (playlist.playlist_items as unknown as { count: number }[])?.[0]?.count ?? 0
          const playlistLikeRows = likesData.filter((like) => like.playlist_id === playlist.id)
          const likesCount = playlistLikeRows.filter((like) => like.is_like).length
          const dislikesCount = playlistLikeRows.filter((like) => !like.is_like).length
          const userLike = userLikes.find((like) => like.playlist_id === playlist.id)
          const isFavorited = userFavorites.some((fav) => fav.playlist_id === playlist.id)

          const profile = userProfilesMap.get(playlist.user_id)
          const username = profile?.displayName ?? "Utilisateur"
          const user_role = profile?.role ?? "member"
          const avatar_url = profile?.avatar_url

          return {
            ...playlist,
            username,
            avatar_url,
            user_role,
            items_count: itemsCount,
            likes_count: likesCount,
            dislikes_count: dislikesCount,
            is_liked: userLike?.is_like === true,
            is_disliked: userLike?.is_like === false,
            is_favorited: isFavorited,
          }
        })

        // ── 6. Apply sort ─────────────────────────────────────────────────────
        if (sort === "role") {
          processedPlaylists.sort((a, b) => {
            const roleDiff = rolePriority(a.user_role) - rolePriority(b.user_role)
            if (roleDiff !== 0) return roleDiff
            // secondary sort: most recent
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          })
        } else if (sort === "liked") {
          processedPlaylists.sort((a, b) => b.likes_count - a.likes_count)
        }
        // "recent" is already ordered by updated_at from the query

        // ── 7. Paginate ───────────────────────────────────────────────────────
        const paginated = processedPlaylists.slice(offset, offset + itemsPerPage)

        if (isMountedRef.current) {
          setPlaylists(paginated)
          setCurrentPage(page)
        }
      } catch (error) {
        if (isMountedRef.current) {
          setPlaylists([])
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
      }
    },
    [user?.id, supabase, itemsPerPage],
  )

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    loadPublicPlaylists(1, sortBy)
  }, [sortBy, loadPublicPlaylists])

  // ── Like / dislike ─────────────────────────────────────────────────────────
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
              if (playlist.id !== playlistId) return playlist
              return {
                ...playlist,
                likes_count: isLike ? playlist.likes_count - 1 : playlist.likes_count,
                dislikes_count: !isLike ? playlist.dislikes_count - 1 : playlist.dislikes_count,
                is_liked: false,
                is_disliked: false,
              }
            }),
          )
        } else {
          await supabase.from("playlist_likes").update({ is_like: isLike }).eq("id", existingLike.id)
          setPlaylists((prev) =>
            prev.map((playlist) => {
              if (playlist.id !== playlistId) return playlist
              return {
                ...playlist,
                likes_count: isLike ? playlist.likes_count + 1 : playlist.likes_count - 1,
                dislikes_count: !isLike ? playlist.dislikes_count + 1 : playlist.dislikes_count - 1,
                is_liked: isLike,
                is_disliked: !isLike,
              }
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
            if (playlist.id !== playlistId) return playlist
            return {
              ...playlist,
              likes_count: isLike ? playlist.likes_count + 1 : playlist.likes_count,
              dislikes_count: !isLike ? playlist.dislikes_count + 1 : playlist.dislikes_count,
              is_liked: isLike,
              is_disliked: !isLike,
            }
          }),
        )
      }

      toast({
        title: isLike ? "Playlist likée" : "Playlist dislikée",
        description: isLike ? "Ajoutée à vos likes" : "Ajoutée à vos dislikes",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre réaction",
        variant: "destructive",
      })
    }
  }

  // ── Favorites ──────────────────────────────────────────────────────────────
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
        tmdbId: 0,
      }

      if (currentPlaylist.is_favorited) {
        await supabase.from("playlist_favorites").delete().eq("playlist_id", playlistId).eq("user_id", user.id)
        WatchTracker.removeFromFavorites(playlistId, "playlist")
        setPlaylists((prev) =>
          prev.map((pl) => (pl.id === playlistId ? { ...pl, is_favorited: false } : pl)),
        )
        toast({ title: "Retiré des favoris", description: "La playlist a été retirée de vos favoris" })
      } else {
        await supabase.from("playlist_favorites").insert({ playlist_id: playlistId, user_id: user.id })
        WatchTracker.addToFavorites(playlistData)
        setPlaylists((prev) =>
          prev.map((pl) => (pl.id === playlistId ? { ...pl, is_favorited: true } : pl)),
        )
        toast({ title: "Ajouté aux favoris", description: "La playlist a été ajoutée à vos favoris" })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour vos favoris",
        variant: "destructive",
      })
    }
  }

  // ── Filtered list (search) ─────────────────────────────────────────────────
  const filteredPlaylists = searchQuery.trim()
    ? playlists.filter(
        (playlist) =>
          playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          playlist.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          playlist.username.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : playlists

  return {
    playlists: filteredPlaylists,
    loading,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    toggleLike,
    toggleFavorite,
    refreshPlaylists: loadPublicPlaylists,
    currentPage,
    setCurrentPage,
    totalCount,
    itemsPerPage,
    totalPages: Math.ceil(totalCount / itemsPerPage),
    goToPage: (page: number) => loadPublicPlaylists(page, sortBy),
  }
}
