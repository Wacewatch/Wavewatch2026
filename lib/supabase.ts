import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables")
}

// Client-side Supabase client for browser usage
export function createClient() {
  return createBrowserClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder-key")
}

// Legacy export for backward compatibility - use createClient() instead
export const supabase = createClient()

// Fonction pour forcer la confirmation d'un utilisateur
export async function forceConfirmUser(email: string) {
  try {
    console.log("🔧 Attempting to force confirm user:", email)
    const supabase = createClient()

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
    const supabase = createClient()
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
    const supabase = createClient()
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
