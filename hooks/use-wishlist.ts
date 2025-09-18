"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface WishlistItem {
  id: string
  user_id: string
  tmdb_id: number
  content_type: string
  content_title: string
  poster_path?: string
  created_at: string
}

export function useWishlist(item?: any) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadWishlistItems()
      if (item) {
        checkWishlistStatus()
      }
    } else {
      setWishlistItems([])
      setLoading(false)
    }
  }, [user, item])

  const loadWishlistItems = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("user_wishlist")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading wishlist items:", error)
        return
      }

      const transformedData = (data || []).map((item) => ({
        id: item.id,
        user_id: item.user_id,
        tmdb_id: item.content_id,
        content_type: item.content_type,
        content_title: item.content_title,
        poster_path: item.metadata?.poster_path || item.poster_path,
        created_at: item.created_at,
        title: item.content_title, // Add title for compatibility
        type: item.content_type === "movie" ? "movie" : "tv", // Add type for compatibility
        addedAt: item.created_at, // Add addedAt for compatibility
      }))

      setWishlistItems(transformedData)

      window.dispatchEvent(new CustomEvent("wishlist-updated"))
    } catch (error) {
      console.error("Error loading wishlist items:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkWishlistStatus = async () => {
    if (!user || !item) return

    try {
      const { data, error } = await supabase
        .from("user_wishlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("content_id", item.id)
        .eq("content_type", item.title ? "movie" : "tv")
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error checking wishlist status:", error)
        return
      }

      setIsInWishlist(!!data)
    } catch (error) {
      console.error("Error checking wishlist status:", error)
    }
  }

  const toggleWishlist = async (content: any) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour ajouter des favoris.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const contentType = content.title ? "movie" : "tv"

      if (isInWishlist) {
        // Remove from wishlist
        const { error } = await supabase
          .from("user_wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("content_id", content.id)
          .eq("content_type", contentType)

        if (error) throw error

        setIsInWishlist(false)
        await loadWishlistItems()
        toast({
          title: "Retiré des favoris",
          description: `${content.title || content.name} a été retiré de vos favoris.`,
        })
      } else {
        const { error } = await supabase.from("user_wishlist").insert({
          user_id: user.id,
          content_id: content.id, // This maps to content_id in the database
          content_type: contentType,
          content_title: content.title || content.name,
          metadata: {
            poster_path: content.poster_path,
            tmdb_id: content.id,
            release_date: content.release_date || content.first_air_date,
            overview: content.overview,
          },
        })

        if (error) throw error

        setIsInWishlist(true)
        await loadWishlistItems()
        toast({
          title: "Ajouté aux favoris",
          description: `${content.title || content.name} a été ajouté à vos favoris.`,
        })
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification des favoris.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWishlist = async (tmdbId: number, contentType: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("user_wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("content_id", tmdbId)
        .eq("content_type", contentType)

      if (error) throw error

      await loadWishlistItems()
      toast({
        title: "Retiré des favoris",
        description: "L'élément a été retiré de vos favoris.",
      })
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      })
    }
  }

  return {
    isInWishlist,
    isLoading,
    toggleWishlist,
    wishlistItems,
    loading,
    removeFromWishlist,
    refreshWishlist: loadWishlistItems,
  }
}
