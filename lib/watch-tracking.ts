export interface WatchedItem {
  id: string
  type: "movie" | "tv" | "episode"
  tmdbId: number | string
  title: string
  duration: number // en minutes
  watchedAt: Date
  genre?: string
  season?: number
  episode?: number
  rating?: number
  posterPath?: string
  showId?: number // Pour les épisodes, ID de la série parente
}

export interface WishlistItem {
  id: string
  type: "movie" | "tv"
  tmdbId: number
  title: string
  addedAt: Date
  posterPath?: string
}

export interface FavoriteItem {
  id: string
  type: "movie" | "tv" | "tv-channel" | "radio" | "actor" | "playlist" | "game"
  tmdbId: number
  title: string
  addedAt: Date
  posterPath?: string
  profilePath?: string // pour les acteurs
  logoUrl?: string // pour les chaînes/radio/jeux
  streamUrl?: string // pour les chaînes TV et radios
  url?: string // pour les jeux rétro
}

export interface RatingItem {
  id: string
  type: "movie" | "tv" | "episode" | "tv-channel" | "radio" | "game" | "playlist"
  tmdbId: number | string // string pour les jeux/chaînes custom et playlists
  title: string
  rating: "like" | "dislike"
  ratedAt: Date
  posterPath?: string
  logoUrl?: string
  showId?: number // Pour les épisodes
  season?: number
  episode?: number
}

export interface WatchStats {
  totalWatchTime: number // en minutes
  moviesWatched: number
  showsWatched: number
  episodesWatched: number
  tvChannelsFavorites: number
  averageRating: number
  favoriteGenre: string
  watchingStreak: number
  totalLikes: number
  totalDislikes: number
  likesMovies: number
  dislikesMovies: number
  likesTVShows: number
  dislikesTVShows: number
  likesEpisodes: number
  dislikesEpisodes: number
  likesTVChannels: number
  dislikesTVChannels: number
  likesRadio: number
  dislikesRadio: number
  likesGames: number
  dislikesGames: number
  likesPlaylists: number
  dislikesPlaylists: number
  monthlyStats: { month: string; minutes: number }[]
  genreStats: { genre: string; count: number; minutes: number }[]
}

// SMIC horaire en France (approximatif)
const SMIC_HOURLY = 11.27

export class WatchTracker {
  private static STORAGE_KEY_WATCHED = "wavewatch_watched_items"
  private static STORAGE_KEY_WISHLIST = "wavewatch_wishlist_items"
  private static STORAGE_KEY_FAVORITES = "wavewatch_favorite_items"
  private static STORAGE_KEY_RATINGS = "wavewatch_rating_items"

  private static async getDB() {
    if (typeof window === "undefined") return null
    try {
      const { watchTrackerDB } = await import("@/lib/supabase/watch-tracking-db")
      const userId = await watchTrackerDB.getUserId()
      return userId ? watchTrackerDB : null
    } catch {
      return null
    }
  }

  private static async triggerSync(type: "favorites" | "history") {
    if (typeof window === "undefined") return

    // Import dynamique pour éviter les erreurs SSR
    const { DatabaseSync } = await import("@/lib/database-sync")

    if (type === "favorites") {
      const favorites = await this.getFavoriteItems()
      await DatabaseSync.syncFavorites(favorites)
    } else if (type === "history") {
      const history = await this.getWatchedItems()
      await DatabaseSync.syncHistory(history)
    }
  }

  // === RATINGS (LIKE/DISLIKE) ===
  static getRatingItems(): RatingItem[] {
    if (typeof window === "undefined") return []
    try {
      const items = localStorage.getItem(this.STORAGE_KEY_RATINGS)
      return items
        ? JSON.parse(items)
            .map((item: any) => ({
              ...item,
              ratedAt: new Date(item.ratedAt),
            }))
            .sort((a: RatingItem, b: RatingItem) => b.ratedAt.getTime() - a.ratedAt.getTime())
        : []
    } catch {
      return []
    }
  }

  static async getRating(type: string, id: number | string): Promise<"like" | "dislike" | null> {
    const db = await this.getDB()
    if (db) {
      const contentId = typeof id === "string" ? Number.parseInt(id) : id
      return await db.getRating(contentId, type)
    }

    // Fallback to localStorage
    const items = this.getRatingItems()
    const item = items.find((item) => item.type === type && item.tmdbId === id)
    return item ? item.rating : null
  }

  static async setRating(
    type: "movie" | "tv" | "episode" | "tv-channel" | "radio" | "game" | "playlist",
    id: number | string,
    title: string,
    rating: "like" | "dislike",
    options?: {
      posterPath?: string
      logoUrl?: string
      showId?: number
      season?: number
      episode?: number
    },
  ): Promise<void> {
    const db = await this.getDB()
    if (db) {
      const contentId = typeof id === "string" ? Number.parseInt(id) : id
      const currentRating = await db.getRating(contentId, type)

      if (currentRating === rating) {
        // Remove if same rating (toggle off)
        await db.setRating(contentId, type, null)
      } else {
        // Set new rating
        await db.setRating(contentId, type, rating)
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("watchlist-updated"))
      }
      return
    }

    // Fallback to localStorage
    if (typeof window === "undefined") return

