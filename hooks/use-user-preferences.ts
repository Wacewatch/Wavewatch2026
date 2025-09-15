"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"

interface UserPreferences {
  showAdultContent: boolean
  showWatchedContent: boolean
}

export function useUserPreferences() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences>({
    showAdultContent: false, // Par défaut, masquer le contenu adulte
    showWatchedContent: true,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadPreferences()
    } else {
      setPreferences({
        showAdultContent: false,
        showWatchedContent: true,
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
      const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading preferences:", error)
        return
      }

      if (data) {
        setPreferences({
          showAdultContent: data.show_adult_content || false, // Par défaut false
          showWatchedContent: data.show_watched_content !== false, // Default to true
        })
      } else {
        setPreferences({
          showAdultContent: false,
          showWatchedContent: true,
        })
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

    try {
      const { error } = await supabase.from("user_preferences").upsert({
        user_id: user.id,
        show_adult_content: updatedPreferences.showAdultContent,
        show_watched_content: updatedPreferences.showWatchedContent,
      })

      if (error) {
        console.error("Error updating preferences:", error)
        // Revert on error
        setPreferences(preferences)
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
