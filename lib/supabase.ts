import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables")
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
    global: {
      headers: {
        "X-Client-Info": "wavewatch-app",
      },
    },
    db: {
      schema: "public",
    },
    realtime: {
      params: {
        eventsPerSecond: 2,
      },
    },
  },
)

export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    })
  }

  return createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder-key", {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
}

// Fonction pour forcer la confirmation d'un utilisateur
export async function forceConfirmUser(email: string) {
  try {
    console.log("🔧 Attempting to force confirm user:", email)

    const { data, error } = await supabase.rpc("force_confirm_specific_user", {
      user_email: email,
    })

    if (error) {
      console.error("❌ Error forcing user confirmation:", error)
      return false
    }

    console.log("✅ User confirmation forced successfully")
    return true
  } catch (error) {
    console.error("❌ Exception in forceConfirmUser:", error)
    return false
  }
}

// Fonction utilitaire pour vérifier la connexion
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("user_profiles").select("count").limit(1)
    if (error) {
      console.error("❌ Supabase connection error:", error)
      return false
    }
    console.log("✅ Supabase connection successful")
    return true
  } catch (error) {
    console.error("❌ Supabase connection failed:", error)
    return false
  }
}

// Fonction pour obtenir le profil utilisateur
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("❌ Error getting user profile:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("❌ Exception in getUserProfile:", error)
    return null
  }
}
