"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Film, TrendingUp, Calendar, Star, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Collection {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  parts: Array<{
    id: number
    title: string
    release_date: string
    vote_average: number
  }>
}

export default function CollectionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [collections, setCollections] = useState<Collection[]>([])
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState<"name" | "parts" | "recent">("name")

  // Popular collections IDs from TMDB
  const popularCollectionIds = [
    10, // Star Wars
    1241, // Harry Potter
    131295, // Marvel Cinematic Universe
    645, // James Bond
    2344, // The Matrix
    8945, // The Lord of the Rings
    121938, // The Hobbit
    295, // Pirates of the Caribbean
    528, // The Terminator
    1570, // Die Hard
    9485, // The Fast and the Furious
    87359, // Mission: Impossible
    86311, // The Avengers
    131296, // X-Men
    535313, // Jurassic Park
  ]

  useEffect(() => {
    loadPopularCollections()
  }, [])

  useEffect(() => {
    filterAndSortCollections()
  }, [collections, searchQuery, sortBy])

  const loadPopularCollections = async () => {
    setLoading(true)
    try {
      const loadedCollections: Collection[] = []

      for (const id of popularCollectionIds) {
        try {
          const response = await fetch(`/api/tmdb/collection/${id}`)
          if (response.ok) {
            const data = await response.json()
            loadedCollections.push(data)
          }
        } catch (error) {
          console.error(`Error loading collection ${id}:`, error)
        }
      }

      setCollections(loadedCollections)
    } catch (error) {
      console.error("Error loading collections:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortCollections = () => {
    let filtered = [...collections]

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (collection) =>
          collection.name.toLowerCase().includes(query) || collection.overview.toLowerCase().includes(query),
      )
    }

    // Sort collections
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "parts":
          return (b.parts?.length || 0) - (a.parts?.length || 0)
        case "recent":
          const aDate = a.parts?.[a.parts.length - 1]?.release_date || "0"
          const bDate = b.parts?.[b.parts.length - 1]?.release_date || "0"
          return bDate.localeCompare(aDate)
        default:
          return 0
      }
    })

    setFilteredCollections(filtered)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    filterAndSortCollections()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Film className="w-10 h-10 text-blue-400" />
          <h1 className="text-4xl font-bold text-white">Collections & Sagas</h1>
        </div>
        <p className="text-gray-400 text-lg">Découvrez les plus grandes sagas et collections de films</p>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gray-800 border-gray-700 mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher une collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="name" className="text-white">
                    Nom (A-Z)
                  </SelectItem>
                  <SelectItem value="parts" className="text-white">
                    Nombre de films
                  </SelectItem>
                  <SelectItem value="recent" className="text-white">
                    Plus récent
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Collections Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des collections...</p>
          </div>
        </div>
      ) : filteredCollections.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Film className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? "Aucun résultat" : "Aucune collection"}
            </h3>
            <p className="text-gray-400 text-center">
              {searchQuery ? "Essayez avec d'autres mots-clés" : "Les collections seront bientôt disponibles"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((collection) => (
            <Link key={collection.id} href={`/collections/${collection.id}`}>
              <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-all duration-300 cursor-pointer group h-full">
                <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
                  {collection.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${collection.poster_path}`}
                      alt={collection.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                      <Film className="w-16 h-16 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Film count badge */}
                  <Badge className="absolute top-3 right-3 bg-blue-600 text-white border-0">
                    <Film className="w-3 h-3 mr-1" />
                    {collection.parts?.length || 0} films
                  </Badge>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                    {collection.name}
                  </CardTitle>
                  {collection.overview && (
                    <CardDescription className="text-gray-400 line-clamp-3 text-sm">
                      {collection.overview}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  {collection.parts && collection.parts.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(collection.parts[0].release_date).getFullYear()} -{" "}
                          {new Date(collection.parts[collection.parts.length - 1].release_date).getFullYear()}
                        </span>
                      </div>

                      {collection.parts[0].vote_average > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{collection.parts[0].vote_average.toFixed(1)}/10</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-700 mt-8">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-white mb-2">Collections populaires</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Explorez les plus grandes sagas cinématographiques de tous les temps. Chaque collection regroupe tous
                les films d'une même franchise, vous permettant de suivre l'évolution des histoires et des personnages à
                travers les années.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
