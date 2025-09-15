"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

export function useWishlist(item: any) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user && item) {
      checkWishlistStatus()
    }
  }, [user, item])

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
        toast({
          title: "Retiré des favoris",
          description: `${content.title || content.name} a été retiré de vos favoris.`,
        })
      } else {
        // Add to wishlist
        const { error } = await supabase.from("user_wishlist").insert({
          user_id: user.id,
          content_id: content.id,
          content_type: contentType,
          content_title: content.title || content.name,
          metadata: {
            poster_path: content.poster_path,
            vote_average: content.vote_average,
            release_date: content.release_date || content.first_air_date,
          },
        })

        if (error) throw error

        setIsInWishlist(true)
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

  return {
    isInWishlist,
    isLoading,
    toggleWishlist,
  }
}
