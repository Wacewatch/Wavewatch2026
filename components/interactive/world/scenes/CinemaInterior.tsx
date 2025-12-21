"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"
import type { CinemaRoom, CinemaSeat, CinemaInteriorProps } from "./types" // Assuming types are defined in a separate file
import { generateSeatPosition, getThemeColors, getVideoType } from "./utils" // Assuming utils are defined in a separate file

function WaitingScreen({
  room,
  countdown,
  width = 16,
  height = 9,
  position = [0, 0, 0] as [number, number, number],
}: {
  room: CinemaRoom
  countdown: string
  width?: number
  height?: number
  position?: [number, number, number]
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const textureRef = useRef<THREE.CanvasTexture | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Créer le canvas une seule fois
  useEffect(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 1920
    canvas.height = 1080
    canvasRef.current = canvas

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    textureRef.current = texture

    // Charger l'image du poster
    if (room.movie_poster) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        imageRef.current = img
        setImageLoaded(true)
      }
      img.onerror = () => {
        setImageLoaded(true) // Continuer sans image
      }
      const posterUrl = room.movie_poster.startsWith("http")
        ? room.movie_poster
        : `https://image.tmdb.org/t/p/w500${room.movie_poster}`
      img.src = posterUrl
    } else {
      setImageLoaded(true)
    }

    return () => {
      texture.dispose()
    }
  }, [room.movie_poster])

  // Redessiner le canvas à chaque frame pour mettre à jour le compte à rebours
  useFrame(() => {
    if (!canvasRef.current || !textureRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Fond noir
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Cadre décoratif
    ctx.strokeStyle = "#333333"
    ctx.lineWidth = 4
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80)

    // Titre du film
    const title = room.movie_title || room.name || "Salle de cinéma"
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 72px Arial, sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"

    // Gérer les titres longs
    const maxWidth = canvas.width - 200
    const words = title.split(" ")
    const lines: string[] = []
    let currentLine = ""

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)

    let titleY = 100
    for (const line of lines) {
      ctx.fillText(line, canvas.width / 2, titleY)
      titleY += 80
    }

    // Image du poster au centre
    if (imageRef.current && imageLoaded) {
      const img = imageRef.current
      const posterWidth = 280
      const posterHeight = 420
      const posterX = (canvas.width - posterWidth) / 2
      const posterY = titleY + 40

      // Ombre du poster
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      ctx.fillRect(posterX + 8, posterY + 8, posterWidth, posterHeight)

      // Poster
      ctx.drawImage(img, posterX, posterY, posterWidth, posterHeight)

      // Bordure du poster
      ctx.strokeStyle = "#444444"
      ctx.lineWidth = 2
      ctx.strokeRect(posterX, posterY, posterWidth, posterHeight)
    }

    // Compte à rebours
    const countdownY = imageLoaded && imageRef.current ? 700 : titleY + 100

    ctx.fillStyle = "#aaaaaa"
    ctx.font = "36px Arial, sans-serif"
    ctx.fillText("Début dans:", canvas.width / 2, countdownY)

    ctx.fillStyle = "#fbbf24" // Jaune
    ctx.font = "bold 64px Arial, sans-serif"
    ctx.fillText(countdown, canvas.width / 2, countdownY + 60)

    // Message Watch Party
    ctx.fillStyle = "#666666"
    ctx.font = "28px Arial, sans-serif"
    ctx.fillText("🎬 Watch Party - Le film démarrera automatiquement", canvas.width / 2, canvas.height - 100)

    // Mettre à jour la texture
    textureRef.current.needsUpdate = true

    // Appliquer la texture au mesh
    if (meshRef.current && meshRef.current.material) {
      ;(meshRef.current.material as THREE.MeshBasicMaterial).map = textureRef.current
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial color="#000000" />
    </mesh>
  )
}

