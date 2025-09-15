"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { ContentStatusIcons } from "@/components/content-status-icons"

interface MovieCardProps {
  movie: {
    id: number
    title: string
    poster_path: string
    release_date: string
    vote_average: number
    genre_ids: number[]
  }
  showBadges?: boolean
}

export function MovieCard({ movie, showBadges = true }: MovieCardProps) {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder.svg?height=750&width=500"

  return (
    <Link href={`/movies/${movie.id}`}>
      <Card className="group overflow-hidden hover:scale-105 transition-transform duration-200">
        <CardContent className="p-0">
          <div className="relative aspect-[2/3]">
            <Image
              src={posterUrl || "/placeholder.svg"}
              alt={movie.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

            <ContentStatusIcons contentId={movie.id} contentType="movie" contentTitle={movie.title} />

            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-black/70 text-white">
                <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                {movie.vote_average.toFixed(1)}
              </Badge>
            </div>
          </div>
          <div className="p-3">
            <h3 className="font-semibold text-sm line-clamp-2 mb-1">{movie.title}</h3>
            <p className="text-xs text-muted-foreground">
              {movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
