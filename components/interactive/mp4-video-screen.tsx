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
  const retryCountRef = useRef(0)
  const maxRetries = 5
  const isActiveRef = useRef(true)

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
      isActiveRef.current = false
      cleanupRef.current?.()
    }
  }, [])

  useEffect(() => {
    if (!src || hasError) return

    isActiveRef.current = true
    retryCountRef.current = 0
    const eventListeners: Array<{ target: HTMLVideoElement; event: string; handler: EventListener }> = []

    const initVideo = async () => {
      try {
        setIsLoading(true)
        setIsReady(false)

        const video = document.createElement("video")
        video.crossOrigin = "anonymous"
        video.playsInline = true
        video.muted = true // Always start muted for autoplay
        video.loop = false
        video.autoplay = false
        video.preload = "metadata"
        video.setAttribute("playsinline", "")
        video.setAttribute("webkit-playsinline", "")
        video.setAttribute("x-webkit-airplay", "allow")
        video.setAttribute("disablePictureInPicture", "")
        videoRef.current = video

        const addEventListener = (event: string, handler: EventListener) => {
          video.addEventListener(event, handler)
          eventListeners.push({ target: video, event, handler })
        }

        let isVideoReady = false
        const markVideoReady = () => {
          if (isVideoReady || !isActiveRef.current) return

          if (video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0) {
            isVideoReady = true
            console.log(`[v0] MP4 video ready, size: ${video.videoWidth}x${video.videoHeight}`)

            if (!textureRef.current) {
              const newTexture = new VideoTexture(video)
              newTexture.minFilter = LinearFilter
              newTexture.magFilter = LinearFilter
              newTexture.colorSpace = SRGBColorSpace
              newTexture.generateMipmaps = false
              textureRef.current = newTexture

              if (materialRef.current) {
                materialRef.current.map = newTexture
                materialRef.current.needsUpdate = true
              }
            }

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
          if (!isActiveRef.current) return

          const errorCode = video.error?.code
          const errorMessage = video.error?.message || "Unknown error"
          console.log(
            `[v0] MP4 load error (code: ${errorCode}): ${errorMessage}, retry ${retryCountRef.current + 1}/${maxRetries}`,
          )

          if (retryCountRef.current < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000)
            retryCountRef.current++

            setTimeout(() => {
              if (isActiveRef.current && videoRef.current) {
                console.log(`[v0] Retrying MP4 load...`)
                const cacheBuster = `${src.includes("?") ? "&" : "?"}_t=${Date.now()}`
                videoRef.current.src = src + cacheBuster
                videoRef.current.load()
              }
            }, delay)
          } else {
            setHasError(true)
            setIsLoading(false)
            onError?.("Failed to load video after retries")
          }
        })

        addEventListener("stalled", () => {
          console.log("[v0] MP4 video stalled, attempting recovery...")
          setTimeout(() => {
            if (isActiveRef.current && videoRef.current && videoRef.current.paused) {
              videoRef.current.play().catch(() => {})
            }
          }, 2000)
        })

        addEventListener("waiting", () => {
          console.log("[v0] MP4 video buffering...")
        })

        addEventListener("loadedmetadata", () => {
          if (!isActiveRef.current) return
          console.log(`[v0] MP4 metadata loaded, duration: ${video.duration}s`)

          if (startTime > 0 && startTime < video.duration - 1) {
            console.log(`[v0] Syncing MP4 to ${startTime}s`)
            video.currentTime = startTime
          }

          if (autoplay) {
            setTimeout(() => {
              if (!isActiveRef.current || !videoRef.current) return
              videoRef.current.play().catch((err) => {
                console.log("[v0] MP4 autoplay failed, trying muted:", err)
                if (videoRef.current) {
                  videoRef.current.muted = true
                  videoRef.current.play().catch((e) => console.error("[v0] MP4 muted play failed:", e))
                }
              })
            }, 100)
          }
        })

        addEventListener("abort", () => {
          console.log("[v0] MP4 video aborted")
        })

        // Set source and start loading
        console.log(`[v0] Loading MP4 from: ${src}`)
        video.src = src
        video.load()
      } catch (err) {
        if (isActiveRef.current) {
          console.error("[v0] MP4 init error:", err)
          setHasError(true)
          setIsLoading(false)
          onError?.("Failed to initialize video")
        }
      }
    }

    initVideo()

    return () => {
      isActiveRef.current = false
      eventListeners.forEach(({ target, event, handler }) => {
        try {
          target.removeEventListener(event, handler)
        } catch (e) {
          // Ignore errors
        }
      })
      cleanupRef.current?.()
    }
  }, [src, autoplay, startTime, hasError, onReady, onError])

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

  useEffect(() => {
    if (!isReady) return

    const checkInterval = setInterval(() => {
      if (videoRef.current && isActiveRef.current) {
        const video = videoRef.current
        // If video is paused but should be playing, restart it
        if (video.paused && !video.ended && autoplay) {
          console.log("[v0] MP4 video stopped unexpectedly, restarting...")
          video.play().catch(() => {})
        }
      }
    }, 5000)

    return () => clearInterval(checkInterval)
  }, [isReady, autoplay])

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
