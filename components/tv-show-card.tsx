"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { ContentStatusIcons } from "@/components/content-status-icons"

interface TVShowCardProps {
  show: {
    id: number
    name: string
    poster_path: string
    first_air_date: string
    vote_average: number
    genre_ids: number[]
  }
  isAnime?: boolean
  showBadges?: boolean
}

export function TVShowCard({ show, isAnime = false, showBadges = true }: TVShowCardProps) {
  const posterUrl = show.poster_path
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : "/placeholder.svg?height=750&width=500"

  const linkPath = isAnime ? `/anime/${show.id}` : `/tv-shows/${show.id}`
  const contentType = isAnime ? "anime" : "tv"

  // Safe date handling
  const releaseYear = show.first_air_date ? new Date(show.first_air_date).getFullYear() : "N/A"

  return (
    <Link href={linkPath}>
      <Card className="group overflow-hidden hover:scale-105 transition-transform duration-200">
        <CardContent className="p-0">
          <div className="relative aspect-[2/3]">
            <Image
              src={posterUrl || "/placeholder.svg"}
              alt={show.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

            <ContentStatusIcons
              contentId={show.id}
              contentType={contentType as "tv" | "anime"}
              contentTitle={show.name}
            />

            {showBadges && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-black/70 text-white">
                  <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {show.vote_average.toFixed(1)}
                </Badge>
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="font-semibold text-sm line-clamp-2 mb-1">{show.name}</h3>
            <p className="text-xs text-muted-foreground">{releaseYear}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
