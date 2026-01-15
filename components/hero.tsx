"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"

export function Hero() {
  const [featuredMovies, setFeaturedMovies] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const { user } = useAuth()

  const fetchFeaturedMovies = async () => {
    try {
      const response = await fetch("/api/tmdb/trending/movies")
      if (!response.ok) throw new Error("Failed to fetch")
      const trending = await response.json()
      if (trending.results && trending.results.length > 0) {
        const moviesWithLogos = await Promise.all(
          trending.results.slice(0, 5).map(async (movie: any) => {
            try {
              // Fetch movie images directly from TMDB API with timeout
              const controller = new AbortController()
              const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

              const imagesResponse = await fetch(
                `https://api.themoviedb.org/3/movie/${movie.id}/images?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
                { signal: controller.signal },
              )
              clearTimeout(timeoutId)

              if (imagesResponse.ok) {
                const images = await imagesResponse.json()
                return { ...movie, images }
              }
            } catch (error) {
              // Silently fail for individual movies - they'll just show text title
              console.log(`[v0] Skipping logo for movie ${movie.id}`)
            }
            return movie
          }),
        )
        setFeaturedMovies(moviesWithLogos)
      }
    } catch (error) {
      console.error("Error fetching featured movies:", error)
    }
  }

  useEffect(() => {
    fetchFeaturedMovies()
  }, [])

  useEffect(() => {
    if (featuredMovies.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredMovies.length)
      }, 8000)

      return () => clearInterval(interval)
    }
  }, [featuredMovies.length])

  const featuredMovie = featuredMovies[currentIndex]

  if (!featuredMovie) {
    return null
  }

  const getLogoUrl = () => {
    if (!featuredMovie.images?.logos) return null

    // Prioritize French logos, then English, then any available
    const frenchLogo = featuredMovie.images.logos.find((logo: any) => logo.iso_639_1 === "fr")
    const englishLogo = featuredMovie.images.logos.find((logo: any) => logo.iso_639_1 === "en")
    const anyLogo = featuredMovie.images.logos[0]

    const selectedLogo = frenchLogo || englishLogo || anyLogo
    return selectedLogo ? `https://image.tmdb.org/t/p/original${selectedLogo.file_path}` : null
  }

  const logoUrl = getLogoUrl()

  const getStylizedTitle = (title: string) => {
    if (logoUrl) {
      return (
        <div className="flex justify-center">
          <img
            src={logoUrl || "/placeholder.svg"}
            alt={title}
            className="h-16 md:h-32 lg:h-40 w-auto object-contain"
            style={{
              filter: "drop-shadow(0 0 20px rgba(0,0,0,0.9)) drop-shadow(0 0 40px rgba(0,0,0,0.7))",
              maxWidth: "90%",
            }}
          />
        </div>
      )
    }

    return (
      <h1
        className="text-2xl md:text-6xl lg:text-7xl font-bold text-white leading-tight text-center"
        style={{
          textShadow: "0 0 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7), 2px 2px 4px rgba(0,0,0,1)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 900,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h1>
    )
  }

  return (
    <Link href={`/movies/${featuredMovie?.id}`} className="block">
      <div className="relative h-[50vh] md:min-h-[90vh] overflow-hidden cursor-pointer group">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path})`,
          }}
        >
          <div className="absolute inset-0 bg-black/60 md:bg-black/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="w-full">
            <div className="space-y-3 md:space-y-6 max-w-4xl mx-auto">
              {getStylizedTitle(featuredMovie.title)}

              <div className="flex items-center justify-center space-x-3 text-gray-300">
                <div className="flex items-center space-x-1 bg-black/40 rounded-full px-2 py-1 md:px-3 md:py-1">
                  <Star className="w-3 h-3 md:w-5 md:h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs md:text-lg font-medium">{featuredMovie.vote_average.toFixed(1)}</span>
                </div>
                <span className="text-sm md:text-2xl">•</span>
                <span className="text-xs md:text-lg bg-black/40 rounded-full px-2 py-1 md:px-3 md:py-1">
                  {new Date(featuredMovie.release_date).getFullYear()}
                </span>
              </div>

              <p className="text-xs md:text-xl text-gray-200 leading-relaxed max-w-2xl line-clamp-2 md:line-clamp-3 text-center mx-auto">
                {featuredMovie.overview}
              </p>
            </div>
          </div>
        </div>

        {/* Pagination Indicators */}
        <div className="absolute bottom-4 left-0 w-full flex justify-center space-x-2 z-20">
          {featuredMovies.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-all ${index === currentIndex ? "bg-white w-8" : "bg-gray-500"}`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setCurrentIndex(index)
              }}
            />
          ))}
        </div>
      </div>
    </Link>
  )
}
