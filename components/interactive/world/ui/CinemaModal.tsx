"use client"

import { Film, X, Users, Sparkles } from "lucide-react"

interface CinemaRoom {
  id: string
  room_number: number
  movie_title: string | null
  movie_poster: string | null
  theme: string
  capacity: number
  is_open: boolean
  schedule_start: string | null
  schedule_end: string | null
}

interface CinemaSeat {
  cinema_room_id: string
  user_id: string | null
}

interface CinemaModalProps {
  cinemaRooms: CinemaRoom[]
  cinemaSeats: CinemaSeat[]
  onEnterRoom: (room: CinemaRoom) => void
  onClose: () => void
}

export function CinemaModal({
  cinemaRooms,
  cinemaSeats,
  onEnterRoom,
  onClose,
}: CinemaModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-purple-400/30">
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
          <div className="grid gap-4 md:grid-cols-2">
            {cinemaRooms.map((room) => {
              const currentOccupancy = cinemaSeats.filter((s) => s.cinema_room_id === room.id && s.user_id).length
              const isFull = currentOccupancy >= room.capacity
              const isOpen = room.is_open

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
                    {room.movie_poster ? (
                      <img
                        src={room.movie_poster}
                        alt={room.movie_title || "Affiche"}
                        className="w-20 h-28 object-cover rounded-lg border border-purple-400/30 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-20 h-28 bg-purple-900/50 rounded-lg border border-purple-400/30 flex items-center justify-center flex-shrink-0">
                        <Film className="w-8 h-8 text-purple-400/50" />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-white">Salle {room.room_number}</span>
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
                      <h3 className="text-white font-semibold text-sm mb-1">{room.movie_title || "Aucun film"}</h3>
                      <div className="flex items-center gap-2 text-xs text-purple-300">
                        <Sparkles className="w-3 h-3" />
                        <span>{room.theme}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center gap-2 text-white">
                      <Users className="w-4 h-4" />
                      <span>
                        {currentOccupancy}/{room.capacity}
                      </span>
                    </div>
                    {(room.schedule_start || room.schedule_end) && (
                      <div className="text-purple-300 text-xs">
                        {room.schedule_start && (
                          <>
                            {new Date(room.schedule_start).toLocaleDateString("fr-FR", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}{" "}
                            à{" "}
                            {new Date(room.schedule_start).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </>
                        )}
                        {room.schedule_start && room.schedule_end && " → "}
                        {room.schedule_end && (
                          <>
                            {new Date(room.schedule_end).toLocaleDateString("fr-FR", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}{" "}
                            à{" "}
                            {new Date(room.schedule_end).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </>
                        )}
                      </div>
                    )}
                  </div>

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
