"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MovieCard } from "@/components/movie-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getGenres, getMoviesByGenre, searchMulti } from "@/lib/tmdb"
import { Search, Filter, RefreshCw } from "lucide-react"

export default function MoviesPage() {
  const [movies, setMovies] = useState<any[]>([])
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
        const genresData = await getGenres("movie")
        setGenres(genresData.genres)
      } catch (error) {
        console.error("Error fetching genres:", error)
      }
    }

    fetchGenres()
  }, [])

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true)
      try {
        let data

        if (searchQuery) {
          data = await searchMulti(searchQuery, currentPage)
          // Filter only movies from search results
          data.results = data.results.filter((item: any) => item.media_type === "movie")
        } else if (selectedGenre !== "all") {
          data = await getMoviesByGenre(Number.parseInt(selectedGenre), currentPage)
        } else {
          // Utiliser la nouvelle API qui utilise le cache
          const response = await fetch(`/api/content/movies?page=${currentPage}&cache=true`)
          if (!response.ok) throw new Error("Failed to fetch movies")
          data = await response.json()
        }

        // Apply sorting if not searching
        if (!searchQuery && data.results) {
          data.results.sort((a: any, b: any) => {
            switch (sortBy) {
              case "release_date.desc":
                return new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime()
              case "release_date.asc":
                return new Date(a.release_date || 0).getTime() - new Date(b.release_date || 0).getTime()
              case "vote_average.desc":
                return (b.vote_average || 0) - (a.vote_average || 0)
              case "vote_average.asc":
                return (a.vote_average || 0) - (b.vote_average || 0)
              case "title.asc":
                return (a.title || "").localeCompare(b.title || "")
              case "title.desc":
                return (b.title || "").localeCompare(a.title || "")
              default: // popularity.desc
                return (b.popularity || 0) - (a.popularity || 0)
            }
          })
        }

        setMovies(data.results || [])
        setTotalPages(data.total_pages || 1)
      } catch (error) {
        console.error("Error fetching movies:", error)
        setMovies([])
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [searchQuery, selectedGenre, sortBy, currentPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
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
      const response = await fetch(`/api/content/movies?page=${currentPage}&cache=false`)
      if (!response.ok) throw new Error("Failed to refresh movies")
      const data = await response.json()

      // Apply current sorting
      if (data.results) {
        data.results.sort((a: any, b: any) => {
          switch (sortBy) {
            case "release_date.desc":
              return new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime()
            case "release_date.asc":
              return new Date(a.release_date || 0).getTime() - new Date(b.release_date || 0).getTime()
            case "vote_average.desc":
              return (b.vote_average || 0) - (a.vote_average || 0)
            case "vote_average.asc":
              return (a.vote_average || 0) - (b.vote_average || 0)
            case "title.asc":
              return (a.title || "").localeCompare(b.title || "")
            case "title.desc":
              return (b.title || "").localeCompare(a.title || "")
            default: // popularity.desc
              return (b.popularity || 0) - (a.popularity || 0)
          }
        })
      }

      setMovies(data.results || [])
      setTotalPages(data.total_pages || 1)
    } catch (error) {
      console.error("Error refreshing movies:", error)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Films</h1>
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
                placeholder="Rechercher des films..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </form>

          <Select value={selectedGenre} onValueChange={handleGenreChange}>
            <SelectTrigger className="w-full md:w-48 bg-gray-800 border-gray-700 text-white">
              <Filter className="w-4 h-4 mr-2 text-red-500" />
              <SelectValue placeholder="Tous les genres" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all" className="text-white hover:bg-gray-700">
                Tous les genres
              </SelectItem>
              {genres &&
                genres.length > 0 &&
                genres.map((genre) => (
                  <SelectItem key={genre.id} value={genre.id.toString()} className="text-white hover:bg-gray-700">
                    {genre.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full md:w-48 bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="popularity.desc" className="text-white hover:bg-gray-700">
                Popularité ↓
              </SelectItem>
              <SelectItem value="vote_average.desc" className="text-white hover:bg-gray-700">
                Mieux notés ⭐
              </SelectItem>
              <SelectItem value="release_date.desc" className="text-white hover:bg-gray-700">
                Plus récents
              </SelectItem>
              <SelectItem value="release_date.asc" className="text-white hover:bg-gray-700">
                Plus anciens
              </SelectItem>
              <SelectItem value="vote_average.asc" className="text-white hover:bg-gray-700">
                Moins bien notés
              </SelectItem>
              <SelectItem value="title.asc" className="text-white hover:bg-gray-700">
                Titre A-Z
              </SelectItem>
              <SelectItem value="title.desc" className="text-white hover:bg-gray-700">
                Titre Z-A
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movies && movies.length > 0 && movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-red-600 hover:bg-red-700 text-white border-red-600"
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
                className="bg-red-600 hover:bg-red-700 text-white border-red-600"
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      )}

      {movies.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun film trouvé.</p>
        </div>
      )}
    </div>
  )
}
