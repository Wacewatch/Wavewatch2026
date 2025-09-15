"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { updateAdultContentPreference } from "@/lib/tmdb"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface User {
  id: string
  username: string
  email: string
  isVip: boolean
  isAdmin: boolean
  vipExpiresAt?: string
  showAdultContent?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (username: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    let isMounted = true

    const initAuth = async () => {
      try {
        console.log("🔄 Initializing auth...")

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("❌ Error getting session:", error)
        } else if (session?.user && isMounted) {
          console.log("✅ Found existing session for:", session.user.email)
          console.log("📧 Email confirmed:", !!session.user.email_confirmed_at)

          await loadUserProfile(session.user, true)
        } else {
          console.log("ℹ️ No existing session found")
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return

      console.log("🔄 Auth state change:", event, session?.user?.email || "no user")

      if (event === "SIGNED_IN" && session?.user) {
        console.log("✅ User signed in:", session.user.email)
        console.log("📧 Email confirmed:", !!session.user.email_confirmed_at)

        await loadUserProfile(session.user, true)
      } else if (event === "SIGNED_OUT") {
        console.log("👋 User signed out")
        setUser(null)
        updateAdultContentPreference(false)
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        console.log("🔄 Token refreshed for:", session.user.email)
        await loadUserProfile(session.user, true)
      }

      if (isMounted) {
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [mounted])

  const loadUserProfile = async (supabaseUser: SupabaseUser, ignoreConfirmation = false) => {
    try {
      console.log("👤 Loading profile for user:", supabaseUser.email)
      console.log("📧 Email confirmed:", !!supabaseUser.email_confirmed_at)
      console.log("🔓 Ignoring confirmation:", ignoreConfirmation)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .maybeSingle()

      if (error && error.code !== "PGRST116") {
        console.error("❌ Error loading profile:", error)
        await createUserProfileSecurely(supabaseUser)
        return
      }

      if (!profile) {
        console.log("📝 No profile found, creating securely...")
        await createUserProfileSecurely(supabaseUser)
        return
      }

      console.log("✅ Profile loaded:", profile)

      const userData: User = {
        id: supabaseUser.id,
        username: profile.username || supabaseUser.email?.split("@")[0] || "User",
        email: supabaseUser.email || "",
        isVip: Boolean(profile.is_vip || profile.is_vip_plus),
        isAdmin: Boolean(profile.is_admin),
        vipExpiresAt: profile.vip_expires_at,
        showAdultContent: Boolean(profile.show_adult_content),
      }

      setUser(userData)

      updateAdultContentPreference(userData.showAdultContent || false)

      console.log("👤 User set:", {
        username: userData.username,
        isAdmin: userData.isAdmin,
        isVip: userData.isVip,
        showAdultContent: userData.showAdultContent,
      })
    } catch (error) {
      console.error("❌ Error loading user profile:", error)

      const username = supabaseUser.user_metadata?.username || supabaseUser.email?.split("@")[0] || "User"
      const isAdmin = username.toLowerCase() === "wwadmin"

      console.log("🔄 Using fallback user creation")

      setUser({
        id: supabaseUser.id,
        username: username,
        email: supabaseUser.email || "",
        isVip: isAdmin,
        isAdmin: isAdmin,
        showAdultContent: false,
      })

      updateAdultContentPreference(false)
    }
  }

  const createUserProfileSecurely = async (supabaseUser: SupabaseUser) => {
    try {
      const username = supabaseUser.user_metadata?.username || supabaseUser.email?.split("@")[0] || "User"

      console.log("📝 Creating profile securely for:", username)

      try {
        const { data, error } = await supabase.rpc("create_user_profile_secure", {
          user_id_param: supabaseUser.id,
          username_param: username,
          email_param: supabaseUser.email,
        })

        if (error) {
          throw error
        }

        console.log("✅ Profile created securely via SQL function:", data)

        const userData: User = {
          id: data.id,
          username: data.username,
          email: data.email,
          isVip: Boolean(data.is_vip || data.is_vip_plus),
          isAdmin: Boolean(data.is_admin),
          vipExpiresAt: data.vip_expires_at,
          showAdultContent: Boolean(data.show_adult_content),
        }

        setUser(userData)
        updateAdultContentPreference(userData.showAdultContent || false)
        return
      } catch (sqlError) {
        console.warn("⚠️ SQL function not available, using fallback:", sqlError)
      }

      const isAdmin = username.toLowerCase() === "wwadmin"

      setUser({
        id: supabaseUser.id,
        username: username,
        email: supabaseUser.email || "",
        isVip: isAdmin,
        isAdmin: isAdmin,
        showAdultContent: false,
      })

      updateAdultContentPreference(false)

      console.log("✅ Profile created in memory as fallback")
    } catch (error) {
      console.error("❌ Error in createUserProfileSecurely:", error)

      const username = supabaseUser.user_metadata?.username || supabaseUser.email?.split("@")[0] || "User"
      const isAdmin = username.toLowerCase() === "wwadmin"

      setUser({
        id: supabaseUser.id,
        username: username,
        email: supabaseUser.email || "",
        isVip: isAdmin,
        isAdmin: isAdmin,
        showAdultContent: false,
      })

      updateAdultContentPreference(false)
    }
  }

  const refreshUser = async () => {
    try {
      console.log("🔄 Refreshing user data...")
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("❌ Error getting session for refresh:", error)
        return
      }

      if (session?.user) {
        await loadUserProfile(session.user, true)
        console.log("✅ User data refreshed")
      }
    } catch (error) {
      console.error("❌ Error refreshing user:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      console.log("🔐 Attempting sign in for:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        console.error("❌ Sign in error:", error)
        throw error
      }

      console.log("✅ Sign in successful:", data.user?.email)

      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur WaveWatch!",
      })
    } catch (error: any) {
      console.error("❌ Final sign in error:", error)
      toast({
        title: "Erreur de connexion",
        description: error.message || "Email ou mot de passe incorrect",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (username: string, email: string, password: string) => {
    try {
      setLoading(true)
      console.log("📝 Attempting sign up for:", email, "username:", username)

      if (!username || username.length < 2) {
        throw new Error("Le nom d'utilisateur doit contenir au moins 2 caractères")
      }
      if (!email || !email.includes("@")) {
        throw new Error("Format d'email invalide")
      }
      if (!password || password.length < 6) {
        throw new Error("Le mot de passe doit contenir au moins 6 caractères")
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
          data: {
            username: username.trim(),
          },
        },
      })

      if (error) {
        console.error("❌ Sign up error:", error)
        throw error
      }

      console.log("📝 Sign up result:", {
        user: !!data.user,
        session: !!data.session,
        userEmail: data.user?.email,
        confirmed: !!data.user?.email_confirmed_at,
      })

      if (data.user) {
        if (data.session) {
          console.log("✅ User signed up and logged in immediately")
          toast({
            title: "Compte créé avec succès !",
            description: `Bienvenue ${username} sur WaveWatch !`,
          })
        } else {
          console.log("📧 User created, attempting immediate sign in...")

          await new Promise((resolve) => setTimeout(resolve, 2000))

          try {
            await signIn(email, password)
          } catch (signInError) {
            console.warn("⚠️ Could not auto sign in after signup:", signInError)
            toast({
              title: "Compte créé !",
              description: "Votre compte a été créé. Vous pouvez maintenant vous connecter.",
            })
          }
        }
      }
    } catch (error: any) {
      console.error("❌ Registration error:", error)
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue lors de la création du compte",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      console.log("👋 Signing out...")
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      updateAdultContentPreference(false)
      console.log("✅ Sign out successful")

      toast({
        title: "Déconnexion réussie",
        description: "À bientôt!",
      })
    } catch (error: any) {
      console.error("❌ Signout error:", error)
      setUser(null)
      updateAdultContentPreference(false)
      toast({
        title: "Déconnexion",
        description: "Vous avez été déconnecté",
      })
    }
  }

  useEffect(() => {
    const handleProfileUpdate = () => {
      if (user?.id) {
        refreshUser()
      }
    }

    window.addEventListener("profile-updated", handleProfileUpdate)
    return () => window.removeEventListener("profile-updated", handleProfileUpdate)
  }, [user?.id])

  if (!mounted) {
    return (
      <AuthContext.Provider
        value={{
          user: null,
          loading: true,
          signIn: async () => {},
          signUp: async () => {},
          signOut: async () => {},
          refreshUser: async () => {},
        }}
      >
        {children}
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
