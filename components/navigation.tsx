"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Menu, X, User, LogOut, Crown, Shield, ChevronDown } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user, signOut } = useAuth()
  const router = useRouter()
  const isMobile = useMobile()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setIsMenuOpen(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-blue-950 border-b border-blue-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-24 h-6 sm:w-32 sm:h-8 md:w-48 md:h-12 lg:w-64 lg:h-16 transition-transform group-hover:scale-105">
              <Image
                src="/images/new-wavewatch-logo.png"
                alt="WaveWatch - Plateforme de Streaming Premium"
                fill
                className="object-contain drop-shadow-lg logo-glow"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link
              href="/movies"
              className="text-white hover:text-blue-300 transition-all duration-300 font-medium relative group"
            >
              Films
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="/tv-shows"
              className="text-white hover:text-blue-300 transition-all duration-300 font-medium relative group"
            >
              Séries
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="/anime"
              className="text-white hover:text-blue-300 transition-all duration-300 font-medium relative group"
            >
              Animés
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="/dashboard/wishlist"
              className="text-white hover:text-blue-300 transition-all duration-300 font-medium relative group"
            >
              Wishlist
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
            </Link>

            {/* Media Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="text-white hover:text-blue-300 transition-all duration-300 font-medium relative group flex items-center">
                Médias
                <ChevronDown className="w-4 h-4 ml-1" />
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-blue-900 border-blue-700">
                <DropdownMenuItem asChild>
                  <Link href="/tv-channels" className="text-white hover:text-blue-300">
                    Chaînes TV
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/radio" className="text-white hover:text-blue-300">
                    Radio FM
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/retrogaming" className="text-white hover:text-blue-300">
                    Retrogaming
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/discover" className="text-white hover:text-blue-300">
                    Découvrir des Playlists
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-blue-900/60 border-blue-700 text-white placeholder-blue-300 rounded-full h-12 focus:bg-blue-800 transition-colors"
              />
            </div>
          </form>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-12 w-12 rounded-full border-2 border-blue-700 hover:border-blue-500 transition-colors"
                  >
                    <User className="w-5 h-5 text-white" />
                    {user.isVip && (
                      <Crown className="w-4 h-4 absolute -top-1 -right-1 text-yellow-400 drop-shadow-glow" />
                    )}
                    {user.isAdmin && <Shield className="w-3 h-3 absolute top-0 left-0 text-red-400" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-blue-900 border-blue-700">
                  <div className="px-3 py-2 border-b border-blue-700">
                    <p className="text-sm font-medium text-white">{user.username || "Utilisateur"}</p>
                    <p className="text-xs text-blue-300">{user.isVip ? "Membre VIP" : "Membre Standard"}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="text-white hover:text-blue-300">
                      Tableau de bord
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="text-white hover:text-blue-300">
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  {!user.isVip && (
                    <DropdownMenuItem disabled className="text-gray-500 cursor-not-allowed">
                      <Crown className="w-4 h-4 mr-2" />
                      Devenir VIP (Bientôt)
                    </DropdownMenuItem>
                  )}
                  {user.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="text-red-400 hover:text-red-300">
                        <Shield className="w-4 h-4 mr-2" />
                        Administration
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut} className="text-white hover:text-blue-300">
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Button variant="ghost" asChild className="text-white hover:text-blue-300">
                  <Link href="/login">Connexion</Link>
                </Button>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                  <Link href="/register">Inscription</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white h-12 w-12 lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-blue-950/95 z-50 lg:hidden overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
              <Link href="/" className="flex items-center space-x-3" onClick={() => setIsMenuOpen(false)}>
                <div className="relative w-40 h-10">
                  <Image
                    src="/images/new-wavewatch-logo.png"
                    alt="WaveWatch - Plateforme de Streaming Premium"
                    fill
                    className="object-contain logo-glow"
                  />
                </div>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                <X className="w-6 h-6 text-white" />
              </Button>
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-blue-900 border-blue-700 text-white placeholder-blue-300"
                />
              </div>
            </form>

            {/* Mobile Navigation Links */}
            <div className="space-y-6">
              {/* User Actions */}
              {!user ? (
                <div className="flex flex-col space-y-2">
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 w-full">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      Connexion
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-blue-600 text-white hover:bg-blue-800 w-full bg-transparent"
                  >
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      Inscription
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="relative h-10 w-10 rounded-full bg-blue-800 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                      {user.isVip && <Crown className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400" />}
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.username || "Utilisateur"}</p>
                      <p className="text-xs text-blue-300">{user.isVip ? "Membre VIP" : "Membre Standard"}</p>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="ghost"
                    className="justify-start text-white hover:text-blue-300 hover:bg-blue-900"
                  >
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      Tableau de bord
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="justify-start text-white hover:text-blue-300 hover:bg-blue-900"
                  >
                    <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                      Profil
                    </Link>
                  </Button>
                  {!user.isVip && (
                    <Button
                      variant="ghost"
                      disabled
                      className="justify-start text-gray-500 cursor-not-allowed hover:bg-blue-900"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Devenir VIP (Bientôt)
                    </Button>
                  )}
                  {user.isAdmin && (
                    <Button
                      asChild
                      variant="ghost"
                      className="justify-start text-red-400 hover:text-red-300 hover:bg-blue-900"
                    >
                      <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                        <Shield className="w-4 h-4 mr-2" />
                        Administration
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="justify-start text-white hover:text-blue-300 hover:bg-blue-900"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </Button>
                </div>
              )}

              <div className="pt-4 border-t border-blue-800">
                <h3 className="text-lg font-medium text-white mb-3">Contenu</h3>
                <div className="space-y-1">
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start text-white hover:text-blue-300 hover:bg-blue-900"
                  >
                    <Link href="/movies" onClick={() => setIsMenuOpen(false)}>
                      Films
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start text-white hover:text-blue-300 hover:bg-blue-900"
                  >
                    <Link href="/tv-shows" onClick={() => setIsMenuOpen(false)}>
                      Séries
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start text-white hover:text-blue-300 hover:bg-blue-900"
                  >
                    <Link href="/anime" onClick={() => setIsMenuOpen(false)}>
                      Animés
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start text-white hover:text-blue-300 hover:bg-blue-900"
                  >
                    <Link href="/dashboard/wishlist" onClick={() => setIsMenuOpen(false)}>
                      Wishlist
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-blue-800">
                <h3 className="text-lg font-medium text-white mb-3">Médias</h3>
                <div className="space-y-1">
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start text-white hover:text-blue-300 hover:bg-blue-900"
                  >
                    <Link href="/tv-channels" onClick={() => setIsMenuOpen(false)}>
                      Chaînes TV
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start text-white hover:text-blue-300 hover:bg-blue-900"
                  >
                    <Link href="/radio" onClick={() => setIsMenuOpen(false)}>
                      Radio FM
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start text-white hover:text-blue-300 hover:bg-blue-900"
                  >
                    <Link href="/retrogaming" onClick={() => setIsMenuOpen(false)}>
                      Retrogaming
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start text-white hover:text-blue-300 hover:bg-blue-900"
                  >
                    <Link href="/discover" onClick={() => setIsMenuOpen(false)}>
                      Découvrir des Playlists
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
