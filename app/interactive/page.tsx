"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { InteractiveWorld } from "@/components/interactive/interactive-world"
import { LoadingScreen } from "@/components/interactive/loading-screen"
import { OnboardingFlow } from "@/components/interactive/onboarding-flow"

export default function InteractivePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [worldReady, setWorldReady] = useState(false)
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

    loadProfile()
  }, [user, authLoading])

  const loadProfile = async () => {
    if (!user) return

    try {
      const { data: profileData } = await supabase
        .from("interactive_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (!profileData || !profileData.username) {
        setWorldReady(false)
        setIsLoading(false)
        return
      }

      await supabase
        .from("interactive_profiles")
        .update({ is_online: true, last_seen: new Date().toISOString() })
        .eq("user_id", user.id)

      setProfile(profileData)
      setWorldReady(true)
      setIsLoading(false)
    } catch (error) {
      console.error("[v0] Profile error:", error)
      setIsLoading(false)
    }
  }

  if (authLoading || isLoading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <LoadingScreen />
  }

  if (!worldReady || !profile) {
    return (
      <OnboardingFlow 
        userId={user.id} 
        userRole={user.isAdmin ? 'admin' : user.isVipPlus ? 'vip_plus' : user.isVip ? 'vip' : 'member'}
        onComplete={loadProfile} 
      />
    )
  }

  return (
    <InteractiveWorld 
      userId={user.id} 
      username={profile.username} 
      userRole={user.isAdmin ? 'admin' : user.isVipPlus ? 'vip_plus' : user.isVip ? 'vip' : 'member'}
      avatarStyle={profile.avatar_style}
    />
  )
}
