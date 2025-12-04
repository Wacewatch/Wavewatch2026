"use client"

import { Html } from "@react-three/drei"
import { HLSVideoScreen } from "../../hls-video-screen"

interface CinemaRoom {
  id: string
  room_number: number
  movie_title: string
  movie_poster?: string
  embed_url?: string
  schedule_start?: string
}

interface CinemaSeat {
  id: string
  row_number: number
  seat_number: number
  position_x: number
  position_y: number
  position_z: number
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

export function CinemaInterior({
  currentCinemaRoom,
  cinemaRooms,
  cinemaSeats,
  mySeat,
  showMovieFullscreen,
  isCinemaMuted,
  countdown,
}: CinemaInteriorProps) {
  const room = cinemaRooms.find((r) => r.id === currentCinemaRoom.id)
  const isMovieStarted = room?.schedule_start && new Date(room.schedule_start).getTime() < Date.now()

  return (
    <>
      {/* Cinema Interior Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[30, 40]} />
        <meshStandardMaterial color="#2d1010" />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 3, -20]}>
        <boxGeometry args={[30, 6, 0.5]} />
        <meshStandardMaterial color="#1a0f0a" />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-15, 3, 0]}>
        <boxGeometry args={[0.5, 6, 40]} />
        <meshStandardMaterial color="#1a0f0a" />
      </mesh>
      {/* Right Wall */}
      <mesh position={[15, 3, 0]}>
        <boxGeometry args={[0.5, 6, 40]} />
        <meshStandardMaterial color="#1a0f0a" />
      </mesh>

      {/* Cinema Screen - HLS stream only for room 1 */}
      {currentCinemaRoom?.room_number === 1 && !showMovieFullscreen && (
        <group position={[0, 3, -15]}>
          <HLSVideoScreen
            key={`hls-room-${currentCinemaRoom.id}`}
            src="https://amg02162-newenconnect-amg02162c2-rakuten-us-1981.playouts.now.amagi.tv/ts-us-e2-n2/playlist/amg02162-newenconnect-100pour100docs-rakutenus/playlist.m3u8"
            width={13.5}
            height={7.5}
            position={[0, 0, 0]}
            autoplay={true}
            muted={isCinemaMuted}
          />
        </group>
      )}

      {/* Movie Info and Countdown / Movie Display */}
      {room && (
        <group position={[0, 3, -20]}>
          {/* Movie Info and Countdown - Display before movie starts */}
          {!isMovieStarted && (
            <Html position={[0, 1, 0.2]} center zIndexRange={[100, 0]}>
              <div className="bg-black/80 p-6 rounded-lg text-white text-center backdrop-blur">
                <h2 className="text-3xl font-bold mb-2">{room.movie_title}</h2>
                <p className="text-lg text-gray-300 mb-4">
                  Début dans: <span className="text-yellow-400 font-bold">{countdown}</span>
                </p>
                {room.movie_poster && (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${room.movie_poster}`}
                    alt={room.movie_title}
                    className="w-40 h-60 object-cover rounded mx-auto"
                  />
                )}
              </div>
            </Html>
          )}

          {/* Movie Display - iframe fallback for non-HLS URLs from DB */}
          {isMovieStarted && room.embed_url && !showMovieFullscreen && !room.embed_url.includes('.m3u8') && (
            <Html transform style={{ width: "1300px", height: "720px" }}>
              <iframe
                src={room.embed_url}
                className="w-full h-full rounded"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </Html>
          )}
        </group>
      )}

      {/* Cinema Seats */}
      {cinemaSeats.map((seat) => {
        const seatId = seat.row_number * 100 + seat.seat_number
        const isMySeat = mySeat === seatId
        const isOccupied = !!seat.user_id
        const seatColor = isMySeat ? "#ef4444" : (isOccupied ? "#f97316" : "#374151")

        return (
          <group key={seat.id || `seat-${seat.seat_number}-${seat.position_x}-${seat.position_z}`} position={[seat.position_x, seat.position_y, seat.position_z]}>
            <mesh castShadow>
              <boxGeometry args={[1, 0.8, 0.9]} />
              <meshStandardMaterial color={seatColor} />
            </mesh>
          </group>
        )
      })}
    </>
  )
}
