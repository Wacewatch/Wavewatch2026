"use client"

import { useCallback, useEffect, useRef } from "react"
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

// Helper to calculate seat positions
function calculateSeatPositions(seats: any[]): CinemaSeat[] {
  if (!seats || seats.length === 0) return []

  const seatsByRow: Record<number, any[]> = {}
  seats.forEach(seat => {
    if (!seatsByRow[seat.row_number]) seatsByRow[seat.row_number] = []
    seatsByRow[seat.row_number].push(seat)
  })

  const maxSeatsInAnyRow = Math.max(...Object.values(seatsByRow).map(row => row.length))
  const seatSpacing = 1.2
  const rowSpacing = 1.8

  return seats.map((seat) => {
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
  // Refs to avoid stale closures in callbacks
  const mySeatRef = useRef(mySeat)
  const currentCinemaRoomRef = useRef(currentCinemaRoom)

  // Keep refs in sync
  useEffect(() => {
    mySeatRef.current = mySeat
  }, [mySeat])

  useEffect(() => {
    currentCinemaRoomRef.current = currentCinemaRoom
  }, [currentCinemaRoom])

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

    setCinemaSeats(calculateSeatPositions(data))
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

  // Sit in any available seat - fetches fresh data from DB to avoid race conditions
  const handleSitInAnySeat = useCallback(async () => {
    const room = currentCinemaRoomRef.current
    if (!room) return

    // Fetch fresh seat data directly from DB to avoid stale state
    const { data: freshSeats, error: fetchError } = await supabase
      .from("interactive_cinema_seats")
      .select("*")
      .eq("room_id", room.id)
      .is("user_id", null) // Only get unoccupied seats
      .order("row_number", { ascending: true })
      .order("seat_number", { ascending: true })
      .limit(1)

    if (fetchError || !freshSeats || freshSeats.length === 0) {
      console.error("No available seats or error:", fetchError)
      return
    }

    const availableSeat = freshSeats[0]

    // Try to claim the seat atomically - only update if still unoccupied
    const { data: updatedSeat, error } = await supabase
      .from("interactive_cinema_seats")
      .update({
        user_id: userId,
        is_occupied: true,
        occupied_at: new Date().toISOString(),
      })
      .eq("room_id", room.id)
      .eq("row_number", availableSeat.row_number)
      .eq("seat_number", availableSeat.seat_number)
      .is("user_id", null) // Only update if still unoccupied (atomic check)
      .select()
      .single()

    if (error || !updatedSeat) {
      // Seat was taken by someone else, try again
      console.log("Seat was taken, retrying...")
      // Reload seats and let user try again
      loadSeats()
      return
    }

    // Calculate position for the seat
    const allSeats = await supabase
      .from("interactive_cinema_seats")
      .select("*")
      .eq("room_id", room.id)
      .order("row_number", { ascending: true })
      .order("seat_number", { ascending: true })

    const seatsWithPositions = calculateSeatPositions(allSeats.data || [])
    const seatWithPosition = seatsWithPositions.find(
      s => s.row_number === availableSeat.row_number && s.seat_number === availableSeat.seat_number
    )

    if (seatWithPosition) {
      setMySeat(availableSeat.row_number * 100 + availableSeat.seat_number)
      setMyPosition({
        x: seatWithPosition.position_x,
        y: seatWithPosition.position_y,
        z: seatWithPosition.position_z
      })

      await supabase
        .from("interactive_profiles")
        .update({
          position_x: seatWithPosition.position_x,
          position_y: seatWithPosition.position_y,
          position_z: seatWithPosition.position_z,
        })
        .eq("user_id", userId)
    }

    // Refresh seat list for everyone
    loadSeats()
  }, [userId, setMyPosition, setMySeat, loadSeats])

  // Stand up from current seat
  const handleStandUp = useCallback(() => {
    // Use refs to get current values (avoids stale closure)
    const currentMySeat = mySeatRef.current
    const currentRoom = currentCinemaRoomRef.current

    if (currentMySeat === null || !currentRoom) return

    // Use correct Y position for walking (-0.35)
    const standPos = { x: 0, y: -0.35, z: 8 }

    // IMPORTANT: Reset seat state FIRST to allow movement again
    setMySeat(null)
    setMyPosition(standPos)

    // Update database asynchronously (don't block the state change)
    supabase.from("interactive_cinema_seats").update({
      user_id: null,
      is_occupied: false,
      occupied_at: null,
    }).eq("room_id", currentRoom.id).eq("user_id", userId)
      .then(() => {})

    supabase
      .from("interactive_profiles")
      .update({
        position_x: standPos.x,
        position_y: standPos.y,
        position_z: standPos.z,
      })
      .eq("user_id", userId)
      .then(() => {})
  }, [userId, setMyPosition, setMySeat])

  return {
    loadSeats,
    handleSitInAnySeat,
    handleSitInSeat: handleStandUp, // Keep old name for compatibility
  }
}
