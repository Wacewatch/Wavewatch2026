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
  row_number: number
  seat_number: number
  user_id: string | null
}

interface CinemaInteriorProps {
  currentCinemaRoom: CinemaRoom
  cinemaRooms: CinemaRoom[]
  cinemaSessions?: CinemaSession[]
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

function getCurrentSession(roomId: string, sessions: CinemaSession[]): CinemaSession | null {
  const now = new Date()
  const roomSessions = sessions.filter((s) => s.room_id === roomId && s.is_active)

  const currentSession = roomSessions.find((s) => {
    const start = new Date(s.schedule_start)
    const end = new Date(s.schedule_end)
    return now >= start && now <= end
  })

  if (currentSession) return currentSession

  const upcomingSessions = roomSessions
    .filter((s) => new Date(s.schedule_start) > now)
    .sort((a, b) => new Date(a.schedule_start).getTime() - new Date(b.schedule_start).getTime())

  return upcomingSessions[0] || null
}

function WaitingScreen3D({
  movieTitle,
  countdown,
  posterUrl,
}: {
  movieTitle: string
  countdown: string
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

    if (!posterUrl || typeof posterUrl !== "string") {
      setPosterLoaded(true)
      return
    }

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
    const fullUrl = posterUrl.startsWith("http") ? posterUrl : `https://image.tmdb.org/t/p/w500${posterUrl}`
    img.src = fullUrl
  }, [posterUrl, isClient])

  useEffect(() => {
    if (!isClient) return

    const canvas = document.createElement("canvas")
    canvas.width = 1024
    canvas.height = 576
    canvasRef.current = canvas

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    textureRef.current = texture

    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial
      material.map = texture
      material.needsUpdate = true
    }

    return () => {
      texture.dispose()
    }
  }, [isClient])

  useFrame(() => {
    if (!canvasRef.current || !textureRef.current || !isClient) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#111111"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (posterImageRef.current && posterLoaded) {
      const posterWidth = 180
      const posterHeight = 270
      const posterX = (canvas.width - posterWidth) / 2
      const posterY = 140

      ctx.save()
      ctx.beginPath()
      ctx.roundRect(posterX, posterY, posterWidth, posterHeight, 8)
      ctx.clip()
      ctx.drawImage(posterImageRef.current, posterX, posterY, posterWidth, posterHeight)
      ctx.restore()

      ctx.strokeStyle = "#6b7280"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(posterX, posterY, posterWidth, posterHeight, 8)
      ctx.stroke()
    }

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 38px Arial, sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    const title = movieTitle || "Film à venir"
    const maxWidth = canvas.width - 100
    const words = title.split(" ")
    const lines: string[] = []
    let currentLine = ""

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)

    const titleY = posterLoaded && posterImageRef.current ? 70 : 180
    lines.forEach((line, i) => {
      ctx.fillText(line, canvas.width / 2, titleY + i * 44)
    })

    const countdownLabelY = posterLoaded && posterImageRef.current ? 440 : 280
    ctx.fillStyle = "#9ca3af"
    ctx.font = "24px Arial, sans-serif"
    ctx.fillText("Début dans:", canvas.width / 2, countdownLabelY)

    ctx.fillStyle = "#facc15"
    ctx.font = "bold 36px Arial, sans-serif"
    ctx.fillText(countdown || "...", canvas.width / 2, countdownLabelY + 45)

    ctx.fillStyle = "#6b7280"
    ctx.font = "16px Arial, sans-serif"
    ctx.fillText("Watch Party - Le film démarrera automatiquement", canvas.width / 2, canvas.height - 30)

    textureRef.current.needsUpdate = true
  })

  if (!isClient) {
    return (
      <mesh position={[0, 0, 0.3]}>
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
    if (!isClient) return

    const canvas = document.createElement("canvas")
    canvas.width = 1024
    canvas.height = 576
    const ctx = canvas.getContext("2d")

    if (ctx) {
      ctx.fillStyle = "#111111"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 48px Arial, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("Séance terminée", canvas.width / 2, 200)

      ctx.fillStyle = "#9ca3af"
      ctx.font = "28px Arial, sans-serif"
      ctx.fillText(`La projection de "${movieTitle || "Film"}" est terminée.`, canvas.width / 2, 280)

      ctx.fillStyle = "#6b7280"
      ctx.font = "22px Arial, sans-serif"
      ctx.fillText("Merci d'avoir participé à cette Watch Party!", canvas.width / 2, 350)
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter

    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial
      material.map = texture
      material.needsUpdate = true
    }

    return () => {
      texture.dispose()
    }
  }, [movieTitle, isClient])

  return (
    <mesh ref={meshRef} position={[0, 0, 0.3]}>
      <planeGeometry args={[14, 8]} />
      <meshBasicMaterial color="#111111" />
    </mesh>
  )
}

