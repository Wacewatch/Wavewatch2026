"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Calendar, Clock, Star, ArrowLeft } from "lucide-react"

interface Episode {
  id: number
  name: string
  overview: string
  episode_number: number
  still_path?: string
  air_date: string
  runtime?: number
  vote_average: number
}

interface Season {
  id: number
  name: string
  overview: string
  season_number: number
  episode_count: number
  air_date: string
  poster_path?: string
  episodes?: Episode[]
}

interface SeasonDetailsProps {
  season: Season
  showId: number
  showData?: any
  isAnime?: boolean
}

export function SeasonDetails({ season, showId, showData, isAnime = false }: SeasonDetailsProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)

  const basePath = isAnime ? `/anime/${showId}` : `/tv-shows/${showId}`
  const episodePath = (episodeNumber: number) => `${basePath}/season/${season.season_number}/episode/${episodeNumber}`

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* En-tête avec retour */}
      <div className="flex items-center gap-4">
        <Link href={basePath}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div className="text-center md:text-left w-full md:w-auto">
          <h1 className="text-3xl font-bold">{season.name}</h1>
          {showData && (
            <p className="text-muted-foreground">
              {showData.name || showData.title} • {season.episode_count} épisodes
            </p>
          )}
        </div>
      </div>

      {/* Informations de la saison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="relative aspect-[2/3] mb-4 w-full mx-auto">
                <Image
                  src={
                    season.poster_path
                      ? `https://image.tmdb.org/t/p/w500${season.poster_path}`
                      : "/placeholder.svg?height=450&width=300"
                  }
                  alt={season.name}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
              <div className="space-y-2 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {season.air_date
                      ? new Date(season.air_date).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Date inconnue"}
                  </span>
                </div>
                <div className="flex justify-center md:justify-start">
                  <Badge variant="secondary">{season.episode_count} épisodes</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-center md:text-left">Synopsis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed text-center md:text-left">
                {season.overview || "Aucun synopsis disponible pour cette saison."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Liste des épisodes */}
      <Card>
        <CardHeader>
          <CardTitle>Épisodes</CardTitle>
        </CardHeader>
        <CardContent>
          {season.episodes && season.episodes.length > 0 ? (
            <div className="space-y-4">
              {season.episodes.map((episode) => (
                <Link key={episode.id} href={episodePath(episode.episode_number)} className="block group">
                  <div className="flex gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="relative w-24 h-16 flex-shrink-0">
                      <Image
                        src={
                          episode.still_path
                            ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
                            : "/placeholder.svg?height=64&width=96"
                        }
                        alt={episode.name}
                        fill
                        className="object-cover rounded"
                        sizes="96px"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold group-hover:text-blue-600 transition-colors">
                            {episode.episode_number}. {episode.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {episode.overview || "Aucun résumé disponible."}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {episode.runtime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{episode.runtime}min</span>
                            </div>
                          )}
                          {episode.vote_average > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{episode.vote_average.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {episode.air_date && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Diffusé le{" "}
                          {new Date(episode.air_date).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucun épisode disponible pour cette saison.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SeasonDetails
