"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase"
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
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          await loadUserProfile(session.user)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // 🔁 Rafraîchir le token toutes les 25 secondes
    const refreshInterval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          await supabase.auth.refreshSession()
        }
      } catch (error) {
        console.error("Erreur lors du rafraîchissement du token :", error)
      }
    }, 25000) // 25 secondes

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await loadUserProfile(session.user)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        updateAdultContentPreference(false)
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        await loadUserProfile(session.user)
      }
      setLoading(false)
    })

    const sessionCheckInterval = setInterval(async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.user && user) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle()

          if (profile) {
            const userData: User = {
              id: session.user.id,
              username: profile.username || session.user.email?.split("@")[0] || "User",
              email: session.user.email || "",
              isVip: Boolean(profile.is_vip || profile.is_vip_plus),
              isAdmin: Boolean(profile.is_admin),
              vipExpiresAt: profile.vip_expires_at,
              showAdultContent: Boolean(profile.show_adult_content),
            }
            setUser(userData)
          }
        } else if (!session && user) {
          setUser(null)
          updateAdultContentPreference(false)
        }
      } catch (error) {
        console.error("Session check error:", error)
      }
    }, 60000) // Vérification toutes les minutes

    return () => {
      subscription.unsubscribe()
      clearInterval(sessionCheckInterval)
      clearInterval(refreshInterval) // 🧹 Nettoyage du rafraîchissement du token
    }
  }, [])

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .maybeSingle()

      let userData: User

      if (profile && !error) {
        userData = {
          id: supabaseUser.id,
          username: profile.username || supabaseUser.email?.split("@")[0] || "User",
          email: supabaseUser.email || "",
          isVip: Boolean(profile.is_vip || profile.is_vip_plus),
          isAdmin: Boolean(profile.is_admin),
          vipExpiresAt: profile.vip_expires_at,
          showAdultContent: Boolean(profile.show_adult_content),
        }
      } else {
        const username = supabaseUser.user_metadata?.username || supabaseUser.email?.split("@")[0] || "User"
        const isAdmin = username.toLowerCase() === "wwadmin"

        userData = {
          id: supabaseUser.id,
          username: username,
          email: supabaseUser.email || "",
          isVip: isAdmin,
          isAdmin: isAdmin,
          showAdultContent: false,
        }

        supabase
          .from("user_profiles")
          .upsert({
            id: supabaseUser.id,
            username: userData.username,
            email: userData.email,
            is_admin: userData.isAdmin,
            is_vip: userData.isVip,
            show_adult_content: false,
          })
          .then(({ error }) => {
            if (error) {
              console.log("Could not create profile in database:", error.message)
            }
          })
      }

      setUser(userData)
      updateAdultContentPreference(userData.showAdultContent || false)
    } catch (error) {
      console.error("Error loading user profile:", error)
      const username = supabaseUser.email?.split("@")[0] || "User"
      setUser({
        id: supabaseUser.id,
        username: username,
        email: supabaseUser.email || "",
        isVip: false,
        isAdmin: username.toLowerCase() === "wwadmin",
        showAdultContent: false,
      })
    }
  }

  const refreshUser = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        await loadUserProfile(session.user)
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

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
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      updateAdultContentPreference(false)

      toast({
        title: "Déconnexion réussie",
        description: "À bientôt!",
      })
    } catch (error: any) {
      console.error("Signout error:", error)
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
