"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Star, Search, Filter, Gamepad2, Monitor, Smartphone, Users } from "lucide-react"

const jeux = [
  {
    id: 1,
    title: "Cyberpunk 2077",
    description: "RPG futuriste dans un monde cyberpunk immersif",
    genre: "RPG",
    platform: "PC, PlayStation, Xbox",
    size: "70 GB",
    rating: 4.2,
    price: "59.99€",
    type: "Payant",
    downloads: "13M",
    thumbnail: "/placeholder.svg?height=300&width=200",
    releaseYear: 2020,
    multiplayer: false,
  },
  {
    id: 2,
    title: "Among Us",
    description: "Jeu de déduction sociale multijoueur",
    genre: "Party",
    platform: "PC, Mobile, Switch",
    size: "250 MB",
    rating: 4.5,
    price: "Gratuit",
    type: "Gratuit",
    downloads: "500M",
    thumbnail: "/placeholder.svg?height=300&width=200",
    releaseYear: 2018,
    multiplayer: true,
  },
  {
    id: 3,
    title: "The Witcher 3: Wild Hunt",
    description: "RPG fantasy épique avec un monde ouvert",
    genre: "RPG",
    platform: "PC, PlayStation, Xbox, Switch",
    size: "35 GB",
    rating: 4.9,
    price: "39.99€",
    type: "Payant",
    downloads: "40M",
    thumbnail: "/placeholder.svg?height=300&width=200",
    releaseYear: 2015,
    multiplayer: false,
  },
  {
    id: 4,
    title: "Fortnite",
    description: "Battle royale gratuit avec construction",
    genre: "Battle Royale",
    platform: "PC, Mobile, PlayStation, Xbox, Switch",
    size: "26 GB",
    rating: 4.3,
    price: "Gratuit",
    type: "Gratuit",
    downloads: "400M",
    thumbnail: "/placeholder.svg?height=300&width=200",
    releaseYear: 2017,
    multiplayer: true,
  },
  {
    id: 5,
    title: "Minecraft",
    description: "Jeu de construction et d'aventure en blocs",
    genre: "Sandbox",
    platform: "PC, Mobile, PlayStation, Xbox, Switch",
    size: "1 GB",
    rating: 4.8,
    price: "26.95€",
    type: "Payant",
    downloads: "238M",
    thumbnail: "/placeholder.svg?height=300&width=200",
    releaseYear: 2011,
    multiplayer: true,
  },
  {
    id: 6,
    title: "Genshin Impact",
    description: "RPG d'action en monde ouvert gratuit",
    genre: "RPG",
    platform: "PC, Mobile, PlayStation",
    size: "15 GB",
    rating: 4.6,
    price: "Gratuit",
    type: "Gratuit",
    downloads: "100M",
    thumbnail: "/placeholder.svg?height=300&width=200",
    releaseYear: 2020,
    multiplayer: true,
  },
]

const genres = [
  "Tous",
  "RPG",
  "Action",
  "Aventure",
  "Sport",
  "Course",
  "Stratégie",
  "Puzzle",
  "Battle Royale",
  "Party",
  "Sandbox",
]
const platforms = ["Tous", "PC", "Mobile", "PlayStation", "Xbox", "Switch"]
const types = ["Tous", "Gratuit", "Payant", "Freemium"]

