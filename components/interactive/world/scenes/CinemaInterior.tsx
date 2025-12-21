"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"

interface CinemaRoom {
  id: string
  room_number: number
  name?: string
  capacity?: number
  theme?: string
  movie_title: string
  movie_poster?: string
  embed_url?: string
  schedule_start?: string
  schedule_end?: string
}

interface CinemaSeat {
  id: string
  row_number: number
  seat_number: number
  user_id: string | null
}

interface CinemaInteriorProps {
  currentCinemaRoom: CinemaRoom
  cinemaRooms: CinemaRoom[]
  cinemaSeats: CinemaSeat[]
  mySeat: number | null
  showMovieFullscreen: boolean
  isCinemaMuted: boolean
  countdown: string
}

function generateSeatPosition(rowNumber: number, seatNumber: number, totalSeatsPerRow = 10): [number, number, number] {
  const rowSpacing = 2.5
  const seatSpacing = 1.5
  const startX = -((totalSeatsPerRow - 1) * seatSpacing) / 2
  const firstRowZ = 2

  const x = startX + (seatNumber - 1) * seatSpacing
  const y = 0.4
  const z = firstRowZ + (rowNumber - 1) * rowSpacing

  return [x, y, z]
}

function getThemeColors(theme?: string): { floor: string; wall: string; seatDefault: string } {
  switch (theme) {
    case "luxury":
      return { floor: "#1a1a2e", wall: "#16213e", seatDefault: "#c9a227" }
    case "retro":
      return { floor: "#3d0c02", wall: "#1a0f0a", seatDefault: "#8b4513" }
    case "modern":
      return { floor: "#0f0f0f", wall: "#1f1f1f", seatDefault: "#4a4a4a" }
    default:
      return { floor: "#2d1010", wall: "#1a0f0a", seatDefault: "#374151" }
  }
}

function getVideoType(url: string): "mp4" | "m3u8" | "iframe" | "unknown" {
  if (!url) return "unknown"
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
  if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be") || lowerUrl.includes("vimeo.com")) {
    return "iframe"
  }
  return "mp4"
}

function calculateSyncPosition(scheduleStart: string): number {
  const startDate = new Date(scheduleStart)
  const now = new Date()
  const elapsedSeconds = Math.floor((now.getTime() - startDate.getTime()) / 1000)
  return Math.max(0, elapsedSeconds)
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
          {/* Affichages avant le début du film */}
          {!isMovieStarted && (
            <Html position={[0, 4, -17]} center>
              <div className="bg-black/80 p-6 rounded-lg text-white text-center backdrop-blur">
                <h2 className="text-3xl font-bold mb-2">{room.movie_title || room.name || "Salle de cinéma"}</h2>
                {room.schedule_start && (
                  <p className="text-lg text-gray-300 mb-4">
                    Début dans: <span className="text-yellow-400 font-bold">{countdown}</span>
                  </p>
                )}
                {room.movie_poster && (
                  <img
                    src={
                      room.movie_poster.startsWith("http")
                        ? room.movie_poster
                        : `https://image.tmdb.org/t/p/w500${room.movie_poster}`
                    }
                    alt={room.movie_title}
                    className="w-40 h-60 object-cover rounded mx-auto"
                  />
                )}
                <p className="text-sm text-gray-400 mt-4">Watch Party - Le film démarrera automatiquement</p>
              </div>
            </Html>
          )}

          {/* Affichage après la fin du film */}
          {isMovieEnded && (
            <Html position={[0, 4, -17]} center>
              <div className="bg-black/80 p-6 rounded-lg text-white text-center backdrop-blur">
                <h2 className="text-2xl font-bold mb-2">Séance terminée</h2>
                <p className="text-gray-300">La projection de "{room.movie_title}" est terminée.</p>
                <p className="text-sm text-gray-400 mt-2">Merci d'avoir participé à cette Watch Party!</p>
              </div>
            </Html>
          )}

          {/* Aucune séance programmée */}
          {!room.embed_url && !room.movie_title && (
            <Html position={[0, 4, -17]} center>
              <div className="bg-black/80 p-6 rounded-lg text-white text-center backdrop-blur">
                <h2 className="text-2xl font-bold mb-2">{room.name || `Salle ${room.room_number}`}</h2>
                <p className="text-gray-300">Aucune séance programmée</p>
                <p className="text-sm text-gray-400 mt-2">Revenez plus tard pour la prochaine Watch Party!</p>
              </div>
            </Html>
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
