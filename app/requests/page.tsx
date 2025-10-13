"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, ExternalLink, ArrowLeft } from "lucide-react"
import { searchMulti } from "@/lib/tmdb"
import Image from "next/image"
import Link from "next/link"

interface SearchResult {
  id: number
  title?: string
  name?: string
  poster_path: string
  media_type: string
  release_date?: string
  first_air_date?: string
  overview: string
}

export default function RequestsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [requests, setRequests] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(false)

  // Search for content in TMDB
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const data = await searchMulti(query)
      setSearchResults(data.results.filter((item: any) => item.media_type === "movie" || item.media_type === "tv"))
    } catch (error) {
      console.error("Error searching:", error)
      toast({
        title: "Erreur de recherche",
        description: "Impossible de rechercher le contenu.",
        variant: "destructive",
      })
    } finally {
      setSearching(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleRequestContent = async (content: SearchResult) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour faire une demande.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Check if content already exists (mock check)
      const isAvailable = Math.random() > 0.7 // 30% chance it's already available

      if (isAvailable) {
        const contentType = content.media_type === "movie" ? "movies" : "tv-shows"
        toast({
          title: "Contenu déjà disponible !",
          description: (
            <div className="space-y-2">
              <p>Ce contenu est déjà disponible sur WaveWatch.</p>
              <Link
                href={`/${contentType}/${content.id}`}
                className="inline-flex items-center text-blue-400 hover:underline"
              >
                Voir maintenant <ExternalLink className="w-3 h-3 ml-1" />
              </Link>
            </div>
          ),
        })
        return
      }

      // Submit request (mock API call)
      toast({
        title: "Demande envoyée",
        description: `Votre demande pour "${content.title || content.name}" a été envoyée avec succès.`,
      })

      // Clear search
      setSearchQuery("")
      setSearchResults([])
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de la demande.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">En attente</Badge>
      case "approved":
        return <Badge variant="default">Approuvée</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejetée</Badge>
      case "completed":
        return <Badge className="bg-green-600">Terminée</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Demandes de contenu</h1>
          <p className="text-sm sm:text-base text-gray-400">
            Recherchez et demandez l'ajout de films, séries ou animés
          </p>
        </div>

        <Tabs defaultValue="submit" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 bg-gray-800 border-gray-700">
            <TabsTrigger value="submit" className="data-[state=active]:bg-gray-700 text-gray-300 text-sm">
              Faire une demande
            </TabsTrigger>
            <TabsTrigger value="browse" className="data-[state=active]:bg-gray-700 text-gray-300 text-sm">
              Parcourir
            </TabsTrigger>
            {user && (
              <TabsTrigger value="my-requests" className="data-[state=active]:bg-gray-700 text-gray-300 text-sm">
                Mes demandes
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="submit" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg sm:text-xl">Rechercher du contenu</CardTitle>
                <CardDescription className="text-gray-400 text-sm">
                  Tapez le nom d'un film, série ou animé pour le rechercher et faire une demande
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Rechercher un film, série ou animé..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                {!user && <p className="text-sm text-gray-400">Vous devez être connecté pour faire une demande.</p>}

                {searching && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-400 mt-2">Recherche en cours...</p>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">Résultats de recherche :</h3>
                    <div className="grid gap-4">
                      {searchResults.slice(0, 10).map((result) => (
                        <Card key={result.id} className="overflow-hidden bg-gray-700 border-gray-600">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              <div className="relative w-16 h-24 flex-shrink-0 rounded overflow-hidden">
                                <Image
                                  src={
                                    result.poster_path
                                      ? `https://image.tmdb.org/t/p/w200${result.poster_path}`
                                      : "/placeholder.svg?height=120&width=80"
                                  }
                                  alt={result.title || result.name || ""}
                                  fill
                                  className="object-cover"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2 gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-base sm:text-lg text-white truncate">
                                      {result.title || result.name}
                                    </h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                      <Badge variant="outline" className="border-gray-500 text-gray-300">
                                        {result.media_type === "movie" ? "Film" : "Série"}
                                      </Badge>
                                      <span>
                                        {result.release_date || result.first_air_date
                                          ? new Date(result.release_date || result.first_air_date || "").getFullYear()
                                          : "N/A"}
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    onClick={() => handleRequestContent(result)}
                                    disabled={loading || !user}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                                  >
                                    <Plus className="w-4 h-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Demander</span>
                                  </Button>
                                </div>

                                {result.overview && (
                                  <p className="text-sm text-gray-400 line-clamp-2">{result.overview}</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {searchQuery && !searching && searchResults.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Aucun résultat trouvé pour "{searchQuery}"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="browse" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Toutes les demandes</CardTitle>
                <CardDescription className="text-gray-400">Parcourez les demandes de la communauté</CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">Aucune demande pour le moment.</p>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request: any) => (
                      <div key={request.id} className="border border-gray-700 rounded-lg p-4 space-y-2 bg-gray-700/50">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-white">{request.title}</h3>
                            <p className="text-sm text-gray-400">
                              {request.content_type === "movie"
                                ? "Film"
                                : request.content_type === "tv"
                                  ? "Série TV"
                                  : "Animé"}
                            </p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                        {request.description && <p className="text-sm text-gray-300">{request.description}</p>}
                        <p className="text-xs text-gray-500">
                          Demandé le {new Date(request.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {user && (
            <TabsContent value="my-requests" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Mes demandes</CardTitle>
                  <CardDescription className="text-gray-400">Suivez le statut de vos demandes</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-400 py-8">Vous n'avez fait aucune demande pour le moment.</p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
