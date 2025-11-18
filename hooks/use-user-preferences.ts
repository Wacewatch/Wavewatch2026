"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"

interface UserPreferences {
  showAdultContent: boolean
  showWatchedContent: boolean
  hideAdultContent: boolean
  autoMarkWatched: boolean
  themePreference: string
  hideSpoilers: boolean
}

export function useUserPreferences() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences>({
    showAdultContent: false,
    showWatchedContent: true,
    hideAdultContent: true,
    autoMarkWatched: false,
    themePreference: "system",
    hideSpoilers: false,
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
        hideSpoilers: false,
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
      const { data, error } = await supabase
        .from("user_profiles")
        .select("hide_adult_content, auto_mark_watched, theme_preference, hide_spoilers")
        .eq("id", user.id)
        .maybeSingle()

      if (error && error.code !== "PGRST116") {
        console.error("[v0] Error loading preferences:", error.message)
        return
      }

      if (data) {
        const newPreferences = {
          showAdultContent: !data.hide_adult_content,
          showWatchedContent: true,
          hideAdultContent: data.hide_adult_content !== false,
          autoMarkWatched: data.auto_mark_watched || false,
          themePreference: data.theme_preference || "system",
          hideSpoilers: data.hide_spoilers || false,
        }

        setPreferences(newPreferences)

        if (typeof window !== "undefined") {
          localStorage.setItem("wavewatch_adult_content", newPreferences.showAdultContent.toString())
          localStorage.setItem("wavewatch_hide_spoilers", newPreferences.hideSpoilers.toString())
          const { updateAdultContentPreference } = await import("@/lib/tmdb")
          updateAdultContentPreference(newPreferences.showAdultContent)
        }
      } else {
        const defaultPreferences = {
          showAdultContent: false,
          showWatchedContent: true,
          hideAdultContent: true,
          autoMarkWatched: false,
          themePreference: "system",
          hideSpoilers: false,
        }
        setPreferences(defaultPreferences)

        if (typeof window !== "undefined") {
          localStorage.setItem("wavewatch_adult_content", "false")
          localStorage.setItem("wavewatch_hide_spoilers", "false")
          const { updateAdultContentPreference } = await import("@/lib/tmdb")
          updateAdultContentPreference(false)
        }
      }
    } catch (error: any) {
      console.error("[v0] Error loading preferences:", error.message)
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user?.id) {
      console.error("[v0] No user ID available for updating preferences")
      return false
    }

    const updatedPreferences = { ...preferences, ...newPreferences }

    if ("showAdultContent" in newPreferences) {
      updatedPreferences.hideAdultContent = !newPreferences.showAdultContent
    }
    if ("hideAdultContent" in newPreferences) {
      updatedPreferences.showAdultContent = !newPreferences.hideAdultContent
    }

    setPreferences(updatedPreferences)

    if (typeof window !== "undefined") {
      localStorage.setItem("wavewatch_adult_content", updatedPreferences.showAdultContent.toString())
      localStorage.setItem("wavewatch_hide_spoilers", updatedPreferences.hideSpoilers.toString())
    }

    try {
      console.log("[v0] Updating preferences for user:", user.id)

      const { error } = await supabase.from("user_profiles").upsert(
        {
          id: user.id,
          hide_adult_content: updatedPreferences.hideAdultContent,
          auto_mark_watched: updatedPreferences.autoMarkWatched,
          theme_preference: updatedPreferences.themePreference,
          hide_spoilers: updatedPreferences.hideSpoilers,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      )

      if (error) {
        console.error("[v0] Error updating preferences:", error.message)
        setPreferences(preferences)
        if (typeof window !== "undefined") {
          localStorage.setItem("wavewatch_adult_content", preferences.showAdultContent.toString())
          localStorage.setItem("wavewatch_hide_spoilers", preferences.hideSpoilers.toString())
        }
        return false
      }

      console.log("[v0] Preferences updated successfully")

      if (typeof window !== "undefined") {
        const { updateAdultContentPreference } = await import("@/lib/tmdb")
        updateAdultContentPreference(updatedPreferences.showAdultContent)
      }

      window.dispatchEvent(
        new CustomEvent("preferences-updated", {
          detail: updatedPreferences,
        }),
      )

      return true
    } catch (error: any) {
      console.error("[v0] Error updating preferences:", error.message)
      setPreferences(preferences)
      if (typeof window !== "undefined") {
        localStorage.setItem("wavewatch_adult_content", preferences.showAdultContent.toString())
        localStorage.setItem("wavewatch_hide_spoilers", preferences.hideSpoilers.toString())
      }
      return false
    }
  }

  return {
    preferences,
    updatePreferences,
    loading,
  }
}
