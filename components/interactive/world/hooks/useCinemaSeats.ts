"use client"

import { useCallback, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

interface Position {
  x: number
  y: number
  z: number
}

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
  is_occupied?: boolean
}

interface UseCinemaSeatsProps {
  userId: string
  currentCinemaRoom: CinemaRoom | null
  mySeat: number | null
  cinemaSeats: CinemaSeat[]
  setMyPosition: (pos: Position) => void
  setMySeat: (seat: number | null) => void
  setCinemaSeats: (seats: CinemaSeat[]) => void
}

export function useCinemaSeats({
  userId,
  currentCinemaRoom,
  mySeat,
  cinemaSeats,
  setMyPosition,
  setMySeat,
  setCinemaSeats,
}: UseCinemaSeatsProps) {
  // Load seats for current cinema room
  const loadSeats = useCallback(async () => {
    if (!currentCinemaRoom) return
    const { data, error } = await supabase
      .from("interactive_cinema_seats")
      .select("*")
      .eq("room_id", currentCinemaRoom.id)
      .order("row_number", { ascending: true })
      .order("seat_number", { ascending: true })

    if (error) {
      console.error("Error loading seats:", error)
      return
    }

    if (!data || data.length === 0) {
      setCinemaSeats([])
      return
    }

    // Group seats by row to find how many seats per row
    const seatsByRow: Record<number, any[]> = {}
    data.forEach(seat => {
      if (!seatsByRow[seat.row_number]) seatsByRow[seat.row_number] = []
      seatsByRow[seat.row_number].push(seat)
    })

    const maxSeatsInAnyRow = Math.max(...Object.values(seatsByRow).map(row => row.length))
    const seatSpacing = 1.2
    const rowSpacing = 1.8

    // Add display positions to database seats
    const seatsWithPositions = data.map((seat) => {
      const seatsInThisRow = seatsByRow[seat.row_number].length
      const seatIndexInRow = seatsByRow[seat.row_number].findIndex(s => s.id === seat.id)
      const rowOffset = (maxSeatsInAnyRow - seatsInThisRow) / 2

      return {
        ...seat,
        position_x: (seatIndexInRow + rowOffset - maxSeatsInAnyRow / 2 + 0.5) * seatSpacing,
        position_y: 0.4,
        position_z: (seat.row_number - 1) * rowSpacing + 2,
        is_occupied: !!seat.user_id,
      }
    })
    setCinemaSeats(seatsWithPositions)
  }, [currentCinemaRoom, setCinemaSeats])

  // Subscribe to seat changes
  useEffect(() => {
    if (!currentCinemaRoom) return

    loadSeats()

    const channel = supabase
      .channel(`cinema_seats_${currentCinemaRoom.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "interactive_cinema_seats",
          filter: `room_id=eq.${currentCinemaRoom.id}`,
        },
        loadSeats,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentCinemaRoom, loadSeats])

  // Release seat on page exit
  useEffect(() => {
    const releaseSeatOnExit = async () => {
      if (mySeat !== null && currentCinemaRoom && userId) {
        const payload = JSON.stringify({
          room_id: currentCinemaRoom.id,
          user_id: userId,
        })
        navigator.sendBeacon?.('/api/cinema/release-seat', payload)
      }
    }

    window.addEventListener('beforeunload', releaseSeatOnExit)
    window.addEventListener('pagehide', releaseSeatOnExit)

    return () => {
      window.removeEventListener('beforeunload', releaseSeatOnExit)
      window.removeEventListener('pagehide', releaseSeatOnExit)
    }
  }, [mySeat, currentCinemaRoom, userId])

  // Cleanup abandoned seats (occupied for more than 30 min)
  useEffect(() => {
    if (!currentCinemaRoom) return

    const cleanupAbandonedSeats = async () => {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      await supabase
        .from('interactive_cinema_seats')
        .update({ is_occupied: false, user_id: null, occupied_at: null })
        .eq('room_id', currentCinemaRoom.id)
        .eq('is_occupied', true)
        .lt('occupied_at', thirtyMinutesAgo)
    }

    cleanupAbandonedSeats()
  }, [currentCinemaRoom])

  // Sit in any available seat
  const handleSitInAnySeat = useCallback(async () => {
    if (!currentCinemaRoom) return

    // Find first available seat
    const availableSeat = cinemaSeats.find((s) => !s.is_occupied)

    if (!availableSeat) {
      return
    }

    const { error } = await supabase.from("interactive_cinema_seats").update({
      user_id: userId,
      is_occupied: true,
      occupied_at: new Date().toISOString(),
    }).eq("room_id", currentCinemaRoom.id).eq("row_number", availableSeat.row_number).eq("seat_number", availableSeat.seat_number)

    if (!error) {
      setMySeat(availableSeat.row_number * 100 + availableSeat.seat_number)
      setMyPosition({ x: availableSeat.position_x, y: availableSeat.position_y, z: availableSeat.position_z })

      await supabase
        .from("interactive_profiles")
        .update({
          position_x: availableSeat.position_x,
          position_y: availableSeat.position_y,
          position_z: availableSeat.position_z,
        })
        .eq("user_id", userId)
    } else {
      console.error("Error sitting:", error)
    }
  }, [userId, currentCinemaRoom, cinemaSeats, setMyPosition, setMySeat])

  // Stand up from current seat
  const handleSitInSeat = useCallback(async (seatId: number) => {
    if (mySeat !== null && currentCinemaRoom) {
      await supabase.from("interactive_cinema_seats").update({
        user_id: null,
        is_occupied: false,
        occupied_at: null,
      }).eq("room_id", currentCinemaRoom.id).eq("user_id", userId)

      setMySeat(null)
      setMyPosition({ x: 0, y: 0.5, z: 0 })
    }
  }, [userId, mySeat, currentCinemaRoom, setMyPosition, setMySeat])

  return {
    loadSeats,
    handleSitInAnySeat,
    handleSitInSeat,
  }
}
