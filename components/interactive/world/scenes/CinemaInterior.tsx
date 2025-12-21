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
  const screenZ = -19
  const firstRowZ = screenZ + 8

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

  // MP4, WebM, Ogg ou PHP (qui stream du MP4)
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
  // Par défaut, traiter comme vidéo MP4 pour les URLs de streaming
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
  cinemaSeats,
  mySeat,
  showMovieFullscreen,
  isCinemaMuted,
  countdown,
}: CinemaInteriorProps) {
  const room = cinemaRooms.find((r) => r.id === currentCinemaRoom.id) || currentCinemaRoom
  const isMovieStarted = room?.schedule_start && new Date(room.schedule_start).getTime() < Date.now()
  const isMovieEnded = room?.schedule_end && new Date(room.schedule_end).getTime() < Date.now()

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

    // Générer des sièges par défaut basés sur la capacité
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
    if (room?.schedule_start && isMovieStarted && !isMovieEnded) {
      const syncPosition = calculateSyncPosition(room.schedule_start)
      setVideoStartPosition(syncPosition)

      // Synchroniser la vidéo toutes les 10 secondes
      const videoSyncInterval = setInterval(() => {
        if (videoRef.current && room.schedule_start) {
          const expectedPosition = calculateSyncPosition(room.schedule_start)
          const currentPosition = videoRef.current.currentTime
          const drift = Math.abs(expectedPosition - currentPosition)

          // Corriger si plus de 5 secondes de décalage
          if (drift > 5) {
            console.log(`[v0] Syncing video: drift ${drift}s, seeking to ${expectedPosition}s`)
            videoRef.current.currentTime = expectedPosition
          }
        }
      }, 10000)

      return () => {
        clearInterval(videoSyncInterval)
      }
    }
  }, [room?.schedule_start, isMovieStarted, isMovieEnded])

  const videoType = room?.embed_url ? getVideoType(room.embed_url) : "unknown"

  return (
    <>
      {/* Cinema Interior Floor - uses theme color */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[30, 40]} />
        <meshStandardMaterial color={themeColors.floor} />
      </mesh>

      {/* Back Wall - uses theme color */}
      <mesh position={[0, 3, 20]}>
        <boxGeometry args={[30, 6, 0.5]} />
        <meshStandardMaterial color={themeColors.wall} />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-15, 3, 0]}>
        <boxGeometry args={[0.5, 6, 40]} />
        <meshStandardMaterial color={themeColors.wall} />
      </mesh>
      {/* Right Wall */}
      <mesh position={[15, 3, 0]}>
        <boxGeometry args={[0.5, 6, 40]} />
        <meshStandardMaterial color={themeColors.wall} />
      </mesh>
      {/* Front Wall (behind screen) */}
      <mesh position={[0, 3, -20]}>
        <boxGeometry args={[30, 6, 0.5]} />
        <meshStandardMaterial color={themeColors.wall} />
      </mesh>

      {/* Screen background */}
      <mesh position={[0, 3.5, -19.5]}>
        <boxGeometry args={[16, 9, 0.1]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {room && (
        <group position={[0, 3, -19]}>
          {/* Avant le début du film - afficher l'affiche et le compte à rebours */}
          {!isMovieStarted && (
            <Html position={[0, 1, 0.2]} center zIndexRange={[100, 0]}>
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
                <p className="text-sm text-gray-400 mt-4">🎬 Watch Party - Le film démarrera automatiquement</p>
              </div>
            </Html>
          )}

          {/* Film terminé */}
          {isMovieEnded && (
            <Html position={[0, 1, 0.2]} center zIndexRange={[100, 0]}>
              <div className="bg-black/80 p-6 rounded-lg text-white text-center backdrop-blur">
                <h2 className="text-2xl font-bold mb-2">Séance terminée</h2>
                <p className="text-gray-300">La projection de "{room.movie_title}" est terminée.</p>
                <p className="text-sm text-gray-400 mt-2">Merci d'avoir participé à cette Watch Party!</p>
              </div>
            </Html>
          )}

          {/* Pas de film programmé */}
          {!room.embed_url && !room.movie_title && (
            <Html position={[0, 1, 0.2]} center zIndexRange={[100, 0]}>
              <div className="bg-black/80 p-6 rounded-lg text-white text-center backdrop-blur">
                <h2 className="text-2xl font-bold mb-2">{room.name || `Salle ${room.room_number}`}</h2>
                <p className="text-gray-300">Aucune séance programmée</p>
                <p className="text-sm text-gray-400 mt-2">Revenez plus tard pour la prochaine Watch Party!</p>
              </div>
            </Html>
          )}

          {/* Film en cours - synchronisé pour tous les utilisateurs */}
          {isMovieStarted && !isMovieEnded && room.embed_url && !showMovieFullscreen && (
            <>
              {/* MP4/WebM/PHP vidéo directe - lecture synchronisée */}
              {videoType === "mp4" && (
                <Html transform style={{ width: "1300px", height: "720px" }}>
                  <div className="relative w-full h-full bg-black rounded overflow-hidden">
                    <video
                      ref={videoRef}
                      src={room.embed_url}
                      className="w-full h-full object-contain"
                      autoPlay
                      muted={isCinemaMuted}
                      playsInline
                      controls={false}
                      controlsList="nodownload nofullscreen noremoteplayback"
                      disablePictureInPicture
                      onLoadedMetadata={(e) => {
                        const video = e.currentTarget
                        const syncTime = room.schedule_start ? calculateSyncPosition(room.schedule_start) : 0
                        console.log(`[v0] Video loaded, syncing to ${syncTime}s from schedule_start`)
                        if (syncTime > 0 && video.duration > syncTime) {
                          video.currentTime = syncTime
                        }
                        video.play().catch(() => {})
                      }}
                      onCanPlay={(e) => {
                        // S'assurer que la lecture commence
                        e.currentTarget.play().catch(() => {})
                      }}
                      style={{ pointerEvents: "none" }}
                    />
                    {/* Overlay pour bloquer les contrôles */}
                    <div className="absolute inset-0 bg-transparent" style={{ pointerEvents: "all" }} />
                  </div>
                </Html>
              )}

              {/* M3U8/HLS stream - lecture synchronisée */}
              {videoType === "m3u8" && (
                <HLSVideoScreen
                  key={`hls-embed-${room.id}`}
                  src={room.embed_url}
                  width={13.5}
                  height={7.5}
                  position={[0, 0, 0]}
                  autoplay={true}
                  muted={isCinemaMuted}
                />
              )}

              {/* YouTube/Vimeo iframes uniquement */}
              {videoType === "iframe" && room.embed_url && (
                <Html transform style={{ width: "1300px", height: "720px" }}>
                  <div className="relative w-full h-full">
                    <iframe
                      src={room.embed_url}
                      className="w-full h-full rounded"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen={false}
                      style={{ border: "none" }}
                    />
                    {/* Overlay pour bloquer les interactions */}
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

      {/* Cinema Seats - Orientés vers l'écran (rotation de 180°) */}
      {displaySeats.map((seat) => {
        const seatId = seat.row_number * 100 + seat.seat_number
        const isMySeat = mySeat === seatId
        const isOccupied = !!seat.user_id

        const seatColor = isMySeat ? "#ef4444" : isOccupied ? "#f97316" : themeColors.seatDefault

        const [x, y, z] = generateSeatPosition(seat.row_number, seat.seat_number, seatsPerRow)

        return (
          <group key={seat.id} position={[x, y, z]} rotation={[0, Math.PI, 0]}>
            {/* Assise du siège */}
            <mesh castShadow position={[0, 0, 0]}>
              <boxGeometry args={[1, 0.8, 0.9]} />
              <meshStandardMaterial color={seatColor} />
            </mesh>
            {/* Dossier */}
            <mesh castShadow position={[0, 0.6, -0.35]}>
              <boxGeometry args={[1, 0.8, 0.2]} />
              <meshStandardMaterial color={seatColor} />
            </mesh>
            {/* Accoudoirs */}
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
