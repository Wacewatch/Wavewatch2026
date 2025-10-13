"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, Film, ThumbsUp, ArrowRight } from "lucide-react"
import Link from "next/link"
import { usePublicPlaylists } from "@/hooks/use-public-playlists"

export function PublicPlaylistsRow() {
  const { playlists, loading } = usePublicPlaylists()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Playlists Publiques</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-800 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (playlists.length === 0) {
    return null
  }

  const displayPlaylists = playlists.slice(0, 12)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Playlists Publiques</h2>
        <Button asChild variant="ghost" className="text-blue-400 hover:text-blue-300">
          <Link href="/discover/playlists">
            Voir tout
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayPlaylists.map((playlist) => (
          <Link key={playlist.id} href={`/playlists/${playlist.id}`}>
            <Card className="group overflow-hidden hover:scale-105 transition-transform duration-200 bg-gray-800 border-gray-700">
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${playlist.theme_color}40 0%, ${playlist.theme_color}20 100%)`,
                    }}
                  >
                    <Film className="w-16 h-16 text-white opacity-50" />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-black/70 text-white text-xs">
                      <Globe className="w-3 h-3 mr-1" />
                      Public
                    </Badge>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1 text-white">{playlist.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="flex items-center gap-1">
                        <Film className="w-3 h-3" />
                        {playlist.items_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {playlist.likes_count}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Par {playlist.username}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
