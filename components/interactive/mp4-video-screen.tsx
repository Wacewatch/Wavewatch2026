"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useFrame } from "@react-three/fiber"
import { VideoTexture, LinearFilter, SRGBColorSpace, type Mesh, type MeshBasicMaterial } from "three"

interface MP4VideoScreenProps {
  src: string
  width?: number
  height?: number
  position?: [number, number, number]
  autoplay?: boolean
  muted?: boolean
  startTime?: number
  onReady?: () => void
  onError?: (error: string) => void
}

export function MP4VideoScreen({
  src,
  width = 13.5,
  height = 7.5,
  position = [0, 3, -20],
  autoplay = true,
  muted = true,
  startTime = 0,
  onReady,
  onError,
}: MP4VideoScreenProps) {
  const meshRef = useRef<Mesh>(null)
  const materialRef = useRef<MeshBasicMaterial>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const textureRef = useRef<VideoTexture | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 5

  const cleanupRef = useRef<(() => void) | null>(null)

  const cleanup = useCallback(() => {
    if (videoRef.current) {
      const video = videoRef.current
      try {
        video.pause()
        video.removeAttribute("src")
        video.srcObject = null
        video.src = ""
        video.load()
        if (video.parentNode) {
          video.parentNode.removeChild(video)
        }
      } catch (e) {
        // Ignore cleanup errors
      }
      videoRef.current = null
    }

    if (textureRef.current) {
      try {
        textureRef.current.dispose()
      } catch (e) {
        // Ignore cleanup errors
      }
      textureRef.current = null
    }

    if (materialRef.current) {
      materialRef.current.map = null
      materialRef.current.needsUpdate = true
    }
  }, [])

  useEffect(() => {
    cleanupRef.current = cleanup
  }, [cleanup])

  useEffect(() => {
    return () => {
      cleanupRef.current?.()
    }
  }, [])

  useEffect(() => {
    if (!src || hasError) return

    let isActive = true
    const eventListeners: Array<{ target: HTMLVideoElement; event: string; handler: EventListener }> = []

    const initVideo = async () => {
      try {
        setIsLoading(true)

        // Create video element
        const video = document.createElement("video")
        video.crossOrigin = "anonymous"
        video.playsInline = true
        video.muted = muted
        video.loop = false
        video.autoplay = false
        video.preload = "auto"
        video.setAttribute("playsinline", "")
        video.setAttribute("webkit-playsinline", "")
        videoRef.current = video

        // Create texture
        const newTexture = new VideoTexture(video)
        newTexture.minFilter = LinearFilter
        newTexture.magFilter = LinearFilter
        newTexture.colorSpace = SRGBColorSpace
        newTexture.generateMipmaps = false
        newTexture.needsUpdate = true
        textureRef.current = newTexture

        if (materialRef.current) {
          materialRef.current.map = newTexture
          materialRef.current.needsUpdate = true
        }

        const addEventListener = (event: string, handler: EventListener) => {
          video.addEventListener(event, handler)
          eventListeners.push({ target: video, event, handler })
        }

        let isVideoReady = false
        const markVideoReady = () => {
          if (isVideoReady || !isActive) return

          if (video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0) {
            isVideoReady = true
            setIsReady(true)
            setIsLoading(false)
            onReady?.()
          }
        }

        addEventListener("loadeddata", markVideoReady)
        addEventListener("canplay", markVideoReady)
        addEventListener("canplaythrough", markVideoReady)
        addEventListener("playing", markVideoReady)

        addEventListener("error", () => {
          if (!isActive) return
          console.log(`[v0] MP4 load error, retry ${retryCount + 1}/${maxRetries}`)

          if (retryCount < maxRetries) {
            setTimeout(
              () => {
                if (isActive) {
                  setRetryCount((prev) => prev + 1)
                  video.load()
                }
              },
              1000 * (retryCount + 1),
            )
          } else {
            setHasError(true)
            setIsLoading(false)
            onError?.("Failed to load video after retries")
          }
        })

        addEventListener("stalled", () => {
          console.log("[v0] MP4 video stalled, attempting recovery...")
          setTimeout(() => {
            if (isActive && video.paused) {
              video.play().catch(() => {})
            }
          }, 2000)
        })

        addEventListener("waiting", () => {
          console.log("[v0] MP4 video buffering...")
        })

        addEventListener("loadedmetadata", () => {
          if (!isActive) return
          console.log(`[v0] MP4 metadata loaded, duration: ${video.duration}s`)

          // Sync to start time if provided
          if (startTime > 0 && video.duration > startTime) {
            console.log(`[v0] Syncing MP4 to ${startTime}s`)
            video.currentTime = startTime
          }

          if (autoplay) {
            video.play().catch((err) => {
              console.log("[v0] MP4 autoplay failed, trying muted:", err)
              video.muted = true
              video.play().catch((e) => console.error("[v0] MP4 muted play failed:", e))
            })
          }
        })

        // Set source and start loading
        video.src = src
        video.load()
      } catch (err) {
        if (isActive) {
          console.error("[v0] MP4 init error:", err)
          setHasError(true)
          setIsLoading(false)
          onError?.("Failed to initialize video")
        }
      }
    }

    initVideo()

    return () => {
      isActive = false
      eventListeners.forEach(({ target, event, handler }) => {
        try {
          target.removeEventListener(event, handler)
        } catch (e) {
          // Ignore errors
        }
      })
      cleanupRef.current?.()
    }
  }, [src, autoplay, muted, startTime, hasError, retryCount, onReady, onError])

  // Update muted state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted
    }
  }, [muted])

  // Update texture every frame
  useFrame(() => {
    if (textureRef.current && videoRef.current) {
      const video = videoRef.current
      if (!video.paused && video.readyState >= video.HAVE_CURRENT_DATA) {
        textureRef.current.needsUpdate = true

        if (materialRef.current && materialRef.current.map !== textureRef.current) {
          materialRef.current.map = textureRef.current
          materialRef.current.needsUpdate = true
        }
      }
    }
  })

  return (
    <group position={position}>
      {/* Screen background */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[width + 0.5, height + 0.5]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>

      {/* Video screen */}
      <mesh ref={meshRef}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial ref={materialRef} color={hasError ? "#660000" : "#ffffff"} toneMapped={false} />
      </mesh>

      {/* Loading indicator */}
      {isLoading && !hasError && (
        <mesh position={[0, 0, 0.01]}>
          <ringGeometry args={[0.2, 0.3, 32]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}
    </group>
  )
}
