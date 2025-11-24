"use client"

import { useEffect, useState } from "react"
import { watchTrackerDB } from "@/lib/supabase/watch-tracking-db"
import { createClient } from "@/lib/supabase/client"

export function DataMigration() {
  const [migrating, setMigrating] = useState(false)

  useEffect(() => {
    const performMigration = async () => {
      // Only run on client side
      if (typeof window === "undefined") return

      // Check if user is logged in
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.log("[v0] No user logged in, skipping migration")
        return
      }

      // Check if migration was already done
      const migrationKey = `wavewatch_migration_done_${user.id}`
      if (localStorage.getItem(migrationKey)) {
        console.log("[v0] Migration already completed")
        return
      }

      // Check if there's any data in localStorage to migrate
      const hasData =
        localStorage.getItem("wavewatch_watched_items") ||
        localStorage.getItem("wavewatch_favorite_items") ||
        localStorage.getItem("wavewatch_wishlist_items") ||
        localStorage.getItem("wavewatch_rating_items")

      if (!hasData) {
        console.log("[v0] No localStorage data to migrate")
        // Mark as done even if no data to avoid checking again
        localStorage.setItem(migrationKey, "true")
        return
      }

      console.log("[v0] Found localStorage data, starting automatic migration...")
      setMigrating(true)

      try {
        await watchTrackerDB.migrateFromLocalStorage()
        console.log("[v0] Automatic migration successful!")
      } catch (error) {
        console.error("[v0] Migration failed:", error)
      } finally {
        setMigrating(false)
      }
    }

    // Run migration after a short delay to ensure everything is loaded
    const timer = setTimeout(performMigration, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Silent migration - no UI shown
  return null
}
