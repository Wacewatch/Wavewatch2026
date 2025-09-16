import useSWR from "swr"
import { createClient } from "@/lib/supabase"

interface TVChannel {
  id: number
  name: string
  category: string
  country: string
  language: string
  logo_url: string
  stream_url: string
  description?: string
  quality?: string
  is_active?: boolean
  trailer_url?: string
}

const fallbackChannels: TVChannel[] = [
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

const fetcher = async (): Promise<TVChannel[]> => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("Supabase not configured, using fallback data")
      return fallbackChannels
    }

    const supabase = createClient()
    const { data, error } = await supabase.from("tv_channels").select("*").eq("is_active", true).order("name")

    if (error) {
      console.error("Error loading TV channels:", error)
      return fallbackChannels
    }

    return data || fallbackChannels
  } catch (error) {
    console.error("Error loading TV channels:", error)
    return fallbackChannels
  }
}

export function useTVChannels() {
  const { data, error, isLoading, mutate } = useSWR<TVChannel[]>("tv-channels", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // 1 minute
    errorRetryCount: 3,
    fallbackData: fallbackChannels,
  })

  return {
    channels: data || fallbackChannels,
    isLoading,
    error,
    refresh: mutate,
  }
}
