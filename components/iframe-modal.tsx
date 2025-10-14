"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X, Maximize2, Minimize2 } from "lucide-react"

interface IframeModalProps {
  isOpen: boolean
  onClose: () => void
  src: string
  title: string
}

export function IframeModal({ isOpen, onClose, src, title }: IframeModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isAudioStream, setIsAudioStream] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    // Check if the src is an audio stream (typically .mp3, .aac, or streaming URLs)
    const audioExtensions = [".mp3", ".aac", ".ogg", ".wav", ".m3u8", ".pls"]
    const isAudio =
      audioExtensions.some((ext) => src.toLowerCase().includes(ext)) || src.includes("stream") || src.includes("radio")
    setIsAudioStream(isAudio)
  }, [src])

  useEffect(() => {
    if (isAudioStream && isOpen && src) {
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
  }, [isAudioStream, isOpen, src])

  const handleClose = () => {
    if (audio) {
      audio.pause()
      audio.src = ""
    }
    setIsPlaying(false)
    onClose()
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`${
          isFullscreen
            ? "max-w-full w-screen h-screen p-0 bg-black border-0 rounded-none"
            : isAudioStream
              ? "max-w-md w-[90vw] h-auto p-0 bg-gray-900 border border-gray-700 rounded-lg"
              : "max-w-6xl w-[90vw] h-[80vh] p-0 bg-black border border-gray-700 rounded-lg"
        }`}
      >
        {/* Controls Bar */}
        <div className="bg-black/80 backdrop-blur-sm border-b border-gray-700 p-2 flex items-center justify-between">
          <h3 className="text-white font-medium text-sm truncate flex-1 mr-4">{title}</h3>
          <div className="flex items-center gap-2">
            {!isAudioStream && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20 h-8 w-8"
                title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            )}
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

        {isAudioStream ? (
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
        ) : (
          <iframe
            src={src}
            className="w-full h-full border-0"
            allowFullScreen
            title={title}
            style={{
              height: isFullscreen ? "100%" : "calc(100% - 48px)",
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
