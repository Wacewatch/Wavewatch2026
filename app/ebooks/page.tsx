"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Download, Star, Search, Filter, FileText } from "lucide-react"

const ebooks = [
  {
    id: 1,
    title: "Le Petit Prince",
    author: "Antoine de Saint-Exupéry",
    description: "Un conte poétique et philosophique sous l'apparence d'un conte pour enfants",
    pages: 96,
    year: 1943,
    genre: "Classique",
    language: "Français",
    format: "PDF, EPUB",
    size: "2.1 MB",
    rating: 4.8,
    downloads: "2.1M",
    thumbnail: "/placeholder.svg?height=400&width=300",
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    description: "Un roman dystopique qui explore les thèmes de la surveillance et du totalitarisme",
    pages: 328,
    year: 1949,
    genre: "Science-fiction",
    language: "Français",
    format: "PDF, EPUB, MOBI",
    size: "1.8 MB",
    rating: 4.9,
    downloads: "3.2M",
    thumbnail: "/placeholder.svg?height=400&width=300",
  },
  {
    id: 3,
    title: "L'Étranger",
    author: "Albert Camus",
    description: "Un roman qui explore l'absurdité de la condition humaine",
    pages: 159,
    year: 1942,
    genre: "Philosophie",
    language: "Français",
    format: "PDF, EPUB",
    size: "1.5 MB",
    rating: 4.6,
    downloads: "1.8M",
    thumbnail: "/placeholder.svg?height=400&width=300",
  },
  {
    id: 4,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    description: "Une brève histoire de l'humanité, de la révolution cognitive à nos jours",
    pages: 512,
    year: 2011,
    genre: "Histoire",
    language: "Français",
    format: "PDF, EPUB, MOBI",
    size: "3.2 MB",
    rating: 4.7,
    downloads: "2.9M",
    thumbnail: "/placeholder.svg?height=400&width=300",
  },
  {
    id: 5,
    title: "Les Misérables",
    author: "Victor Hugo",
    description: "Un roman historique, social et philosophique dans lequel l'auteur s'attache à dépeindre...",
    pages: 1232,
    year: 1862,
    genre: "Classique",
    language: "Français",
    format: "PDF, EPUB",
    size: "4.8 MB",
    rating: 4.5,
    downloads: "1.2M",
    thumbnail: "/placeholder.svg?height=400&width=300",
  },
  {
    id: 6,
    title: "L'Art de la guerre",
    author: "Sun Tzu",
    description: "Un traité de stratégie militaire écrit par le général et philosophe Sun Tzu",
    pages: 112,
    year: -500,
    genre: "Philosophie",
    language: "Français",
    format: "PDF, EPUB, MOBI",
    size: "0.8 MB",
    rating: 4.4,
    downloads: "892K",
    thumbnail: "/placeholder.svg?height=400&width=300",
  },
]

const genres = ["Tous", "Classique", "Science-fiction", "Philosophie", "Histoire", "Roman", "Biographie", "Essai"]
const formats = ["Tous", "PDF", "EPUB", "MOBI"]

export default function EbooksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("Tous")
  const [selectedFormat, setSelectedFormat] = useState("Tous")
  const [sortBy, setSortBy] = useState("rating")

  const filteredEbooks = ebooks
    .filter(
      (book) =>
        (book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (selectedGenre === "Tous" || book.genre === selectedGenre) &&
        (selectedFormat === "Tous" || book.format.includes(selectedFormat)),
    )
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating
      if (sortBy === "downloads") return Number.parseFloat(b.downloads) - Number.parseFloat(a.downloads)
      if (sortBy === "year") return b.year - a.year
      if (sortBy === "title") return a.title.localeCompare(b.title)
      return 0
    })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">E-books</h1>
        <p className="text-gray-300 text-lg">
          Découvrez notre bibliothèque numérique avec des milliers d'ouvrages gratuits
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-blue-900/60 border-blue-800">
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">15,000+</p>
            <p className="text-gray-400 text-sm">Livres disponibles</p>
          </CardContent>
        </Card>
        <Card className="bg-green-900/60 border-green-800">
          <CardContent className="p-4 text-center">
            <Download className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">2.1M+</p>
            <p className="text-gray-400 text-sm">Téléchargements</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-900/60 border-purple-800">
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">4.7/5</p>
            <p className="text-gray-400 text-sm">Note moyenne</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-900/60 border-orange-800">
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">12</p>
            <p className="text-gray-400 text-sm">Formats supportés</p>
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
              placeholder="Rechercher un livre ou auteur..."
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

            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger className="w-40 bg-blue-800/50 border-blue-700 text-white">
                <FileText className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-blue-900 border-blue-700">
                {formats.map((format) => (
                  <SelectItem key={format} value={format} className="text-white hover:bg-blue-800">
                    {format}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-blue-800/50 border-blue-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-blue-900 border-blue-700">
                <SelectItem value="rating" className="text-white hover:bg-blue-800">
                  Note
                </SelectItem>
                <SelectItem value="downloads" className="text-white hover:bg-blue-800">
                  Téléchargements
                </SelectItem>
                <SelectItem value="year" className="text-white hover:bg-blue-800">
                  Année
                </SelectItem>
                <SelectItem value="title" className="text-white hover:bg-blue-800">
                  Titre
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grille des e-books */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEbooks.map((book) => (
          <Card
            key={book.id}
            className="bg-blue-900/60 border-blue-800 hover:border-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group"
          >
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={book.thumbnail || "/placeholder.svg"}
                alt={book.title}
                className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-3 left-3">
                <Badge className="bg-green-600 text-white">{book.format.split(",")[0]}</Badge>
              </div>
              <div className="absolute top-3 right-3">
                <div className="flex items-center bg-black/60 rounded px-2 py-1">
                  <Star className="w-3 h-3 text-yellow-400 mr-1" />
                  <span className="text-white text-xs font-medium">{book.rating}</span>
                </div>
              </div>
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 mr-1" />
                  Télécharger
                </Button>
              </div>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg line-clamp-2 group-hover:text-blue-300 transition-colors">
                {book.title}
              </CardTitle>
              <p className="text-gray-400 text-sm font-medium">{book.author}</p>
              <div className="flex items-center justify-between text-sm">
                <Badge variant="outline" className="border-green-600 text-green-400">
                  {book.genre}
                </Badge>
                <span className="text-gray-400">{book.year > 0 ? book.year : "Antiquité"}</span>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-gray-300 text-sm line-clamp-3 mb-4">{book.description}</p>

              <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-400">
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {book.pages} pages
                </div>
                <div className="flex items-center">
                  <Download className="w-4 h-4 mr-1" />
                  {book.downloads}
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  {book.size}
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  {book.rating}/5
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Lire en ligne
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                  {book.format.includes("EPUB") && (
                    <Button
                      variant="outline"
                      className="flex-1 border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                    >
                      EPUB
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Langue: {book.language} • Formats: {book.format}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEbooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Aucun e-book trouvé</p>
          <p className="text-gray-500 text-sm mt-2">Essayez de modifier vos critères de recherche</p>
        </div>
      )}
    </div>
  )
}
