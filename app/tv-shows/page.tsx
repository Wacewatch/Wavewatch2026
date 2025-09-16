"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { TVShowCard } from "@/components/tv-show-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getGenres, getTVShowsByGenre, searchMulti } from "@/lib/tmdb"
import { Search, Filter, RefreshCw } from "lucide-react"

export default function TVShowsPage() {
  const [shows, setShows] = useState<any[]>([])
  const [genres, setGenres] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("popularity.desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresData = await getGenres("tv")
        setGenres(genresData.genres)
      } catch (error) {
        console.error("Error fetching genres:", error)
      }
    }

    fetchGenres()
  }, [])

  useEffect(() => {
    const fetchShows = async () => {
      setLoading(true)
      try {
        let data

        if (searchQuery) {
          data = await searchMulti(searchQuery, currentPage)
          // Filter only TV shows from search results (excluding anime and talk shows)
          data.results = data.results.filter(
            (item: any) =>
              item.media_type === "tv" &&
              !item.genre_ids?.includes(16) && // Exclude anime
              !item.genre_ids?.includes(10767), // Exclude talk shows
          )
        } else if (selectedGenre !== "all") {
          data = await getTVShowsByGenre(Number.parseInt(selectedGenre), currentPage)
          // Exclude anime and talk shows
          data.results = data.results.filter(
            (show: any) =>
              !show.genre_ids?.includes(16) && // Exclude anime
              !show.genre_ids?.includes(10767), // Exclude talk shows
          )
        } else {
          // Utiliser la nouvelle API qui utilise le cache
          const response = await fetch(`/api/content/tv-shows?page=${currentPage}&cache=true`)
          if (!response.ok) throw new Error("Failed to fetch TV shows")
          data = await response.json()
        }

        // Apply sorting if not searching
        if (!searchQuery && data.results) {
          data.results.sort((a: any, b: any) => {
            switch (sortBy) {
              case "first_air_date.desc":
                return new Date(b.first_air_date || 0).getTime() - new Date(a.first_air_date || 0).getTime()
              case "first_air_date.asc":
                return new Date(a.first_air_date || 0).getTime() - new Date(b.first_air_date || 0).getTime()
              case "vote_average.desc":
                return (b.vote_average || 0) - (a.vote_average || 0)
              case "vote_average.asc":
                return (a.vote_average || 0) - (b.vote_average || 0)
              case "name.asc":
                return (a.name || "").localeCompare(b.name || "")
              case "name.desc":
                return (b.name || "").localeCompare(a.name || "")
              default: // popularity.desc
                return (b.popularity || 0) - (a.popularity || 0)
            }
          })
        }

        setShows(data.results || [])
        setTotalPages(data.total_pages || 1)
      } catch (error) {
        console.error("Error fetching TV shows:", error)
        setShows([])
      } finally {
        setLoading(false)
      }
    }

    fetchShows()
  }, [searchQuery, selectedGenre, sortBy, currentPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    // The search will be triggered by the useEffect when searchQuery changes
  }

  const handleGenreChange = (value: string) => {
    setSelectedGenre(value)
    setCurrentPage(1)
    setSearchQuery("")
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // Forcer la mise à jour du cache
      const response = await fetch(`/api/content/tv-shows?page=${currentPage}&cache=false`)
      if (!response.ok) throw new Error("Failed to refresh TV shows")
      const data = await response.json()

      // Apply current sorting
      if (data.results) {
        data.results.sort((a: any, b: any) => {
          switch (sortBy) {
            case "first_air_date.desc":
              return new Date(b.first_air_date || 0).getTime() - new Date(a.first_air_date || 0).getTime()
            case "first_air_date.asc":
              return new Date(a.first_air_date || 0).getTime() - new Date(b.first_air_date || 0).getTime()
            case "vote_average.desc":
              return (b.vote_average || 0) - (a.vote_average || 0)
            case "vote_average.asc":
              return (a.vote_average || 0) - (b.vote_average || 0)
            case "name.asc":
              return (a.name || "").localeCompare(b.name || "")
            case "name.desc":
              return (b.name || "").localeCompare(a.name || "")
            default: // popularity.desc
              return (b.popularity || 0) - (a.popularity || 0)
          }
        })
      }

      setShows(data.results || [])
      setTotalPages(data.total_pages || 1)
    } catch (error) {
      console.error("Error refreshing TV shows:", error)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Séries TV</h1>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Actualisation..." : "Actualiser"}
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Rechercher des séries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          <Select value={selectedGenre} onValueChange={handleGenreChange}>
            <SelectTrigger className="w-full md:w-48 bg-gray-800 border-gray-700 text-white">
              <Filter className="w-4 h-4 mr-2 text-blue-500" />
              <SelectValue placeholder="Tous les genres" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all" className="text-white hover:bg-gray-700">
                Tous les genres
              </SelectItem>
              {(genres || [])
                .filter((genre) => genre.id !== 16 && genre.id !== 10767)
                .map((genre) => (
                  <SelectItem key={genre.id} value={genre.id.toString()} className="text-white hover:bg-gray-700">
                    {genre.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity.desc">Popularité ↓</SelectItem>
              <SelectItem value="vote_average.desc">Mieux notées ⭐</SelectItem>
              <SelectItem value="first_air_date.desc">Plus récentes</SelectItem>
              <SelectItem value="first_air_date.asc">Plus anciennes</SelectItem>
              <SelectItem value="vote_average.asc">Moins bien notées</SelectItem>
              <SelectItem value="name.asc">Titre A-Z</SelectItem>
              <SelectItem value="name.desc">Titre Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* TV Shows Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {shows.map((show) => (
              <TVShowCard key={show.id} show={show} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
              >
                Précédent
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                  if (page > totalPages) return null

                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      )}

      {shows.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucune série trouvée.</p>
        </div>
      )}
    </div>
  )
}
