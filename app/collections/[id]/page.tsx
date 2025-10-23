"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Film, Calendar, Star, ArrowLeft, Play, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"

interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
}

interface Collection {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  parts: Movie[]
}

export default function CollectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadCollection(params.id as string)
    }
  }, [params.id])

  const loadCollection = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tmdb/collection/${id}`)
      if (response.ok) {
        const data = await response.json()
        // Sort movies by release date
        if (data.parts) {
          data.parts.sort(
            (a: Movie, b: Movie) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime(),
          )
        }
        setCollection(data)
      }
    } catch (error) {
      console.error("Error loading collection:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement de la collection...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Film className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Collection introuvable</h3>
            <p className="text-gray-400 text-center mb-4">Cette collection n'existe pas ou n'est plus disponible</p>
            <Button onClick={() => router.push("/collections")} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux collections
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Backdrop */}
      <div className="relative h-[400px] md:h-[500px]">
        {collection.backdrop_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/original${collection.backdrop_path}`}
            alt={collection.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gray-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent" />

        <div className="absolute inset-0 container mx-auto px-4 flex items-end pb-8">
          <div className="flex flex-col md:flex-row gap-6 w-full">
            {/* Poster */}
            <div className="relative w-48 h-72 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl">
              {collection.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${collection.poster_path}`}
                  alt={collection.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <Film className="w-16 h-16 text-gray-600" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-end">
              <Button
                onClick={() => router.push("/collections")}
                variant="ghost"
                className="w-fit mb-4 text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux collections
              </Button>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{collection.name}</h1>

              <div className="flex items-center gap-4 mb-4">
                <Badge className="bg-blue-600 text-white border-0">
                  <Film className="w-3 h-3 mr-1" />
                  {collection.parts?.length || 0} films
                </Badge>

                {collection.parts && collection.parts.length > 0 && (
                  <>
                    <div className="flex items-center gap-1 text-gray-300">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(collection.parts[0].release_date).getFullYear()} -{" "}
                        {new Date(collection.parts[collection.parts.length - 1].release_date).getFullYear()}
                      </span>
                    </div>

                    {collection.parts[0].vote_average > 0 && (
                      <div className="flex items-center gap-1 text-gray-300">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{collection.parts[0].vote_average.toFixed(1)}/10</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {collection.overview && (
                <p className="text-gray-300 text-lg max-w-3xl leading-relaxed">{collection.overview}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Movies List */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Films de la collection</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collection.parts?.map((movie, index) => (
            <Link key={movie.id} href={`/movies/${movie.id}`}>
              <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-all duration-300 cursor-pointer group h-full">
                <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
                  {movie.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                      <Film className="w-16 h-16 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Order badge */}
                  <Badge className="absolute top-3 left-3 bg-blue-600 text-white border-0">#{index + 1}</Badge>

                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-blue-600 rounded-full p-4">
                      <Play className="w-8 h-8 text-white fill-current" />
                    </div>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                    {movie.title}
                  </CardTitle>
                  {movie.overview && (
                    <CardDescription className="text-gray-400 line-clamp-2 text-sm">{movie.overview}</CardDescription>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(movie.release_date).toLocaleDateString("fr-FR")}</span>
                    </div>

                    {movie.vote_average > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>
                          {movie.vote_average.toFixed(1)}/10
                          {movie.vote_count > 0 && (
                            <span className="text-gray-500 ml-1">({movie.vote_count} votes)</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter à une playlist
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
