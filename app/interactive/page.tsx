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
    if (authLoading) return
    if (!user) {
      router.push("/login")
      return
    }
    checkProfile()
  }, [user, authLoading])

  const checkProfile = async () => {
    if (!user) return

    try {
      const { data } = await supabase
        .from("interactive_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (data && data.username) {
        setProfile(data)
        setHasProfile(true)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isLoading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <LoadingScreen />
  }

  if (!hasProfile) {
    return <SimpleOnboarding userId={user.id} onComplete={checkProfile} />
  }

  return <SimpleWorld profile={profile} />
}
