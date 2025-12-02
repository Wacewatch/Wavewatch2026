"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Plus, Save, Film, ImageIcon } from 'lucide-react'

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
}

export function CinemaRoomsPanel({ rooms }: { rooms: any[] }) {
  const [cinemaRooms, setCinemaRooms] = useState<CinemaRoom[]>(rooms)
  const [isSaving, setIsSaving] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const handleCreateRoom = async () => {
    const newRoomNumber = cinemaRooms.length > 0
      ? Math.max(...cinemaRooms.map(r => r.room_number)) + 1
      : 1

    const { data, error } = await supabase
      .from("interactive_cinema_rooms")
      .insert({
        room_number: newRoomNumber,
        name: `Salle ${newRoomNumber}`,
        capacity: 30,
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

    setCinemaRooms([...cinemaRooms, data])
    toast({
      title: "Salle créée",
      description: `La salle ${data.name} a été créée avec succès`,
    })
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
    } else {
      toast({
        title: "Salle mise à jour",
        description: `La salle ${room.name} a été mise à jour avec succès`,
      })
    }

    setIsSaving(null)
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
                    src={room.movie_poster}
                    alt={room.movie_title || "Affiche"}
                    className="w-24 h-36 object-cover rounded-lg border border-gray-600"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
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
                    setCinemaRooms(
                      cinemaRooms.map((r) => (r.id === room.id ? { ...r, name: e.target.value } : r)),
                    )
                  }}
                  className="bg-gray-600 border-gray-500 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Capacité</label>
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
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Thème</label>
                <select
                  value={room.theme}
                  onChange={(e) => {
                    setCinemaRooms(
                      cinemaRooms.map((r) => (r.id === room.id ? { ...r, theme: e.target.value } : r)),
                    )
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
                <label className="text-sm text-gray-300">Titre du Film</label>
                <Input
                  value={room.movie_title || ""}
                  onChange={(e) => {
                    setCinemaRooms(
                      cinemaRooms.map((r) =>
                        r.id === room.id ? { ...r, movie_title: e.target.value } : r,
                      ),
                    )
                  }}
                  className="bg-gray-600 border-gray-500 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">ID TMDB du Film</label>
                <Input
                  type="number"
                  value={room.movie_tmdb_id || ""}
                  onChange={(e) => {
                    setCinemaRooms(
                      cinemaRooms.map((r) =>
                        r.id === room.id
                          ? { ...r, movie_tmdb_id: Number.parseInt(e.target.value) || null }
                          : r,
                      ),
                    )
                  }}
                  className="bg-gray-600 border-gray-500 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">URL Affiche</label>
                <Input
                  value={room.movie_poster || ""}
                  onChange={(e) => {
                    setCinemaRooms(
                      cinemaRooms.map((r) =>
                        r.id === room.id ? { ...r, movie_poster: e.target.value } : r,
                      ),
                    )
                  }}
                  className="bg-gray-600 border-gray-500 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">URL Embed (Iframe)</label>
                <Input
                  value={room.embed_url || ""}
                  onChange={(e) => {
                    setCinemaRooms(
                      cinemaRooms.map((r) => (r.id === room.id ? { ...r, embed_url: e.target.value } : r)),
                    )
                  }}
                  placeholder="https://www.youtube.com/embed/..."
                  className="bg-gray-600 border-gray-500 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Heure de Début</label>
                <Input
                  type="datetime-local"
                  value={
                    room.schedule_start ? new Date(room.schedule_start).toISOString().slice(0, 16) : ""
                  }
                  onChange={(e) => {
                    setCinemaRooms(
                      cinemaRooms.map((r) =>
                        r.id === room.id ? { ...r, schedule_start: e.target.value } : r,
                      ),
                    )
                  }}
                  className="bg-gray-600 border-gray-500 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Heure de Fin</label>
                <Input
                  type="datetime-local"
                  value={room.schedule_end ? new Date(room.schedule_end).toISOString().slice(0, 16) : ""}
                  onChange={(e) => {
                    setCinemaRooms(
                      cinemaRooms.map((r) =>
                        r.id === room.id ? { ...r, schedule_end: e.target.value } : r,
                      ),
                    )
                  }}
                  className="bg-gray-600 border-gray-500 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Niveau d'Accès</label>
                <select
                  value={room.access_level}
                  onChange={(e) => {
                    setCinemaRooms(
                      cinemaRooms.map((r) =>
                        r.id === room.id ? { ...r, access_level: e.target.value } : r,
                      ),
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
                        cinemaRooms.map((r) =>
                          r.id === room.id ? { ...r, is_open: e.target.checked } : r,
                        ),
                      )
                    }}
                  />
                  Salle Ouverte
                </label>
              </div>

              <div className="lg:col-span-3 flex justify-end gap-2">
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
