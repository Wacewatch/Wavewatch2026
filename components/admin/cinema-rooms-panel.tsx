"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Plus, Save, Film, ImageIcon, Trash2, Calendar, ChevronDown, ChevronUp } from "lucide-react"

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
  name: string
  capacity: number
  theme: string
  movie_title: string
  movie_tmdb_id: number | null
  movie_poster: string | null
  embed_url: string | null
  schedule_start: string | null
  schedule_end: string | null
  access_level: string
  is_open: boolean
  sessions?: CinemaSession[]
}

async function generateSeatsForRoom(supabase: any, roomId: string, capacity: number) {
  // Calculate rows and seats per row based on capacity
  const seatsPerRow = Math.min(10, Math.ceil(Math.sqrt(capacity)))
  const totalRows = Math.ceil(capacity / seatsPerRow)

  const seats = []
  let seatCount = 0

  for (let row = 1; row <= totalRows && seatCount < capacity; row++) {
    const seatsInThisRow = Math.min(seatsPerRow, capacity - seatCount)
    for (let seat = 1; seat <= seatsInThisRow; seat++) {
      seats.push({
        room_id: roomId,
        row_number: row,
        seat_number: seat,
        is_occupied: false,
        user_id: null,
      })
      seatCount++
    }
  }

  if (seats.length > 0) {
    const { error } = await supabase.from("interactive_cinema_seats").insert(seats)

    if (error) {
      console.error("Error creating seats:", error)
      return false
    }
  }

  return true
}

async function updateSeatsForRoom(supabase: any, roomId: string, newCapacity: number) {
  // First, delete all existing seats for this room
  await supabase.from("interactive_cinema_seats").delete().eq("room_id", roomId)

  // Then regenerate seats with new capacity
  return await generateSeatsForRoom(supabase, roomId, newCapacity)
}

