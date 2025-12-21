"use client"

import { EyeOff, RefreshCw, Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface MovieFullscreenModalProps {
  movieTitle: string
  embedUrl: string
  onClose: () => void
  scheduleStart?: string
}

function calculateSyncPosition(scheduleStart: string): number {
  const startDate = new Date(scheduleStart)
  const now = new Date()
  const elapsedSeconds = Math.floor((now.getTime() - startDate.getTime()) / 1000)
  return Math.max(0, elapsedSeconds)
}

function getVideoType(url: string): "mp4" | "m3u8" | "iframe" {
  if (!url) return "iframe"
  const lowerUrl = url.toLowerCase()
  if (
    lowerUrl.includes(".mp4") ||
    lowerUrl.includes(".webm") ||
    lowerUrl.includes(".ogg") ||
    lowerUrl.includes(".php")
  ) {
    return "mp4"
  }
  if (lowerUrl.includes(".m3u8")) {
    return "m3u8"
  }
  return "iframe"
}

export function MovieFullscreenModal({ movieTitle, embedUrl, onClose, scheduleStart }: MovieFullscreenModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoType = getVideoType(embedUrl)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 5

  useEffect(() => {
    if (videoType !== "mp4" || !videoRef.current) return

    const video = videoRef.current
    let retryTimeout: NodeJS.Timeout

    const handleLoadStart = () => {
      setIsLoading(true)
      setHasError(false)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
      setHasError(false)

      // Sync to schedule start
      if (scheduleStart) {
        const syncTime = calculateSyncPosition(scheduleStart)
        if (syncTime > 0 && video.duration > syncTime) {
          console.log(`[v0] Fullscreen: Syncing to ${syncTime}s`)
          video.currentTime = syncTime
        }
      }

      video.play().catch(() => {
        video.muted = true
        video.play().catch(console.error)
      })
    }

    const handleError = () => {
      console.log(`[v0] Fullscreen video error, retry ${retryCount + 1}/${maxRetries}`)

      if (retryCount < maxRetries) {
        retryTimeout = setTimeout(
          () => {
            setRetryCount((prev) => prev + 1)
            video.load()
          },
          1000 * (retryCount + 1),
        )
      } else {
        setIsLoading(false)
        setHasError(true)
      }
    }

    const handleStalled = () => {
      console.log("[v0] Fullscreen video stalled, attempting recovery...")
      setTimeout(() => {
        if (video.paused) {
          video.play().catch(() => {})
        }
      }, 2000)
    }

    video.addEventListener("loadstart", handleLoadStart)
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("canplaythrough", handleCanPlay)
    video.addEventListener("error", handleError)
    video.addEventListener("stalled", handleStalled)

    // Start loading
    video.load()

    return () => {
      clearTimeout(retryTimeout)
      video.removeEventListener("loadstart", handleLoadStart)
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("canplaythrough", handleCanPlay)
      video.removeEventListener("error", handleError)
      video.removeEventListener("stalled", handleStalled)
    }
  }, [videoType, scheduleStart, retryCount])

  // Sync interval for MP4
  useEffect(() => {
    if (videoType === "mp4" && scheduleStart && videoRef.current) {
      const syncInterval = setInterval(() => {
        if (videoRef.current) {
          const expectedPosition = calculateSyncPosition(scheduleStart)
          const currentPosition = videoRef.current.currentTime
          const drift = Math.abs(expectedPosition - currentPosition)

          if (drift > 5) {
            videoRef.current.currentTime = expectedPosition
          }
        }
      }, 10000)

      return () => clearInterval(syncInterval)
    }
  }, [videoType, scheduleStart])

  const handleRetry = () => {
    setRetryCount(0)
    setHasError(false)
    setIsLoading(true)
    if (videoRef.current) {
      videoRef.current.load()
    }
  }

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
      <div className="flex-1 relative">
        {videoType === "mp4" ? (
          <>
            <video
              ref={videoRef}
              src={embedUrl}
              className="w-full h-full object-contain bg-black"
              autoPlay
              playsInline
              preload="auto"
              controls={false}
              controlsList="nodownload nofullscreen noremoteplayback"
              disablePictureInPicture
              style={{ pointerEvents: "none" }}
            />

            {isLoading && !hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center text-white">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                  <p>Chargement de la vidéo...</p>
                  {retryCount > 0 && (
                    <p className="text-sm text-gray-400 mt-2">
                      Tentative {retryCount}/{maxRetries}
                    </p>
                  )}
                </div>
              </div>
            )}

            {hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center text-white">
                  <p className="text-red-400 mb-4">Erreur de chargement</p>
                  <button
                    onClick={handleRetry}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Réessayer
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </div>
  )
}
