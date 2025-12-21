"use client"

import { Film, X, Users, Sparkles, Clock, Calendar } from "lucide-react"

interface CinemaRoom {
  id: string
  room_number: number
  name?: string
  movie_title: string | null
  movie_poster: string | null
  theme: string
  capacity: number
  is_open: boolean
  schedule_start: string | null
  schedule_end: string | null
}

interface CinemaSession {
  id: string
  room_id: string
  movie_title: string | null
  movie_poster: string | null
  movie_tmdb_id: number | null
  embed_url: string | null
  schedule_start: string | null
  schedule_end: string | null
  is_active: boolean
}

interface CinemaSeat {
  cinema_room_id: string
  user_id: string | null
}

interface CinemaModalProps {
  cinemaRooms: CinemaRoom[]
  cinemaSessions?: CinemaSession[]
  cinemaSeats: CinemaSeat[]
  onEnterRoom: (room: CinemaRoom) => void
  onClose: () => void
}

export function CinemaModal({ cinemaRooms, cinemaSessions = [], cinemaSeats, onEnterRoom, onClose }: CinemaModalProps) {
  const getSessionsForRoom = (roomId: string) => {
    return cinemaSessions
      .filter((session) => session.room_id === roomId && session.is_active)
      .sort((a, b) => {
        if (!a.schedule_start) return 1
        if (!b.schedule_start) return -1
        return new Date(a.schedule_start).getTime() - new Date(b.schedule_start).getTime()
      })
  }

  const getCurrentOrNextSession = (roomId: string) => {
    const sessions = getSessionsForRoom(roomId)
    const now = new Date()

    // Find current session (started but not ended)
    const currentSession = sessions.find((session) => {
      if (!session.schedule_start) return false
      const start = new Date(session.schedule_start)
      const end = session.schedule_end ? new Date(session.schedule_end) : new Date(start.getTime() + 3 * 60 * 60 * 1000) // 3h default
      return now >= start && now <= end
    })

    if (currentSession) return { session: currentSession, status: "playing" as const }

    // Find next upcoming session
    const nextSession = sessions.find((session) => {
      if (!session.schedule_start) return false
      return new Date(session.schedule_start) > now
    })

    if (nextSession) return { session: nextSession, status: "upcoming" as const }

    return null
  }

  const formatTimeRemaining = (dateStr: string) => {
    const targetDate = new Date(dateStr)
    const now = new Date()
    const diff = targetDate.getTime() - now.getTime()

    if (diff <= 0) return "Maintenant"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `Dans ${hours}h ${minutes}min`
    }
    return `Dans ${minutes}min`
  }

  const formatSessionTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Paris",
    })
  }

  const formatSessionDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      timeZone: "Europe/Paris",
    })
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl p-6 md:p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-purple-400/30">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Film className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
            Salles de Cinéma
          </h2>
          <button onClick={onClose} className="text-white hover:text-red-400 transition-colors">
            <X className="w-6 h-6 md:w-8 md:h-8" />
          </button>
        </div>

        {cinemaRooms.length === 0 ? (
          <div className="text-center text-white py-12">
            <Film className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Aucune salle de cinéma disponible pour le moment</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {cinemaRooms.map((room) => {
              const currentOccupancy = cinemaSeats.filter((s) => s.cinema_room_id === room.id && s.user_id).length
              const isFull = currentOccupancy >= room.capacity
              const isOpen = room.is_open

              const roomSessions = getSessionsForRoom(room.id)
              const currentOrNext = getCurrentOrNextSession(room.id)

              // Use session data if available, otherwise fall back to room data
              const displayPoster = currentOrNext?.session.movie_poster || room.movie_poster
              const displayTitle = currentOrNext?.session.movie_title || room.movie_title

              return (
                <div
                  key={room.id}
                  className={`bg-white/10 backdrop-blur rounded-xl p-4 border-2 transition-all ${
                    isFull || !isOpen
                      ? "border-gray-500/30 opacity-60"
                      : "border-purple-400/30 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20"
                  }`}
                >
                  <div className="flex items-start gap-4 mb-3">
                    {/* Affiche du film */}
                    {displayPoster ? (
                      <img
                        src={displayPoster || "/placeholder.svg"}
                        alt={displayTitle || "Affiche"}
                        className="w-24 h-36 object-cover rounded-lg border border-purple-400/30 flex-shrink-0"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                    ) : (
                      <div className="w-24 h-36 bg-purple-900/50 rounded-lg border border-purple-400/30 flex items-center justify-center flex-shrink-0">
                        <Film className="w-10 h-10 text-purple-400/50" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-lg font-bold text-white">Salle {room.room_number}</span>
                        {currentOrNext?.status === "playing" && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                            En cours
                          </span>
                        )}
                        {isFull && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            Complète
                          </span>
                        )}
                        {!isOpen && (
                          <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            Fermée
                          </span>
                        )}
                      </div>

                      <h3 className="text-white font-semibold text-base mb-2 truncate">
                        {displayTitle || "Aucun film programmé"}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-purple-300 mb-2">
                        <Sparkles className="w-3 h-3" />
                        <span className="capitalize">{room.theme || "default"}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-white">
                        <Users className="w-4 h-4" />
                        <span>
                          {currentOccupancy}/{room.capacity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {roomSessions.length > 0 && (
                    <div className="mb-4 bg-black/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm text-purple-300 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-semibold">Séances programmées</span>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {roomSessions.slice(0, 5).map((session) => {
                          const isPlaying =
                            currentOrNext?.session.id === session.id && currentOrNext.status === "playing"
                          const isNext = currentOrNext?.session.id === session.id && currentOrNext.status === "upcoming"

                          return (
                            <div
                              key={session.id}
                              className={`flex items-center justify-between text-xs rounded px-2 py-1 ${
                                isPlaying
                                  ? "bg-green-500/20 text-green-300"
                                  : isNext
                                    ? "bg-purple-500/20 text-purple-300"
                                    : "text-gray-300"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{session.movie_title || "Film"}</span>
                              </div>
                              <div className="flex-shrink-0 ml-2">
                                {session.schedule_start && (
                                  <span>
                                    {isPlaying ? (
                                      <span className="text-green-400 font-semibold">En cours</span>
                                    ) : isNext ? (
                                      <span className="text-purple-400 font-semibold">
                                        {formatTimeRemaining(session.schedule_start)}
                                      </span>
                                    ) : (
                                      <>
                                        {formatSessionDate(session.schedule_start)}{" "}
                                        {formatSessionTime(session.schedule_start)}
                                      </>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                        {roomSessions.length > 5 && (
                          <div className="text-xs text-purple-400 text-center">
                            +{roomSessions.length - 5} autres séances
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {roomSessions.length === 0 && (
                    <div className="mb-4 bg-black/20 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400">Aucune séance programmée</p>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (!isFull && isOpen) {
                        onEnterRoom(room)
                      }
                    }}
                    disabled={isFull || !isOpen}
                    className={`w-full py-3 rounded-lg font-bold transition-all ${
                      isFull || !isOpen
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transform hover:scale-105"
                    }`}
                  >
                    {isFull ? "Salle Complète" : !isOpen ? "Salle Fermée" : "Entrer"}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
