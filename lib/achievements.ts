export interface Achievement {
  id: string
  code: string
  name: string
  description: string
  category:
    | "movie"
    | "tv"
    | "anime"
    | "tv-channel"
    | "radio"
    | "retrogaming"
    | "playlist"
    | "vip"
    | "social"
    | "general"
  icon: string
  color: string
  requirement_type: "count" | "streak" | "time" | "rating" | "special"
  requirement_value: number
  points: number
  rarity: "common" | "rare" | "epic" | "legendary"
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
  progress: number
  achievement?: Achievement
}

export interface AchievementProgress {
  achievement: Achievement
  unlocked: boolean
  progress: number
  percentage: number
}

export class AchievementSystem {
  // Check and unlock achievements based on user stats
  static checkAchievements(stats: any): string[] {
    const unlockedCodes: string[] = []

    // Movie achievements
    if (stats.moviesWatched >= 1) unlockedCodes.push("movie_first")
    if (stats.moviesWatched >= 10) unlockedCodes.push("movie_10")
    if (stats.moviesWatched >= 50) unlockedCodes.push("movie_50")
    if (stats.moviesWatched >= 100) unlockedCodes.push("movie_100")
    if (stats.moviesWatched >= 500) unlockedCodes.push("movie_500")

    // TV achievements
    if (stats.showsWatched >= 1) unlockedCodes.push("tv_first")
    if (stats.showsWatched >= 10) unlockedCodes.push("tv_10")
    if (stats.showsWatched >= 50) unlockedCodes.push("tv_50")
    if (stats.showsWatched >= 100) unlockedCodes.push("tv_100")

    if (stats.episodesWatched >= 100) unlockedCodes.push("tv_episodes_100")
    if (stats.episodesWatched >= 500) unlockedCodes.push("tv_episodes_500")
    if (stats.episodesWatched >= 1000) unlockedCodes.push("tv_episodes_1000")

    // TV Channel achievements
    if (stats.tvChannelsFavorites >= 1) unlockedCodes.push("tv_channel_first")
    if (stats.tvChannelsFavorites >= 5) unlockedCodes.push("tv_channel_5")
    if (stats.tvChannelsFavorites >= 10) unlockedCodes.push("tv_channel_10")
    if (stats.likesTVChannels >= 10) unlockedCodes.push("tv_channel_like_10")

    // Radio achievements
    const radioFavorites = stats.radioFavorites || 0
    if (radioFavorites >= 1) unlockedCodes.push("radio_first")
    if (radioFavorites >= 5) unlockedCodes.push("radio_5")
    if (radioFavorites >= 10) unlockedCodes.push("radio_10")
    if (stats.likesRadio >= 10) unlockedCodes.push("radio_like_10")

    // Retrogaming achievements
    const gamesFavorites = stats.gamesFavorites || 0
    if (gamesFavorites >= 1) unlockedCodes.push("game_first")
    if (gamesFavorites >= 10) unlockedCodes.push("game_10")
    if (gamesFavorites >= 50) unlockedCodes.push("game_50")
    if (stats.likesGames >= 20) unlockedCodes.push("game_like_20")

    // Playlist achievements
    if (stats.likesPlaylists >= 10) unlockedCodes.push("playlist_like_10")

    // Social achievements
    if (stats.totalLikes >= 50) unlockedCodes.push("social_likes_50")
    if (stats.totalLikes >= 100) unlockedCodes.push("social_likes_100")
    if (stats.totalLikes >= 500) unlockedCodes.push("social_likes_500")

    const totalFavorites = stats.favoritesCount || 0
    if (totalFavorites >= 50) unlockedCodes.push("social_favorites_50")
    if (totalFavorites >= 100) unlockedCodes.push("social_favorites_100")

    // General achievements
    if (stats.watchingStreak >= 7) unlockedCodes.push("general_streak_7")
    if (stats.watchingStreak >= 30) unlockedCodes.push("general_streak_30")
    if (stats.watchingStreak >= 100) unlockedCodes.push("general_streak_100")

    // Time-based achievements (totalWatchTime is in minutes)
    if (stats.totalWatchTime >= 1440) unlockedCodes.push("general_time_24h") // 24 hours
    if (stats.totalWatchTime >= 10080) unlockedCodes.push("general_time_week") // 7 days
    if (stats.totalWatchTime >= 43200) unlockedCodes.push("general_time_month") // 30 days

    return unlockedCodes
  }

  // Calculate progress for an achievement
  static calculateProgress(achievement: Achievement, stats: any): number {
    switch (achievement.code) {
      // Movies
      case "movie_first":
      case "movie_10":
      case "movie_50":
      case "movie_100":
      case "movie_500":
        return Math.min(stats.moviesWatched, achievement.requirement_value)

      // TV Shows
      case "tv_first":
      case "tv_10":
      case "tv_50":
      case "tv_100":
        return Math.min(stats.showsWatched, achievement.requirement_value)

      case "tv_episodes_100":
      case "tv_episodes_500":
      case "tv_episodes_1000":
        return Math.min(stats.episodesWatched, achievement.requirement_value)

      // TV Channels
      case "tv_channel_first":
      case "tv_channel_5":
      case "tv_channel_10":
        return Math.min(stats.tvChannelsFavorites, achievement.requirement_value)

      case "tv_channel_like_10":
        return Math.min(stats.likesTVChannels, achievement.requirement_value)

      // Radio
      case "radio_first":
      case "radio_5":
      case "radio_10":
        return Math.min(stats.radioFavorites || 0, achievement.requirement_value)

      case "radio_like_10":
        return Math.min(stats.likesRadio, achievement.requirement_value)

      // Retrogaming
      case "game_first":
      case "game_10":
      case "game_50":
        return Math.min(stats.gamesFavorites || 0, achievement.requirement_value)

      case "game_like_20":
        return Math.min(stats.likesGames, achievement.requirement_value)

      // Playlists
      case "playlist_like_10":
        return Math.min(stats.likesPlaylists, achievement.requirement_value)

      // Social
      case "social_likes_50":
      case "social_likes_100":
      case "social_likes_500":
        return Math.min(stats.totalLikes, achievement.requirement_value)

      case "social_favorites_50":
      case "social_favorites_100":
        return Math.min(stats.favoritesCount || 0, achievement.requirement_value)

      // General
      case "general_streak_7":
      case "general_streak_30":
      case "general_streak_100":
        return Math.min(stats.watchingStreak, achievement.requirement_value)

      case "general_time_24h":
      case "general_time_week":
      case "general_time_month":
        return Math.min(stats.totalWatchTime, achievement.requirement_value)

      default:
        return 0
    }
  }

  // Get rarity color
  static getRarityColor(rarity: string): string {
    switch (rarity) {
      case "common":
        return "text-gray-400 border-gray-600"
      case "rare":
        return "text-blue-400 border-blue-600"
      case "epic":
        return "text-purple-400 border-purple-600"
      case "legendary":
        return "text-yellow-400 border-yellow-600"
      default:
        return "text-gray-400 border-gray-600"
    }
  }

  // Get rarity badge background
  static getRarityBg(rarity: string): string {
    switch (rarity) {
      case "common":
        return "bg-gray-900/50"
      case "rare":
        return "bg-blue-900/50"
      case "epic":
        return "bg-purple-900/50"
      case "legendary":
        return "bg-yellow-900/50"
      default:
        return "bg-gray-900/50"
    }
  }
}