export default function JeuxPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("Tous")
  const [selectedPlatform, setSelectedPlatform] = useState("Tous")
  const [selectedType, setSelectedType] = useState("Tous")

  const filteredJeux = jeux.filter(
    (jeu) =>
      jeu.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedGenre === "Tous" || jeu.genre === selectedGenre) &&
      (selectedPlatform === "Tous" || jeu.platform.includes(selectedPlatform)) &&
      (selectedType === "Tous" || jeu.type === selectedType),
  )

  const getPlatformIcon = (platform: string) => {
    if (platform.includes("Mobile")) return Smartphone
    return Monitor
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Jeux</h1>
        <p className="text-gray-300 text-lg">Découvrez et téléchargez les meilleurs jeux pour toutes les plateformes</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-blue-900/60 border-blue-800">
          <CardContent className="p-4 text-center">
            <Gamepad2 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">10,000+</p>
            <p className="text-gray-400 text-sm">Jeux disponibles</p>
          </CardContent>
        </Card>
        <Card className="bg-green-900/60 border-green-800">
          <CardContent className="p-4 text-center">
            <Download className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">1.2B+</p>
            <p className="text-gray-400 text-sm">Téléchargements</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-900/60 border-purple-800">
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">4.5/5</p>
            <p className="text-gray-400 text-sm">Note moyenne</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-900/60 border-orange-800">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">50M+</p>
            <p className="text-gray-400 text-sm">Joueurs actifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-blue-900/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-blue-800">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher un jeu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-blue-800/50 border-blue-700 text-white placeholder-gray-400"
            />
          </div>

          <div className="flex gap-3">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-40 bg-blue-800/50 border-blue-700 text-white">
                <Filter className="w-4 h-4 mr-2" />
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

            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-40 bg-blue-800/50 border-blue-700 text-white">
                <Monitor className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-blue-900 border-blue-700">
                {platforms.map((platform) => (
                  <SelectItem key={platform} value={platform} className="text-white hover:bg-blue-800">
                    {platform}
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

      {/* Grille des jeux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredJeux.map((jeu) => {
          const PlatformIcon = getPlatformIcon(jeu.platform)
          return (
            <Card
              key={jeu.id}
              className="bg-blue-900/60 border-blue-800 hover:border-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group"
            >
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={jeu.thumbnail || "/placeholder.svg"}
                  alt={jeu.title}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-3 left-3">
                  <Badge className={`${jeu.type === "Gratuit" ? "bg-green-600" : "bg-blue-600"} text-white`}>
                    {jeu.type}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <div className="flex items-center bg-black/60 rounded px-2 py-1">
                    <Star className="w-3 h-3 text-yellow-400 mr-1" />
                    <span className="text-white text-xs font-medium">{jeu.rating}</span>
                  </div>
                </div>
                {jeu.multiplayer && (
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="outline" className="border-orange-600 text-orange-400 bg-black/60">
                      <Users className="w-3 h-3 mr-1" />
                      Multijoueur
                    </Badge>
                  </div>
                )}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-1" />
                    {jeu.type === "Gratuit" ? "Télécharger" : jeu.price}
                  </Button>
                </div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg line-clamp-2 group-hover:text-blue-300 transition-colors">
                  {jeu.title}
                </CardTitle>
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="outline" className="border-purple-600 text-purple-400">
                    {jeu.genre}
                  </Badge>
                  <span className="text-gray-400">{jeu.releaseYear}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-gray-300 text-sm line-clamp-2 mb-4">{jeu.description}</p>

                <div className="space-y-2 mb-4 text-xs text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Taille:</span>
                    <span className="text-white">{jeu.size}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Plateformes:</span>
                    <div className="flex items-center">
                      <PlatformIcon className="w-3 h-3 mr-1" />
                      <span className="text-white text-xs">{jeu.platform.split(",").length} plateformes</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Téléchargements:</span>
                    <span className="text-white">{jeu.downloads}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Prix:</span>
                    <span className={`font-medium ${jeu.type === "Gratuit" ? "text-green-400" : "text-blue-400"}`}>
                      {jeu.price}
                    </span>
                  </div>
                </div>

                <Button
                  className={`w-full ${jeu.type === "Gratuit" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"} text-white`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {jeu.type === "Gratuit" ? "Télécharger gratuitement" : `Acheter ${jeu.price}`}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredJeux.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Aucun jeu trouvé</p>
          <p className="text-gray-500 text-sm mt-2">Essayez de modifier vos critères de recherche</p>
        </div>
      )}
    </div>
  )
}
