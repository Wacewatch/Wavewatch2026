"use client"

import { Html } from "@react-three/drei"
import { HLSVideoScreen } from "../../hls-video-screen"
import { useState, useEffect, useRef, useMemo } from "react"

interface CinemaRoom {
  id: string
  room_number: number
  name?: string
  capacity?: number
  theme?: string
}

interface CinemaSeat {
  id: string
  row_number: number
  seat_number: number
  user_id: string | null
}

interface CinemaSession {
  id: string
  room_id: string
  movie_title: string
  embed_url: string
  schedule_start: string
  schedule_end: string
  movie_poster: string | null
  movie_tmdb_id: number | null
  is_active: boolean
}

interface CinemaInteriorProps {
  currentCinemaRoom: CinemaRoom
  cinemaRooms: CinemaRoom[]
  cinemaSessions: CinemaSession[]
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

  console.log("[v0] CinemaInterior - Room ID:", room.id)
  console.log("[v0] CinemaInterior - Total sessions:", cinemaSessions.length)

  const roomSessions = (cinemaSessions || [])
    .filter((s) => {
      const matches = s.room_id === room.id && s.is_active
      console.log(`[v0] Session ${s.id} - room_id: ${s.room_id}, matches: ${matches}`)
      return matches
    })
    .sort((a, b) => new Date(a.schedule_start).getTime() - new Date(b.schedule_start).getTime())

  console.log("[v0] CinemaInterior - Room sessions:", roomSessions.length)

  const now = new Date()
  console.log("[v0] Current time (now):", now.toISOString())

  roomSessions.forEach((s, idx) => {
    const start = new Date(s.schedule_start)
    const end = new Date(s.schedule_end)
    console.log(`[v0] Session ${idx + 1} (${s.movie_title}):`)
    console.log(`  - start: ${start.toISOString()} (${start.getTime()})`)
    console.log(`  - end: ${end.toISOString()} (${end.getTime()})`)
    console.log(`  - now: ${now.toISOString()} (${now.getTime()})`)
    console.log(`  - is after start: ${start <= now}`)
    console.log(`  - is before end: ${end > now}`)
    console.log(`  - is current: ${start <= now && end > now}`)
  })

  const currentSession =
    roomSessions.find((s) => {
      const start = new Date(s.schedule_start)
      const end = new Date(s.schedule_end)
      const isCurrent = start <= now && end > now
      return isCurrent
    }) || roomSessions.find((s) => new Date(s.schedule_start) > now)

  console.log("[v0] CinemaInterior - Current session:", currentSession ? currentSession.movie_title : "none")

  const nextSession = roomSessions.find((s) => new Date(s.schedule_start) > now)

