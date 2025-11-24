import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"

export interface WatchedItemDB {
  id?: string
  user_id: string
  content_id: number
  content_type: "movie" | "tv" | "episode"
  content_title: string
  watch_duration: number
  total_duration: number
  progress: number
  last_watched_at: string
  created_at?: string
  metadata?: {
    genre?: string
    season?: number
    episode?: number
    rating?: number
    posterPath?: string
    showId?: number
  }
}

export interface FavoriteItemDB {
  id?: string
  user_id: string
  content_id: number
  content_type: string
  content_title: string
  created_at?: string
  metadata?: {
    posterPath?: string
    profilePath?: string
    logoUrl?: string
    streamUrl?: string
    url?: string
  }
}

export interface WishlistItemDB {
  id?: string
  user_id: string
  content_id: number
  content_type: string
  content_title: string
  created_at?: string
  metadata?: {
    posterPath?: string
  }
}

export interface RatingItemDB {
  id?: string
  user_id: string
  content_id: number
  content_type: string
  rating: "like" | "dislike"
  created_at?: string
  updated_at?: string
}

export class WatchTrackerDB {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createClient()
  }

  async getUserId(): Promise<string | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    return user?.id || null
  }

  // === WATCH HISTORY ===
  async getWatchHistory(): Promise<WatchedItemDB[]> {
    const userId = await this.getUserId()
    if (!userId) return []

    const { data, error } = await this.supabase
      .from("user_watch_history")
      .select("*")
      .eq("user_id", userId)
      .order("last_watched_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching watch history:", error)
      return []
    }

    return data || []
  }

  async addToWatchHistory(item: Omit<WatchedItemDB, "id" | "user_id">): Promise<boolean> {
    const userId = await this.getUserId()
    if (!userId) return false

    const { error } = await this.supabase.from("user_watch_history").upsert(
      {
        user_id: userId,
        content_id: item.content_id,
        content_type: item.content_type,
        content_title: item.content_title,
        watch_duration: item.watch_duration,
        total_duration: item.total_duration,
        progress: item.progress,
        last_watched_at: item.last_watched_at,
        metadata: item.metadata,
      },
      {
        onConflict: "user_id,content_id,content_type",
      },
    )

    if (error) {
      console.error("[v0] Error adding to watch history:", error)
      return false
    }

    return true
  }

  async removeFromWatchHistory(contentId: number, contentType: string): Promise<boolean> {
    const userId = await this.getUserId()
    if (!userId) return false

    const { error } = await this.supabase
      .from("user_watch_history")
      .delete()
      .eq("user_id", userId)
      .eq("content_id", contentId)
      .eq("content_type", contentType)

    if (error) {
      console.error("[v0] Error removing from watch history:", error)
      return false
    }

    return true
  }

  async isWatched(contentId: number, contentType: string): Promise<boolean> {
    const userId = await this.getUserId()
    if (!userId) return false

    const { data, error } = await this.supabase
      .from("user_watch_history")
      .select("id")
      .eq("user_id", userId)
      .eq("content_id", contentId)
      .eq("content_type", contentType)
      .maybeSingle()

    if (error) {
      console.error("[v0] Error checking watched status:", error)
      return false
    }

    return !!data
  }

  // === FAVORITES ===
  async getFavorites(): Promise<FavoriteItemDB[]> {
    const userId = await this.getUserId()
    if (!userId) return []

    const { data, error } = await this.supabase
      .from("user_favorites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching favorites:", error)
      return []
    }

    return data || []
  }

  async addToFavorites(item: Omit<FavoriteItemDB, "id" | "user_id">): Promise<boolean> {
    const userId = await this.getUserId()
    if (!userId) return false

    const { error } = await this.supabase.from("user_favorites").insert({
      user_id: userId,
      content_id: item.content_id,
      content_type: item.content_type,
      content_title: item.content_title,
      metadata: item.metadata,
    })

    if (error) {
      console.error("[v0] Error adding to favorites:", error)
      return false
    }

    return true
  }

  async removeFromFavorites(contentId: number, contentType: string): Promise<boolean> {
    const userId = await this.getUserId()
    if (!userId) return false

    const { error } = await this.supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("content_id", contentId)
      .eq("content_type", contentType)

    if (error) {
      console.error("[v0] Error removing from favorites:", error)
      return false
    }

    return true
  }

  async isFavorite(contentId: number, contentType: string): Promise<boolean> {
    const userId = await this.getUserId()
    if (!userId) return false

    const { data, error } = await this.supabase
      .from("user_favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("content_id", contentId)
      .eq("content_type", contentType)
      .maybeSingle()

    if (error) {
      console.error("[v0] Error checking favorite status:", error)
      return false
    }

    return !!data
  }

  // === WISHLIST ===
  async getWishlist(): Promise<WishlistItemDB[]> {
    const userId = await this.getUserId()
    if (!userId) return []

    const { data, error } = await this.supabase
      .from("user_wishlist")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching wishlist:", error)
      return []
    }

    return data || []
  }

  async addToWishlist(item: Omit<WishlistItemDB, "id" | "user_id">): Promise<boolean> {
    const userId = await this.getUserId()
    if (!userId) return false

    const { error } = await this.supabase.from("user_wishlist").insert({
      user_id: userId,
      content_id: item.content_id,
      content_type: item.content_type,
      content_title: item.content_title,
      metadata: item.metadata,
    })

    if (error) {
      console.error("[v0] Error adding to wishlist:", error)
      return false
    }

    return true
  }

  async removeFromWishlist(contentId: number, contentType: string): Promise<boolean> {
    const userId = await this.getUserId()
    if (!userId) return false

    const { error } = await this.supabase
      .from("user_wishlist")
      .delete()
      .eq("user_id", userId)
      .eq("content_id", contentId)
      .eq("content_type", contentType)

    if (error) {
      console.error("[v0] Error removing from wishlist:", error)
      return false
    }

    return true
  }

  async isInWishlist(contentId: number, contentType: string): Promise<boolean> {
    const userId = await this.getUserId()
    if (!userId) return false

    const { data, error } = await this.supabase
      .from("user_wishlist")
      .select("id")
      .eq("user_id", userId)
      .eq("content_id", contentId)
      .eq("content_type", contentType)
      .maybeSingle()

    if (error) {
      console.error("[v0] Error checking wishlist status:", error)
      return false
    }

    return !!data
  }

  // === RATINGS ===
  async getRatings(): Promise<RatingItemDB[]> {
    const userId = await this.getUserId()
    if (!userId) return []

    const { data, error } = await this.supabase
      .from("user_ratings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching ratings:", error)
      return []
    }

    return data || []
  }

  async getRating(contentId: number, contentType: string): Promise<"like" | "dislike" | null> {
    const userId = await this.getUserId()
    if (!userId) return null

    const { data, error } = await this.supabase
      .from("user_ratings")
      .select("rating")
      .eq("user_id", userId)
      .eq("content_id", contentId)
      .eq("content_type", contentType)
      .maybeSingle()

    if (error) {
      console.error("[v0] Error fetching rating:", error)
      return null
    }

    return (data?.rating as "like" | "dislike") || null
  }

  async setRating(contentId: number, contentType: string, rating: "like" | "dislike" | null): Promise<boolean> {
    const userId = await this.getUserId()
    if (!userId) return false

    if (rating === null) {
      // Remove rating
      const { error } = await this.supabase
        .from("user_ratings")
        .delete()
        .eq("user_id", userId)
        .eq("content_id", contentId)
        .eq("content_type", contentType)

      if (error) {
        console.error("[v0] Error removing rating:", error)
        return false
      }
    } else {
      // Upsert rating
      const { error } = await this.supabase.from("user_ratings").upsert(
        {
          user_id: userId,
          content_id: contentId,
          content_type: contentType,
          rating: rating,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,content_id,content_type",
        },
      )

      if (error) {
        console.error("[v0] Error setting rating:", error)
        return false
      }
    }

    return true
  }

  // === STATISTICS ===
  async getStatistics() {
    const userId = await this.getUserId()
    if (!userId) return null

    const { data, error } = await this.supabase.from("user_statistics").select("*").eq("user_id", userId).maybeSingle()

    if (error && error.code !== "PGRST116") {
      console.error("[v0] Error fetching statistics:", error)
      return null
    }

    return data
  }

  async updateStatistics(updates: {
    monthly_goal?: number
    watching_streak?: number
    last_activity_date?: string
  }): Promise<boolean> {
    const userId = await this.getUserId()
    if (!userId) return false

    const { error } = await this.supabase.from("user_statistics").upsert(
      {
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )

    if (error) {
      console.error("[v0] Error updating statistics:", error)
      return false
    }

    return true
  }

  // === MIGRATION FROM LOCALSTORAGE ===
  async migrateFromLocalStorage(): Promise<void> {
    if (typeof window === "undefined") return

    const userId = await this.getUserId()
    if (!userId) return

    console.log("[v0] Starting migration from localStorage to database...")

    // Import the old localStorage tracker
    const { WatchTracker } = await import("@/lib/watch-tracking")

    // Migrate watch history
    const watchedItems = WatchTracker.getWatchedItems()
    for (const item of watchedItems) {
      await this.addToWatchHistory({
        content_id: typeof item.tmdbId === "string" ? Number.parseInt(item.tmdbId) : item.tmdbId,
        content_type: item.type,
        content_title: item.title,
        watch_duration: item.duration,
        total_duration: item.duration,
        progress: 100,
        last_watched_at: item.watchedAt.toISOString(),
        metadata: {
          genre: item.genre,
          season: item.season,
          episode: item.episode,
          rating: item.rating,
          posterPath: item.posterPath,
          showId: item.showId,
        },
      })
    }

    // Migrate favorites
    const favoriteItems = WatchTracker.getFavoriteItems()
    for (const item of favoriteItems) {
      await this.addToFavorites({
        content_id: item.tmdbId,
        content_type: item.type,
        content_title: item.title,
        metadata: {
          posterPath: item.posterPath,
          profilePath: item.profilePath,
          logoUrl: item.logoUrl,
          streamUrl: item.streamUrl,
          url: item.url,
        },
      })
    }

    // Migrate wishlist
    const wishlistItems = WatchTracker.getWishlistItems()
    for (const item of wishlistItems) {
      await this.addToWishlist({
        content_id: item.tmdbId,
        content_type: item.type,
        content_title: item.title,
        metadata: {
          posterPath: item.posterPath,
        },
      })
    }

    // Migrate ratings
    const ratingItems = WatchTracker.getRatingItems()
    for (const item of ratingItems) {
      await this.setRating(
        typeof item.tmdbId === "string" ? Number.parseInt(item.tmdbId) : item.tmdbId,
        item.type,
        item.rating,
      )
    }

    console.log("[v0] Migration completed!")
  }
}

// Export singleton instance
export const watchTrackerDB = new WatchTrackerDB()
