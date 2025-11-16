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
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour accéder au monde interactif",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!user.isAdmin) {
      toast({
        title: "Accès refusé",
        description: "Cette fonctionnalité est réservée aux administrateurs.",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    // User is admin, proceed with initialization
    initializeUser()
  }, [user, authLoading, router, toast])

  const initializeUser = async () => {
    const supabase = createClient()

    // Get current user
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      toast({
        title: "Erreur d'authentification",
        description: "Impossible de charger votre profil",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from("interactive_profiles")
      .select("*")
      .eq("user_id", currentUser.id)
      .single()

    if (profileError && profileError.code === "PGRST116") {
      // No profile exists - need full onboarding
      setNeedsOnboarding(true)
      setUserId(currentUser.id)
      setIsLoading(false)
      return
    } else if (profile && !profile.avatar_style) {
      // Profile exists but no avatar customization - need onboarding
      setNeedsOnboarding(true)
      setUserId(currentUser.id)
      setProfileId(profile.id)
      setIsLoading(false)
      return
    } else if (profile) {
      // Profile complete, update online status
      await supabase
        .from("interactive_profiles")
        .update({ is_online: true, last_seen: new Date().toISOString() })
        .eq("user_id", currentUser.id)

      setUsername(profile.username)
      setUserId(currentUser.id)
      setProfileId(profile.id)
    }

    setIsLoading(false)
  }

  const handleOnboardingComplete = async () => {
    // Reload profile after onboarding
    await initializeUser()
    setNeedsOnboarding(false)
  }

  if (authLoading || isLoading) {
    return <LoadingScreen />
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Accès refusé</h1>
          <p className="text-muted-foreground">
            Cette fonctionnalité est réservée aux administrateurs.
          </p>
        </div>
      </div>
    )
  }

  if (needsOnboarding && userId) {
    return <OnboardingFlow userId={userId} onComplete={handleOnboardingComplete} />
  }

  if (!userId || !username) {
    return null
  }

  return <InteractiveWorld userId={userId} username={username} />
}
