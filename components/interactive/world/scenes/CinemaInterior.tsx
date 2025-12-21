"use client"

import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import { HLSVideoScreen } from "../../hls-video-screen"
import { useState, useEffect, useRef, useMemo } from "react"
import * as THREE from "three"

interface CinemaSession {
  id: string
  room_id: string
  movie_title: string | null
  movie_tmdb_id: number | null
  movie_poster: string | null
  embed_url: string | null
  schedule_start: string
  schedule_end: string
  is_active: boolean
}

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
  room_id: string
  row_number: number
  seat_number: number
  user_id: string | null
}

interface CinemaInteriorProps {
  currentCinemaRoom: CinemaRoom | null
  cinemaRooms?: CinemaRoom[]
  cinemaSessions?: CinemaSession[]
  cinemaSeats?: CinemaSeat[]
  mySeat?: number | null
  showMovieFullscreen?: boolean
  isCinemaMuted?: boolean
  countdown?: string
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

  // PHP files and MP4 files are treated as mp4
  if (
    lowerUrl.includes(".php") ||
    lowerUrl.includes(".mp4") ||
    lowerUrl.includes(".webm") ||
    lowerUrl.includes(".ogg")
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

function calculateCountdown(scheduleStart: string): string {
  const startDate = new Date(scheduleStart)
  const now = new Date()
  const diffMs = startDate.getTime() - now.getTime()

  if (diffMs <= 0) return "Démarrage..."

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}

function WaitingScreen3D({
  movieTitle,
  scheduleStart,
  posterUrl,
}: {
  movieTitle: string
  scheduleStart?: string
  posterUrl?: string
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const textureRef = useRef<THREE.CanvasTexture | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const posterImageRef = useRef<HTMLImageElement | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [posterLoaded, setPosterLoaded] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const canvas = document.createElement("canvas")
    canvas.width = 1024
    canvas.height = 576
    canvasRef.current = canvas

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    textureRef.current = texture

    if (meshRef.current) {
      ;(meshRef.current.material as THREE.MeshBasicMaterial).map = texture
      ;(meshRef.current.material as THREE.MeshBasicMaterial).needsUpdate = true
    }

    // Load poster image
    if (posterUrl && typeof posterUrl === "string" && posterUrl.startsWith("http")) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        posterImageRef.current = img
        setPosterLoaded(true)
      }
      img.onerror = () => {
        posterImageRef.current = null
        setPosterLoaded(true)
      }
      img.src = posterUrl
    } else {
      setPosterLoaded(true)
    }

    return () => {
      texture.dispose()
    }
  }, [isClient, posterUrl])

  useFrame(() => {
    if (!canvasRef.current || !textureRef.current || !isClient) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Clear with dark background
    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, 1024, 576)

    // Draw poster if loaded
    if (posterImageRef.current && posterLoaded) {
      const posterWidth = 180
      const posterHeight = 270
      const posterX = (1024 - posterWidth) / 2
      const posterY = 150
      ctx.drawImage(posterImageRef.current, posterX, posterY, posterWidth, posterHeight)
    }

    // Draw title
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 36px sans-serif"
    ctx.textAlign = "center"
    const title = movieTitle || "Film"
    ctx.fillText(title.length > 30 ? title.substring(0, 30) + "..." : title, 512, 80)

    // Draw countdown
    if (scheduleStart) {
      const countdown = calculateCountdown(scheduleStart)
      ctx.fillStyle = "#888888"
      ctx.font = "24px sans-serif"
      ctx.fillText("Début dans:", 512, 460)
      ctx.fillStyle = "#ef4444"
      ctx.font = "bold 32px sans-serif"
      ctx.fillText(countdown, 512, 500)
    }

    textureRef.current.needsUpdate = true
  })

  if (!isClient) {
    return (
      <mesh ref={meshRef} position={[0, 0, 0.3]}>
        <planeGeometry args={[14, 8]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
    )
  }

  return (
    <mesh ref={meshRef} position={[0, 0, 0.3]}>
      <planeGeometry args={[14, 8]} />
      <meshBasicMaterial color="#111111" />
    </mesh>
  )
}

function EndedScreen3D({ movieTitle }: { movieTitle: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || typeof document === "undefined") return

    const canvas = document.createElement("canvas")
    canvas.width = 1024
    canvas.height = 576
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, 1024, 576)

    ctx.fillStyle = "#666666"
    ctx.font = "bold 48px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("Séance terminée", 512, 260)

    ctx.fillStyle = "#444444"
    ctx.font = "28px sans-serif"
    ctx.fillText(movieTitle || "Film", 512, 320)

    const texture = new THREE.CanvasTexture(canvas)
    if (meshRef.current) {
      ;(meshRef.current.material as THREE.MeshBasicMaterial).map = texture
      ;(meshRef.current.material as THREE.MeshBasicMaterial).needsUpdate = true
    }

    return () => {
      texture.dispose()
    }
  }, [isClient, movieTitle])

  return (
    <mesh ref={meshRef} position={[0, 0, 0.3]}>
      <planeGeometry args={[14, 8]} />
      <meshBasicMaterial color="#111111" />
    </mesh>
  )
}

