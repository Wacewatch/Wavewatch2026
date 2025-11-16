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
    const loadingTimeout = setTimeout(() => {
      if (isLoading && user) {
        console.log("[v0] Loading timeout - showing onboarding")
        setIsLoading(false)
        setNeedsOnboarding(true)
        setUserId(user.id)
      }
    }, 8000) // Increased timeout for slower connections

    return () => clearTimeout(loadingTimeout)
  }, [isLoading, user])

  useEffect(() => {
    if (authLoading) {
      console.log("[v0] Auth still loading...")
      return
    }

    if (!user) {
      console.log("[v0] No user found after auth loaded")
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour accéder au monde interactif",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    console.log("[v0] User authenticated, initializing...")
    initializeUser()
  }, [user, authLoading])

  const initializeUser = async () => {
    if (!user) {
      console.error("[v0] Auth error: Auth session missing!")
      toast({
        title: "Erreur d'authentification",
        description: "Impossible de charger votre profil",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    console.log("[v0] Initializing user:", user.id)
    const supabase = createClient()

    try {
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()

      console.log("[v0] User profile loaded:", userProfile?.username)

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
        .eq("user_id", user.id)
        .single()

      console.log("[v0] Interactive profile found:", !!profile)

      if (profileError && profileError.code === "PGRST116") {
        console.log("[v0] No interactive profile - showing onboarding")
        setNeedsOnboarding(true)
        setUserId(user.id)
        setUserRole(role)
        setIsLoading(false)
        return
      }

      if (profile && !profile.avatar_style) {
        console.log("[v0] Profile exists but missing avatar - showing onboarding")
        setNeedsOnboarding(true)
        setUserId(user.id)
        setUserRole(role)
        setProfileData(profile)
        setIsLoading(false)
        return
      }

      if (profile) {
        console.log("[v0] Complete profile found - loading world")
        await supabase
          .from("interactive_profiles")
          .update({ 
            is_online: true, 
            last_seen: new Date().toISOString() 
          })
          .eq("user_id", user.id)

        setUsername(profile.username)
        setUserId(user.id)
        setUserRole(role)
        setProfileData(profile)
      }

      setIsLoading(false)
    } catch (error) {
      console.error("[v0] Error initializing user:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement",
        variant: "destructive",
      })
      setIsLoading(false)
    }
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
