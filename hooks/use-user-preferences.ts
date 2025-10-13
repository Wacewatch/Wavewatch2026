"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"

interface UserPreferences {
  showAdultContent: boolean
  showWatchedContent: boolean
  hideAdultContent: boolean
  autoMarkWatched: boolean
  themePreference: string
}

export function useUserPreferences() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences>({
    showAdultContent: false, // Par défaut, masquer le contenu adulte
    showWatchedContent: true,
    hideAdultContent: true, // Added new preference fields
    autoMarkWatched: false,
    themePreference: "system",
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user?.id) {
      loadPreferences()
    } else {
      setPreferences({
        showAdultContent: false,
        showWatchedContent: true,
        hideAdultContent: true,
        autoMarkWatched: false,
        themePreference: "system",
      })
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    const handleGetPreferences = () => {
      const event = new CustomEvent("user-preferences-response", {
        detail: preferences,
      })
      window.dispatchEvent(event)
    }

    const handleUpdatePreferences = (e: any) => {
      if (e.detail) {
        updatePreferences(e.detail)
      }
    }

    window.addEventListener("get-user-preferences", handleGetPreferences)
    window.addEventListener("update-user-preferences", handleUpdatePreferences)

    return () => {
      window.removeEventListener("get-user-preferences", handleGetPreferences)
      window.removeEventListener("update-user-preferences", handleUpdatePreferences)
    }
  }, [preferences])

  const loadPreferences = async () => {
    if (!user?.id) return

    try {
      console.log("[v0] Loading user preferences for user:", user.id)

      const { data, error } = await supabase
        .from("user_profiles")
        .select("hide_adult_content, auto_mark_watched, theme_preference")
        .eq("id", user.id)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading preferences:", error)
        return
      }

      console.log("[v0] Raw preferences data:", data)

      if (data) {
        const newPreferences = {
          showAdultContent: data.hide_adult_content === false, // Only show if explicitly set to false
          showWatchedContent: true,
          hideAdultContent: data.hide_adult_content !== false, // Hide by default
          autoMarkWatched: data.auto_mark_watched || false,
          themePreference: data.theme_preference || "system",
        }

        console.log("[v0] Processed preferences:", newPreferences)
        setPreferences(newPreferences)

        // Update TMDB library with adult content preference
        if (typeof window !== "undefined") {
          const { updateAdultContentPreference } = await import("@/lib/tmdb")
          updateAdultContentPreference(newPreferences.showAdultContent)
        }
      } else {
        console.log("[v0] No preferences found, using defaults")
        const defaultPreferences = {
          showAdultContent: false, // Default: hide adult content
          showWatchedContent: true,
          hideAdultContent: true, // Default: hide adult content
          autoMarkWatched: false,
          themePreference: "system",
        }
        setPreferences(defaultPreferences)

        // Update TMDB library with default preference
        if (typeof window !== "undefined") {
          const { updateAdultContentPreference } = await import("@/lib/tmdb")
          updateAdultContentPreference(false)
        }
      }
    } catch (error) {
      console.error("Error loading preferences:", error)
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user?.id) return

    const updatedPreferences = { ...preferences, ...newPreferences }
    setPreferences(updatedPreferences)

    console.log("[v0] Updating preferences:", updatedPreferences)

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          hide_adult_content: updatedPreferences.hideAdultContent,
          auto_mark_watched: updatedPreferences.autoMarkWatched,
          theme_preference: updatedPreferences.themePreference,
        })
        .eq("id", user.id)

      if (error) {
        console.error("Error updating preferences:", error)
        // Revert on error
        setPreferences(preferences)
      } else {
        console.log("[v0] Preferences updated successfully:", updatedPreferences)

        // Update TMDB library with new adult content preference
        if (typeof window !== "undefined") {
          const { updateAdultContentPreference } = await import("@/lib/tmdb")
          updateAdultContentPreference(updatedPreferences.showAdultContent)
        }

        window.dispatchEvent(
          new CustomEvent("preferences-updated", {
            detail: updatedPreferences,
          }),
        )
      }
    } catch (error) {
      console.error("Error updating preferences:", error)
      // Revert on error
      setPreferences(preferences)
    }
  }

  return {
    preferences,
    updatePreferences,
    loading,
  }
}
