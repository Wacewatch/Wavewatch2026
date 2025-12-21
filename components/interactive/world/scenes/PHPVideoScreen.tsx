"use client"

import { useRef, useEffect, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface PHPVideoScreenProps {
  src: string
  width?: number
  height?: number
  position?: [number, number, number]
  muted?: boolean
  startTime?: number
}

export function PHPVideoScreen({
  src,
  width = 14,
  height = 8,
  position = [0, 0, 0],
  muted = false,
  startTime = 0,
}: PHPVideoScreenProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const textureRef = useRef<THREE.CanvasTexture | null>(null)
  const [status, setStatus] = useState<"loading" | "playing" | "error">("loading")
  const [retryCount, setRetryCount] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const maxRetries = 5

  // Check if we're on the client
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !src) return

    // Create canvas for texture
    const canvas = document.createElement("canvas")
    canvas.width = 1280
    canvas.height = 720
    canvasRef.current = canvas

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    textureRef.current = texture

    // Apply texture to mesh
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial
      material.map = texture
      material.needsUpdate = true
    }

    // Fill with black and loading text initially
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#ffffff"
      ctx.font = "32px Arial"
      ctx.textAlign = "center"
      ctx.fillText("Chargement de la vidéo...", canvas.width / 2, canvas.height / 2)
      texture.needsUpdate = true
    }

    // Create video element
    const video = document.createElement("video")
    video.crossOrigin = "anonymous"
    video.playsInline = true
    video.muted = muted
    video.loop = false
    video.preload = "metadata"
    // Force video type hint for PHP streams
    video.setAttribute("type", "video/mp4")
    videoRef.current = video

    const loadVideo = (retry = 0) => {
      setStatus("loading")

      // Add cache busting and type hint for retries
      const separator = src.includes("?") ? "&" : "?"
      const videoUrl = retry > 0 ? `${src}${separator}_retry=${retry}&t=${Date.now()}` : src

      console.log(`[v0] PHP Video loading: ${videoUrl} (attempt ${retry + 1}/${maxRetries})`)
      video.src = videoUrl

      video.onloadedmetadata = () => {
        console.log(`[v0] PHP Video metadata loaded, duration: ${video.duration}`)

        // Seek to sync position
        if (startTime > 0 && video.duration && isFinite(video.duration)) {
          const seekTime = startTime % video.duration
          video.currentTime = seekTime
          console.log(`[v0] PHP Video seeking to ${seekTime}s for watch party sync`)
        }
      }

      video.oncanplay = () => {
        console.log("[v0] PHP Video can play")
        setStatus("playing")

        video.play().catch((err) => {
          console.log("[v0] PHP Video autoplay blocked, trying muted:", err.message)
          video.muted = true
          video.play().catch((e) => {
            console.error("[v0] PHP Video play failed even muted:", e.message)
          })
        })
      }

      video.onerror = (e) => {
        const errorCode = video.error?.code || 0
        const errorMessage = video.error?.message || "Unknown error"
        console.error(`[v0] PHP Video error (code ${errorCode}): ${errorMessage}`)

        if (retry < maxRetries - 1) {
          console.log(`[v0] PHP Video retrying in ${(retry + 1) * 2}s...`)
          setTimeout(
            () => {
              setRetryCount(retry + 1)
              video.src = ""
              loadVideo(retry + 1)
            },
            2000 * (retry + 1),
          )
        } else {
          console.error("[v0] PHP Video max retries reached")
          setStatus("error")

          // Draw error message on canvas
          if (ctx) {
            ctx.fillStyle = "#000000"
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = "#ff4444"
            ctx.font = "32px Arial"
            ctx.textAlign = "center"
            ctx.fillText("Erreur de chargement vidéo", canvas.width / 2, canvas.height / 2 - 20)
            ctx.fillStyle = "#888888"
            ctx.font = "20px Arial"
            ctx.fillText("Veuillez réessayer plus tard", canvas.width / 2, canvas.height / 2 + 20)
            texture.needsUpdate = true
          }
        }
      }

      video.onstalled = () => {
        console.log("[v0] PHP Video stalled, attempting recovery")
      }

      video.onwaiting = () => {
        console.log("[v0] PHP Video buffering...")
      }
    }

    // Start loading
    loadVideo(0)

    // Periodic health check
    const healthCheck = setInterval(() => {
      if (video && status === "playing") {
        if (video.paused && !video.ended) {
          console.log("[v0] PHP Video paused unexpectedly, resuming")
          video.play().catch(() => {})
        }

        // Re-sync if needed
        if (startTime > 0 && video.duration && isFinite(video.duration)) {
          const expectedTime = (startTime + (Date.now() - startTime * 1000) / 1000) % video.duration
          const drift = Math.abs(video.currentTime - expectedTime)
          if (drift > 10) {
            console.log(`[v0] PHP Video drift ${drift}s, re-syncing`)
            video.currentTime = expectedTime
          }
        }
      }
    }, 5000)

    return () => {
      clearInterval(healthCheck)
      if (video) {
        video.pause()
        video.src = ""
        video.load()
      }
      if (textureRef.current) {
        textureRef.current.dispose()
      }
    }
  }, [src, muted, startTime, isClient])

  // Update canvas texture with video frames
  useFrame(() => {
    if (!videoRef.current || !canvasRef.current || !textureRef.current) return
    if (status !== "playing" || videoRef.current.readyState < 2) return

    const ctx = canvasRef.current.getContext("2d")
    if (ctx && !videoRef.current.paused) {
      try {
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
        textureRef.current.needsUpdate = true
      } catch (e) {
        // Ignore draw errors (can happen during seeking)
      }
    }
  })

  // Update muted state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted
    }
  }, [muted])

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial color="#000000" toneMapped={false} />
    </mesh>
  )
}