    const items = this.getRatingItems()
    const existingIndex = items.findIndex((item) => item.type === type && item.tmdbId === id)

    if (existingIndex >= 0) {
      if (items[existingIndex].rating === rating) {
        items.splice(existingIndex, 1)
      } else {
        items[existingIndex].rating = rating
        items[existingIndex].ratedAt = new Date()
      }
    } else {
      const newItem: RatingItem = {
        id: `${type}_${id}_${Date.now()}`,
        type,
        tmdbId: id,
        title,
        rating,
        ratedAt: new Date(),
        ...options,
      }
      items.push(newItem)
    }

    localStorage.setItem(this.STORAGE_KEY_RATINGS, JSON.stringify(items))
    window.dispatchEvent(new Event("watchlist-updated"))
  }

  static async toggleLike(
    type: "movie" | "tv" | "episode" | "tv-channel" | "radio" | "game" | "playlist",
    id: number | string,
    title: string,
    options?: {
      posterPath?: string
      logoUrl?: string
      showId?: number
      season?: number
      episode?: number
    },
  ): Promise<"like" | null> {
    const currentRating = await this.getRating(type, id)
    if (currentRating === "like") {
      await this.setRating(type, id, title, "like", options)
      return null
    } else {
      await this.setRating(type, id, title, "like", options)
      return "like"
    }
  }

  static async toggleDislike(
    type: "movie" | "tv" | "episode" | "tv-channel" | "radio" | "game" | "playlist",
    id: number | string,
    title: string,
    options?: {
      posterPath?: string
      logoUrl?: string
      showId?: number
      season?: number
      episode?: number
    },
  ): Promise<"dislike" | null> {
    const currentRating = await this.getRating(type, id)
    if (currentRating === "dislike") {
      await this.setRating(type, id, title, "dislike", options)
      return null
    } else {
      await this.setRating(type, id, title, "dislike", options)
      return "dislike"
    }
  }

  // === WATCHED ITEMS ===
  static async getWatchedItems(): Promise<WatchedItem[]> {
    const db = await this.getDB()
    if (db) {
      const items = await db.getWatchHistory()
      return items.map((item) => ({
        id: item.id || "",
        type: item.content_type,
        tmdbId: item.content_id,
        title: item.content_title,
        duration: item.watch_duration,
        watchedAt: new Date(item.last_watched_at),
        genre: item.metadata?.genre,
        season: item.metadata?.season,
        episode: item.metadata?.episode,
        rating: item.metadata?.rating,
        posterPath: item.metadata?.posterPath,
        showId: item.metadata?.showId,
      }))
    }

    // Fallback to localStorage
    if (typeof window === "undefined") return []
    try {
      const items = localStorage.getItem(this.STORAGE_KEY_WATCHED)
      return items
        ? JSON.parse(items)
            .map((item: any) => ({
              ...item,
              watchedAt: new Date(item.watchedAt),
            }))
            .sort((a: WatchedItem, b: WatchedItem) => b.watchedAt.getTime() - a.watchedAt.getTime())
        : []
    } catch {
      return []
    }
  }

  static async isWatched(type: "movie" | "tv" | "episode", tmdbId: number | string): Promise<boolean> {
    const db = await this.getDB()
    if (db) {
      const contentId = typeof tmdbId === "string" ? Number.parseInt(tmdbId) : tmdbId
      return await db.isWatched(contentId, type)
    }

    // Fallback to localStorage
    const items = await this.getWatchedItems()
    if (type === "episode") {
      const parts = typeof tmdbId === "string" ? tmdbId.split("-") : []
      if (parts.length === 3) {
        const [showId, season, episode] = parts.map(Number)
        return items.some(
          (item) =>
            item.type === "episode" && item.showId === showId && item.season === season && item.episode === episode,
        )
      }
    }

    return items.some((item) => item.type === type && item.tmdbId === tmdbId)
  }

  static isEpisodeWatched(showId: number, season: number, episode: number): boolean {
    const items = this.getWatchedItems()
    return items.some(
      (item) => item.type === "episode" && item.showId === showId && item.season === season && item.episode === episode,
    )
  }

  static async markAsWatched(
    type: "movie" | "tv" | "episode",
    tmdbId: number | string,
    title: string,
    duration: number,
    options?: {
      genre?: string
      season?: number
      episode?: number
      rating?: number
      posterPath?: string
      showId?: number
      seasons?: any[]
      showName?: string
    },
  ): Promise<void> {
    console.log("[v0] markAsWatched called:", { type, tmdbId, title })

    const db = await this.getDB()
    const numericId = typeof tmdbId === "string" ? Number.parseInt(tmdbId) : tmdbId

    if (db) {
      // Use database
      if (type === "tv") {
        const isWatched = await db.isWatched(numericId, type)

        if (isWatched) {
          // Unmark series and all episodes
          console.log("[v0] Unmarking series and episodes from database")
          await db.removeFromWatchHistory(numericId, type)

          // Also remove all episodes
          if (options?.seasons) {
            for (const season of options.seasons) {
              if (season.episodes) {
                for (const episode of season.episodes) {
                  const episodeId = `${numericId}-${season.season_number}-${episode.episode_number}`
                  await db.removeFromWatchHistory(Number.parseInt(episodeId), "episode")
                }
              }
            }
          }
        } else {
          // Mark series
          console.log("[v0] Marking series in database")
          await db.addToWatchHistory({
            content_id: numericId,
            content_type: type,
            content_title: title,
            watch_duration: duration,
            total_duration: duration,
            progress: 100,
            last_watched_at: new Date().toISOString(),
            metadata: {
              genre: options?.genre,
              posterPath: options?.posterPath,
              rating: options?.rating,
            },
          })

          // Mark all episodes
          if (options?.seasons) {
            for (const season of options.seasons) {
              if (season.episodes) {
                for (const episode of season.episodes) {
                  const episodeTitle = `${title} - S${season.season_number}E${episode.episode_number}`
                  const episodeId = Number.parseInt(`${numericId}${season.season_number}${episode.episode_number}`)

                  await db.addToWatchHistory({
                    content_id: episodeId,
                    content_type: "episode",
                    content_title: episodeTitle,
                    watch_duration: episode.runtime || 45,
                    total_duration: episode.runtime || 45,
                    progress: 100,
                    last_watched_at: new Date().toISOString(),
                    metadata: {
                      genre: options?.genre,
                      posterPath: options?.posterPath,
                      season: season.season_number,
                      episode: episode.episode_number,
                      showId: numericId,
                    },
                  })
                }
              }
            }
          }
        }
      } else if (type === "episode") {
        const episodeId = Number.parseInt(`${options?.showId}${options?.season}${options?.episode}`)
        const isWatched = await db.isWatched(episodeId, type)

        if (isWatched) {
          console.log("[v0] Removing episode from database")
          await db.removeFromWatchHistory(episodeId, type)
        } else {
          console.log("[v0] Adding episode to database")
          await db.addToWatchHistory({
            content_id: episodeId,
            content_type: type,
            content_title: title,
            watch_duration: duration,
            total_duration: duration,
            progress: 100,
            last_watched_at: new Date().toISOString(),
            metadata: {
              genre: options?.genre,
              posterPath: options?.posterPath,
              season: options?.season,
              episode: options?.episode,
              showId: options?.showId,
            },
          })
        }
      } else {
        // Movie
        const isWatched = await db.isWatched(numericId, type)

        if (isWatched) {
          console.log("[v0] Removing movie from database")
          await db.removeFromWatchHistory(numericId, type)
        } else {
          console.log("[v0] Adding movie to database")
          await db.addToWatchHistory({
            content_id: numericId,
            content_type: type,
            content_title: title,
            watch_duration: duration,
            total_duration: duration,
            progress: 100,
            last_watched_at: new Date().toISOString(),
            metadata: {
              genre: options?.genre,
              posterPath: options?.posterPath,
              rating: options?.rating,
            },
          })
        }
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("watchlist-updated"))
      }
      return
    }

    // Fallback to localStorage (should rarely be used)
    if (typeof window === "undefined") return

    const items = await this.getWatchedItems()

    if (type === "tv") {
      console.log("[v0] Marking/unmarking entire series:", title)

      const isCurrentlyWatched = items.some((item) => item.type === "tv" && item.tmdbId === tmdbId)

      if (isCurrentlyWatched) {
        console.log("[v0] Unmarking series and all episodes")

        // Remove all episodes of this series
        const filteredItems = items.filter((item) => {
          if (
            item.type === "episode" &&
            item.showId === (typeof tmdbId === "string" ? Number.parseInt(tmdbId) : tmdbId)
          ) {
            return false
          }
          if (item.type === "tv" && item.tmdbId === tmdbId) {
            return false
          }
          return true
        })

        localStorage.setItem(this.STORAGE_KEY_WATCHED, JSON.stringify(filteredItems))
        window.dispatchEvent(new Event("watchlist-updated"))
        return
      }

      if (options?.seasons && options.seasons.length > 0) {
        // Mark all episodes from all seasons
        options.seasons.forEach((season: any) => {
          if (season.episodes && season.episodes.length > 0) {
            season.episodes.forEach((episode: any) => {
              const episodeId = `${tmdbId}-${season.season_number}-${episode.episode_number}`
              const existingEpisodeIndex = items.findIndex(
                (item) =>
                  item.type === "episode" &&
                  item.showId === (typeof tmdbId === "string" ? Number.parseInt(tmdbId) : tmdbId) &&
                  item.season === season.season_number &&
                  item.episode === episode.episode_number,
              )

              if (existingEpisodeIndex === -1) {
                const episodeItem: WatchedItem = {
                  id: `episode_${episodeId}_${Date.now()}_${Math.random()}`,
                  type: "episode",
                  tmdbId: typeof tmdbId === "string" ? Number.parseInt(tmdbId) : tmdbId,
                  title: `${title} - S${season.season_number}E${episode.episode_number}`,
                  duration: episode.runtime || 45,
                  watchedAt: new Date(),
                  posterPath: options?.posterPath,
                  season: season.season_number,
                  episode: episode.episode_number,
                  genre: options?.genre,
                  rating: options?.rating,
                  showId: typeof tmdbId === "string" ? Number.parseInt(tmdbId) : tmdbId,
                }
                items.push(episodeItem)
              }
            })
          }
        })
        console.log("[v0] Marked all episodes as watched")
      }

      // Also mark the series itself
      const existingSeriesIndex = items.findIndex((item) => item.type === "tv" && item.tmdbId === tmdbId)
      if (existingSeriesIndex === -1) {
        const seriesItem: WatchedItem = {
          id: `tv_${tmdbId}_${Date.now()}`,
          type: "tv",
          tmdbId: typeof tmdbId === "string" ? Number.parseInt(tmdbId) : tmdbId,
          title,
          duration: duration,
          watchedAt: new Date(),
          posterPath: options?.posterPath,
          genre: options?.genre,
          rating: options?.rating,
        }
        items.push(seriesItem)
      }
    } else if (type === "episode") {
      // For individual episodes, use the provided ID format
      const episodeId =
        typeof tmdbId === "string" ? tmdbId : `${options?.showId}-${options?.season}-${options?.episode}`
      const existingIndex = items.findIndex(
        (item) =>
          item.type === "episode" &&
          item.showId === options?.showId &&
          item.season === options?.season &&
          item.episode === options?.episode,
      )

      if (existingIndex >= 0) {
        items.splice(existingIndex, 1)
        console.log("Episode removed from watched")
      } else {
        const newItem: WatchedItem = {
          id: `episode_${episodeId}_${Date.now()}`,
          type: "episode",
          tmdbId: typeof tmdbId === "string" ? Number.parseInt(tmdbId) : tmdbId,
          title,
          duration: duration,
          watchedAt: new Date(),
          posterPath: options?.posterPath,
          season: options?.season,
          episode: options?.episode,
          genre: options?.genre,
          rating: options?.rating,
          showId: options?.showId,
        }
        items.push(newItem)
        console.log("Episode added to watched:", newItem.title)
      }
    } else {
      // For movies, keep existing logic
      const existingIndex = items.findIndex((item) => item.type === type && item.tmdbId === tmdbId)

      if (existingIndex >= 0) {
        items.splice(existingIndex, 1)
      } else {
        const newItem: WatchedItem = {
          id: `${type}_${tmdbId}_${Date.now()}`,
          type,
          tmdbId: typeof tmdbId === "string" ? Number.parseInt(tmdbId) : tmdbId,
          title,
          duration: duration,
          watchedAt: new Date(),
          posterPath: options?.posterPath,
          genre: options?.genre,
          rating: options?.rating,
        }
        items.push(newItem)
      }
    }

    localStorage.setItem(this.STORAGE_KEY_WATCHED, JSON.stringify(items))
    window.dispatchEvent(new Event("watchlist-updated"))

    this.triggerSync("history")
  }

  // === WISHLIST ===
  static getWishlistItems(): WishlistItem[] {
    if (typeof window === "undefined") return []
    try {
      const items = localStorage.getItem(this.STORAGE_KEY_WISHLIST)
      return items
        ? JSON.parse(items)
            .map((item: any) => ({
              ...item,
              addedAt: new Date(item.addedAt),
            }))
            .sort((a: WishlistItem, b: WishlistItem) => b.addedAt.getTime() - a.addedAt.getTime())
        : []
    } catch {
      return []
    }
  }

  static isInWishlist(type: "movie" | "tv", tmdbId: number): boolean {
    const items = this.getWishlistItems()
    return items.some((item) => item.type === type && item.tmdbId === tmdbId)
  }

  static toggleWishlist(type: "movie" | "tv", tmdbId: number, title: string, posterPath?: string): boolean {
    if (typeof window === "undefined") return false

    const items = this.getWishlistItems()
    const existingIndex = items.findIndex((item) => item.type === type && item.tmdbId === tmdbId)

    if (existingIndex >= 0) {
      items.splice(existingIndex, 1)
      localStorage.setItem(this.STORAGE_KEY_WISHLIST, JSON.stringify(items))
      window.dispatchEvent(new Event("watchlist-updated"))
      return false
    } else {
      const newItem: WishlistItem = {
        id: `${type}_${tmdbId}_${Date.now()}`,
        type,
        tmdbId,
        title,
        addedAt: new Date(),
        posterPath,
      }
      items.push(newItem)
      localStorage.setItem(this.STORAGE_KEY_WISHLIST, JSON.stringify(items))
      window.dispatchEvent(new Event("watchlist-updated"))
      return true
    }
  }

  // === FAVORITES ===
  static async getFavoriteItems(): Promise<FavoriteItem[]> {
    const db = await this.getDB()
    if (db) {
      const items = await db.getFavorites()
      return items.map((item) => ({
        id: item.id || "",
        type: item.content_type as any,
        tmdbId: item.content_id,
        title: item.content_title,
        addedAt: new Date(item.created_at || ""),
        posterPath: item.metadata?.posterPath,
        profilePath: item.metadata?.profilePath,
        logoUrl: item.metadata?.logoUrl,
        streamUrl: item.metadata?.streamUrl,
        url: item.metadata?.url,
      }))
    }

    // Fallback to localStorage
    if (typeof window === "undefined") return []
    try {
      const items = localStorage.getItem(this.STORAGE_KEY_FAVORITES)
      return items
        ? JSON.parse(items)
            .map((item: any) => ({
              ...item,
              addedAt: new Date(item.addedAt),
            }))
            .sort((a: FavoriteItem, b: FavoriteItem) => b.addedAt.getTime() - a.addedAt.getTime())
        : []
    } catch {
      return []
    }
  }

  static async isFavorite(
    type: "movie" | "tv" | "tv-channel" | "radio" | "actor" | "playlist" | "game",
    tmdbId: number,
  ): Promise<boolean> {
    const db = await this.getDB()
    if (db) {
      return await db.isFavorite(tmdbId, type)
    }

    // Fallback to localStorage
    const items = await this.getFavoriteItems()
    return items.some((item) => item.type === type && item.tmdbId === tmdbId)
  }

  static async toggleFavorite(
    type: "movie" | "tv" | "tv-channel" | "radio" | "actor" | "playlist" | "game",
    tmdbId: number,
    title: string,
    options?: {
      posterPath?: string
      profilePath?: string
      logoUrl?: string
      streamUrl?: string
      url?: string
    },
  ): Promise<boolean> {
    console.log("[v0] toggleFavorite called:", { type, tmdbId, title })

    const db = await this.getDB()
    if (db) {
      const isFav = await db.isFavorite(tmdbId, type)
      if (isFav) {
        console.log("[v0] Removing from favorites in database")
        await db.removeFromFavorites(tmdbId, type)
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("favorites-updated"))
        }
        return false
      } else {
        console.log("[v0] Adding to favorites in database")
        await db.addToFavorites({
          content_id: tmdbId,
          content_type: type,
          content_title: title,
          metadata: options,
        })
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("favorites-updated"))
        }
        return true
      }
    }

    // Fallback to localStorage (should rarely be used)
    console.log("[v0] Using localStorage fallback for favorites")
    if (typeof window === "undefined") return false

    const items = await this.getFavoriteItems()
    const existingIndex = items.findIndex((item) => item.type === type && item.tmdbId === tmdbId)

    if (existingIndex >= 0) {
      items.splice(existingIndex, 1)
      localStorage.setItem(this.STORAGE_KEY_FAVORITES, JSON.stringify(items))
      window.dispatchEvent(new Event("favorites-updated"))
      await this.triggerSync("favorites")
      return false
    } else {
      const newItem: FavoriteItem = {
        id: `${type}_${tmdbId}_${Date.now()}`,
        type,
        tmdbId,
        title,
        addedAt: new Date(),
        ...options,
      }
      items.push(newItem)
      localStorage.setItem(this.STORAGE_KEY_FAVORITES, JSON.stringify(items))
      window.dispatchEvent(new Event("favorites-updated"))
      await this.triggerSync("favorites")
      return true
    }
  }

  // === STATISTICS ===
  static async getMonthlyGoal(): Promise<number> {
    const db = await this.getDB()
    if (db) {
      const stats = await db.getStatistics()
      return stats?.monthly_goal || 10
    }

    // Fallback to localStorage
    if (typeof window !== "undefined") {
      return Number.parseInt(localStorage.getItem("monthlyGoal") || "10")
    }
    return 10
  }

  static async setMonthlyGoal(goal: number): Promise<void> {
    const db = await this.getDB()
    if (db) {
      await db.updateStatistics({ monthly_goal: goal })
      return
    }

    // Fallback to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("monthlyGoal", goal.toString())
    }
  }

  static async getStats(): Promise<WatchStats> {
    const items = await this.getWatchedItems()
    const favorites = await this.getFavoriteItems()
    const db = await this.getDB()

    let ratings: RatingItem[] = []
    if (db) {
      const dbRatings = await db.getRatings()
      ratings = dbRatings.map((r) => ({
        id: r.id || "",
        type: r.content_type as any,
        tmdbId: r.content_id,
        title: "",
        rating: r.rating,
        ratedAt: new Date(r.created_at || ""),
      }))
    } else {
      ratings = this.getRatingItems()
    }

    console.log("Calcul des stats - Total items:", items.length)
    console.log("Episodes dans les items:", items.filter((i) => i.type === "episode").length)

    // Calculs des likes/dislikes par type
    const totalLikes = ratings.filter((r) => r.rating === "like").length
    const totalDislikes = ratings.filter((r) => r.rating === "dislike").length

    const likesMovies = ratings.filter((r) => r.type === "movie" && r.rating === "like").length
    const dislikesMovies = ratings.filter((r) => r.type === "movie" && r.rating === "dislike").length

    const likesTVShows = ratings.filter((r) => r.type === "tv" && r.rating === "like").length
    const dislikesTVShows = ratings.filter((r) => r.type === "tv" && r.rating === "dislike").length

    const likesEpisodes = ratings.filter((r) => r.type === "episode" && r.rating === "like").length
    const dislikesEpisodes = ratings.filter((r) => r.type === "episode" && r.rating === "dislike").length

    const likesTVChannels = ratings.filter((r) => r.type === "tv-channel" && r.rating === "like").length
    const dislikesTVChannels = ratings.filter((r) => r.type === "tv-channel" && r.rating === "dislike").length

    const likesRadio = ratings.filter((r) => r.type === "radio" && r.rating === "like").length
    const dislikesRadio = ratings.filter((r) => r.type === "radio" && r.rating === "dislike").length

    const likesGames = ratings.filter((r) => r.type === "game" && r.rating === "like").length
    const dislikesGames = ratings.filter((r) => r.type === "game" && r.rating === "dislike").length

    const likesPlaylists = ratings.filter((r) => r.type === "playlist" && r.rating === "like").length
    const dislikesPlaylists = ratings.filter((r) => r.type === "playlist" && r.rating === "dislike").length

    if (items.length === 0) {
      return {
        totalWatchTime: 0,
        moviesWatched: 0,
        showsWatched: 0,
        episodesWatched: 0,
        tvChannelsFavorites: favorites.filter((f) => f.type === "tv-channel").length,
        averageRating: 0,
        favoriteGenre: "Aucun",
        watchingStreak: 0,
        totalLikes,
        totalDislikes,
        likesMovies,
        dislikesMovies,
        likesTVShows,
        dislikesTVShows,
        likesEpisodes,
        dislikesEpisodes,
        likesTVChannels,
        dislikesTVChannels,
        likesRadio,
        dislikesRadio,
        likesGames,
        dislikesGames,
        likesPlaylists,
        dislikesPlaylists,
        monthlyStats: [],
        genreStats: [],
      }
    }

    // Calcul du temps total en s'assurant que duration existe
    const totalWatchTime = items.reduce((sum, item) => {
      const duration = item.duration || 0
      return sum + duration
    }, 0)

    console.log("Temps total calculé:", totalWatchTime, "minutes")

    const moviesWatched = items.filter((item) => item.type === "movie").length
    const episodesWatched = items.filter((item) => item.type === "episode").length

    console.log("Films:", moviesWatched, "Épisodes:", episodesWatched)

    // Compter les séries uniques (soit marquées directement, soit via leurs épisodes)
    const uniqueShowIds = new Set()
    items.forEach((item) => {
      if (item.type === "tv") {
        uniqueShowIds.add(item.tmdbId)
      } else if (item.type === "episode" && item.showId) {
        uniqueShowIds.add(item.showId)
      }
    })
    const showsWatched = uniqueShowIds.size

    console.log("Séries uniques:", showsWatched)

    // Calcul de la note moyenne
    const ratedItems = items.filter((item) => item.rating && item.rating > 0)
    const averageRating =
      ratedItems.length > 0 ? ratedItems.reduce((sum, item) => sum + (item.rating || 0), 0) / ratedItems.length : 0

    // Genre favori
    const genreCounts = items.reduce(
      (acc, item) => {
        if (item.genre) {
          acc[item.genre] = (acc[item.genre] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    const favoriteGenre =
      Object.keys(genreCounts).length > 0 ? Object.entries(genreCounts).sort(([, a], [, b]) => b - a)[0][0] : "Aucun"

    const stats = {
      totalWatchTime,
      moviesWatched,
      showsWatched,
      episodesWatched,
      tvChannelsFavorites: favorites.filter((f) => f.type === "tv-channel").length,
      averageRating,
      favoriteGenre,
      watchingStreak: this.calculateStreak(items),
      totalLikes,
      totalDislikes,
      likesMovies,
      dislikesMovies,
      likesTVShows,
      dislikesTVShows,
      likesEpisodes,
      dislikesEpisodes,
      likesTVChannels,
      dislikesTVChannels,
      likesRadio,
      dislikesRadio,
      likesGames,
      dislikesGames,
      likesPlaylists,
      dislikesPlaylists,
      monthlyStats: [],
      genreStats: [],
    }

    console.log("Stats finales:", stats)
    return stats
  }

  private static calculateStreak(items: WatchedItem[]): number {
    if (items.length === 0) return 0

    const sortedDates = items
      .map((item) => item.watchedAt.toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    let streak = 0
    let currentDate = new Date()

    for (const dateStr of sortedDates) {
      const date = new Date(dateStr)
      const diffDays = Math.floor((currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays <= streak + 1) {
        streak++
        currentDate = date
      } else {
        break
      }
    }

    return streak
  }

  static calculateSMICEquivalent(minutes: number): { hours: number; euros: number; days: number } {
    const hours = minutes / 60
    const euros = hours * SMIC_HOURLY
    const days = hours / 8 // 8h de travail par jour

    return { hours, euros, days }
  }

  static async getInterestingFacts(stats: WatchStats): Promise<string[]> {
    const facts: string[] = []
    const smicEquiv = this.calculateSMICEquivalent(stats.totalWatchTime)
    const favorites = await this.getFavoriteItems()

    // Statistiques de temps
    if (stats.totalWatchTime > 0) {
      const hours = Math.floor(stats.totalWatchTime / 60)
      const days = Math.floor(hours / 24)
      const weeks = Math.floor(days / 7)
      const months = Math.floor(days / 30)
      const years = Math.floor(days / 365)

      if (years > 0) {
        facts.push(`${years} annee${years > 1 ? "s" : ""} de visionnage ! Vous pourriez avoir fait le tour du monde !`)
      } else if (months > 0) {
        facts.push(`${months} mois de visionnage ! Vous pourriez avoir appris plusieurs langues !`)
      } else if (weeks > 0) {
        facts.push(`${weeks} semaine${weeks > 1 ? "s" : ""} de visionnage ! Vous pourriez avoir lu 20 livres !`)
      } else if (days > 0) {
        facts.push(`${days} jour${days > 1 ? "s" : ""} de visionnage ! Vous pourriez avoir visite une nouvelle ville !`)
      } else if (hours > 0) {
        facts.push(`${hours} heure${hours > 1 ? "s" : ""} de visionnage ! Un bon debut !`)
      }

      facts.push(`Vous avez regarde l equivalent de ${smicEquiv.euros.toFixed(0)} euros au SMIC !`)
      facts.push(`Cela represente ${smicEquiv.days.toFixed(1)} jours de travail a temps plein.`)

      if (smicEquiv.euros > 1000) {
        facts.push(`Avec ${smicEquiv.euros.toFixed(0)} euros, vous pourriez vous offrir un voyage aux Maldives !`)
      } else if (smicEquiv.euros > 500) {
        facts.push(`${smicEquiv.euros.toFixed(0)} euros au SMIC, de quoi s offrir un bon smartphone !`)
      } else if (smicEquiv.euros > 100) {
        facts.push(`${smicEquiv.euros.toFixed(0)} euros au SMIC, parfait pour un weekend romantique !`)
      }
    }

    // Statistiques de contenu
    if (stats.totalLikes > stats.totalDislikes && stats.totalLikes > 10) {
      facts.push(`${stats.totalLikes} likes ! Vous etes plutot positif dans vos evaluations !`)
    }

    if (stats.totalDislikes > stats.totalLikes && stats.totalDislikes > 10) {
      facts.push(`${stats.totalDislikes} dislikes... Vous etes difficile a satisfaire !`)
    }

    if (stats.totalLikes + stats.totalDislikes > 50) {
      facts.push(`${stats.totalLikes + stats.totalDislikes} evaluations ! Vous aimez donner votre avis !`)
    }

    if (stats.moviesWatched > 10) {
      facts.push(`Avec ${stats.moviesWatched} films vus, vous pourriez animer un cine-club !`)
    }

    if (stats.moviesWatched > 100) {
      facts.push(`${stats.moviesWatched} films ! Vous avez vu plus de films que la plupart des critiques !`)
    }

    if (stats.episodesWatched > 100) {
      facts.push(`${stats.episodesWatched} episodes ! Vous etes un vrai binge-watcher !`)
    }

    if (stats.episodesWatched > 500) {
      facts.push(`${stats.episodesWatched} episodes ! Vous pourriez ecrire un livre sur les series TV !`)
    }

    if (stats.episodesWatched > 1000) {
      facts.push(`${stats.episodesWatched} episodes ! Vous etes une encyclopedie vivante des series !`)
    }

    if (stats.showsWatched > 20) {
      facts.push(`${stats.showsWatched} series differentes ! Vous etes un explorateur de l audiovisuel !`)
    }

    if (stats.showsWatched > 50) {
      facts.push(`${stats.showsWatched} series ! Vous pourriez ouvrir votre propre plateforme de streaming !`)
    }

    if (stats.watchingStreak > 7) {
      facts.push(`${stats.watchingStreak} jours de suite ! Votre serie vous manque deja ?`)
    }

    if (stats.watchingStreak > 30) {
      facts.push(`${stats.watchingStreak} jours consecutifs ! Vous etes accro aux ecrans !`)
    }

    // Statistiques comparatives amusantes
    if (stats.totalWatchTime > 525600) {
      facts.push("Vous avez regarde plus d une annee complete ! Vous pourriez avoir appris le chinois !")
    }

    if (stats.totalWatchTime > 2628000) {
      facts.push("5 ans de visionnage ! Vous pourriez avoir fait des etudes superieures !")
    }

    if (stats.episodesWatched > 0 && stats.moviesWatched > 0) {
      const ratio = stats.episodesWatched / stats.moviesWatched
      if (ratio > 10) {
        facts.push("Vous preferez clairement les series aux films ! Team series !")
      } else if (ratio < 0.5) {
        facts.push("Vous etes plutot team cinema ! Les films n ont pas de secret pour vous !")
      }
    }

    // Statistiques de favoris
    if (stats.tvChannelsFavorites > 5) {
      facts.push(`${stats.tvChannelsFavorites} chaines TV en favoris ! Vous aimez zapper !`)
    }

    if (favorites.filter((f) => f.type === "actor").length > 10) {
      facts.push(`${favorites.filter((f) => f.type === "actor").length} acteurs favoris ! Vous avez bon gout !`)
    }

    if (favorites.filter((f) => f.type === "radio").length > 3) {
      facts.push(`${favorites.filter((f) => f.type === "radio").length} radios favorites ! Vous aimez la diversite !`)
    }

    // Statistiques de qualite
    if (stats.averageRating > 8) {
      facts.push(`Note moyenne de ${stats.averageRating.toFixed(1)}/10 ! Vous ne regardez que du bon contenu !`)
    }

    if (stats.averageRating < 6 && stats.averageRating > 0) {
      facts.push(`Note moyenne de ${stats.averageRating.toFixed(1)}/10... Vous n etes pas difficile !`)
    }

    // Statistiques temporelles
    const now = new Date()
    const thisYear = now.getFullYear()
    const watchedItems = await this.getWatchedItems()
    const thisYearItems = watchedItems.filter((item) => item.watchedAt.getFullYear() === thisYear)
    if (thisYearItems.length > 50) {
      facts.push(`${thisYearItems.length} contenus vus cette annee ! Vous battez des records !`)
    }

    // Statistiques par genre
    if (stats.favoriteGenre !== "Aucun") {
      const genreCount = watchedItems.filter((item) => item.genre === stats.favoriteGenre).length
      if (genreCount > 10) {
        facts.push(`${genreCount} contenus en ${stats.favoriteGenre} ! Vous etes un expert du genre !`)
      }
    }

    // Statistiques de likes/dislikes
    if (stats.totalLikes > 0 && stats.totalDislikes === 0) {
      facts.push("Vous n avez jamais dislike ! Vous etes tres positif !")
    }

    if (stats.totalDislikes > 0 && stats.totalLikes === 0) {
      facts.push("Que des dislikes... Rien ne vous plait ?")
    }

    const likeRatio =
      stats.totalLikes + stats.totalDislikes > 0
        ? (stats.totalLikes / (stats.totalLikes + stats.totalDislikes)) * 100
        : 0

    if (likeRatio > 80 && stats.totalLikes + stats.totalDislikes > 10) {
      facts.push(`${likeRatio.toFixed(0)}% de likes ! Vous etes tres positif dans vos evaluations !`)
    }

    if (likeRatio < 20 && stats.totalLikes + stats.totalDislikes > 10) {
      facts.push(`${likeRatio.toFixed(0)}% de likes... Vous etes un critique severe !`)
    }

    // Statistiques fun supplementaires
    if (stats.totalWatchTime > 43800) {
      facts.push("Vous avez regarde plus d un mois complet ! Vous pourriez avoir traverse l Atlantique a la nage !")
    }

    if (stats.episodesWatched > 2000) {
      facts.push("Plus de 2000 episodes ! Vous pourriez presenter un quiz TV !")
    }

    // Playlist-specific interesting facts
    if (stats.likesPlaylists > 5) {
      facts.push(`${stats.likesPlaylists} playlists likees ! Vous appreciez les collections de la communaute !`)
    }

    if (stats.likesPlaylists > stats.dislikesPlaylists && stats.likesPlaylists > 0) {
      facts.push(`Vous likez plus de playlists que vous n en dislikez ! Vous etes ouvert aux decouvertes !`)
    }

    return facts.slice(0, 8) // Limiter à 8 faits pour ne pas surcharger
  }

  // === ADDITIONAL METHODS ===
  static async addToHistory(
    type: "movie" | "tv" | "episode",
    tmdbId: number | string,
    title: string,
    duration: number,
    watchDuration: number,
    options?: {
      genre?: string
      season?: number
      episode?: number
      posterPath?: string
      showId?: number
    },
  ): Promise<void> {
    console.log("[v0] addToHistory called:", { type, tmdbId, title, watchDuration })

    const db = await this.getDB()
    const numericId = typeof tmdbId === "string" ? Number.parseInt(tmdbId) : tmdbId

    if (db) {
      const progress = duration > 0 ? Math.round((watchDuration / duration) * 100) : 0

      let contentId = numericId
      if (type === "episode" && options?.showId && options?.season && options?.episode) {
        contentId = Number.parseInt(`${options.showId}${options.season}${options.episode}`)
      }

      console.log("[v0] Saving to database with progress:", progress)
      await db.addToWatchHistory({
        content_id: contentId,
        content_type: type,
        content_title: title,
        watch_duration: watchDuration,
        total_duration: duration,
        progress: progress,
        last_watched_at: new Date().toISOString(),
        metadata: {
          genre: options?.genre,
          posterPath: options?.posterPath,
          season: options?.season,
          episode: options?.episode,
          showId: options?.showId,
        },
      })

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("watchlist-updated"))
      }
      return
    }

    // Fallback to localStorage
    console.log("[v0] Using localStorage fallback for history")
    if (typeof window === "undefined") return

    const items = await this.getWatchedItems()

    const existingIndex = items.findIndex((item) => item.type === type && item.tmdbId === numericId)

    if (existingIndex >= 0) {
      items[existingIndex].watchedAt = new Date()
      items[existingIndex].duration = duration
      items[existingIndex].progress = Math.round((watchDuration / duration) * 100)
    } else {
      const newItem: WatchedItem = {
        id: `${type}_${numericId}_${Date.now()}`,
        type,
        tmdbId: numericId,
        title,
        duration,
        watchedAt: new Date(),
        progress: Math.round((watchDuration / duration) * 100),
        posterPath: options?.posterPath,
        season: options?.season,
        episode: options?.episode,
        showId: options?.showId,
      }
      items.push(newItem)
    }

    localStorage.setItem(this.STORAGE_KEY_WATCHED, JSON.stringify(items))
    window.dispatchEvent(new Event("watchlist-updated"))
  }
}
