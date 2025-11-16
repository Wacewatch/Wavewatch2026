"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Text } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Armchair } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface CinemaRoom {
  id: string
  room_number: number
  name: string
  capacity: number
  theme: string
  movie_title: string | null
  is_open: boolean
}

interface Seat {
  id: string
  row_number: number
  seat_number: number
  user_id: string | null
  is_occupied: boolean
}

interface CinemaInteriorProps {
  userId: string
  username: string
  onExit: () => void
}

export function CinemaInterior({ userId, username, onExit }: CinemaInteriorProps) {
  const [rooms, setRooms] = useState<CinemaRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<CinemaRoom | null>(null)
  const [seats, setSeats] = useState<Seat[]>([])
  const [mySeaId, setMySeatId] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadRooms()
  }, [])

  useEffect(() => {
    if (selectedRoom) {
      loadSeats(selectedRoom.id)
    }
  }, [selectedRoom])

  const loadRooms = async () => {
    const { data, error } = await supabase
      .from("interactive_cinema_rooms")
      .select("*")
      .eq("is_open", true)
      .order("room_number", { ascending: true })

    if (error) {
      console.error("Error loading rooms:", error)
      return
    }

    setRooms(data || [])
  }

  const loadSeats = async (roomId: string) => {
    const { data, error } = await supabase
      .from("interactive_cinema_seats")
      .select("*")
      .eq("room_id", roomId)
      .order("row_number", { ascending: true })
      .order("seat_number", { ascending: true })

    if (error) {
      console.error("Error loading seats:", error)
      return
    }

    setSeats(data || [])

    // Find user's seat
    const mySeat = data?.find((s) => s.user_id === userId)
    setMySeatId(mySeat?.id || null)
  }

  const handleTakeSeat = async (seatId: string) => {
    // Release previous seat if any
    if (mySeatId) {
      await supabase
        .from("interactive_cinema_seats")
        .update({ user_id: null, is_occupied: false, occupied_at: null })
        .eq("id", mySeatId)
    }

    // Take new seat
    const { error } = await supabase
      .from("interactive_cinema_seats")
      .update({ user_id: userId, is_occupied: true, occupied_at: new Date().toISOString() })
      .eq("id", seatId)
      .is("user_id", null)

    if (error) {
      toast({
        title: "Place occupée",
        description: "Cette place est déjà prise",
        variant: "destructive",
      })
      return
    }

    setMySeatId(seatId)
    toast({
      title: "Place réservée",
      description: "Vous avez pris place avec succès",
    })

    if (selectedRoom) {
      loadSeats(selectedRoom.id)
    }
  }

  const handleReleaseSeat = async () => {
    if (!mySeatId) return

    const { error } = await supabase
      .from("interactive_cinema_seats")
      .update({ user_id: null, is_occupied: false, occupied_at: null })
      .eq("id", mySeatId)

    if (error) {
      console.error("Error releasing seat:", error)
      return
    }

    setMySeatId(null)
    toast({
      title: "Place libérée",
      description: "Vous avez quitté votre place",
    })

    if (selectedRoom) {
      loadSeats(selectedRoom.id)
    }
  }

  if (!selectedRoom) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black text-white p-8">
        <Button variant="outline" onClick={onExit} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la ville
        </Button>

        <h1 className="text-4xl font-bold mb-8">Salles de Cinéma</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <Card key={room.id} className="p-6 bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-700 transition">
              <div onClick={() => setSelectedRoom(room)}>
                <h3 className="text-2xl font-bold mb-2">Salle {room.room_number}</h3>
                <p className="text-gray-400 mb-4">{room.name}</p>
                {room.movie_title && (
                  <div className="bg-red-600 px-3 py-1 rounded text-sm inline-block mb-2">
                    En cours: {room.movie_title}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Armchair className="w-4 h-4" />
                  <span>{room.capacity} places</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const rowsMap = new Map<number, Seat[]>()
  seats.forEach((seat) => {
    if (!rowsMap.has(seat.row_number)) {
      rowsMap.set(seat.row_number, [])
    }
    rowsMap.get(seat.row_number)!.push(seat)
  })

  const rows = Array.from(rowsMap.entries()).sort((a, b) => a[0] - b[0])

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <Button variant="outline" onClick={() => setSelectedRoom(null)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au hall
        </Button>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Salle {selectedRoom.room_number} - {selectedRoom.name}</h2>
          {selectedRoom.movie_title && <p className="text-gray-400">{selectedRoom.movie_title}</p>}
        </div>
        {mySeatId && (
          <Button variant="outline" onClick={handleReleaseSeat}>
            Quitter ma place
          </Button>
        )}
      </div>

      <div className="p-8 overflow-auto h-full">
        {/* Screen */}
        <div className="bg-gradient-to-b from-gray-700 to-gray-800 h-32 mb-8 flex items-center justify-center rounded-lg">
          <span className="text-2xl font-bold text-gray-400">ÉCRAN</span>
        </div>

        {/* Seating */}
        <div className="space-y-4">
          {rows.map(([rowNumber, rowSeats]) => (
            <div key={rowNumber} className="flex items-center gap-2 justify-center">
              <span className="w-8 text-center text-gray-500 font-mono">R{rowNumber}</span>
              <div className="flex gap-2">
                {rowSeats.map((seat) => {
                  const isMySeat = seat.id === mySeatId
                  const isOccupied = seat.is_occupied && !isMySeat

                  return (
                    <button
                      key={seat.id}
                      onClick={() => !isOccupied && handleTakeSeat(seat.id)}
                      disabled={isOccupied}
                      className={`
                        w-10 h-10 rounded flex items-center justify-center transition
                        ${isMySeat ? "bg-blue-500 hover:bg-blue-600" : ""}
                        ${isOccupied ? "bg-red-500 cursor-not-allowed" : ""}
                        ${!isOccupied && !isMySeat ? "bg-green-500 hover:bg-green-600" : ""}
                      `}
                      title={`Siège ${seat.seat_number}`}
                    >
                      <Armchair className="w-5 h-5" />
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded"></div>
            <span className="text-sm">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded"></div>
            <span className="text-sm">Votre place</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 rounded"></div>
            <span className="text-sm">Occupée</span>
          </div>
        </div>
      </div>
    </div>
  )
}