function EndedScreen({
  room,
  width = 16,
  height = 9,
  position = [0, 0, 0] as [number, number, number],
}: {
  room: CinemaRoom
  width?: number
  height?: number
  position?: [number, number, number]
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const textureRef = useRef<THREE.CanvasTexture | null>(null)

  useEffect(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 1920
    canvas.height = 1080
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Fond noir
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Cadre
    ctx.strokeStyle = "#333333"
    ctx.lineWidth = 4
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80)

    // Titre
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 64px Arial, sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("Séance terminée", canvas.width / 2, canvas.height / 2 - 80)

    // Message
    ctx.fillStyle = "#aaaaaa"
    ctx.font = "36px Arial, sans-serif"
    ctx.fillText(`La projection de "${room.movie_title}" est terminée.`, canvas.width / 2, canvas.height / 2 + 20)

    // Remerciement
    ctx.fillStyle = "#666666"
    ctx.font = "28px Arial, sans-serif"
    ctx.fillText("Merci d'avoir participé à cette Watch Party!", canvas.width / 2, canvas.height / 2 + 100)

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    textureRef.current = texture

    if (meshRef.current) {
      ;(meshRef.current.material as THREE.MeshBasicMaterial).map = texture
      ;(meshRef.current.material as THREE.MeshBasicMaterial).needsUpdate = true
    }

    return () => {
      texture.dispose()
    }
  }, [room.movie_title])

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial color="#000000" />
    </mesh>
  )
}

function NoSessionScreen({
  room,
  width = 16,
  height = 9,
  position = [0, 0, 0] as [number, number, number],
}: {
  room: CinemaRoom
  width?: number
  height?: number
  position?: [number, number, number]
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const textureRef = useRef<THREE.CanvasTexture | null>(null)

  useEffect(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 1920
    canvas.height = 1080
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Fond noir
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Cadre
    ctx.strokeStyle = "#333333"
    ctx.lineWidth = 4
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80)

    // Titre de la salle
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 64px Arial, sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(room.name || `Salle ${room.room_number}`, canvas.width / 2, canvas.height / 2 - 60)

    // Message
    ctx.fillStyle = "#aaaaaa"
    ctx.font = "36px Arial, sans-serif"
    ctx.fillText("Aucune séance programmée", canvas.width / 2, canvas.height / 2 + 20)

    // Info
    ctx.fillStyle = "#666666"
    ctx.font = "28px Arial, sans-serif"
    ctx.fillText("Revenez plus tard pour la prochaine Watch Party!", canvas.width / 2, canvas.height / 2 + 100)

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    textureRef.current = texture

    if (meshRef.current) {
      ;(meshRef.current.material as THREE.MeshBasicMaterial).map = texture
      ;(meshRef.current.material as THREE.MeshBasicMaterial).needsUpdate = true
    }

    return () => {
      texture.dispose()
    }
  }, [room.name, room.room_number])

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial color="#000000" />
    </mesh>
  )
}