function NoSessionScreen3D({ roomName, roomNumber }: { roomName?: string; roomNumber: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const canvas = document.createElement("canvas")
    canvas.width = 1024
    canvas.height = 576
    const ctx = canvas.getContext("2d")

    if (ctx) {
      ctx.fillStyle = "#111111"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 48px Arial, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(roomName || `Salle ${roomNumber}`, canvas.width / 2, 220)

      ctx.fillStyle = "#9ca3af"
      ctx.font = "28px Arial, sans-serif"
      ctx.fillText("Aucune séance programmée", canvas.width / 2, 300)

      ctx.fillStyle = "#6b7280"
      ctx.font = "22px Arial, sans-serif"
      ctx.fillText("Revenez plus tard pour la prochaine Watch Party!", canvas.width / 2, 370)
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter

    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial
      material.map = texture
      material.needsUpdate = true
    }

    return () => {
      texture.dispose()
    }
  }, [roomName, roomNumber, isClient])

  return (
    <mesh ref={meshRef} position={[0, 0, 0.3]}>
      <planeGeometry args={[14, 8]} />
      <meshBasicMaterial color="#111111" />
    </mesh>
  )
}

export function CinemaInterior({
  currentCinemaRoom,
  cinemaRooms,
  cinemaSessions = [],
  cinemaSeats,
  mySeat,
  showMovieFullscreen,
  isCinemaMuted,
  countdown,
}: CinemaInteriorProps) {
  const room = cinemaRooms.find((r) => r.id === currentCinemaRoom.id) || currentCinemaRoom

  const currentSession = useMemo(() => {
    return getCurrentSession(room.id, cinemaSessions)
  }, [room.id, cinemaSessions])

  const activeMovieTitle = currentSession?.movie_title || room?.movie_title || ""
  const activeMoviePoster = currentSession?.movie_poster || room?.movie_poster
  const activeEmbedUrl = currentSession?.embed_url || room?.embed_url
  const activeScheduleStart = currentSession?.schedule_start || room?.schedule_start
  const activeScheduleEnd = currentSession?.schedule_end || room?.schedule_end

  const isMovieStarted = activeScheduleStart ? new Date(activeScheduleStart).getTime() < Date.now() : false
  const isMovieEnded = activeScheduleEnd ? new Date(activeScheduleEnd).getTime() < Date.now() : false

  const hasSession = !!(activeMovieTitle || activeEmbedUrl || currentSession)

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

  const videoType = activeEmbedUrl ? getVideoType(activeEmbedUrl) : "unknown"

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current || videoType !== "mp4" || !isMovieStarted || isMovieEnded) return

    const video = videoRef.current

    // Sync au temps de la séance
    if (activeScheduleStart) {
      const syncTime = calculateSyncPosition(activeScheduleStart)
      if (syncTime > 0) {
        video.currentTime = syncTime
      }
    }

    // Tenter de lancer la lecture
    video.play().catch(() => {
      video.muted = true
      video.play().catch(console.error)
    })

    // Sync toutes les 10 secondes
    const syncInterval = setInterval(() => {
      if (activeScheduleStart && video && !video.paused) {
        const expectedTime = calculateSyncPosition(activeScheduleStart)
        const drift = Math.abs(video.currentTime - expectedTime)
        if (drift > 5) {
          video.currentTime = expectedTime
        }
      }
    }, 10000)

    return () => clearInterval(syncInterval)
  }, [videoType, isMovieStarted, isMovieEnded, activeScheduleStart])

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
      {room && (
        <group position={[0, 4, -17.5]}>
          {/* Écran d'attente - avant le début du film */}
          {!isMovieStarted && hasSession && activeMovieTitle && (
            <WaitingScreen3D
              movieTitle={activeMovieTitle}
              countdown={countdown || "..."}
              posterUrl={activeMoviePoster}
            />
          )}

          {/* Écran fin de séance */}
          {isMovieEnded && hasSession && <EndedScreen3D movieTitle={activeMovieTitle || "Film"} />}

          {/* Écran aucune séance */}
          {!hasSession && <NoSessionScreen3D roomName={room.name} roomNumber={room.room_number} />}

          {/* Vidéo en cours - MP4/PHP simple comme v105 */}
          {isMovieStarted && !isMovieEnded && activeEmbedUrl && !showMovieFullscreen && videoType === "mp4" && (
            <Html
              transform
              position={[0, 0, 0.3]}
              scale={0.5}
              occlude
              style={{
                width: "1120px",
                height: "630px",
                background: "#000",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <video
                ref={videoRef}
                src={activeEmbedUrl}
                autoPlay
                muted={isCinemaMuted}
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  background: "#000",
                }}
              />
            </Html>
          )}

          {/* Vidéo HLS/M3U8 - NE PAS TOUCHER */}
          {isMovieStarted && !isMovieEnded && activeEmbedUrl && !showMovieFullscreen && videoType === "m3u8" && (
            <HLSVideoScreen
              key={`hls-embed-${room.id}`}
              src={activeEmbedUrl}
              width={14}
              height={8}
              position={[0, 0, 0.3]}
              autoplay={true}
              muted={isCinemaMuted}
            />
          )}

          {/* Iframe */}
          {isMovieStarted && !isMovieEnded && activeEmbedUrl && !showMovieFullscreen && videoType === "iframe" && (
            <Html
              transform
              position={[0, 0, 0.3]}
              scale={0.5}
              occlude
              style={{
                width: "1120px",
                height: "630px",
                background: "#000",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <iframe
                src={activeEmbedUrl}
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
      )}

      {/* Sièges */}
      {displaySeats.map((seat) => {
        const seatId = seat.row_number * 100 + seat.seat_number
        const isMySeat = mySeat === seatId
        const isOccupied = !!seat.user_id

        const seatColor = isMySeat ? "#ef4444" : isOccupied ? "#f97316" : themeColors.seatDefault

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