export function CinemaRoomsPanel({ rooms, sessions: initialSessions }: { rooms: any[]; sessions?: any[] }) {
  const [cinemaRooms, setCinemaRooms] = useState<CinemaRoom[]>(
    rooms.map((room) => ({
      ...room,
      sessions: initialSessions?.filter((s) => s.room_id === room.id) || [],
    })),
  )
  const [isSaving, setIsSaving] = useState<string | null>(null)
  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({})
  const { toast } = useToast()
  const supabase = createClient()

  const [originalCapacities, setOriginalCapacities] = useState<Record<string, number>>(
    Object.fromEntries(rooms.map((r) => [r.id, r.capacity])),
  )

  const toggleRoomExpanded = (roomId: string) => {
    setExpandedRooms((prev) => ({ ...prev, [roomId]: !prev[roomId] }))
  }

  const handleCreateRoom = async () => {
    const newRoomNumber = cinemaRooms.length > 0 ? Math.max(...cinemaRooms.map((r) => r.room_number)) + 1 : 1

    const defaultCapacity = 30

    const { data, error } = await supabase
      .from("interactive_cinema_rooms")
      .insert({
        room_number: newRoomNumber,
        name: `Salle ${newRoomNumber}`,
        capacity: defaultCapacity,
        theme: "default",
        movie_title: "",
        access_level: "public",
        is_open: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating room:", error)
      toast({
        title: "Erreur",
        description: "Impossible de créer la salle",
        variant: "destructive",
      })
      return
    }

    // Generate seats for the new room
    const seatsCreated = await generateSeatsForRoom(supabase, data.id, defaultCapacity)

    if (!seatsCreated) {
      toast({
        title: "Attention",
        description: "La salle a été créée mais les sièges n'ont pas pu être générés",
        variant: "destructive",
      })
    }

    setCinemaRooms([...cinemaRooms, { ...data, sessions: [] }])
    setOriginalCapacities((prev) => ({ ...prev, [data.id]: defaultCapacity }))
    toast({
      title: "Salle créée",
      description: `La salle ${data.name} a été créée avec ${defaultCapacity} sièges`,
    })
  }

  const handleCreateSession = async (roomId: string) => {
    const room = cinemaRooms.find((r) => r.id === roomId)
    if (!room) return

    // Default to 2 hours from now
    const now = new Date()
    const scheduleStart = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    const scheduleEnd = new Date(scheduleStart.getTime() + 2 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from("interactive_cinema_sessions")
      .insert({
        room_id: roomId,
        movie_title: room.movie_title || "Nouveau Film",
        movie_tmdb_id: room.movie_tmdb_id,
        movie_poster: room.movie_poster,
        embed_url: room.embed_url,
        schedule_start: scheduleStart.toISOString(),
        schedule_end: scheduleEnd.toISOString(),
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating session:", error)
      toast({
        title: "Erreur",
        description: "Impossible de créer la séance",
        variant: "destructive",
      })
      return
    }

    setCinemaRooms(cinemaRooms.map((r) => (r.id === roomId ? { ...r, sessions: [...(r.sessions || []), data] } : r)))
    setExpandedRooms((prev) => ({ ...prev, [roomId]: true }))
    toast({
      title: "Séance créée",
      description: "La nouvelle séance a été créée",
    })
  }

  const handleUpdateSession = async (session: CinemaSession) => {
    setIsSaving(session.id)

    const { error } = await supabase
      .from("interactive_cinema_sessions")
      .update({
        movie_title: session.movie_title,
        movie_tmdb_id: session.movie_tmdb_id,
        movie_poster: session.movie_poster,
        embed_url: session.embed_url,
        schedule_start: new Date(session.schedule_start).toISOString(),
        schedule_end: new Date(session.schedule_end).toISOString(),
        is_active: session.is_active,
      })
      .eq("id", session.id)

    if (error) {
      console.error("Error updating session:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la séance",
        variant: "destructive",
      })
      setIsSaving(null)
      return
    }

    toast({
      title: "Séance mise à jour",
      description: "La séance a été mise à jour avec succès",
    })
    setIsSaving(null)
  }

  const handleDeleteSession = async (sessionId: string, roomId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette séance ?")) {
      return
    }

    const { error } = await supabase.from("interactive_cinema_sessions").delete().eq("id", sessionId)

    if (error) {
      console.error("Error deleting session:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la séance",
        variant: "destructive",
      })
      return
    }

    setCinemaRooms(
      cinemaRooms.map((r) =>
        r.id === roomId ? { ...r, sessions: (r.sessions || []).filter((s) => s.id !== sessionId) } : r,
      ),
    )
    toast({
      title: "Séance supprimée",
      description: "La séance a été supprimée",
    })
  }

  const updateSessionInState = (roomId: string, sessionId: string, updates: Partial<CinemaSession>) => {
    setCinemaRooms(
      cinemaRooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              sessions: (r.sessions || []).map((s) => (s.id === sessionId ? { ...s, ...updates } : s)),
            }
          : r,
      ),
    )
  }

  const handleUpdateRoom = async (room: CinemaRoom) => {
    setIsSaving(room.id)

    const { error } = await supabase
      .from("interactive_cinema_rooms")
      .update({
        room_number: room.room_number,
        name: room.name,
        capacity: room.capacity,
        theme: room.theme,
        movie_title: room.movie_title,
        movie_tmdb_id: room.movie_tmdb_id,
        movie_poster: room.movie_poster,
        embed_url: room.embed_url,
        schedule_start: room.schedule_start ? new Date(room.schedule_start).toISOString() : null,
        schedule_end: room.schedule_end ? new Date(room.schedule_end).toISOString() : null,
        access_level: room.access_level,
        is_open: room.is_open,
      })
      .eq("id", room.id)

    if (error) {
      console.error("Error updating room:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la salle",
        variant: "destructive",
      })
      setIsSaving(null)
      return
    }

    if (originalCapacities[room.id] !== room.capacity) {
      const seatsUpdated = await updateSeatsForRoom(supabase, room.id, room.capacity)
      if (seatsUpdated) {
        setOriginalCapacities((prev) => ({ ...prev, [room.id]: room.capacity }))
        toast({
          title: "Salle mise à jour",
          description: `La salle ${room.name} a été mise à jour avec ${room.capacity} sièges`,
        })
      } else {
        toast({
          title: "Attention",
          description: "La salle a été mise à jour mais les sièges n'ont pas pu être régénérés",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Salle mise à jour",
        description: `La salle ${room.name} a été mise à jour avec succès`,
      })
    }

    setIsSaving(null)
  }

  const handleDeleteRoom = async (roomId: string, roomName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la salle "${roomName}" ?`)) {
      return
    }

    // Delete sessions first
    await supabase.from("interactive_cinema_sessions").delete().eq("room_id", roomId)

    // Delete seats
    await supabase.from("interactive_cinema_seats").delete().eq("room_id", roomId)

    // Then delete room
    const { error } = await supabase.from("interactive_cinema_rooms").delete().eq("id", roomId)

    if (error) {
      console.error("Error deleting room:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la salle",
        variant: "destructive",
      })
      return
    }

    setCinemaRooms(cinemaRooms.filter((r) => r.id !== roomId))
    toast({
      title: "Salle supprimée",
      description: `La salle ${roomName} a été supprimée`,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Film className="w-5 h-5" />
          Gestion des Salles de Cinéma
        </h3>
        <Button onClick={handleCreateRoom} size="sm" className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Créer une Salle
        </Button>
      </div>

      <div className="space-y-4">
        {cinemaRooms.map((room) => (
          <div key={room.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
            <div className="flex gap-4">
              {/* Aperçu de l'affiche */}
              <div className="flex-shrink-0">
                {room.movie_poster ? (
                  <img
                    src={room.movie_poster || "/placeholder.svg"}
                    alt={room.movie_title || "Affiche"}
                    className="w-24 h-36 object-cover rounded-lg border border-gray-600"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                ) : (
                  <div className="w-24 h-36 bg-gray-600 rounded-lg border border-gray-500 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Formulaire */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Numéro de Salle</label>
                  <Input
                    type="number"
                    value={room.room_number}
                    onChange={(e) => {
                      setCinemaRooms(
                        cinemaRooms.map((r) =>
                          r.id === room.id ? { ...r, room_number: Number.parseInt(e.target.value) } : r,
                        ),
                      )
                    }}
                    className="bg-gray-600 border-gray-500 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Nom de la Salle</label>
                  <Input
                    value={room.name}
                    onChange={(e) => {
                      setCinemaRooms(cinemaRooms.map((r) => (r.id === room.id ? { ...r, name: e.target.value } : r)))
                    }}
                    className="bg-gray-600 border-gray-500 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Capacité (sièges)</label>
                  <Input
                    type="number"
                    value={room.capacity}
                    onChange={(e) => {
                      setCinemaRooms(
                        cinemaRooms.map((r) =>
                          r.id === room.id ? { ...r, capacity: Number.parseInt(e.target.value) } : r,
                        ),
                      )
                    }}
                    className="bg-gray-600 border-gray-500 text-white"
                  />
                  {originalCapacities[room.id] !== room.capacity && (
                    <p className="text-xs text-yellow-400">Les sièges seront régénérés à la sauvegarde</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Thème</label>
                  <select
                    value={room.theme}
                    onChange={(e) => {
                      setCinemaRooms(cinemaRooms.map((r) => (r.id === room.id ? { ...r, theme: e.target.value } : r)))
                    }}
                    className="w-full px-3 py-2 bg-gray-600 border-gray-500 rounded-md text-white"
                  >
                    <option value="default">Par défaut</option>
                    <option value="luxury">Luxe</option>
                    <option value="retro">Rétro</option>
                    <option value="modern">Moderne</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Niveau d'Accès</label>
                  <select
                    value={room.access_level}
                    onChange={(e) => {
                      setCinemaRooms(
                        cinemaRooms.map((r) => (r.id === room.id ? { ...r, access_level: e.target.value } : r)),
                      )
                    }}
                    className="w-full px-3 py-2 bg-gray-600 border-gray-500 rounded-md text-white"
                  >
                    <option value="public">Public</option>
                    <option value="vip">VIP</option>
                    <option value="vip_plus">VIP+</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-2 flex items-center">
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={room.is_open}
                      onChange={(e) => {
                        setCinemaRooms(
                          cinemaRooms.map((r) => (r.id === room.id ? { ...r, is_open: e.target.checked } : r)),
                        )
                      }}
                    />
                    Salle Ouverte
                  </label>
                </div>

                <div className="lg:col-span-3 flex justify-end gap-2">
                  <Button
                    onClick={() => handleDeleteRoom(room.id, room.name)}
                    size="sm"
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                  <Button
                    onClick={() => handleUpdateRoom(room)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isSaving === room.id}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving === room.id ? "Sauvegarde..." : "Sauvegarder"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-gray-600 pt-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => toggleRoomExpanded(room.id)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white"
                >
                  <Calendar className="w-4 h-4" />
                  Séances programmées ({room.sessions?.length || 0})
                  {expandedRooms[room.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <Button
                  onClick={() => handleCreateSession(room.id)}
                  size="sm"
                  variant="outline"
                  className="border-gray-500 text-gray-300 hover:text-white hover:bg-gray-600"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter une Séance
                </Button>
              </div>

              {expandedRooms[room.id] && (
                <div className="space-y-3">
                  {(room.sessions || []).length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      Aucune séance programmée. Cliquez sur "Ajouter une Séance" pour en créer une.
                    </p>
                  ) : (
                    (room.sessions || []).map((session) => (
                      <div key={session.id} className="p-3 bg-gray-800 rounded-lg border border-gray-600">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs text-gray-400">Titre du Film</label>
                            <Input
                              value={session.movie_title || ""}
                              onChange={(e) =>
                                updateSessionInState(room.id, session.id, { movie_title: e.target.value })
                              }
                              className="bg-gray-700 border-gray-600 text-white text-sm h-8"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs text-gray-400">URL Video</label>
                            <Input
                              value={session.embed_url || ""}
                              onChange={(e) => updateSessionInState(room.id, session.id, { embed_url: e.target.value })}
                              placeholder="MP4, M3U8 ou Embed"
                              className="bg-gray-700 border-gray-600 text-white text-sm h-8"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs text-gray-400">Début</label>
                            <Input
                              type="datetime-local"
                              value={
                                session.schedule_start
                                  ? new Date(session.schedule_start).toISOString().slice(0, 16)
                                  : ""
                              }
                              onChange={(e) =>
                                updateSessionInState(room.id, session.id, { schedule_start: e.target.value })
                              }
                              className="bg-gray-700 border-gray-600 text-white text-sm h-8"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs text-gray-400">Fin</label>
                            <Input
                              type="datetime-local"
                              value={
                                session.schedule_end ? new Date(session.schedule_end).toISOString().slice(0, 16) : ""
                              }
                              onChange={(e) =>
                                updateSessionInState(room.id, session.id, { schedule_end: e.target.value })
                              }
                              className="bg-gray-700 border-gray-600 text-white text-sm h-8"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs text-gray-400">URL Affiche</label>
                            <Input
                              value={session.movie_poster || ""}
                              onChange={(e) =>
                                updateSessionInState(room.id, session.id, { movie_poster: e.target.value })
                              }
                              className="bg-gray-700 border-gray-600 text-white text-sm h-8"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs text-gray-400">ID TMDB</label>
                            <Input
                              type="number"
                              value={session.movie_tmdb_id || ""}
                              onChange={(e) =>
                                updateSessionInState(room.id, session.id, {
                                  movie_tmdb_id: Number.parseInt(e.target.value) || null,
                                })
                              }
                              className="bg-gray-700 border-gray-600 text-white text-sm h-8"
                            />
                          </div>

                          <div className="flex items-end gap-2">
                            <label className="flex items-center gap-2 text-xs text-gray-400">
                              <input
                                type="checkbox"
                                className="rounded"
                                checked={session.is_active}
                                onChange={(e) =>
                                  updateSessionInState(room.id, session.id, { is_active: e.target.checked })
                                }
                              />
                              Active
                            </label>
                          </div>

                          <div className="flex items-end justify-end gap-2">
                            <Button
                              onClick={() => handleDeleteSession(session.id, room.id)}
                              size="sm"
                              variant="ghost"
                              className="h-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => handleUpdateSession(session)}
                              size="sm"
                              className="h-8 bg-blue-600 hover:bg-blue-700"
                              disabled={isSaving === session.id}
                            >
                              <Save className="w-3 h-3 mr-1" />
                              {isSaving === session.id ? "..." : "Sauver"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {cinemaRooms.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            Aucune salle de cinéma. Cliquez sur "Créer une Salle" pour commencer.
          </div>
        )}
      </div>
    </div>
  )
}
