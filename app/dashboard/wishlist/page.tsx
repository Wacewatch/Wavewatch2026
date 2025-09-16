"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useWishlist } from "@/hooks/use-wishlist"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function WishlistPage() {
  const { user } = useAuth()
  const { wishlistItems, loading, removeFromWishlist } = useWishlist()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleRemoveFromWishlist = async (tmdbId: number, contentType: string) => {
    try {
      await removeFromWishlist(tmdbId, contentType)
    } catch (error) {
      console.error("Error removing from wishlist:", error)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">Chargement...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-white">Accès refusé</h1>
            <p className="text-gray-300">Vous devez être connecté pour accéder à cette page.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-300">Chargement de votre wishlist...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Ma Wishlist</h1>
            <p className="text-gray-400">Films et séries que vous voulez regarder plus tard</p>
          </div>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Heart className="h-5 w-5 text-red-400" />
              Wishlist complète ({wishlistItems.length})
            </CardTitle>
            <CardDescription className="text-gray-400">Tous vos contenus à regarder plus tard</CardDescription>
          </CardHeader>
          <CardContent>
            {wishlistItems.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">Votre wishlist est vide</p>
                <p className="text-gray-500 text-sm">
                  Ajoutez des films et séries depuis leurs pages de détails pour les retrouver ici.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {wishlistItems.map((item) => {
                  const imageUrl = item.poster_path
                    ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                    : "/placeholder.svg?height=300&width=200"

                  return (
                    <div key={`${item.tmdb_id}-${item.content_type}`} className="space-y-2 group">
                      <Link href={`/${item.content_type === "movie" ? "movies" : "tv-shows"}/${item.tmdb_id}`}>
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-700 cursor-pointer">
                          <Image
                            src={imageUrl || "/placeholder.svg"}
                            alt={item.content_title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 12.5vw"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg?height=300&width=200"
                            }}
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-red-600 text-white text-xs">
                              <Heart className="w-3 h-3" />
                            </Badge>
                          </div>
                        </div>
                      </Link>
                      <div>
                        <Link href={`/${item.content_type === "movie" ? "movies" : "tv-shows"}/${item.tmdb_id}`}>
                          <p className="text-sm font-medium line-clamp-2 group-hover:text-blue-400 text-white cursor-pointer">
                            {item.content_title}
                          </p>
                        </Link>
                        <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</p>
                        <div className="flex items-center justify-between mt-1">
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                            {item.content_type === "movie" ? "Film" : "Série"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFromWishlist(item.tmdb_id, item.content_type)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
