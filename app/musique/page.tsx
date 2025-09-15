"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, SkipForward, SkipBack, Volume2, Heart, Search, Music, Clock, Users } from "lucide-react"

const musicContent = [
  {
    id: 1,
    title: "Les Enfoirés 2024",
    artist: "Les Enfoirés",
    description: "Concert caritatif complet",
    duration: "180 min",
    year: 2024,
    genre: "Variété française",
    type: "Concert",
    thumbnail: "/placeholder.svg?height=300&width=200",
    quality: "4K Ultra HD",
    views: "2.1M",
  },
  {
    id: 2,
    title: "Daft Punk - Alive 2007",
    artist: "Daft Punk",
    description: "Concert légendaire à Bercy",
    duration: "95 min",
    year: 2007,
    genre: "Électronique",
    type: "Concert",
    thumbnail: "/placeholder.svg?height=300&width=200",
    quality: "HD",
    views: "5.8M",
  },
  {
    id: 3,
    title: "Woodstock 99",
    artist: "Divers artistes",
    description: "Le festival qui a marqué une génération",
    duration: "240 min",
    year: 1999,
    genre: "Rock",
    type: "Festival",
    thumbnail: "/placeholder.svg?height=300&width=200",
    quality: "HD",
    views: "3.2M",
  },
  {
    id: 4,
    title: "Stromae - Racine Carrée Live",
    artist: "Stromae",
    description: "Tournée mondiale complète",
    duration: "120 min",
    year: 2014,
    genre: "Pop",
    type: "Concert",
    thumbnail: "/placeholder.svg?height=300&width=200",
    quality: "HD",
    views: "1.9M",
  },
  {
    id: 5,
    title: "Jazz à Vienne 2023",
    artist: "Herbie Hancock",
    description: "Performance jazz exceptionnelle",
    duration: "85 min",
    year: 2023,
    genre: "Jazz",
    type: "Festival",
    thumbnail: "/placeholder.svg?height=300&width=200",
    quality: "4K Ultra HD",
    views: "421K",
  },
  {
    id: 6,
    title: "Coachella 2024 Highlights",
    artist: "Divers artistes",
    description: "Les meilleurs moments du festival",
    duration: "150 min",
    year: 2024,
    genre: "Pop",
    type: "Festival",
    thumbnail: "/placeholder.svg?height=300&width=200",
    quality: "4K Ultra HD",
    views: "4.7M",
  },
]

const genres = ["Tous", "Pop", "Rock", "Jazz", "Électronique", "Rap", "Variété française", "Classique"]
const types = ["Tous", "Concert", "Festival", "Documentaire", "Clip"]

export default function MusiquePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("Tous")
  const [selectedType, setSelectedType] = useState("Tous")
  const [currentPlaying, setCurrentPlaying] = useState<number | null>(null)

  const filteredContent = musicContent.filter(
    (content) =>
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedGenre === "Tous" || content.genre === selectedGenre) &&
      (selectedType === "Tous" || content.type === selectedType),
  )

  const togglePlay = (id: number) => {
    setCurrentPlaying(currentPlaying === id ? null : id)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Musique</h1>
        <p className="text-gray-300 text-lg">
          Découvrez concerts, festivals et documentaires musicaux en haute qualité
        </p>
      </div>

      {/* Player miniature */}
      {currentPlaying && (
        <div className="fixed bottom-4 right-4 bg-blue-900/90 backdrop-blur-sm rounded-lg p-4 border border-blue-700 shadow-2xl z-50">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={musicContent.find((c) => c.id === currentPlaying)?.thumbnail || "/placeholder.svg"}
              alt="Now playing"
              className="w-12 h-12 rounded object-cover"
            />
            <div>
              <p className="text-white font-medium text-sm">
                {musicContent.find((c) => c.id === currentPlaying)?.title}
              </p>
              <p className="text-gray-300 text-xs">{musicContent.find((c) => c.id === currentPlaying)?.artist}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="text-white hover:bg-blue-800">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setCurrentPlaying(null)}>
              <Pause className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-white hover:bg-blue-800">
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-white hover:bg-blue-800">
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="bg-blue-900/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-blue-800">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher un concert, artiste..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-blue-800/50 border-blue-700 text-white placeholder-gray-400"
            />
          </div>

          <div className="flex gap-3">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-40 bg-blue-800/50 border-blue-700 text-white">
                <Music className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-blue-900 border-blue-700">
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre} className="text-white hover:bg-blue-800">
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40 bg-blue-800/50 border-blue-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-blue-900 border-blue-700">
                {types.map((type) => (
                  <SelectItem key={type} value={type} className="text-white hover:bg-blue-800">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredContent.map((content) => (
          <Card
            key={content.id}
            className="bg-blue-900/60 border-blue-800 hover:border-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group"
          >
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={content.thumbnail || "/placeholder.svg"}
                alt={content.title}
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                <div className="flex items-center gap-2">
                  <Button size="icon" className="bg-blue-600 hover:bg-blue-700" onClick={() => togglePlay(content.id)}>
                    {currentPlaying === content.id ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="absolute top-3 right-3">
                <Badge variant="secondary" className="bg-black/60 text-white">
                  {content.quality}
                </Badge>
              </div>
              <div className="absolute top-3 left-3">
                <Badge className="bg-purple-600 text-white">{content.type}</Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg line-clamp-2 group-hover:text-blue-300 transition-colors">
                {content.title}
              </CardTitle>
              <p className="text-gray-400 text-sm font-medium">{content.artist}</p>
              <div className="flex items-center justify-between text-sm">
                <Badge variant="outline" className="border-purple-600 text-purple-400">
                  {content.genre}
                </Badge>
                <span className="text-gray-400">{content.year}</span>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-gray-300 text-sm line-clamp-2 mb-4">{content.description}</p>

              <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {content.duration}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {content.views} vues
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => togglePlay(content.id)}
                >
                  {currentPlaying === content.id ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Écouter
                    </>
                  )}
                </Button>
                <Button size="icon" variant="ghost" className="text-gray-400 hover:text-red-400 hover:bg-red-400/10">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Aucun contenu musical trouvé</p>
          <p className="text-gray-500 text-sm mt-2">Essayez de modifier vos critères de recherche</p>
        </div>
      )}
    </div>
  )
}