  const isMovieStarted = currentSession && new Date(currentSession.schedule_start).getTime() < Date.now()
  const isMovieEnded = currentSession && new Date(currentSession.schedule_end).getTime() < Date.now()
  const videoUrl = currentSession?.embed_url
  const movieTitle = currentSession?.movie_title || room.name
  const moviePoster = currentSession?.movie_poster
  const scheduleStart = currentSession?.schedule_start
  const scheduleEnd = currentSession?.schedule_end

  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoStartPosition, setVideoStartPosition] = useState(0)

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

  useEffect(() => {
    if (scheduleStart && isMovieStarted && !isMovieEnded) {
      const syncPosition = calculateSyncPosition(scheduleStart)
      setVideoStartPosition(syncPosition)

      const videoSyncInterval = setInterval(() => {
        if (videoRef.current && scheduleStart) {
          const expectedPosition = calculateSyncPosition(scheduleStart)
          const currentPosition = videoRef.current.currentTime
          const drift = Math.abs(expectedPosition - currentPosition)

          if (drift > 5) {
            console.log(`[v0] Syncing video: drift ${drift}s, seeking to ${expectedPosition}s`)
            videoRef.current.currentTime = expectedPosition
          }
        }
      }, 5000)

      return () => {
        clearInterval(videoSyncInterval)
      }
    }
  }, [scheduleStart, isMovieStarted, isMovieEnded])

  const videoType = videoUrl ? getVideoType(videoUrl) : "unknown"

  const getTimeUntilNextSession = () => {
    if (!nextSession) return null
    const nextStart = new Date(nextSession.schedule_start)
    const diffMs = nextStart.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}min`
    }
    return `${diffMins}min`
  }

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[40, 50]} />
        <meshStandardMaterial color={themeColors.floor} />
      </mesh>

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

      <mesh position={[0, 4, -18]}>
        <boxGeometry args={[18, 10, 0.2]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      <mesh position={[0, 2, -2]} visible={false}>
        <boxGeometry args={[40, 4, 0.1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {room && (
        <group position={[0, 4, -17.5]}>
          {!isMovieStarted && (
            <Html position={[0, 0, 0.5]} center zIndexRange={[100, 0]}>
              <div className="bg-black/80 p-6 rounded-lg text-white text-center backdrop-blur">
                <h2 className="text-3xl font-bold mb-2">{movieTitle || "Salle de cinéma"}</h2>
                {scheduleStart && (
                  <p className="text-lg text-gray-300 mb-4">
                    Début dans: <span className="text-yellow-400 font-bold">{countdown}</span>
                  </p>
                )}
                {moviePoster && (
                  <img
                    src={moviePoster || "/placeholder.svg"}
                    alt={movieTitle}
                    className="w-40 h-60 object-cover rounded mx-auto"
                  />
                )}
                <p className="text-sm text-gray-400 mt-4">Watch Party - Le film démarrera automatiquement</p>
              </div>
            </Html>
          )}

          {isMovieEnded && (
            <Html position={[0, 0, 0.5]} center zIndexRange={[100, 0]}>
              <div className="bg-black/80 p-6 rounded-lg text-white text-center backdrop-blur">
                {nextSession ? (
                  <>
                    <h2 className="text-2xl font-bold mb-2">Prochaine séance</h2>
                    <p className="text-gray-300 mb-4">{nextSession.movie_title}</p>
                    {nextSession.movie_poster && (
                      <img
                        src={nextSession.movie_poster || "/placeholder.svg"}
                        alt={nextSession.movie_title}
                        className="w-40 h-60 object-cover rounded mx-auto mb-4"
                      />
                    )}
                    <p className="text-lg text-yellow-400 font-bold">Début dans {getTimeUntilNextSession()}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {new Date(nextSession.schedule_start).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-2">Séance terminée</h2>
                    <p className="text-gray-300">Aucune prochaine séance programmée.</p>
                    <p className="text-sm text-gray-400 mt-2">Revenez plus tard!</p>
                  </>
                )}
              </div>
            </Html>
          )}

          {!videoUrl && !currentSession && (
            <Html position={[0, 0, 0.5]} center zIndexRange={[100, 0]}>
              <div className="bg-black/80 p-6 rounded-lg text-white text-center backdrop-blur">
                <h2 className="text-2xl font-bold mb-2">{room.name || `Salle ${room.room_number}`}</h2>
                <p className="text-gray-300">Aucune séance programmée</p>
                <p className="text-sm text-gray-400 mt-2">Revenez plus tard pour la prochaine Watch Party!</p>
              </div>
            </Html>
          )}

          {isMovieStarted && !isMovieEnded && videoUrl && !showMovieFullscreen && (
            <>
              {videoType === "mp4" && (
                <Html transform style={{ width: "1400px", height: "780px" }} position={[0, 0, 0.3]}>
                  <div className="relative w-full h-full bg-black rounded overflow-hidden">
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      className="w-full h-full object-contain"
                      autoPlay
                      muted={isCinemaMuted}
                      playsInline
                      controls={false}
                      controlsList="nodownload nofullscreen noremoteplayback"
                      disablePictureInPicture
                      onLoadedMetadata={(e) => {
                        const video = e.currentTarget
                        const syncTime = scheduleStart ? calculateSyncPosition(scheduleStart) : 0
                        console.log(`[v0] Video loaded, syncing to ${syncTime}s from session schedule_start`)
                        if (syncTime > 0 && video.duration > syncTime) {
                          video.currentTime = syncTime
                        }
                        video.play().catch(() => {})
                      }}
                      onCanPlay={(e) => {
                        e.currentTarget.play().catch(() => {})
                      }}
                      style={{ pointerEvents: "none" }}
                    />
                    <div className="absolute inset-0 bg-transparent" style={{ pointerEvents: "all" }} />
                  </div>
                </Html>
              )}

              {videoType === "m3u8" && (
                <HLSVideoScreen
                  key={`hls-embed-${room.id}-${currentSession?.id}`}
                  src={videoUrl}
                  width={14}
                  height={8}
                  position={[0, 0, 0.3]}
                  autoplay={true}
                  muted={isCinemaMuted}
                  scheduleStart={scheduleStart}
                />
              )}

              {videoType === "iframe" && videoUrl && (
                <Html transform style={{ width: "1400px", height: "780px" }} position={[0, 0, 0.3]}>
                  <div className="relative w-full h-full">
                    <iframe
                      src={videoUrl}
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
        </group>
      )}

      {displaySeats.map((seat) => {
        const seatId = seat.row_number * 100 + seat.seat_number
        const isMySeat = mySeat === seatId
        const isOccupied = !!seat.user_id

        const seatColor = isMySeat ? "#ef4444" : isOccupied ? "#f97316" : themeColors.seatDefault

        const [x, y, z] = generateSeatPosition(seat.row_number, seat.seat_number, seatsPerRow)

        return (
          <group key={seat.id} position={[x, y, z]}>
            <mesh castShadow position={[0, 0, 0]}>
              <boxGeometry args={[1, 0.8, 0.9]} />
              <meshStandardMaterial color={seatColor} />
            </mesh>
            <mesh castShadow position={[0, 0.6, 0.35]}>
              <boxGeometry args={[1, 0.8, 0.2]} />
              <meshStandardMaterial color={seatColor} />
            </mesh>
            <mesh castShadow position={[-0.45, 0.2, 0]}>
              <boxGeometry args={[0.1, 0.3, 0.7]} />
              <meshStandardMaterial color={seatColor} />
            </mesh>
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
