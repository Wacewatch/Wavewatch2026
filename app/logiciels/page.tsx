"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Star, Search, Filter, Monitor, Smartphone, Shield } from "lucide-react"

const logiciels = [
  {
    id: 1,
    title: "Adobe Photoshop 2024",
    description: "Logiciel de retouche photo professionnel",
    version: "25.0.0",
    size: "2.8 GB",
    category: "Graphisme",
    platform: "Windows, macOS",
    license: "Payant",
    rating: 4.8,
    downloads: "12.5M",
    thumbnail: "/placeholder.svg?height=200&width=200",
    requirements: "8GB RAM, 4GB stockage",
  },
  {
    id: 2,
    title: "VLC Media Player",
    description: "Lecteur multimédia gratuit et open source",
    version: "3.0.18",
    size: "45 MB",
    category: "Multimédia",
    platform: "Windows, macOS, Linux",
    license: "Gratuit",
    rating: 4.9,
    downloads: "3.2B",
    thumbnail: "/placeholder.svg?height=200&width=200",
    requirements: "2GB RAM, 100MB stockage",
  },
  {
    id: 3,
    title: "Visual Studio Code",
    description: "Éditeur de code source gratuit et puissant",
    version: "1.85.0",
    size: "85 MB",
    category: "Développement",
    platform: "Windows, macOS, Linux",
    license: "Gratuit",
    rating: 4.7,
    downloads: "890M",
    thumbnail: "/placeholder.svg?height=200&width=200",
    requirements: "4GB RAM, 200MB stockage",
  },
  {
    id: 4,
    title: "Malwarebytes",
    description: "Protection anti-malware avancée",
    version: "4.5.2",
    size: "120 MB",
    category: "Sécurité",
    platform: "Windows, macOS",
    license: "Freemium",
    rating: 4.6,
    downloads: "450M",
    thumbnail: "/placeholder.svg?height=200&width=200",
    requirements: "4GB RAM, 250MB stockage",
  },
  {
    id: 5,
    title: "OBS Studio",
    description: "Logiciel de streaming et d'enregistrement",
    version: "30.0.0",
    size: "95 MB",
    category: "Multimédia",
    platform: "Windows, macOS, Linux",
    license: "Gratuit",
    rating: 4.5,
    downloads: "180M",
    thumbnail: "/placeholder.svg?height=200&width=200",
    requirements: "8GB RAM, 500MB stockage",
  },
  {
    id: 6,
    title: "Discord",
    description: "Plateforme de communication pour gamers",
    version: "1.0.9013",
    size: "140 MB",
    category: "Communication",
    platform: "Windows, macOS, Linux, Mobile",
    license: "Gratuit",
    rating: 4.4,
    downloads: "2.1B",
    thumbnail: "/placeholder.svg?height=200&width=200",
    requirements: "4GB RAM, 200MB stockage",
  },
]

const categories = [
  "Tous",
  "Graphisme",
  "Multimédia",
  "Développement",
  "Sécurité",
  "Communication",
  "Bureautique",
  "Jeux",
]
const platforms = ["Tous", "Windows", "macOS", "Linux", "Mobile"]
const licenses = ["Tous", "Gratuit", "Payant", "Freemium", "Open Source"]

export default function LogicielsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tous")
  const [selectedPlatform, setSelectedPlatform] = useState("Tous")
  const [selectedLicense, setSelectedLicense] = useState("Tous")

  const filteredLogiciels = logiciels.filter(
    (logiciel) =>
      logiciel.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCategory === "Tous" || logiciel.category === selectedCategory) &&
      (selectedPlatform === "Tous" || logiciel.platform.includes(selectedPlatform)) &&
      (selectedLicense === "Tous" || logiciel.license === selectedLicense),
  )

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Graphisme":
        return Monitor
      case "Multimédia":
        return Monitor
      case "Développement":
        return Monitor
      case "Sécurité":
        return Shield
      case "Communication":
        return Smartphone
      default:
        return Monitor
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Logiciels</h1>
        <p className="text-gray-300 text-lg">Téléchargez les meilleurs logiciels pour Windows, macOS et Linux</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-blue-900/60 border-blue-800">
          <CardContent className="p-4 text-center">
            <Monitor className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">5,000+</p>
            <p className="text-gray-400 text-sm">Logiciels disponibles</p>
          </CardContent>
        </Card>
        <Card className="bg-green-900/60 border-green-800">
          <CardContent className="p-4 text-center">
            <Download className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">890M+</p>
            <p className="text-gray-400 text-sm">Téléchargements</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-900/60 border-purple-800">
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">4.6/5</p>
            <p className="text-gray-400 text-sm">Note moyenne</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-900/60 border-orange-800">
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">100%</p>
            <p className="text-gray-400 text-sm">Sécurisé</p>
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
              placeholder="Rechercher un logiciel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-blue-800/50 border-blue-700 text-white placeholder-gray-400"
            />
          </div>

          <div className="flex gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40 bg-blue-800/50 border-blue-700 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-blue-900 border-blue-700">
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="text-white hover:bg-blue-800">
                    {category}
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

            <Select value={selectedLicense} onValueChange={setSelectedLicense}>
              <SelectTrigger className="w-40 bg-blue-800/50 border-blue-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-blue-900 border-blue-700">
                {licenses.map((license) => (
                  <SelectItem key={license} value={license} className="text-white hover:bg-blue-800">
                    {license}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grille des logiciels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredLogiciels.map((logiciel) => {
          const CategoryIcon = getCategoryIcon(logiciel.category)
          return (
            <Card
              key={logiciel.id}
              className="bg-blue-900/60 border-blue-800 hover:border-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group"
            >
              <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-800 to-blue-900 p-8">
                <div className="flex items-center justify-center">
                  <img
                    src={logiciel.thumbnail || "/placeholder.svg"}
                    alt={logiciel.title}
                    className="w-16 h-16 object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="absolute top-3 left-3">
                  <Badge
                    className={`${logiciel.license === "Gratuit" ? "bg-green-600" : logiciel.license === "Payant" ? "bg-red-600" : "bg-orange-600"} text-white`}
                  >
                    {logiciel.license}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <div className="flex items-center bg-black/60 rounded px-2 py-1">
                    <Star className="w-3 h-3 text-yellow-400 mr-1" />
                    <span className="text-white text-xs font-medium">{logiciel.rating}</span>
                  </div>
                </div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg line-clamp-2 group-hover:text-blue-300 transition-colors">
                  {logiciel.title}
                </CardTitle>
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="outline" className="border-blue-600 text-blue-400">
                    <CategoryIcon className="w-3 h-3 mr-1" />
                    {logiciel.category}
                  </Badge>
                  <span className="text-gray-400">v{logiciel.version}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-gray-300 text-sm line-clamp-2 mb-4">{logiciel.description}</p>

                <div className="space-y-2 mb-4 text-xs text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Taille:</span>
                    <span className="text-white">{logiciel.size}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Plateforme:</span>
                    <span className="text-white text-right">{logiciel.platform}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Téléchargements:</span>
                    <span className="text-white">{logiciel.downloads}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Requis:</span>
                    <span className="text-white text-right text-xs">{logiciel.requirements}</span>
                  </div>
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredLogiciels.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Aucun logiciel trouvé</p>
          <p className="text-gray-500 text-sm mt-2">Essayez de modifier vos critères de recherche</p>
        </div>
      )}
    </div>
  )
}
