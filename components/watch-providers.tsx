"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tv } from "lucide-react"

interface WatchProvider {
  logo_path: string
  provider_id: number
  provider_name: string
  display_priority: number
}

interface WatchProvidersProps {
  providers?: {
    results?: {
      FR?: {
        flatrate?: WatchProvider[]
        buy?: WatchProvider[]
        rent?: WatchProvider[]
      }
      US?: {
        flatrate?: WatchProvider[]
        buy?: WatchProvider[]
        rent?: WatchProvider[]
      }
    }
  }
}

export function WatchProviders({ providers }: WatchProvidersProps) {
  // Try FR first, then US as fallback
  const countryData = providers?.results?.FR || providers?.results?.US

  if (!countryData) return null

  const streamingProviders = countryData.flatrate || []
  const buyProviders = countryData.buy || []
  const rentProviders = countryData.rent || []

  const allProviders = [...streamingProviders, ...buyProviders, ...rentProviders]

  // Remove duplicates based on provider_id
  const uniqueProviders = allProviders.filter(
    (provider, index, self) => index === self.findIndex((p) => p.provider_id === provider.provider_id),
  )

  if (uniqueProviders.length === 0) return null

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Tv className="w-5 h-5" />
          Disponible sur
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {uniqueProviders.slice(0, 8).map((provider) => (
            <div key={provider.provider_id} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shadow-md">
                <img
                  src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                  alt={provider.provider_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs text-gray-300 text-center max-w-[60px] line-clamp-2">
                {provider.provider_name}
              </span>
            </div>
          ))}
        </div>
        {streamingProviders.length > 0 && (
          <p className="text-xs text-gray-400 mt-4">
            Disponible en streaming sur {streamingProviders.map((p) => p.provider_name).join(", ")}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
