"use client"

import { EyeOff } from "lucide-react"

interface MovieFullscreenModalProps {
  movieTitle: string
  embedUrl: string
  onClose: () => void
}

export function MovieFullscreenModal({
  movieTitle,
  embedUrl,
  onClose,
}: MovieFullscreenModalProps) {
  return (
    <div className="absolute inset-0 bg-black z-40 flex flex-col">
      <div className="bg-black/90 backdrop-blur-lg px-4 py-3 flex justify-between items-center">
        <h3 className="text-white font-bold">{movieTitle}</h3>
        <button
          onClick={onClose}
          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 flex items-center justify-center"
          title="Quitter"
        >
          <EyeOff className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}
