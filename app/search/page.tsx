"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MovieCard } from "@/components/movie-card"
import { TVShowCard } from "@/components/tv-show-card"
import { ActorCard } from "@/components/actor-card"
import { searchMulti } from "@/lib/tmdb"
import { Search, Loader2 } from "lucide-react"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  const performSearch = async (query: string) => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const data = await searchMulti(query)
      setResults(data.results || [])
    } catch (error) {
      console.error("Error searching:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(searchQuery)
  }

  const filteredResults = results.filter((item) => {
    if (activeTab === "all") return true
    if (activeTab === "movies") return item.media_type === "movie"
    if (activeTab === "tvshows") return item.media_type === "tv" && !item.genre_ids?.includes(16)
    if (activeTab === "anime") return item.media_type === "tv" && item.genre_ids?.includes(16)
    if (activeTab === "people") return item.media_type === "person"
    return true
  })

  const movieResults = results.filter((item) => item.media_type === "movie")
  const tvShowResults = results.filter((item) => item.media_type === "tv" && !item.genre_ids?.includes(16))
  const animeResults = results.filter((item) => item.media_type === "tv" && item.genre_ids?.includes(16))
  const peopleResults = results.filter((item) => item.media_type === "person")

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Recherche</h1>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Films, séries, acteurs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Rechercher</Button>
        </form>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-muted-foreground">Recherche en cours...</p>
        </div>
      ) : (
        <>
          {results.length > 0 ? (
            <div className="space-y-6">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">Tous ({results.length})</TabsTrigger>
                  <TabsTrigger value="movies">Films ({movieResults.length})</TabsTrigger>
                  <TabsTrigger value="tvshows">Séries ({tvShowResults.length})</TabsTrigger>
                  <TabsTrigger value="anime">Animés ({animeResults.length})</TabsTrigger>
                  <TabsTrigger value="people">Personnes ({peopleResults.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-8">
                  {movieResults.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Films</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {movieResults.slice(0, 6).map((movie) => (
                          <MovieCard key={movie.id} movie={movie} />
                        ))}
                      </div>
                    </div>
                  )}

                  {tvShowResults.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Séries TV</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {tvShowResults.slice(0, 6).map((show) => (
                          <TVShowCard key={show.id} show={show} />
                        ))}
                      </div>
                    </div>
                  )}

                  {animeResults.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Animés</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {animeResults.slice(0, 6).map((anime) => (
                          <TVShowCard key={anime.id} show={anime} isAnime />
                        ))}
                      </div>
                    </div>
                  )}

                  {peopleResults.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Personnes</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {peopleResults.slice(0, 6).map((person) => (
                          <ActorCard key={person.id} actor={person} />
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="movies">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {movieResults.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="tvshows">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {tvShowResults.map((show) => (
                      <TVShowCard key={show.id} show={show} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="anime">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {animeResults.map((anime) => (
                      <TVShowCard key={anime.id} show={anime} isAnime />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="people">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {peopleResults.map((person) => (
                      <ActorCard key={person.id} actor={person} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            initialQuery && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucun résultat trouvé pour "{initialQuery}"</p>
              </div>
            )
          )}
        </>
      )}
    </div>
  )
}
