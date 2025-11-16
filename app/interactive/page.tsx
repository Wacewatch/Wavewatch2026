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
  const [worldState, setWorldState] = useState<{
    userId: string
    username: string
    userRole: 'member' | 'vip' | 'vip_plus' | 'admin'
    avatarStyle: any
    needsOnboarding: boolean
  } | null>(null)
  
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    console.log("[v0] Interactive page mounted")
    console.log("[v0] Auth loading:", authLoading, "User:", !!user)
    
    if (authLoading) {
      return
    }

    if (!user) {
      console.log("[v0] No user - redirecting to login")
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour accéder au monde interactif",
      })
      router.push("/login")
      return
    }

    initializeUser()
  }, [user, authLoading])

  const initializeUser = async () => {
    if (!user) return

    console.log("[v0] Initializing user:", user.id)
    const supabase = createClient()

    try {
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("is_admin, is_vip, is_vip_plus")
        .eq("user_id", user.id)
        .single()

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

      console.log("[v0] Interactive profile:", !!profile, "Error:", profileError?.code)

      if (!profile || !profile.username || !profile.avatar_style) {
        console.log("[v0] Needs onboarding")
        setWorldState({
          userId: user.id,
          username: '',
          userRole: role,
          avatarStyle: null,
          needsOnboarding: true
        })
        setIsLoading(false)
        return
      }

      console.log("[v0] Profile complete - loading world")
      await supabase
        .from("interactive_profiles")
        .update({ 
          is_online: true, 
          last_seen: new Date().toISOString() 
        })
        .eq("user_id", user.id)

      setWorldState({
        userId: user.id,
        username: profile.username,
        userRole: role,
        avatarStyle: profile.avatar_style,
        needsOnboarding: false
      })
      setIsLoading(false)
    } catch (error) {
      console.error("[v0] Error initializing:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleOnboardingComplete = () => {
    console.log("[v0] Onboarding complete - reloading")
    setIsLoading(true)
    initializeUser()
  }

  if (authLoading || isLoading) {
    return <LoadingScreen />
  }

  if (!user || !worldState) {
    return <LoadingScreen />
  }

  if (worldState.needsOnboarding) {
    return (
      <OnboardingFlow 
        userId={worldState.userId} 
        userRole={worldState.userRole} 
        onComplete={handleOnboardingComplete} 
      />
    )
  }

  return (
    <InteractiveWorld 
      userId={worldState.userId} 
      username={worldState.username} 
      userRole={worldState.userRole}
      avatarStyle={worldState.avatarStyle}
    />
  )
}
