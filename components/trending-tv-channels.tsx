"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tv, ChevronLeft, ChevronRight } from "lucide-react"
import { IframeModal } from "@/components/iframe-modal"
import { supabase } from "@/lib/supabase"

interface TVChannel {
  id: number
  name: string
  category: string
  country: string
  language: string
  logo_url: string
  stream_url: string
  trailer_url?: string
  description?: string
  quality?: string
  is_active?: boolean
}

export function TrendingTVChannels() {
  const [channels, setChannels] = useState<TVChannel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<TVChannel | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadTVChannels()
  }, [])

  const loadTVChannels = async () => {
    try {
      setLoading(true)

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn("Supabase not configured, using fallback data")
        loadFallbackChannels()
        return
      }

      const { data, error } = await supabase
        .from("tv_channels")
        .select("*")
        .eq("is_active", true)
        .order("name")
        .limit(25)

      if (error) {
        console.error("Error loading TV channels:", error)
        loadFallbackChannels()
        return
      }

      setChannels(data || [])
    } catch (error) {
      console.error("Error loading TV channels:", error)
      loadFallbackChannels()
    } finally {
      setLoading(false)
    }
  }

  const loadFallbackChannels = () => {
    // Fallback data if database is not available
    const fallbackChannels = [
      {
        id: 1,
        name: "Master TV",
        category: "Premium",
        country: "France",
        language: "Français",
        logo_url: "https://i.imgur.com/8QZqZqZ.png",
        stream_url: "https://embed.wavewatch.xyz/embed/BgYgx",
        description: "Chaîne premium Master TV",
        quality: "HD",
        is_active: true,
      },
      {
        id: 2,
        name: "TF1",
        category: "Généraliste",
        country: "France",
        language: "Français",
        logo_url: "https://logos-world.net/wp-content/uploads/2020/06/TF1-Logo.png",
        stream_url: "https://embed.wavewatch.xyz/embed/Z4no6",
        description: "Première chaîne de télévision française",
        quality: "HD",
        is_active: true,
      },
      {
        id: 3,
        name: "Canal+",
        category: "Premium",
        country: "France",
        language: "Français",
        logo_url: "https://logos-world.net/wp-content/uploads/2020/06/Canal-Plus-Logo.png",
        stream_url: "https://embed.wavewatch.xyz/embed/Y6mnp",
        description: "Canal+ - Chaîne premium généraliste",
        quality: "4K",
        is_active: true,
      },
    ]

    setChannels(fallbackChannels)
  }

  const handleChannelClick = (channel: TVChannel) => {
    setSelectedChannel(channel)
    setIsModalOpen(true)
  }

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      const newScrollLeft =
        direction === "left"
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      })
    }
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Tv className="h-8 w-8 text-blue-500" />
          <h2 className="text-3xl font-bold">Chaînes TV Populaires</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Chargement des chaînes...</p>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tv className="h-8 w-8 text-blue-500" />
            <h2 className="text-3xl font-bold">Chaînes TV Populaires</h2>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="opacity-75 hover:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="opacity-75 hover:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
            onScroll={updateScrollButtons}
          >
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="flex-none w-[150px] md:w-[180px] cursor-pointer"
                onClick={() => handleChannelClick(channel)}
              >
                <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-2 md:p-3">
                    <div className="aspect-[3/4] bg-white rounded-lg mb-2 flex items-center justify-center border">
                      <img
                        src={channel.logo_url || "/placeholder.svg"}
                        alt={channel.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/tv-channel-logo.jpg"
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-xs md:text-sm truncate">{channel.name}</h3>
                        <Badge variant="destructive" className="text-[10px] px-1 py-0">
                          LIVE
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-1 py-0 ${
                            channel.category === "Premium"
                              ? "bg-yellow-100 text-yellow-800"
                              : channel.category === "Sport"
                                ? "bg-green-100 text-green-800"
                                : channel.category === "Généraliste"
                                  ? "bg-blue-100 text-blue-800"
                                  : channel.category === "Documentaire"
                                    ? "bg-orange-100 text-orange-800"
                                    : channel.category === "Jeunesse"
                                      ? "bg-pink-100 text-pink-800"
                                      : channel.category === "Gaming"
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {channel.category}
                        </Badge>
                      </div>

                      <p className="text-[10px] md:text-xs text-gray-600 truncate">
                        {channel.description || channel.country || "Chaîne TV"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal de lecture */}
      <IframeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedChannel?.name || ""}
        src={selectedChannel?.stream_url || ""}
      />
    </>
  )
}
