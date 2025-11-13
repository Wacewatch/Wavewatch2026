"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { updateAdultContentPreference } from "@/lib/tmdb"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface User {
  id: string
  username: string
  email: string
  isVip: boolean
  isVipPlus: boolean
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

function withTimeout<T>(promise: Promise<T>, timeoutMs = 15000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Request timeout")), timeoutMs)),
  ])
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await withTimeout(supabase.auth.getSession(), 10000)

        if (session?.user) {
          await loadUserProfile(session.user)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error("[v0] Auth initialization error:", error)
        setLoading(false)
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Auth state change:", event)

      if (event === "SIGNED_IN" && session?.user) {
        await loadUserProfile(session.user)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        updateAdultContentPreference(false)
      } else if (event === "USER_UPDATED" && session?.user) {
        // Only reload on explicit user updates, not token refreshes
        await loadUserProfile(session.user)
      }
      // Removed TOKEN_REFRESHED handler to prevent unnecessary profile reloads
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log("[v0] Loading profile for user:", supabaseUser.id)

      const { data: profile, error } = await withTimeout(
        supabase.from("user_profiles").select("*").eq("id", supabaseUser.id).single(),
        8000,
      )

      // If profile exists, use it
      if (profile && !error) {
        console.log("[v0] Profile found:", profile.username)
        const userData: User = {
          id: supabaseUser.id,
          username: profile.username || supabaseUser.email?.split("@")[0] || "User",
          email: supabaseUser.email || "",
          isVip: Boolean(profile.is_vip),
          isVipPlus: Boolean(profile.is_vip_plus),
          isAdmin: Boolean(profile.is_admin),
          vipExpiresAt: profile.vip_expires_at,
          showAdultContent: Boolean(profile.show_adult_content),
        }

        setUser(userData)
        updateAdultContentPreference(userData.showAdultContent || false)
        return
      }

      // Only create profile if it genuinely doesn't exist (not on other errors)
      if (error?.code === "PGRST116") {
        // PostgreSQL "no rows" error
        console.log("[v0] Profile not found, creating new profile")
        const username = supabaseUser.user_metadata?.username || supabaseUser.email?.split("@")[0] || "User"
        const isAdmin = username.toLowerCase() === "wwadmin"

        const userData: User = {
          id: supabaseUser.id,
          username: username,
          email: supabaseUser.email || "",
          isVip: isAdmin,
          isVipPlus: false,
          isAdmin: isAdmin,
          showAdultContent: false,
        }

        // Create profile in database
        const { error: upsertError } = await supabase.from("user_profiles").insert({
          id: supabaseUser.id,
          username: userData.username,
          email: userData.email,
          is_admin: userData.isAdmin,
          is_vip: userData.isVip,
          is_vip_plus: false,
          show_adult_content: false,
        })

        if (upsertError) {
          console.error("[v0] Error creating profile:", upsertError)
        } else {
          console.log("[v0] Profile created successfully")
        }

        setUser(userData)
        updateAdultContentPreference(false)
      } else {
        // For other errors, log but still set user with fallback data
        console.error("[v0] Error loading profile:", error)
        const username = supabaseUser.email?.split("@")[0] || "User"
        const fallbackUser: User = {
          id: supabaseUser.id,
          username: username,
          email: supabaseUser.email || "",
          isVip: false,
          isVipPlus: false,
          isAdmin: username.toLowerCase() === "wwadmin",
          showAdultContent: false,
        }
        setUser(fallbackUser)
      }
    } catch (error) {
      console.error("[v0] Exception in loadUserProfile:", error)
      // Fallback user data on exception
      const username = supabaseUser.email?.split("@")[0] || "User"
      setUser({
        id: supabaseUser.id,
        username: username,
        email: supabaseUser.email || "",
        isVip: false,
        isVipPlus: false,
        isAdmin: username.toLowerCase() === "wwadmin",
        showAdultContent: false,
      })
    }
  }

  const refreshUser = async () => {
    try {
      const {
        data: { session },
      } = await withTimeout(supabase.auth.getSession(), 10000)
      if (session?.user) {
        await loadUserProfile(session.user)
      }
    } catch (error) {
      console.error("[v0] Error refreshing user:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)

      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        }),
        15000,
      )

      if (error) {
        throw new Error(error.message)
      }

      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur WaveWatch!",
      })
    } catch (error: any) {
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

      if (!username || username.length < 2) {
        throw new Error("Le nom d'utilisateur doit contenir au moins 2 caractères")
      }
      if (!email || !email.includes("@")) {
        throw new Error("Format d'email invalide")
      }
      if (!password || password.length < 6) {
        throw new Error("Le mot de passe doit contenir au moins 6 caractères")
      }

      const { data, error } = await withTimeout(
        supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
            data: {
              username: username.trim(),
            },
          },
        }),
        15000,
      )

      if (error) throw error

      if (data.user) {
        toast({
          title: "Compte créé avec succès !",
          description: `Bienvenue ${username} sur WaveWatch !`,
        })
      }
    } catch (error: any) {
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
      await withTimeout(supabase.auth.signOut(), 10000)
      setUser(null)
      updateAdultContentPreference(false)

      toast({
        title: "Déconnexion réussie",
        description: "À bientôt!",
      })
    } catch (error: any) {
      console.error("[v0] Signout error:", error)
      setUser(null)
      updateAdultContentPreference(false)
    }
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
