"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WatchProviders } from "@/components/watch-providers"
import { AddToListSelector } from "@/components/add-to-list-selector"
import { IframeModal } from "@/components/iframe-modal"
import { TrailerModal } from "@/components/trailer-modal"
import { CastList } from "@/components/cast-list"
import { Play, Download, Shuffle, Youtube, Star, Check } from "lucide-react"
import Image from "next/image"
import type { TVShowDetailsProps } from "@/types"

export function TVShowDetails({ show, credits, similarShows = [], isAnime = false }: TVShowDetailsProps) {
  const [showStreamingModal, setShowStreamingModal] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [showTrailerModal, setShowTrailerModal] = useState(false)
  const [streamingUrl, setStreamingUrl] = useState("")
  const [downloadUrl, setDownloadUrl] = useState("")
  const [trailerUrl, setTrailerUrl] = useState("")
  const [isFavorite, setIsFavorite] = useState(false)
  const [isWatched, setIsWatched] = useState(false)
  const [isMarkingWatched, setIsMarkingWatched] = useState(false)

  const handleWatch = () => {
    // Logic to handle watch action
  }

  const handleDownload = () => {
    // Logic to handle download action
  }

  const handleRandomEpisode = () => {
    // Logic to handle random episode action
  }

  const handleWatchTrailer = () => {
    // Logic to handle watch trailer action
  }

  const handleAddToFavorites = () => {
    // Logic to handle add to favorites action
  }

  const handleMarkAsWatched = () => {
    // Logic to handle mark as watched action
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {/* Watch Providers for desktop */}
        {show["watch/providers"] && (
          <div className="hidden md:block space-y-4">
            <WatchProviders providers={show["watch/providers"]} />
            <a
              href={`https://www.themoviedb.org/tv/${show.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-lg overflow-hidden bg-white shadow-md flex-shrink-0 inline-block"
              title="Voir sur TMDB"
            >
              <svg className="w-full h-full p-1.5" viewBox="0 0 190.24 81.52">
                <defs>
                  <linearGradient
                    id="linear-gradient-tv-desktop"
                    y1="40.76"
                    x2="190.24"
                    y2="40.76"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0" stopColor="#90cea1" />
                    <stop offset=".56" stopColor="#3cbec9" />
                    <stop offset="1" stopColor="#00b3e5" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#linear-gradient-tv-desktop)"
                  d="M105.67,36.06h66.9A17.67,17.67,0,0,0,190.24,18.4h0A17.67,17.67,0,0,0,172.57.73h-66.9A17.67,17.67,0,0,0,88,18.4h0A17.67,17.67,0,0,0,105.67,36.06Zm-88,45h76.9A17.67,17.67,0,0,0,112.24,63.4h0A17.67,17.67,0,0,0,94.57,45.73H17.67A17.67,17.67,0,0,0,0,63.4H0A17.67,17.67,0,0,0,17.67,81.06ZM10.41,35.42h7.8V6.92h10.1V0H.31v6.9h10.1Zm28.1,0h7.8V8.25h.1l9,27.15h6l9.3-27.15h.1V35.4h7.8V0H66.76l-8.2,23.1h-.1L50.31,0H38.51ZM152.43,55.67a15.07,15.07,0,0,0-4.52-5.52,18.57,18.57,0,0,0-6.68-3.08,33.54,33.54,0,0,0-8.07-1h-11.7v35.4h12.75a24.58,24.58,0,0,0,7.55-1.15A19.34,19.34,0,0,0,148.11,77a16.27,16.27,0,0,0,4.37-5.5,16.91,16.91,0,0,0,1.63-7.58A18.5,18.5,0,0,0,152.43,55.67Zm-8.31,11.92a8.94,8.94,0,0,1-1.87,3.31,9.49,9.49,0,0,1-3.25,2.35,11.92,11.92,0,0,1-4.73.9H128.7v-21h5.3a17,17,0,0,1,4.58.65,10.24,10.24,0,0,1,3.43,1.95,8.09,8.09,0,0,1,2.13,3.23,11.94,11.94,0,0,1,.74,4.29A13.38,13.38,0,0,1,144.12,67.59Zm29.19-20.66a10.07,10.07,0,0,0-4.18,3.57,15.48,15.48,0,0,0-2.37,5.16,23.93,23.93,0,0,0-.77,6.24,19.16,19.16,0,0,0,.87,6.08A14.77,14.77,0,0,0,169.3,73a10.21,10.21,0,0,0,4.18,3.5,14.35,14.35,0,0,0,12.08,0,10.21,10.21,0,0,0,4.18-3.5,14.77,14.77,0,0,0,2.44-5.06,19.16,19.16,0,0,0,.87-6.08,23.93,23.93,0,0,0-.77-6.24,15.48,15.48,0,0,0-2.37-5.16,10.07,10.07,0,0,0-4.18-3.57,13.77,13.77,0,0,0-6.07-1.33A13.89,13.89,0,0,0,173.31,46.93Zm8.16,19.65a8.18,8.18,0,0,1-1.08,3.07,5.1,5.1,0,0,1-2,2,6.12,6.12,0,0,1-3.06.73,6.12,6.12,0,0,1-3.06-.73,5.1,5.1,0,0,1-2-2,8.18,8.18,0,0,1-1.08-3.07,18.94,18.94,0,0,1-.33-3.77,21.07,21.07,0,0,1,.33-3.87,8.59,8.59,0,0,1,1.08-3.15,5.1,5.1,0,0,1,2-2.12,6.12,6.12,0,0,1,3.06-.73,6.12,6.12,0,0,1,3.06.73,5.1,5.1,0,0,1,2,2.12,8.59,8.59,0,0,1,1.08,3.15,21.07,21.07,0,0,1,.33,3.87A18.94,18.94,0,0,1,181.47,66.58Z"
                />
              </svg>
            </a>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-4">
          <Button
            size="lg"
            variant="outline"
            className="border-red-600 text-red-400 hover:bg-red-900/20 px-4 md:px-6 py-3 bg-transparent"
            onClick={handleWatch}
            disabled={isMarkingWatched}
          >
            <Play className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            {isMarkingWatched ? "Marquage..." : "Regarder"}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-blue-600 text-blue-400 hover:bg-blue-900/20 px-4 md:px-6 py-3 bg-transparent"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Télécharger
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-purple-600 text-purple-400 hover:bg-purple-900/20 px-4 md:px-6 py-3 bg-transparent"
            onClick={handleRandomEpisode}
          >
            <Shuffle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Épisode aléatoire
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-orange-600 text-orange-400 hover:bg-orange-900/20 px-4 md:px-6 py-3 bg-transparent"
            onClick={handleWatchTrailer}
          >
            <Youtube className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Bande-annonce
          </Button>
        </div>

        {/* Secondary Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-4">
          <AddToListSelector
            content={{
              id: show.id,
              name: show.name,
              poster_path: show.poster_path,
              vote_average: show.vote_average,
              first_air_date: show.first_air_date,
            }}
            contentType="tv"
            className="w-full sm:w-auto"
          />
          <Button
            size="lg"
            variant="outline"
            className={`border-yellow-600 text-yellow-400 hover:bg-yellow-900/20 px-4 md:px-6 py-3 ${
              isFavorite ? "bg-yellow-900/20" : ""
            }`}
            onClick={handleAddToFavorites}
          >
            <Star className={`w-4 h-4 md:w-5 md:h-5 mr-2 ${isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
            {isFavorite ? "Favori" : "Favoris"}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className={`border-green-600 text-green-400 hover:bg-green-900/20 px-4 md:px-6 py-3 ${
              isWatched ? "bg-green-900/20" : ""
            }`}
            onClick={handleMarkAsWatched}
            disabled={isMarkingWatched}
          >
            <Check className={`w-4 h-4 md:w-5 md:h-5 mr-2 ${isWatched ? "text-green-500" : ""}`} />
            {isMarkingWatched ? "Marquage..." : isWatched ? "Série vue" : "Marquer série vue"}
          </Button>
        </div>

        {/* Seasons */}
        <div className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Saisons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {show.seasons
              .filter((season: any) => season.season_number > 0)
              .map((season: any) => (
                <Link
                  key={season.id}
                  href={`/${isAnime ? "anime" : "tv-shows"}/${show.id}/season/${season.season_number}`}
                >
                  <Card className="group overflow-hidden hover:scale-105 transition-transform duration-200 border-gray-800 bg-gray-900/50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative w-16 h-24 flex-shrink-0">
                          <Image
                            src={
                              season.poster_path
                                ? `https://image.tmdb.org/t/p/w200${season.poster_path}`
                                : "/placeholder.svg?height=120&width=80"
                            }
                            alt={season.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {season.name}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">{season.episode_count} épisodes</p>
                          {season.air_date && (
                            <p className="text-sm text-gray-400">{new Date(season.air_date).getFullYear()}</p>
                          )}
                          <div className="flex items-center mt-2">
                            <Play className="w-4 h-4 mr-1 text-blue-400" />
                            <span className="text-sm text-blue-400">Voir les épisodes</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>

        {/* Cast */}
        {credits.cast && credits.cast.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Casting</h2>
            <CastList cast={credits.cast} />
          </div>
        )}

        {/* Similar Shows Section */}
        {similarShows.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Séries similaires</h2>

            <div className="mobile-slider">
              <div className="flex gap-3 md:gap-4 pb-4 overflow-x-auto md:grid md:grid-cols-4 lg:grid-cols-6 md:overflow-visible">
                {similarShows.map((similarShow: any) => (
                  <Link key={similarShow.id} href={`/${isAnime ? "anime" : "tv-shows"}/${similarShow.id}`}>
                    <div className="space-y-2 group cursor-pointer w-40 md:w-auto flex-shrink-0">
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                        <Image
                          src={
                            similarShow.poster_path
                              ? `https://image.tmdb.org/t/p/w300${similarShow.poster_path}`
                              : "/placeholder.svg?height=450&width=300"
                          }
                          alt={similarShow.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="(max-width: 768px) 160px, (max-width: 1200px) 25vw, 16vw"
                        />
                      </div>
                      <div className="px-1">
                        <p className="text-sm font-medium line-clamp-2 group-hover:text-blue-400 text-white">
                          {similarShow.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {similarShow.first_air_date ? new Date(similarShow.first_air_date).getFullYear() : "N/A"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <IframeModal
        isOpen={showStreamingModal}
        onClose={() => setShowStreamingModal(false)}
        src={streamingUrl}
        title={`Streaming - ${show.name}`}
      />

      <IframeModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        src={downloadUrl}
        title={`Téléchargement - ${show.name}`}
      />

      <TrailerModal
        isOpen={showTrailerModal}
        onClose={() => setShowTrailerModal(false)}
        title={show.name}
        trailerUrl={trailerUrl}
      />
    </div>
  )
}
