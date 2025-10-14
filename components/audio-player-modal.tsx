"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X } from "lucide-react"

interface AudioPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  src: string
  title: string
}

export function AudioPlayerModal({ isOpen, onClose, src, title }: AudioPlayerModalProps) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (isOpen && src) {
      // Create audio element for radio streams
      const newAudio = new Audio(src)
      newAudio.crossOrigin = "anonymous"

      newAudio.addEventListener("canplay", () => {
        newAudio
          .play()
          .then(() => {
            setIsPlaying(true)
          })
          .catch((error) => {
            console.error("[v0] Audio playback error:", error)
          })
      })

      newAudio.addEventListener("error", (e) => {
        console.error("[v0] Audio error:", e)
      })

      setAudio(newAudio)

      return () => {
        newAudio.pause()
        newAudio.src = ""
      }
    }
  }, [isOpen, src])

  const handleClose = () => {
    if (audio) {
      audio.pause()
      audio.src = ""
    }
    setIsPlaying(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[90vw] h-auto p-0 bg-gray-900 border border-gray-700 rounded-lg">
        {/* Controls Bar */}
        <div className="bg-black/80 backdrop-blur-sm border-b border-gray-700 p-2 flex items-center justify-between">
          <h3 className="text-white font-medium text-sm truncate flex-1 mr-4">{title}</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-white hover:bg-white/20 h-8 w-8"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Audio Player UI */}
        <div className="p-8 flex flex-col items-center justify-center space-y-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
            <div className="text-6xl">📻</div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-gray-400">En cours de lecture...</p>
          </div>
          {isPlaying && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-8 bg-blue-500 animate-pulse rounded"></div>
              <div className="w-2 h-12 bg-blue-500 animate-pulse rounded" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-6 bg-blue-500 animate-pulse rounded" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-10 bg-blue-500 animate-pulse rounded" style={{ animationDelay: "0.3s" }}></div>
              <div className="w-2 h-7 bg-blue-500 animate-pulse rounded" style={{ animationDelay: "0.4s" }}></div>
            </div>
          )}
          <Button onClick={handleClose} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2">
            Arrêter la lecture
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
