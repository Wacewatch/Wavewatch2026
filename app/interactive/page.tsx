"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { LoadingScreen } from "@/components/interactive/loading-screen"
import { SimpleOnboarding } from "@/components/interactive/simple-onboarding"
import { SimpleWorld } from "@/components/interactive/simple-world"

export default function InteractivePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    console.log("[v0] Interactive page mounted")
    console.log("[v0] Auth loading:", authLoading, "User:", user?.id)
  }, [])

  useEffect(() => {
    if (authLoading) {
      console.log("[v0] Still loading auth...")
      return
    }
    if (!user) {
      console.log("[v0] No user, redirecting to login")
      router.push("/login")
      return
    }
    console.log("[v0] User authenticated, checking profile...")
    checkProfile()
  }, [user, authLoading])

  const checkProfile = async () => {
    if (!user) return

    try {
      console.log("[v0] Fetching interactive profile for user:", user.id)
      const { data, error } = await supabase
        .from("interactive_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error) {
        console.error("[v0] Error fetching profile:", error)
      }

      if (data && data.username) {
        console.log("[v0] Profile found:", data.username)
        setProfile(data)
        setHasProfile(true)
      } else {
        console.log("[v0] No profile found, showing onboarding")
      }
    } catch (error) {
      console.error("[v0] Exception in checkProfile:", error)
    } finally {
      console.log("[v0] Check profile complete, setting loading to false")
      setIsLoading(false)
    }
  }

  if (authLoading || isLoading) {
    console.log("[v0] Showing loading screen")
    return <LoadingScreen />
  }

  if (!user) {
    console.log("[v0] No user after loading, showing loading screen")
    return <LoadingScreen />
  }

  if (!hasProfile) {
    console.log("[v0] No profile, showing onboarding")
    return <SimpleOnboarding userId={user.id} onComplete={checkProfile} />
  }

  console.log("[v0] Everything ready, loading SimpleWorld")
  return <SimpleWorld profile={profile} />
}
