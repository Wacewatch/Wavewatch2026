"use client"

import { PublicPlaylistsDiscovery } from "@/components/public-playlists-discovery"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" asChild className="text-gray-400 hover:text-white">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au dashboard
            </Link>
          </Button>
        </div>

        <PublicPlaylistsDiscovery />
      </div>
    </div>
  )
}
