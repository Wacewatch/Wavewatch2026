import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}

export function createAdminClient() {
  const cookieStore = cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

// Database operations for user data
export async function addToWatchHistory(
  userId: string,
  contentId: number,
  contentType: string,
  contentTitle: string,
  metadata: any = {},
) {
  const supabase = createClient()

  const { data, error } = await supabase.from("user_watch_history").upsert(
    {
      user_id: userId,
      content_id: contentId,
      content_type: contentType,
      content_title: contentTitle,
      metadata,
      last_watched_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,content_id,content_type",
    },
  )

  return { data, error }
}

export async function addToFavorites(
  userId: string,
  contentId: number,
  contentType: string,
  contentTitle: string,
  metadata: any = {},
) {
  const supabase = createClient()

  const { data, error } = await supabase.from("user_favorites").insert({
    user_id: userId,
    content_id: contentId,
    content_type: contentType,
    content_title: contentTitle,
    metadata,
  })

  return { data, error }
}

export async function removeFromFavorites(userId: string, contentId: number, contentType: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("user_favorites")
    .delete()
    .match({ user_id: userId, content_id: contentId, content_type: contentType })

  return { data, error }
}

export async function addToWishlist(
  userId: string,
  contentId: number,
  contentType: string,
  contentTitle: string,
  metadata: any = {},
) {
  const supabase = createClient()

  const { data, error } = await supabase.from("user_wishlist").insert({
    user_id: userId,
    content_id: contentId,
    content_type: contentType,
    content_title: contentTitle,
    metadata,
  })

  return { data, error }
}

export async function removeFromWishlist(userId: string, contentId: number, contentType: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("user_wishlist")
    .delete()
    .match({ user_id: userId, content_id: contentId, content_type: contentType })

  return { data, error }
}

export async function getUserPreferences(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", userId).single()

  return { data, error }
}
