"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { InteractiveWorld } from "@/components/interactive/interactive-world"
import { LoadingScreen } from "@/components/interactive/loading-screen"
import { OnboardingFlow } from "@/components/interactive/onboarding-flow"
import { useToast } from "@/hooks/use-toast"

export default function InteractivePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<'member' | 'vip' | 'vip_plus' | 'admin'>('member')
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour accéder au monde interactif",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    initializeUser()
  }, [user, authLoading, router, toast])

  const initializeUser = async () => {
    console.log("[v0] Initializing user...")
    const supabase = createClient()

    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("[v0] Current user:", currentUser?.id)

    if (authError || !currentUser) {
      console.error("[v0] Auth error:", authError)
      toast({
        title: "Erreur d'authentification",
        description: "Impossible de charger votre profil",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", currentUser.id)
      .single()

    console.log("[v0] User profile:", userProfile)

    let role: 'member' | 'vip' | 'vip_plus' | 'admin' = 'member'
    if (userProfile) {
      if (userProfile.is_admin) role = 'admin'
      else if (userProfile.is_vip_plus) role = 'vip_plus'
      else if (userProfile.is_vip) role = 'vip'
    }

    console.log("[v0] User role:", role)

    const { data: profile, error: profileError } = await supabase
      .from("interactive_profiles")
      .select("*")
      .eq("user_id", currentUser.id)
      .single()

    console.log("[v0] Interactive profile:", profile)
    console.log("[v0] Profile error:", profileError)

    if (profileError && profileError.code === "PGRST116") {
      console.log("[v0] No profile found, showing onboarding")
      setNeedsOnboarding(true)
      setUserId(currentUser.id)
      setUserRole(role)
      setIsLoading(false)
      return
    } else if (profile && !profile.avatar_style) {
      console.log("[v0] Profile exists but no avatar, showing onboarding")
      setNeedsOnboarding(true)
      setUserId(currentUser.id)
      setUserRole(role)
      setProfileData(profile)
      setIsLoading(false)
      return
    } else if (profile) {
      console.log("[v0] Profile found, updating online status")
      await supabase
        .from("interactive_profiles")
        .update({ is_online: true, last_seen: new Date().toISOString() })
        .eq("user_id", currentUser.id)

      setUsername(profile.username)
      setUserId(currentUser.id)
      setUserRole(role)
      setProfileData(profile)
      console.log("[v0] User initialized successfully")
    }

    setIsLoading(false)
  }

  const handleOnboardingComplete = async () => {
    await initializeUser()
    setNeedsOnboarding(false)
  }

  if (authLoading || isLoading) {
    return <LoadingScreen />
  }

  if (!user) {
    return null
  }

  if (needsOnboarding && userId) {
    return <OnboardingFlow userId={userId} userRole={userRole} onComplete={handleOnboardingComplete} />
  }

  if (!userId || !username || !profileData) {
    return null
  }

  return <InteractiveWorld 
    userId={userId} 
    username={username} 
    userRole={userRole}
    avatarStyle={profileData.avatar_style}
  />
}
