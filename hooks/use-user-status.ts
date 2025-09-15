"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"

export interface UserStatus {
  isWatched: boolean
  isFavorite: boolean
  isInWatchlist: boolean
  rating?: string
}

export function useUserStatus(contentId: number, contentType: "movie" | "tv" | "anime") {
  const { user } = useAuth()
  const [status, setStatus] = useState<UserStatus>({
    isWatched: false,
    isFavorite: false,
    isInWatchlist: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id || !contentId) {
      setLoading(false)
      return
    }

    loadUserStatus()
  }, [user?.id, contentId, contentType])

  const loadUserStatus = async () => {
    if (!user?.id) return

    const supabase = createClient()

    try {
      // Check watch history
      const { data: watchData } = await supabase
        .from("user_watch_history")
        .select("*")
        .eq("user_id", user.id)
        .eq("content_id", contentId)
        .eq("content_type", contentType)
        .single()

      // Check favorites
      const { data: favoriteData } = await supabase
        .from("user_favorites")
        .select("*")
        .eq("user_id", user.id)
        .eq("content_id", contentId)
        .eq("content_type", contentType)
        .single()

      const { data: wishlistData } = await supabase
        .from("user_wishlist")
        .select("*")
        .eq("user_id", user.id)
        .eq("content_id", contentId)
        .eq("content_type", contentType)
        .single()

      setStatus({
        isWatched: !!watchData,
        isFavorite: !!favoriteData,
        isInWatchlist: !!wishlistData,
      })
    } catch (error) {
      console.error("Error loading user status:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleWatched = async (contentTitle: string) => {
    if (!user?.id) return

    const supabase = createClient()

    try {
      if (status.isWatched) {
        // Remove from watch history
        await supabase
          .from("user_watch_history")
          .delete()
          .eq("user_id", user.id)
          .eq("content_id", contentId)
          .eq("content_type", contentType)
      } else {
        // Add to watch history
        await supabase.from("user_watch_history").upsert({
          user_id: user.id,
          content_id: contentId,
          content_type: contentType,
          content_title: contentTitle,
          progress: 100,
          watch_duration: 0,
          total_duration: 0,
          last_watched_at: new Date().toISOString(),
          metadata: {},
        })
      }

      setStatus((prev) => ({ ...prev, isWatched: !prev.isWatched }))
    } catch (error) {
      console.error("Error toggling watched status:", error)
    }
  }

  const toggleFavorite = async (contentTitle: string) => {
    if (!user?.id) return

    const supabase = createClient()

    try {
      if (status.isFavorite) {
        // Remove from favorites
        await supabase
          .from("user_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("content_id", contentId)
          .eq("content_type", contentType)
      } else {
        // Add to favorites
        await supabase.from("user_favorites").upsert({
          user_id: user.id,
          content_id: contentId,
          content_type: contentType,
          content_title: contentTitle,
          metadata: {},
        })
      }

      setStatus((prev) => ({ ...prev, isFavorite: !prev.isFavorite }))
    } catch (error) {
      console.error("Error toggling favorite status:", error)
    }
  }

  const toggleWatchlist = async () => {
    if (!user?.id) return

    const supabase = createClient()

    try {
      if (status.isInWatchlist) {
        await supabase
          .from("user_wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("content_id", contentId)
          .eq("content_type", contentType)
      } else {
        await supabase.from("user_wishlist").upsert({
          user_id: user.id,
          content_id: contentId,
          content_type: contentType,
          content_title: "Unknown", // Will be updated with actual title
          metadata: {},
        })
      }

      setStatus((prev) => ({ ...prev, isInWatchlist: !prev.isInWatchlist }))
    } catch (error) {
      console.error("Error toggling watchlist status:", error)
    }
  }

  return {
    status,
    loading,
    toggleWatched,
    toggleFavorite,
    toggleWatchlist,
  }
}