function NoSessionScreen3D({ roomName, roomNumber }: { roomName?: string; roomNumber?: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || typeof document === "undefined") return

    const canvas = document.createElement("canvas")
    canvas.width = 1024
    canvas.height = 576
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, 1024, 576)

    ctx.fillStyle = "#444444"
    ctx.font = "bold 36px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("Aucune séance programmée", 512, 270)

    ctx.fillStyle = "#333333"
    ctx.font = "24px sans-serif"
    ctx.fillText(roomName || `Salle ${roomNumber || ""}`, 512, 320)

    const texture = new THREE.CanvasTexture(canvas)
    if (meshRef.current) {
      ;(meshRef.current.material as THREE.MeshBasicMaterial).map = texture
      ;(meshRef.current.material as THREE.MeshBasicMaterial).needsUpdate = true
    }

    return () => {
      texture.dispose()
    }
  }, [isClient, roomName, roomNumber])

  return (
    <mesh ref={meshRef} position={[0, 0, 0.3]}>
      <planeGeometry args={[14, 8]} />
      <meshBasicMaterial color="#111111" />
    </mesh>
  )
}

export function CinemaInterior({
  currentCinemaRoom,
  cinemaRooms = [],
  cinemaSessions = [],
  cinemaSeats = [],
  mySeat,
  showMovieFullscreen,
  isCinemaMuted,
  countdown,
}: CinemaInteriorProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Use currentCinemaRoom as the room
  const room = currentCinemaRoom

  const themeColors = useMemo(() => getThemeColors(room?.theme), [room?.theme])

  const generatedSeats = useMemo(() => {
    if (!room) return []

    // Filter seats for current room from BDD
    const roomSeats = cinemaSeats.filter((s) => s.room_id === room.id)

    // If we have seats from BDD, use them
    if (roomSeats.length > 0) {
      return roomSeats
    }

    // Otherwise generate default seats based on capacity
    const capacity = room.capacity || 30
    const seatsPerRow = 6
    const numRows = Math.ceil(capacity / seatsPerRow)
    const seats: { id: string; row_number: number; seat_number: number; user_id: string | null }[] = []

    for (let row = 1; row <= numRows; row++) {
      const seatsInThisRow = row === numRows ? capacity - (numRows - 1) * seatsPerRow : seatsPerRow
      for (let seat = 1; seat <= seatsInThisRow; seat++) {
        seats.push({
          id: `generated-${row}-${seat}`,
          row_number: row,
          seat_number: seat,
          user_id: null,
        })
      }
    }

    return seats
  }, [room, cinemaSeats])

  const seatsPerRow = useMemo(() => {
    if (generatedSeats.length > 0) {
      const seatNumbers = generatedSeats.map((s) => s.seat_number).filter((n) => typeof n === "number" && !isNaN(n))
      if (seatNumbers.length > 0) {
        return Math.max(...seatNumbers)
      }
    }
    return 6
  }, [generatedSeats])

  // Find current session
  const currentSession = useMemo(() => {
    if (!room?.id) return null
    const roomSessions = cinemaSessions.filter((s) => s.room_id === room.id)
    const now = new Date()

    // Find current playing session
    const playing = roomSessions.find((s) => {
      const start = new Date(s.schedule_start)
      const end = new Date(s.schedule_end)
      return now >= start && now <= end
    })

    if (playing) return playing

    // Find next session
    const upcoming = roomSessions
      .filter((s) => new Date(s.schedule_start) > now)
      .sort((a, b) => new Date(a.schedule_start).getTime() - new Date(b.schedule_start).getTime())[0]

    return upcoming || null
  }, [room?.id, cinemaSessions])

  const activeMovieTitle = currentSession?.movie_title || room?.movie_title || ""
  const activeMoviePoster = currentSession?.movie_poster || room?.movie_poster
  const videoUrl = currentSession?.embed_url || room?.embed_url
  const videoType = getVideoType(videoUrl || "")
  const activeScheduleStart = currentSession?.schedule_start || room?.schedule_start
  const activeScheduleEnd = currentSession?.schedule_end || room?.schedule_end

  const isMovieStarted = activeScheduleStart ? new Date(activeScheduleStart).getTime() < Date.now() : false
  const isMovieEnded = activeScheduleEnd ? new Date(activeScheduleEnd).getTime() < Date.now() : false

  const hasSession = !!(activeMovieTitle || videoUrl || currentSession)

  useEffect(() => {
    if (videoType !== "mp4") return
    if (!isMovieStarted || isMovieEnded) return
    if (!videoRef.current || !videoUrl) return

    const video = videoRef.current
    console.log("[v0] Setting up MP4/PHP video:", videoUrl)

    // Simple setup - just set src and try to play
    video.src = videoUrl
    video.load()

    const handleCanPlay = () => {
      console.log("[v0] MP4/PHP canplay - duration:", video.duration)

      // Sync to schedule time
      if (activeScheduleStart) {
        const syncTime = calculateSyncPosition(activeScheduleStart)
        console.log("[v0] Syncing MP4 to time:", syncTime)
        if (syncTime > 0 && video.duration && syncTime < video.duration) {
          video.currentTime = syncTime
        }
      }

      video.play().catch((err) => {
        console.log("[v0] Play failed, trying muted:", err.message)
        video.muted = true
        video.play().catch(() => {})
      })
    }

    video.addEventListener("canplay", handleCanPlay)

    // Periodic sync every 10 seconds
    const syncInterval = setInterval(() => {
      if (video.paused) {
        video.play().catch(() => {})
      }

      if (activeScheduleStart && video.duration > 0) {
        const expectedTime = calculateSyncPosition(activeScheduleStart)
        const drift = Math.abs(video.currentTime - expectedTime)
        if (drift > 5 && expectedTime < video.duration) {
          console.log("[v0] Re-syncing MP4, drift:", drift)
          video.currentTime = expectedTime
        }
      }
    }, 10000)

    return () => {
      video.removeEventListener("canplay", handleCanPlay)
      clearInterval(syncInterval)
    }
  }, [videoType, isMovieStarted, isMovieEnded, videoUrl, activeScheduleStart])

  if (!room) return null

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

      {/* Écran noir de fond */}
      <mesh position={[0, 4, -18]}>
        <boxGeometry args={[18, 10, 0.2]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Mur invisible devant l'écran */}
      <mesh position={[0, 2, -2]} visible={false}>
        <boxGeometry args={[40, 4, 0.1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Zone écran */}
      <group position={[0, 4, -17.5]}>
        {/* Écran d'attente - avant le début du film */}
        {!isMovieStarted && hasSession && activeMovieTitle && (
          <WaitingScreen3D
            movieTitle={activeMovieTitle}
            scheduleStart={activeScheduleStart}
            posterUrl={activeMoviePoster}
          />
        )}

        {/* Écran fin de séance */}
        {isMovieEnded && hasSession && <EndedScreen3D movieTitle={activeMovieTitle || "Film"} />}

        {/* Écran aucune séance */}
        {!hasSession && <NoSessionScreen3D roomName={room.name} roomNumber={room.room_number} />}

        {/* Vidéo MP4/PHP - Simple like v105 */}
        {isMovieStarted && !isMovieEnded && videoUrl && videoType === "mp4" && (
          <Html
            transform
            position={[0, 0, 0.3]}
            scale={0.5}
            occlude
            style={{
              width: "1400px",
              height: "800px",
              background: "#000",
              overflow: "hidden",
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                background: "#000",
              }}
            />
          </Html>
        )}

        {/* Vidéo HLS/M3U8 - NE PAS TOUCHER */}
        {isMovieStarted && !isMovieEnded && videoUrl && videoType === "m3u8" && (
          <HLSVideoScreen
            key={`hls-embed-${room.id}`}
            src={videoUrl}
            width={14}
            height={8}
            position={[0, 0, 0.3]}
            autoplay={true}
            muted={true}
          />
        )}

        {/* Iframe */}
        {isMovieStarted && !isMovieEnded && videoUrl && videoType === "iframe" && (
          <Html
            transform
            position={[0, 0, 0.3]}
            scale={0.5}
            occlude
            style={{
              width: "1400px",
              height: "800px",
              background: "#000",
              overflow: "hidden",
            }}
          >
            <iframe
              src={videoUrl}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </Html>
        )}
      </group>

      {generatedSeats.map((seat) => {
        const isOccupied = seat.user_id !== null
        const isMyCurrentSeat = mySeat === seat.row_number * 100 + seat.seat_number
        const seatColor = isMyCurrentSeat ? "#22c55e" : isOccupied ? "#ef4444" : themeColors.seatDefault

        const [x, y, z] = generateSeatPosition(seat.row_number, seat.seat_number, seatsPerRow)

        return (
          <group key={seat.id} position={[x, y, z]} rotation={[0, Math.PI, 0]}>
            {/* Assise */}
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[0.8, 0.15, 0.7]} />
              <meshStandardMaterial color={seatColor} />
            </mesh>
            {/* Dossier */}
            <mesh position={[0, 0.55, 0.3]}>
              <boxGeometry args={[0.8, 0.6, 0.1]} />
              <meshStandardMaterial color={seatColor} />
            </mesh>
            {/* Accoudoirs */}
            <mesh position={[-0.45, 0.35, 0]}>
              <boxGeometry args={[0.1, 0.3, 0.6]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
            <mesh position={[0.45, 0.35, 0]}>
              <boxGeometry args={[0.1, 0.3, 0.6]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
          </group>
        )
      })}

      {/* Éclairage */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 6, 0]} intensity={0.5} />
      <spotLight position={[0, 8, -15]} angle={0.5} intensity={1} target-position={[0, 4, -17]} />
    </>
  )
}
