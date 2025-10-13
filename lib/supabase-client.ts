import { createClient } from "@supabase/supabase-js"
import { createBrowserClient as createBrowserClientSSR } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export function createBrowserClient() {
  return createBrowserClientSSR(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        if (typeof document === "undefined") return undefined
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(";").shift()
      },
      set(name: string, value: string, options: any) {
        if (typeof document === "undefined") return
        document.cookie = `${name}=${value}; path=/; ${options.maxAge ? `max-age=${options.maxAge};` : ""}`
      },
      remove(name: string, options: any) {
        if (typeof document === "undefined") return
        document.cookie = `${name}=; path=/; max-age=0`
      },
    },
  })
}
