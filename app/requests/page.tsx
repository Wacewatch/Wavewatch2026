"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, ExternalLink } from "lucide-react"
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
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Demandes de contenu</h1>
        <p className="text-muted-foreground">Recherchez et demandez l'ajout de films, séries ou animés</p>
      </div>

      <Tabs defaultValue="submit" className="space-y-6">
        <TabsList>
          <TabsTrigger value="submit">Faire une demande</TabsTrigger>
          <TabsTrigger value="browse">Parcourir les demandes</TabsTrigger>
          {user && <TabsTrigger value="my-requests">Mes demandes</TabsTrigger>}
        </TabsList>

        <TabsContent value="submit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rechercher du contenu</CardTitle>
              <CardDescription>
                Tapez le nom d'un film, série ou animé pour le rechercher et faire une demande
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Rechercher un film, série ou animé..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {!user && (
                <p className="text-sm text-muted-foreground">Vous devez être connecté pour faire une demande.</p>
              )}

              {/* Search Results */}
              {searching && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Recherche en cours...</p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Résultats de recherche :</h3>
                  <div className="grid gap-4">
                    {searchResults.slice(0, 10).map((result) => (
                      <Card key={result.id} className="overflow-hidden">
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
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-lg">{result.title || result.name}</h4>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Badge variant="outline">{result.media_type === "movie" ? "Film" : "Série"}</Badge>
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
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Demander
                                </Button>
                              </div>

                              {result.overview && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{result.overview}</p>
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
                  <p className="text-muted-foreground">Aucun résultat trouvé pour "{searchQuery}"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="browse" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Toutes les demandes</CardTitle>
              <CardDescription>Parcourez les demandes de la communauté</CardDescription>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune demande pour le moment.</p>
              ) : (
                <div className="space-y-4">
                  {requests.map((request: any) => (
                    <div key={request.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{request.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {request.content_type === "movie"
                              ? "Film"
                              : request.content_type === "tv"
                                ? "Série TV"
                                : "Animé"}
                          </p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      {request.description && <p className="text-sm">{request.description}</p>}
                      <p className="text-xs text-muted-foreground">
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
            <Card>
              <CardHeader>
                <CardTitle>Mes demandes</CardTitle>
                <CardDescription>Suivez le statut de vos demandes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Vous n'avez fait aucune demande pour le moment.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
