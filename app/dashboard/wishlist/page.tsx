"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart } from "lucide-react"
import { WatchTracker } from "@/lib/watch-tracking"
import Image from "next/image"
import Link from "next/link"

export default function WishlistPage() {
  const { user } = useAuth()
  const [wishlistItems, setWishlistItems] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setWishlistItems(WatchTracker.getWishlistItems())

    const handleUpdate = () => {
      setWishlistItems(WatchTracker.getWishlistItems())
    }

    window.addEventListener("watchlist-updated", handleUpdate)
    return () => window.removeEventListener("watchlist-updated", handleUpdate)
  }, [])

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
                  let imageUrl = "/placeholder.svg?height=300&width=200"

                  if (item.posterPath) {
                    if (item.posterPath.startsWith("http")) {
                      imageUrl = item.posterPath
                    } else {
                      imageUrl = `https://image.tmdb.org/t/p/w300${item.posterPath}`
                    }
                  }

                  return (
                    <Link key={item.id} href={`/${item.type === "movie" ? "movies" : "tv-shows"}/${item.tmdbId}`}>
                      <div className="space-y-2 group cursor-pointer">
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-700">
                          <Image
                            src={imageUrl || "/placeholder.svg"}
                            alt={item.title}
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
                        <div>
                          <p className="text-sm font-medium line-clamp-2 group-hover:text-blue-400 text-white">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-400">{new Date(item.addedAt).toLocaleDateString()}</p>
                          <Badge variant="outline" className="text-xs mt-1 border-gray-600 text-gray-400">
                            {item.type === "movie" ? "Film" : "Série"}
                          </Badge>
                        </div>
                      </div>
                    </Link>
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
