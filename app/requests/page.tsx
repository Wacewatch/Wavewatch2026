"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus } from "lucide-react"
import { searchMulti } from "@/lib/tmdb"
import Image from "next/image"
import { createBrowserClient } from "@/lib/supabase-client"

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

interface ContentRequest {
  id: string
  user_id: string
  tmdb_id: number
  content_type: string
  title: string
  status: string
  description?: string
  created_at: string
  user_profiles?: {
    username: string
  }
}

export default function RequestsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [requests, setRequests] = useState<ContentRequest[]>([])
  const [myRequests, setMyRequests] = useState<ContentRequest[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadRequests()
  }, [user])

  const loadRequests = async () => {
    try {
      // Load all requests
      const { data: allRequests, error: allError } = await supabase
        .from("content_requests")
        .select(`
          *,
          user_profiles (
            username
          )
        `)
        .order("created_at", { ascending: false })

      if (!allError && allRequests) {
        setRequests(allRequests)
      }

      // Load user's requests if logged in
      if (user) {
        const { data: userRequests, error: userError } = await supabase
          .from("content_requests")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (!userError && userRequests) {
          setMyRequests(userRequests)
        }
      }
    } catch (error) {
      console.error("Error loading requests:", error)
    }
  }
  // </CHANGE>

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
      const { data, error } = await supabase
        .from("content_requests")
        .insert({
          user_id: user.id,
          tmdb_id: content.id,
          content_type: content.media_type,
          title: content.title || content.name || "",
          description: content.overview || "",
          status: "pending",
        })
        .select()

      if (error) {
        throw error
      }

      toast({
        title: "Demande envoyée",
        description: `Votre demande pour "${content.title || content.name}" a été envoyée avec succès.`,
      })

      // Reload requests
      await loadRequests()

      // Clear search
      setSearchQuery("")
      setSearchResults([])
      // </CHANGE>
    } catch (error) {
      console.error("Error submitting request:", error)
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
        return (
          <Badge variant="secondary" className="bg-yellow-600 text-white">
            En attente
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="default" className="bg-blue-600 text-white">
            Approuvée
          </Badge>
        )
      case "rejected":
        return <Badge variant="destructive">Rejetée</Badge>
      case "completed":
        return <Badge className="bg-green-600 text-white">Terminée</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Demandes de contenu</h1>
          <p className="text-gray-400">Recherchez et demandez l'ajout de films, séries ou animés</p>
        </div>

        <Tabs defaultValue="submit" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700 gap-1">
            <TabsTrigger
              value="submit"
              className="data-[state=active]:bg-gray-700 text-gray-300 text-xs sm:text-sm px-2 sm:px-4"
            >
              <span className="hidden sm:inline">Faire une demande</span>
              <span className="sm:hidden">Demander</span>
            </TabsTrigger>
            <TabsTrigger
              value="browse"
              className="data-[state=active]:bg-gray-700 text-gray-300 text-xs sm:text-sm px-2 sm:px-4"
            >
              <span className="hidden sm:inline">Parcourir</span>
              <span className="sm:hidden">Toutes</span>
            </TabsTrigger>
            {user && (
              <TabsTrigger
                value="my-requests"
                className="data-[state=active]:bg-gray-700 text-gray-300 text-xs sm:text-sm px-2 sm:px-4"
              >
                <span className="hidden sm:inline">Mes demandes</span>
                <span className="sm:hidden">Miennes</span>
              </TabsTrigger>
            )}
          </TabsList>
          {/* </CHANGE> */}

          <TabsContent value="submit" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Rechercher du contenu</CardTitle>
                <CardDescription className="text-gray-400">
                  Tapez le nom d'un film, série ou animé pour le rechercher et faire une demande
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Rechercher un film, série ou animé..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-900 border-gray-600 text-white"
                  />
                </div>

                {!user && <p className="text-sm text-gray-400">Vous devez être connecté pour faire une demande.</p>}

                {/* Search Results */}
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
                        <Card key={result.id} className="overflow-hidden bg-gray-900 border-gray-700">
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
                                    <h4 className="font-semibold text-lg text-white">{result.title || result.name}</h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                      <Badge variant="outline" className="border-gray-600 text-gray-300">
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
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Demander
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
                    {requests.map((request) => (
                      <div key={request.id} className="border border-gray-700 rounded-lg p-4 space-y-2 bg-gray-900">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-white">{request.title}</h3>
                            <p className="text-sm text-gray-400">
                              Par {request.user_profiles?.username || "Utilisateur"} •{" "}
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
                  {myRequests.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">Vous n'avez fait aucune demande pour le moment.</p>
                  ) : (
                    <div className="space-y-4">
                      {myRequests.map((request) => (
                        <div key={request.id} className="border border-gray-700 rounded-lg p-4 space-y-2 bg-gray-900">
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
          )}
        </Tabs>
      </div>
    </div>
    // </CHANGE>
  )
}
