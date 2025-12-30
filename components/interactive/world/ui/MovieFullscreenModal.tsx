"use client"

import { EyeOff } from "lucide-react"
import { useEffect, useRef } from "react"
import Hls from "hls.js"

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
  const hlsRef = useRef<Hls | null>(null)
  const videoType = getVideoType(embedUrl)

  // Initialiser HLS pour les flux m3u8
  useEffect(() => {
    if (videoType === "m3u8" && videoRef.current) {
      const video = videoRef.current

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        })
        hlsRef.current = hls
        hls.loadSource(embedUrl)
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // Synchroniser avec le schedule_start si disponible
          if (scheduleStart) {
            const syncTime = calculateSyncPosition(scheduleStart)
            if (syncTime > 0) {
              video.currentTime = syncTime
            }
          }
          video.play().catch(() => {})
        })
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari natif HLS
        video.src = embedUrl
        video.addEventListener("loadedmetadata", () => {
          if (scheduleStart) {
            const syncTime = calculateSyncPosition(scheduleStart)
            if (syncTime > 0) {
              video.currentTime = syncTime
            }
          }
          video.play().catch(() => {})
        })
      }

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy()
          hlsRef.current = null
        }
      }
    }
  }, [videoType, embedUrl, scheduleStart])

  // Sync interval pour mp4
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
        {videoType === "mp4" ? (
          <video
            ref={videoRef}
            src={embedUrl}
            className="w-full h-full object-contain bg-black"
            autoPlay
            playsInline
            controls={false}
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
            onLoadedMetadata={(e) => {
              const video = e.currentTarget
              if (scheduleStart) {
                const syncTime = calculateSyncPosition(scheduleStart)
                if (syncTime > 0 && video.duration > syncTime) {
                  video.currentTime = syncTime
                }
              }
              video.play().catch(() => {})
            }}
            style={{ pointerEvents: "none" }}
          />
        ) : videoType === "m3u8" ? (
          <video
            ref={videoRef}
            className="w-full h-full object-contain bg-black"
            autoPlay
            playsInline
            controls={false}
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
            style={{ pointerEvents: "none" }}
          />
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
