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
  console.log("[v0] Fullscreen sync calculation - scheduleStart:", scheduleStart, "elapsed:", elapsedSeconds)
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

  console.log("[v0] MovieFullscreenModal mounted - type:", videoType, "url:", embedUrl, "scheduleStart:", scheduleStart)

  useEffect(() => {
    if (videoType !== "m3u8" || !videoRef.current) return

    const video = videoRef.current
    console.log("[v0] Setting up HLS fullscreen playback")

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 60,
        maxMaxBufferLength: 120,
      })

      hlsRef.current = hls
      hls.loadSource(embedUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("[v0] HLS manifest parsed")
        if (scheduleStart) {
          const syncTime = calculateSyncPosition(scheduleStart)
          if (syncTime > 0) {
            video.currentTime = syncTime
          }
        }
        video.play().catch(() => {
          video.muted = true
          video.play().catch(console.error)
        })
      })

      return () => {
        hls.destroy()
      }
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = embedUrl
      video.addEventListener("loadedmetadata", () => {
        if (scheduleStart) {
          const syncTime = calculateSyncPosition(scheduleStart)
          if (syncTime > 0) video.currentTime = syncTime
        }
        video.play().catch(console.error)
      })
    }
  }, [videoType, embedUrl, scheduleStart])

  useEffect(() => {
    if (videoType !== "mp4" || !videoRef.current) return

    const video = videoRef.current
    console.log("[v0] Setting up MP4/PHP fullscreen playback")

    const handleLoadedMetadata = () => {
      console.log("[v0] Fullscreen MP4 loadedmetadata - duration:", video.duration)

      // Sync au temps de la séance
      if (scheduleStart) {
        const syncTime = calculateSyncPosition(scheduleStart)
        console.log("[v0] Fullscreen setting currentTime to:", syncTime)
        if (syncTime > 0 && syncTime < video.duration) {
          video.currentTime = syncTime
        }
      }
    }

    const handleCanPlay = () => {
      console.log("[v0] Fullscreen MP4 canplay - starting playback")
      video
        .play()
        .then(() => console.log("[v0] Fullscreen MP4 playing"))
        .catch((err) => {
          console.log("[v0] Fullscreen MP4 play failed, trying muted:", err.message)
          video.muted = true
          video.play().catch(console.error)
        })
    }

    const handleError = () => {
      const error = video.error
      console.error("[v0] Fullscreen MP4 error:", error?.code, error?.message)
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("error", handleError)

    // Sync toutes les 10 secondes
    const syncInterval = setInterval(() => {
      if (scheduleStart && video && !video.paused && video.duration > 0) {
        const expectedPosition = calculateSyncPosition(scheduleStart)
        const currentPosition = video.currentTime
        const drift = Math.abs(expectedPosition - currentPosition)
        console.log(
          "[v0] Fullscreen sync check - current:",
          currentPosition.toFixed(1),
          "expected:",
          expectedPosition,
          "drift:",
          drift.toFixed(1),
        )
        if (drift > 5) {
          console.log("[v0] Fullscreen re-syncing to:", expectedPosition)
          video.currentTime = expectedPosition
        }
      }
    }, 10000)

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("error", handleError)
      clearInterval(syncInterval)
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
      <div className="flex-1 relative">
        {videoType === "mp4" || videoType === "m3u8" ? (
          <video
            ref={videoRef}
            src={videoType === "mp4" ? embedUrl : undefined}
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