function VideoScreen({
  url,
  width = 16,
  height = 9,
  position = [0, 0, 0] as [number, number, number],
  muted = false,
  scheduleStart,
}: {
  url: string
  width?: number
  height?: number
  position?: [number, number, number]
  muted?: boolean
  scheduleStart?: string
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 5

  const initializeVideo = useCallback(() => {
    // Nettoyer l'ancienne vidéo si elle existe
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.src = ""
      videoRef.current.load()
    }

    setIsLoading(true)
    setError(null)

    const video = document.createElement("video")

    video.crossOrigin = "anonymous"
    video.loop = false
    video.muted = muted
    video.playsInline = true
    video.preload = "auto" // Précharger la vidéo
    video.setAttribute("playsinline", "true")
    video.setAttribute("webkit-playsinline", "true")

    // Priorité basse pour le réseau (économie de bande passante)
    if ("fetchPriority" in video) {
      ;(video as any).fetchPriority = "high"
    }

    videoRef.current = video

    // Créer la texture vidéo avec configuration optimisée
    const texture = new THREE.VideoTexture(video)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.format = THREE.RGBAFormat
    texture.colorSpace = THREE.SRGBColorSpace
    texture.generateMipmaps = false // Désactiver les mipmaps pour plus de performance
    setVideoTexture(texture)

    // Calculer la position de synchronisation
    const syncToPosition = () => {
      if (scheduleStart && video.duration > 0) {
        const startDate = new Date(scheduleStart)
        const now = new Date()
        const elapsedSeconds = Math.floor((now.getTime() - startDate.getTime()) / 1000)
        if (elapsedSeconds > 0 && video.duration > elapsedSeconds) {
          video.currentTime = elapsedSeconds
        }
      }
    }

    video.onloadstart = () => {
      setIsLoading(true)
    }

    video.onloadeddata = () => {
      setIsLoading(false)
    }

    video.onloadedmetadata = () => {
      syncToPosition()
      attemptPlay()
    }

    video.oncanplay = () => {
      setIsLoading(false)
      if (!isPlaying) {
        attemptPlay()
      }
    }

    video.oncanplaythrough = () => {
      setIsLoading(false)
    }

    video.onplaying = () => {
      setIsPlaying(true)
      setIsLoading(false)
      setError(null)
    }

    video.onwaiting = () => {
      setIsLoading(true)
    }

    video.onstalled = () => {
      // La vidéo est bloquée, tenter de relancer
      setTimeout(() => {
        if (video.paused) {
          attemptPlay()
        }
      }, 1000)
    }

    video.onerror = (e) => {
      console.error("[v0] Video error:", video.error)
      setError(`Erreur de lecture: ${video.error?.message || "Connexion instable"}`)
      setIsLoading(false)

      // Retry automatique
      if (retryCount < maxRetries) {
        setTimeout(
          () => {
            setRetryCount((prev) => prev + 1)
            initializeVideo()
          },
          2000 * (retryCount + 1),
        ) // Délai croissant entre les retries
      }
    }

    const attemptPlay = () => {
      video
        .play()
        .then(() => {
          setIsPlaying(true)
          setIsLoading(false)
        })
        .catch((e) => {
          console.log("[v0] Autoplay blocked, will retry on user interaction")
          // Écouter une interaction utilisateur pour démarrer
          const startOnInteraction = () => {
            video.play().catch(() => {})
            document.removeEventListener("click", startOnInteraction)
            document.removeEventListener("keydown", startOnInteraction)
          }
          document.addEventListener("click", startOnInteraction, { once: true })
          document.addEventListener("keydown", startOnInteraction, { once: true })
        })
    }

    // Charger la vidéo
    video.src = url
    video.load()

    // Resync périodique
    const syncInterval = setInterval(() => {
      if (video && scheduleStart && video.duration > 0 && !video.paused) {
        const startDate = new Date(scheduleStart)
        const now = new Date()
        const expectedPosition = Math.floor((now.getTime() - startDate.getTime()) / 1000)
        const drift = Math.abs(expectedPosition - video.currentTime)
        if (drift > 5 && expectedPosition < video.duration) {
          video.currentTime = expectedPosition
        }
      }
    }, 10000)

    // Vérification périodique de l'état de la vidéo
    const healthCheck = setInterval(() => {
      if (video && video.paused && !video.ended && isPlaying) {
        attemptPlay()
      }
    }, 5000)

    return () => {
      clearInterval(syncInterval)
      clearInterval(healthCheck)
      video.pause()
      video.src = ""
      video.load()
      texture.dispose()
    }
  }, [url, scheduleStart, muted, retryCount])

  useEffect(() => {
    const cleanup = initializeVideo()
    return cleanup
  }, [url, scheduleStart])

  // Mettre à jour le mute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted
    }
  }, [muted])

  // Mettre à jour la texture à chaque frame
  useFrame(() => {
    if (videoTexture && videoRef.current && !videoRef.current.paused) {
      videoTexture.needsUpdate = true
    }
  })

  return (
    <group>
      <mesh ref={meshRef} position={position}>
        <planeGeometry args={[width, height]} />
        {videoTexture ? (
          <meshBasicMaterial map={videoTexture} side={THREE.FrontSide} toneMapped={false} />
        ) : (
          <meshBasicMaterial color="#000000" />
        )}
      </mesh>

      {isLoading && (
        <Html position={[position[0], position[1], position[2] + 0.1]} center>
          <div className="flex flex-col items-center justify-center p-4 bg-black/80 rounded-lg">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-2" />
            <p className="text-white text-sm">Chargement...</p>
            {retryCount > 0 && (
              <p className="text-gray-400 text-xs mt-1">
                Tentative {retryCount}/{maxRetries}
              </p>
            )}
          </div>
        </Html>
      )}

      {error && !isLoading && (
        <Html position={[position[0], position[1], position[2] + 0.1]} center>
          <div className="flex flex-col items-center justify-center p-4 bg-black/80 rounded-lg">
            <p className="text-red-400 text-sm mb-2">{error}</p>
            <button
              onClick={() => {
                setRetryCount(0)
                initializeVideo()
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              Réessayer
            </button>
          </div>
        </Html>
      )}
    </group>
  )
}

function HLSVideoScreen3D({
  url,
  width = 16,
  height = 9,
  position = [0, 0, 0] as [number, number, number],
  muted = false,
  scheduleStart,
}: {
  url: string
  width?: number
  height?: number
  position?: [number, number, number]
  muted?: boolean
  scheduleStart?: string
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const hlsRef = useRef<any>(null)
  const maxRetries = 5

  const initializeHLS = useCallback(() => {
    // Cleanup
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.src = ""
    }

    setIsLoading(true)
    setError(null)

    const video = document.createElement("video")
    video.crossOrigin = "anonymous"
    video.loop = false
    video.muted = muted
    video.playsInline = true
    video.preload = "auto"

    videoRef.current = video

    const texture = new THREE.VideoTexture(video)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.format = THREE.RGBAFormat
    texture.colorSpace = THREE.SRGBColorSpace
    texture.generateMipmaps = false
    setVideoTexture(texture)

    // Charger HLS dynamiquement avec configuration optimisée
    import("hls.js")
      .then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false, // Désactiver pour plus de stabilité
            backBufferLength: 90, // Plus de buffer en arrière
            maxBufferLength: 60, // Buffer max de 60 secondes
            maxMaxBufferLength: 120, // Buffer max absolu
            maxBufferSize: 60 * 1000 * 1000, // 60 MB max buffer
            maxBufferHole: 0.5, // Tolérance aux trous dans le buffer
            startLevel: -1, // Auto-sélection du niveau de qualité
            abrEwmaDefaultEstimate: 500000, // Estimation bande passante initiale (500 Kbps)
            abrEwmaFastLive: 3, // Adaptation rapide en live
            abrEwmaSlowLive: 9,
            abrBandWidthFactor: 0.8, // Facteur de sécurité pour la bande passante
            abrBandWidthUpFactor: 0.5, // Monter en qualité plus lentement
            fragLoadingTimeOut: 20000, // Timeout plus long pour fragments
            fragLoadingMaxRetry: 6, // Plus de retries pour les fragments
            fragLoadingRetryDelay: 1000, // Délai entre retries
            manifestLoadingTimeOut: 15000, // Timeout manifest
            manifestLoadingMaxRetry: 4,
            levelLoadingTimeOut: 15000,
            levelLoadingMaxRetry: 4,
          })

          hlsRef.current = hls

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false)
            video.play().catch(() => {
              // Écouter une interaction utilisateur
              const startOnInteraction = () => {
                video.play().catch(() => {})
                document.removeEventListener("click", startOnInteraction)
              }
              document.addEventListener("click", startOnInteraction, { once: true })
            })
          })

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              console.error("[v0] HLS fatal error:", data.type, data.details)
              setError(`Erreur de stream: ${data.details}`)
              setIsLoading(false)

              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  // Retry sur erreur réseau
                  if (retryCount < maxRetries) {
                    setTimeout(
                      () => {
                        setRetryCount((prev) => prev + 1)
                        hls.startLoad()
                      },
                      2000 * (retryCount + 1),
                    )
                  }
                  break
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError()
                  break
                default:
                  if (retryCount < maxRetries) {
                    setTimeout(() => {
                      setRetryCount((prev) => prev + 1)
                      initializeHLS()
                    }, 3000)
                  }
                  break
              }
            }
          })

          hls.on(Hls.Events.FRAG_BUFFERED, () => {
            setIsLoading(false)
          })

          hls.on(Hls.Events.BUFFER_APPENDING, () => {
            setIsLoading(false)
          })

          hls.loadSource(url)
          hls.attachMedia(video)
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          // Safari native HLS
          video.src = url
          video.addEventListener("loadeddata", () => setIsLoading(false))
          video.play().catch(() => {})
        }
      })
      .catch((err) => {
        console.error("[v0] Failed to load HLS.js:", err)
        setError("Impossible de charger le lecteur vidéo")
        setIsLoading(false)
      })

    // Health check pour HLS
    const healthCheck = setInterval(() => {
      if (video && video.paused && !video.ended) {
        video.play().catch(() => {})
      }
    }, 5000)

    return () => {
      clearInterval(healthCheck)
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
      video.pause()
      video.src = ""
      texture.dispose()
    }
  }, [url, muted, retryCount])

  useEffect(() => {
    const cleanup = initializeHLS()
    return cleanup
  }, [url])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted
    }
  }, [muted])

  useFrame(() => {
    if (videoTexture && videoRef.current && !videoRef.current.paused) {
      videoTexture.needsUpdate = true
    }
  })

  return (
    <group>
      <mesh ref={meshRef} position={position}>
        <planeGeometry args={[width, height]} />
        {videoTexture ? (
          <meshBasicMaterial map={videoTexture} side={THREE.FrontSide} toneMapped={false} />
        ) : (
          <meshBasicMaterial color="#000000" />
        )}
      </mesh>

      {/* Indicateur de chargement */}
      {isLoading && (
        <Html position={[position[0], position[1], position[2] + 0.1]} center>
          <div className="flex flex-col items-center justify-center p-4 bg-black/80 rounded-lg">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-2" />
            <p className="text-white text-sm">Chargement du stream...</p>
            {retryCount > 0 && (
              <p className="text-gray-400 text-xs mt-1">
                Tentative {retryCount}/{maxRetries}
              </p>
            )}
          </div>
        </Html>
      )}

      {/* Affichage d'erreur */}
      {error && !isLoading && (
        <Html position={[position[0], position[1], position[2] + 0.1]} center>
          <div className="flex flex-col items-center justify-center p-4 bg-black/80 rounded-lg">
            <p className="text-red-400 text-sm mb-2">{error}</p>
            <button
              onClick={() => {
                setRetryCount(0)
                initializeHLS()
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              Réessayer
            </button>
          </div>
        </Html>
      )}
    </group>
  )
}

export function CinemaInterior({
  currentCinemaRoom,
  cinemaRooms,
  cinemaSeats,
  mySeat,
  showMovieFullscreen,
  isCinemaMuted,
  countdown,
}: CinemaInteriorProps) {
  const room = cinemaRooms.find((r) => r.id === currentCinemaRoom.id) || currentCinemaRoom
  const isMovieStarted = room?.schedule_start && new Date(room.schedule_start).getTime() < Date.now()
  const isMovieEnded = room?.schedule_end && new Date(room.schedule_end).getTime() < Date.now()

  const themeColors = useMemo(() => getThemeColors(room?.theme), [room?.theme])

  const seatsPerRow = useMemo(() => {
    if (cinemaSeats.length > 0) {
      const maxSeatInRow = Math.max(...cinemaSeats.map((s) => s.seat_number))
      return Math.max(maxSeatInRow, 10)
    }
    return 10
  }, [cinemaSeats])

  const displaySeats = useMemo(() => {
    if (cinemaSeats.length > 0) {
      return cinemaSeats
    }

    const capacity = room?.capacity || 30
    const perRow = Math.min(10, Math.ceil(Math.sqrt(capacity)))
    const totalRows = Math.ceil(capacity / perRow)
    const defaultSeats: CinemaSeat[] = []

    let seatCount = 0
    for (let row = 1; row <= totalRows && seatCount < capacity; row++) {
      const seatsInThisRow = Math.min(perRow, capacity - seatCount)
      for (let seat = 1; seat <= seatsInThisRow; seat++) {
        defaultSeats.push({
          id: `default-${row}-${seat}`,
          row_number: row,
          seat_number: seat,
          user_id: null,
        })
        seatCount++
      }
    }

    return defaultSeats
  }, [cinemaSeats, room?.capacity])

  const videoType = room?.embed_url ? getVideoType(room.embed_url) : "unknown"

  return (
    <>
      {/* Sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[40, 50]} />
        <meshStandardMaterial color={themeColors.floor} />
      </mesh>

      {/* Murs */}
      <mesh position={[0, 4, 25]}>
        <boxGeometry args={[40, 8, 0.5]} />
        <meshStandardMaterial color={themeColors.wall} />
      </mesh>
      <mesh position={[-20, 4, 0]}>
        <boxGeometry args={[0.5, 8, 50]} />
        <meshStandardMaterial color={themeColors.wall} />
      </mesh>
      <mesh position={[20, 4, 0]}>
        <boxGeometry args={[0.5, 8, 50]} />
        <meshStandardMaterial color={themeColors.wall} />
      </mesh>
      <mesh position={[0, 4, -25]}>
        <boxGeometry args={[40, 8, 0.5]} />
        <meshStandardMaterial color={themeColors.wall} />
      </mesh>

      {/* Fond noir derrière l'écran */}
      <mesh position={[0, 4, -18.5]}>
        <boxGeometry args={[18, 10, 0.2]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Mur invisible pour empêcher de passer devant l'écran */}
      <mesh position={[0, 2, -2]}>
        <boxGeometry args={[40, 4, 0.1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Écran de cinéma - maintenant un vrai objet 3D */}
      {room && (
        <>
          {!isMovieStarted && (
            <WaitingScreen room={room} countdown={countdown} width={16} height={9} position={[0, 4, -17.5]} />
          )}

          {isMovieEnded && <EndedScreen room={room} width={16} height={9} position={[0, 4, -17.5]} />}

          {!room.embed_url && !room.movie_title && (
            <NoSessionScreen room={room} width={16} height={9} position={[0, 4, -17.5]} />
          )}

          {isMovieStarted && !isMovieEnded && room.embed_url && !showMovieFullscreen && (
            <>
              {videoType === "mp4" && (
                <VideoScreen
                  url={room.embed_url}
                  width={16}
                  height={9}
                  position={[0, 4, -17.5]}
                  muted={isCinemaMuted}
                  scheduleStart={room.schedule_start}
                />
              )}

              {videoType === "m3u8" && (
                <HLSVideoScreen3D
                  url={room.embed_url}
                  width={16}
                  height={9}
                  position={[0, 4, -17.5]}
                  muted={isCinemaMuted}
                  scheduleStart={room.schedule_start}
                />
              )}

              {videoType === "iframe" && (
                <Html transform position={[0, 4, -17.5]} style={{ width: "1400px", height: "787px" }} occlude>
                  <div className="relative w-full h-full">
                    <iframe
                      src={room.embed_url}
                      className="w-full h-full rounded"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen={false}
                      style={{ border: "none" }}
                    />
                    <div
                      className="absolute inset-0 bg-transparent cursor-default"
                      style={{ pointerEvents: "all" }}
                      onClick={(e) => e.preventDefault()}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                </Html>
              )}
            </>
          )}
        </>
      )}

      {/* Sièges */}
      {displaySeats.map((seat) => {
        const seatId = seat.row_number * 100 + seat.seat_number
        const isMySeat = mySeat === seatId
        const isOccupied = !!seat.user_id

        const seatColor = isMySeat ? "#ef4444" : isOccupied ? "#f97316" : themeColors.seatDefault

        const [x, y, z] = generateSeatPosition(seat.row_number, seat.seat_number, seatsPerRow)

        return (
          <group key={seat.id} position={[x, y, z]}>
            {/* Assise */}
            <mesh castShadow position={[0, 0, 0]}>
              <boxGeometry args={[1, 0.8, 0.9]} />
              <meshStandardMaterial color={seatColor} />
            </mesh>
            {/* Dossier - orienté vers l'écran (Z négatif) */}
            <mesh castShadow position={[0, 0.6, -0.35]}>
              <boxGeometry args={[1, 0.8, 0.2]} />
              <meshStandardMaterial color={seatColor} />
            </mesh>
            {/* Accoudoir gauche */}
            <mesh castShadow position={[-0.45, 0.2, 0]}>
              <boxGeometry args={[0.1, 0.3, 0.7]} />
              <meshStandardMaterial color={seatColor} />
            </mesh>
            {/* Accoudoir droit */}
            <mesh castShadow position={[0.45, 0.2, 0]}>
              <boxGeometry args={[0.1, 0.3, 0.7]} />
              <meshStandardMaterial color={seatColor} />
            </mesh>
          </group>
        )
      })}
    </>
  )
}
