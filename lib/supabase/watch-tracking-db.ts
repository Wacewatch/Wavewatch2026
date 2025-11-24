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
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private pendingRequests: Map<string, Promise<any>> = new Map()
  private readonly CACHE_TTL = 5000 // 5 seconds cache

  constructor() {
    this.supabase = createClient()
  }

  private async cachedRequest<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Check cache first
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T
    }

    // Check if there's already a pending request
    const pending = this.pendingRequests.get(key)
    if (pending) {
      return pending as Promise<T>
    }

    // Make new request
    const promise = fetcher()
      .then((data) => {
        this.cache.set(key, { data, timestamp: Date.now() })
        this.pendingRequests.delete(key)
        return data
      })
      .catch((error) => {
        this.pendingRequests.delete(key)
        throw error
      })

    this.pendingRequests.set(key, promise)
    return promise
  }

  async getUserId(): Promise<string | null> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      return user?.id || null
    } catch (error) {
      console.error("[v0] Error getting user ID:", error)
      return null
    }
  }

  // === WATCH HISTORY ===
  async getWatchHistory(): Promise<WatchedItemDB[]> {
    return this.cachedRequest("watchHistory", async () => {
      try {
        const userId = await this.getUserId()
        if (!userId) return []

        const { data, error } = await this.supabase
          .from("user_watch_history")
          .select("*")
          .eq("user_id", userId)
          .order("last_watched_at", { ascending: false })

        if (error) {
          console.error("[v0] Error fetching watch history:", error.message || error)
          return []
        }

        return data || []
      } catch (error) {
        console.error("[v0] Error fetching watch history:", error)
        return []
      }
    })
  }

  async addToWatchHistory(item: Omit<WatchedItemDB, "id" | "user_id">): Promise<boolean> {
    const userId = await this.getUserId()
    if (!userId) return false

    console.log("[v0] Adding to watch history:", item.content_title)

    try {
      const { data: existing } = await this.supabase
        .from("user_watch_history")
        .select("id")
        .eq("user_id", userId)
        .eq("content_id", item.content_id)
        .eq("content_type", item.content_type)
        .maybeSingle()

      let error
      if (existing) {
        // Update existing record
        const result = await this.supabase
          .from("user_watch_history")
          .update({
            content_title: item.content_title,
            watch_duration: item.watch_duration,
            total_duration: item.total_duration,
            progress: item.progress,
            last_watched_at: item.last_watched_at,
            metadata: item.metadata,
          })
          .eq("id", existing.id)
        error = result.error
      } else {
        // Insert new record
        const result = await this.supabase.from("user_watch_history").insert({
          user_id: userId,
          content_id: item.content_id,
          content_type: item.content_type,
          content_title: item.content_title,
          watch_duration: item.watch_duration,
          total_duration: item.total_duration,
          progress: item.progress,
          last_watched_at: item.last_watched_at,
          metadata: item.metadata,
        })
        error = result.error
      }

      if (error) {
        console.error("[v0] Error adding to watch history:", error.message || error)
        return false
      }

      this.cache.delete("watchHistory")
      console.log("[v0] Successfully added to watch history")
      return true
    } catch (error) {
      console.error("[v0] Error adding to watch history:", error)
      return false
    }
  }

  async removeFromWatchHistory(contentId: number, contentType: string): Promise<boolean> {
    const userId = await this.getUserId()
    if (!userId) return false

    console.log("[v0] Removing from watch history:", contentId, contentType)

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

    this.cache.delete("watchHistory")
    console.log("[v0] Successfully removed from watch history")
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
    return this.cachedRequest("favorites", async () => {
      try {
        const userId = await this.getUserId()
        if (!userId) return []

        const { data, error } = await this.supabase
          .from("user_favorites")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("[v0] Error fetching favorites:", error.message || error)
          return []
        }

        return data || []
      } catch (error) {
        console.error("[v0] Error fetching favorites:", error)
        return []
      }
    })
  }

  async addToFavorites(item: Omit<FavoriteItemDB, "id" | "user_id">): Promise<boolean> {
    const userId = await this.getUserId()
    if (!userId) return false

    console.log("[v0] Adding to favorites:", item.content_title)

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

    this.cache.delete("favorites")
    console.log("[v0] Successfully added to favorites")
    return true
  }

  async removeFromFavorites(contentId: number, contentType: string): Promise<boolean> {
    const userId = await this.getUserId()
    if (!userId) return false

    console.log("[v0] Removing from favorites:", contentId, contentType)

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

    this.cache.delete("favorites")
    console.log("[v0] Successfully removed from favorites")
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
    return this.cachedRequest("wishlist", async () => {
      try {
        const userId = await this.getUserId()
        if (!userId) return []

        const { data, error } = await this.supabase
          .from("user_wishlist")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("[v0] Error fetching wishlist:", error.message || error)
          return []
        }

        return data || []
      } catch (error) {
        console.error("[v0] Error fetching wishlist:", error)
        return []
      }
    })
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
    return this.cachedRequest("ratings", async () => {
      try {
        const userId = await this.getUserId()
        if (!userId) return []

        const { data, error } = await this.supabase
          .from("user_ratings")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("[v0] Error fetching ratings:", error.message || error)
          return []
        }

        return data || []
      } catch (error) {
        console.error("[v0] Error fetching ratings:", error)
        return []
      }
    })
  }

  async getRating(contentId: number, contentType: string): Promise<"like" | "dislike" | null> {
    try {
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
        console.error("[v0] Error fetching rating:", error.message || error)
        return null
      }

      return (data?.rating as "like" | "dislike") || null
    } catch (error) {
      console.error("[v0] Error fetching rating:", error)
      return null
    }
  }

  async setRating(contentId: number, contentType: string, rating: "like" | "dislike" | null): Promise<boolean> {
    const userId = await this.getUserId()
    if (!userId) return false

    try {
      if (rating === null) {
        // Remove rating
        const { error } = await this.supabase
          .from("user_ratings")
          .delete()
          .eq("user_id", userId)
          .eq("content_id", contentId)
          .eq("content_type", contentType)

        if (error) {
          console.error("[v0] Error removing rating:", error.message || error)
          return false
        }
      } else {
        const { data: existing } = await this.supabase
          .from("user_ratings")
          .select("id")
          .eq("user_id", userId)
          .eq("content_id", contentId)
          .eq("content_type", contentType)
          .maybeSingle()

        let error
        if (existing) {
          // Update existing record
          const result = await this.supabase
            .from("user_ratings")
            .update({
              rating: rating,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id)
          error = result.error
        } else {
          // Insert new record
          const result = await this.supabase.from("user_ratings").insert({
            user_id: userId,
            content_id: contentId,
            content_type: contentType,
            rating: rating,
            updated_at: new Date().toISOString(),
          })
          error = result.error
        }

        if (error) {
          console.error("[v0] Error setting rating:", error.message || error)
          return false
        }
      }

      this.cache.delete("ratings")
      return true
    } catch (error) {
      console.error("[v0] Error setting rating:", error)
      return false
    }
  }

  // === STATISTICS ===
  async getStatistics() {
    try {
      const userId = await this.getUserId()
      if (!userId) return null

      const { data, error } = await this.supabase
        .from("user_statistics")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle()

      if (error && error.code !== "PGRST116") {
        console.error("[v0] Error fetching statistics:", error.message || error)
        return null
      }

      return data
    } catch (error) {
      console.error("[v0] Error fetching statistics:", error)
      return null
    }
  }

  async updateStatistics(updates: {
    monthly_goal?: number
    watching_streak?: number
    last_activity_date?: string
  }): Promise<boolean> {
    const userId = await this.getUserId()
    if (!userId) return false

    try {
      const { data: existing } = await this.supabase
        .from("user_statistics")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle()

      let error
      if (existing) {
        // Update existing record
        const result = await this.supabase
          .from("user_statistics")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
        error = result.error
      } else {
        // Insert new record
        const result = await this.supabase.from("user_statistics").insert({
          user_id: userId,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        error = result.error
      }

      if (error) {
        console.error("[v0] Error updating statistics:", error.message || error)
        return false
      }

      return true
    } catch (error) {
      console.error("[v0] Error updating statistics:", error)
      return false
    }
  }

  // === MIGRATION FROM LOCALSTORAGE ===
  async migrateFromLocalStorage(): Promise<void> {
    if (typeof window === "undefined") return

    const userId = await this.getUserId()
    if (!userId) {
      console.log("[v0] No user logged in, skipping migration")
      return
    }

    // Check if migration was already done
    const migrationKey = `wavewatch_migration_done_${userId}`
    if (localStorage.getItem(migrationKey)) {
      console.log("[v0] Migration already completed for this user")
      return
    }

    console.log("[v0] Starting migration from localStorage to database...")

    try {
      // Migrate watch history
      const watchedRaw = localStorage.getItem("wavewatch_watched_items")
      if (watchedRaw) {
        const watchedItems = JSON.parse(watchedRaw)
        console.log(`[v0] Migrating ${watchedItems.length} watched items...`)
        for (const item of watchedItems) {
          await this.addToWatchHistory({
            content_id: typeof item.tmdbId === "string" ? Number.parseInt(item.tmdbId) : item.tmdbId,
            content_type: item.type,
            content_title: item.title,
            watch_duration: item.duration,
            total_duration: item.duration,
            progress: 100,
            last_watched_at: item.watchedAt,
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
      }

      // Migrate favorites
      const favoritesRaw = localStorage.getItem("wavewatch_favorite_items")
      if (favoritesRaw) {
        const favoriteItems = JSON.parse(favoritesRaw)
        console.log(`[v0] Migrating ${favoriteItems.length} favorite items...`)
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
      }

      // Migrate wishlist
      const wishlistRaw = localStorage.getItem("wavewatch_wishlist_items")
      if (wishlistRaw) {
        const wishlistItems = JSON.parse(wishlistRaw)
        console.log(`[v0] Migrating ${wishlistItems.length} wishlist items...`)
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
      }

      // Migrate ratings
      const ratingsRaw = localStorage.getItem("wavewatch_rating_items")
      if (ratingsRaw) {
        const ratingItems = JSON.parse(ratingsRaw)
        console.log(`[v0] Migrating ${ratingItems.length} rating items...`)
        for (const item of ratingItems) {
          await this.setRating(
            typeof item.tmdbId === "string" ? Number.parseInt(item.tmdbId) : item.tmdbId,
            item.type,
            item.rating,
          )
        }
      }

      // Mark migration as done
      localStorage.setItem(migrationKey, "true")
      console.log("[v0] Migration completed successfully!")
    } catch (error) {
      console.error("[v0] Error during migration:", error)
    }
  }
}

// Export singleton instance
export const watchTrackerDB = new WatchTrackerDB()
