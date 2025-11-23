"use client"

import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Sky, Html, PerspectiveCamera } from "@react-three/drei"
import { useEffect, useRef, useState, useCallback, useMemo, useReducer } from "react"
import { createClient } from "@/lib/supabase/client"
import dynamic from 'next/dynamic'
import React from 'react'

const RealisticAvatar = dynamic(
  () => import("./realistic-avatar"),
  { ssr: false }
)

import {
  Minimize,
  MessageSquare,
  Send,
  Settings,
  Crown,
  Shield,
  X,
  LogOut,
  User,
  Users,
  Palette,
  Menu,
  Eye,
  Play,
  Smile,
  EyeOff,
  ArrowUp,
  Maximize2,
  MessageCircle,
  Star,
  Map,
  Building2,
  Gamepad2,
  Trophy,
  Film,
  Sparkles,
} from "lucide-react"
import type * as THREE from "three"
import { useRouter } from "next/navigation"

const supabase = createClient()

interface WorldProps {
  userId: string
  userProfile: any
}

interface InteractiveWorldProps {
  userId: string
  userProfile: any
}

// Room state management avec reducer
type RoomState = {
  type: 'world' | 'cinema' | 'arcade' | 'stadium'
  currentRoom: string | null
  cinemaRoom?: any
  savedPosition: { x: number; y: number; z: number }
}

type RoomAction = 
  | { type: 'ENTER_CINEMA'; room: any; currentPosition: { x: number; y: number; z: number } }
  | { type: 'ENTER_ARCADE'; currentPosition: { x: number; y: number; z: number } }
  | { type: 'ENTER_STADIUM'; currentPosition: { x: number; y: number; z: number } }
  | { type: 'LEAVE_ROOM'; savedPosition: { x: number; y: number; z: number } }
  | { type: 'INIT'; currentRoom: string | null; position: { x: number; y: number; z: number } }

const roomReducer = (state: RoomState, action: RoomAction): RoomState => {
  switch (action.type) {
    case 'INIT':
      if (action.currentRoom === 'arcade') {
        return { ...state, type: 'arcade', currentRoom: action.currentRoom }
      } else if (action.currentRoom === 'stadium') {
        return { ...state, type: 'stadium', currentRoom: action.currentRoom }
      } else if (action.currentRoom?.startsWith('cinema_')) {
        return { ...state, type: 'cinema', currentRoom: action.currentRoom }
      }
      return { ...state, type: 'world', currentRoom: null, savedPosition: action.position }
    case 'ENTER_CINEMA':
      return {
        type: 'cinema',
        currentRoom: `cinema_${action.room.id}`,
        cinemaRoom: action.room,
        savedPosition: action.currentPosition
      }
    case 'ENTER_ARCADE':
      return {
        type: 'arcade',
        currentRoom: 'arcade',
        savedPosition: action.currentPosition
      }
    case 'ENTER_STADIUM':
      return {
        type: 'stadium',
        currentRoom: 'stadium',
        savedPosition: action.currentPosition
      }
    case 'LEAVE_ROOM':
      return {
        type: 'world',
        currentRoom: null,
        savedPosition: action.savedPosition
      }
    default:
      return state
  }
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Smooth rotation helper
function smoothRotation(current: number, target: number, factor: number = 0.3): number {
  const diff = target - current
  const normalizedDiff = Math.atan2(Math.sin(diff), Math.cos(diff))
  return current + normalizedDiff * factor
}

// Improved collision detection
function createCollisionZones(roomState: RoomState) {
  const zones = []
  
  if (roomState.type === 'world') {
    // Main world collisions
    zones.push(
      { x: 15, z: 0, width: 9, depth: 9 },
      { x: -15, z: -15, width: 5, depth: 5 },
      { x: -15, z: 5, width: 5, depth: 4 },
      { x: -15, z: -8, width: 4, depth: 4 },
      { x: -25, z: 0, width: 8, depth: 8 },
      { x: 25, z: -10, width: 10, depth: 10 },
      { x: -20, z: 15, width: 9, depth: 9 },
      { x: 20, z: 10, width: 7, depth: 7 },
      { x: 0, z: 25, width: 12, depth: 12 },
      // Trees
      { x: -15, z: -15, width: 2, depth: 2 },
      { x: -8, z: -18, width: 2, depth: 2 },
      { x: 8, z: -18, width: 2, depth: 2 },
      { x: 15, z: -15, width: 2, depth: 2 },
      { x: -18, z: 10, width: 2, depth: 2 },
      { x: 18, z: 10, width: 2, depth: 2 },
      { x: -10, z: 15, width: 2, depth: 2 },
      { x: 10, z: 15, width: 2, depth: 2 },
      // Lampposts
      { x: -20, z: -10, width: 1, depth: 1 },
      { x: -20, z: 0, width: 1, depth: 1 },
      { x: -20, z: 10, width: 1, depth: 1 },
      // Fountain
      { x: -15, z: 0, width: 6, depth: 6 },
      // Bushes
      { x: 5, z: -10, width: 2, depth: 2 },
      { x: -5, z: -10, width: 2, depth: 2 },
      { x: 10, z: 5, width: 2, depth: 2 },
      { x: -10, z: 5, width: 2, depth: 2 },
      { x: 12, z: -5, width: 2, depth: 2 },
      { x: -12, z: -5, width: 2, depth: 2 }
    )
  } else if (roomState.type === 'arcade') {
    // Arcade room boundaries
    zones.push({ x: 0, z: -21, width: 50, depth: 2 }) // Back wall
    zones.push({ x: -26, z: 0, width: 2, depth: 40 }) // Left wall
    zones.push({ x: 26, z: 0, width: 2, depth: 40 }) // Right wall
  } else if (roomState.type === 'stadium') {
    // Stadium boundaries
    zones.push({ x: 0, z: -26, width: 60, depth: 2 })
    zones.push({ x: 0, z: 26, width: 60, depth: 2 })
    zones.push({ x: -36, z: 0, width: 2, depth: 40 })
    zones.push({ x: 36, z: 0, width: 2, depth: 40 })
  }
  
  return zones
}

function checkCollision(newX: number, newZ: number, zones: any[]): boolean {
  for (const zone of zones) {
    const halfWidth = zone.width / 2
    const halfDepth = zone.depth / 2

    if (
      newX >= zone.x - halfWidth &&
      newX <= zone.x + halfWidth &&
      newZ >= zone.z - halfDepth &&
      newZ <= zone.z + halfDepth
    ) {
      return true
    }
  }
  return false
}

function CameraFollower({
  characterPosition,
  orbitControlsRef
}: {
  characterPosition: { x: number, y: number, z: number }
  orbitControlsRef: React.MutableRefObject<any>
}) {
  const { camera } = useThree()
  const lastPosition = useRef({ x: 0, y: 0, z: 0 })

  useEffect(() => {
    if (!orbitControlsRef.current) return

    const controls = orbitControlsRef.current
    const deltaX = characterPosition.x - lastPosition.current.x
    const deltaY = characterPosition.y - lastPosition.current.y
    const deltaZ = characterPosition.z - lastPosition.current.z

    if (deltaX !== 0 || deltaY !== 0 || deltaZ !== 0) {
      camera.position.x += deltaX
      camera.position.y += deltaY
      camera.position.z += deltaZ

      controls.target.set(
        characterPosition.x,
        characterPosition.y + 1,
        characterPosition.z
      )

      controls.update()
    }

    lastPosition.current = { ...characterPosition }
  })

  return null
}

const RealisticTree = React.memo(({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.35, 3, 12]} />
        <meshStandardMaterial color="#6b4423" roughness={1} metalness={0} />
      </mesh>
      <mesh position={[0, 3.5, 0]} castShadow>
        <coneGeometry args={[1.5, 2, 8]} />
        <meshStandardMaterial color="#2d5016" roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[0, 4.5, 0]} castShadow>
        <coneGeometry args={[1.2, 1.8, 8]} />
        <meshStandardMaterial color="#3a6b1e" roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[0, 5.3, 0]} castShadow>
        <coneGeometry args={[0.9, 1.5, 8]} />
        <meshStandardMaterial color="#4a8626" roughness={0.9} metalness={0} />
      </mesh>
    </group>
  )
})

const RealisticLamppost = React.memo(({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.2, 8]} />
        <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 5, 12]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 4.8, 0.3]} castShadow>
        <boxGeometry args={[0.2, 0.3, 0.8]} />
        <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 4.6, 0.3]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color="#fff7ed"
          emissive="#fbbf24"
          emissiveIntensity={2}
          metalness={0.1}
          roughness={0.2}
        />
      </mesh>
      <pointLight position={[0, 4.6, 0.3]} intensity={3} distance={15} color="#fbbf24" castShadow />
    </group>
  )
})

export default function InteractiveWorld({ userId, userProfile }: InteractiveWorldProps) {
  const router = useRouter()
  
  // Room state with reducer
  const [roomState, dispatchRoom] = useReducer(roomReducer, {
    type: 'world',
    currentRoom: null,
    savedPosition: { x: 0, y: 0.5, z: 0 }
  })

  const [myProfile, setMyProfile] = useState<any>(null)
  const [otherPlayers, setOtherPlayers] = useState<any[]>([])
  const [onlineCount, setOnlineCount] = useState(0)
  const [myPosition, setMyPosition] = useState({ x: 0, y: -0.35, z: 0 })
  const [myRotation, setMyRotation] = useState(0)
  const [myAvatarStyle, setMyAvatarStyle] = useState({
    bodyColor: "#3b82f6",
    headColor: "#fbbf24",
    hairStyle: "short",
    hairColor: "#1f2937",
    skinTone: "#fbbf24",
    accessory: "none",
    faceSmiley: "😊",
  })

  const [customizationOptions, setCustomizationOptions] = useState<any[]>([])
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [currentEmoji, setCurrentEmoji] = useState<string | null>(null)
  const [isJumping, setIsJumping] = useState(false)

  const [movement, setMovement] = useState({ x: 0, z: 0 })
  const [showChat, setShowChat] = useState(false)
  const [showChatInput, setShowChatInput] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false)
  const [showCinema, setShowCinema] = useState(false)
  const [showUserCard, setShowUserCard] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [roomMessages, setRoomMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState("")
  const [cinemaRooms, setCinemaRooms] = useState<any[]>([])
  const [cinemaSeats, setCinemaSeats] = useState<any[]>([])
  const [mySeat, setMySeat] = useState<number | null>(null)
  const [playerChatBubbles, setPlayerChatBubbles] = useState<Record<string, { message: string; timestamp: number }>>({})

  const [showMap, setShowMap] = useState(false)
  const [arcadeMachines, setArcadeMachines] = useState<any[]>([])
  const [showArcade, setShowArcade] = useState(false)
  const [currentArcadeMachine, setCurrentArcadeMachine] = useState<any>(null)
  const [stadium, setStadium] = useState<any>(null)
  const [showStadium, setShowStadium] = useState(false)
  const [showMovieFullscreen, setShowMovieFullscreen] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [countdown, setCountdown] = useState<string>("")

  const [playerActions, setPlayerActions] = useState<Record<string, { action: string; timestamp: number }>>({})
  const [quickAction, setQuickAction] = useState<string | null>(null)
  
  const keysPressed = useRef<Set<string>>(new Set())
  const cameraAngle = useRef<number>(0)
  const orbitControlsRef = useRef<any>(null)

  const [worldSettings, setWorldSettings] = useState({
    maxCapacity: 100,
    worldMode: "day",
    voiceChatEnabled: false,
    playerInteractionsEnabled: true,
    showStatusBadges: true,
    enableChat: true,
    enableEmojis: true,
    enableJumping: true,
  })

  const [graphicsQuality, setGraphicsQuality] = useState("medium")
  const [isMobileMode, setIsMobileMode] = useState(false)
  const [controlMode, setControlMode] = useState<"auto" | "pc" | "mobile">("auto")
  const [povMode, setPovMode] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [showAFKWarning, setShowAFKWarning] = useState(false)
  const [isLoadingRoom, setIsLoadingRoom] = useState(false)

  const isMoving = movement.x !== 0 || movement.z !== 0

  // Memoized collision zones
  const collisionZones = useMemo(() => createCollisionZones(roomState), [roomState])

  // Debounced position update
  const updatePositionDebounced = useCallback(
    debounce((pos: { x: number; y: number; z: number }) => {
      supabase
        .from("interactive_profiles")
        .update({
          position_x: pos.x,
          position_y: pos.y,
          position_z: pos.z,
        })
        .eq("user_id", userId)
        .then()
    }, 100),
    [userId]
  )

  // Optimized online count
  useEffect(() => {
    const actualPlayersInWorld = otherPlayers.filter((p) => {
      const playerIsInSameRoom =
        roomState.currentRoom === p.current_room || (roomState.currentRoom === null && p.current_room === null)
      const hasValidProfile = (p.user_profiles?.username || p.username) ? true : false
      const isAtDefaultPosition = (p.position_x === 0 && p.position_z === 0 && (p.position_y === 0 || p.position_y === 0.5))
      return playerIsInSameRoom && hasValidProfile && !isAtDefaultPosition
    })
    setOnlineCount(actualPlayersInWorld.length + 1)
  }, [otherPlayers, roomState.currentRoom])

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      if (controlMode === "pc") {
        setIsMobileMode(false)
      } else if (controlMode === "mobile") {
        setIsMobileMode(true)
      } else {
        const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0
        const isSmallScreen = window.innerWidth < 1024
        setIsMobileMode(isTouchDevice || isSmallScreen)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    window.addEventListener("orientationchange", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("orientationchange", checkMobile)
    }
  }, [controlMode])

  // AFK detection
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now())
      setShowAFKWarning(false)
    }

    const events = ["mousedown", "mousemove", "keydown", "touchstart", "touchmove", "wheel"]
    events.forEach((event) => window.addEventListener(event, updateActivity))

    const checkAFK = setInterval(() => {
      const inactiveTime = Date.now() - lastActivity
      const threeHours = 3 * 60 * 60 * 1000

      if (inactiveTime > threeHours) {
        setShowAFKWarning(true)
        supabase
          .from("interactive_profiles")
          .update({ is_online: false, last_seen: new Date().toISOString() })
          .eq("user_id", userId)
          .then(() => {
            window.location.href = "/"
          })
      }
    }, 60000)

    return () => {
      events.forEach((event) => window.removeEventListener(event, updateActivity))
      clearInterval(checkAFK)
    }
  }, [lastActivity, userId])

  // Load world settings
  useEffect(() => {
    const loadWorldSettings = async () => {
      const { data, error } = await supabase
        .from("interactive_world_settings")
        .select("setting_value")
        .eq("setting_key", "world_config")
        .maybeSingle()

      if (data && data.setting_value) {
        setWorldSettings(data.setting_value as any)
      }
    }

    loadWorldSettings()
  }, [])

  // Load players
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from("interactive_profiles")
          .select("*")
          .eq("is_online", true)
          .neq("user_id", userId)
          .not("position_x", "is", null)
          .not("position_y", "is", null)
          .not("position_z", "is", null)
          .or("position_x.neq.0,position_z.neq.0,and(position_y.neq.0,position_y.neq.0.5)")

        if (profilesError) {
          console.error("[v0] Error loading profiles:", profilesError)
          return
        }

        if (profiles && profiles.length > 0) {
          const userIds = profiles.map((p) => p.user_id)

          const { data: userProfiles, error: userProfilesError } = await supabase
            .from("user_profiles")
            .select("user_id, username, is_admin, is_vip, is_vip_plus")
            .in("user_id", userIds)

          if (userProfilesError) {
            console.error("[v0] Error loading user profiles:", userProfilesError)
          }

          const mergedData = profiles.map((profile) => ({
            ...profile,
            user_profiles: userProfiles?.find((up) => up?.user_id === profile.user_id) || {
              username: profile.username,
              is_admin: false,
              is_vip: false,
              is_vip_plus: false,
            },
          }))

          setOtherPlayers(mergedData)
        } else {
          setOtherPlayers([])
        }
      } catch (err) {
        console.error("[v0] Failed to load players:", err)
      }
    }

    supabase
      .from("interactive_profiles")
      .update({ is_online: true, last_seen: new Date().toISOString() })
      .eq("user_id", userId)
      .then()

    loadPlayers()
    const interval = setInterval(loadPlayers, 5000)

    const channel = supabase
      .channel("players")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "interactive_profiles",
        },
        () => {
          loadPlayers()
        },
      )
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
      supabase
        .from("interactive_profiles")
        .update({ is_online: false, last_seen: new Date().toISOString() })
        .eq("user_id", userId)
        .then()
    }
  }, [userId])

  // Load my profile and initialize room state
  useEffect(() => {
    if (!userId) return

    const loadMyProfile = async () => {
      const { data, error } = await supabase.from("interactive_profiles").select("*").eq("user_id", userId).single()

      if (error) {
        console.error("[v0] Error loading my profile:", error)
        return
      }

      setMyProfile(data)

      if (data) {
        const loadedPosition = { x: data.position_x, y: data.position_y, z: data.position_z }
        setMyPosition(loadedPosition)
        setMyRotation(data.rotation || 0)
        
        // Initialize room state
        dispatchRoom({ 
          type: 'INIT', 
          currentRoom: data.current_room,
          position: loadedPosition
        })
      }
    }

    loadMyProfile()
  }, [userId])

  // Load arcade machines
  useEffect(() => {
    const loadArcadeMachines = async () => {
      const { data } = await supabase.from("retrogaming_sources").select("*").eq("is_active", true).order("name")
      if (data) setArcadeMachines(data)
    }
    loadArcadeMachines()
  }, [])

  // Load stadium
  useEffect(() => {
    const loadStadium = async () => {
      const { data } = await supabase.from("interactive_stadium").select("*").eq("is_open", true).single()
      if (data) setStadium(data)
    }

    loadStadium()

    const channel = supabase
      .channel("stadium")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "interactive_stadium",
        },
        loadStadium,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Load cinema rooms
  const loadCinemaRooms = useCallback(async () => {
    const { data } = await supabase
      .from("interactive_cinema_rooms")
      .select("*")
      .eq("is_open", true)
      .order("room_number")

    if (data) setCinemaRooms(data)
  }, [])

  useEffect(() => {
    loadCinemaRooms()

    const channel = supabase
      .channel("cinema_rooms")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "interactive_cinema_rooms",
        },
        loadCinemaRooms,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadCinemaRooms])

  // Load cinema seats
  const loadSeats = useCallback(async () => {
    if (!roomState.cinemaRoom) return
    const { data } = await supabase.from("interactive_cinema_seats").select("*").eq("room_id", roomState.cinemaRoom.id)
    if (data) setCinemaSeats(data)
  }, [roomState.cinemaRoom])

  useEffect(() => {
    if (!roomState.cinemaRoom) return

    loadSeats()

    const channel = supabase
      .channel(`cinema_seats_${roomState.cinemaRoom.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "interactive_cinema_seats",
          filter: `room_id=eq.${roomState.cinemaRoom.id}`,
        },
        loadSeats,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomState.cinemaRoom, loadSeats])

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      const { data } = await supabase
        .from("interactive_chat_messages")
        .select("*")
        .eq("room", "world")
        .order("created_at", { ascending: false })
        .limit(50)

      if (data) setMessages(data.reverse())
    }

    loadMessages()

    const channel = supabase
      .channel("chat")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "interactive_chat_messages",
          filter: "room=eq.world",
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
          setPlayerChatBubbles((prev) => ({
            ...prev,
            [payload.new.user_id]: {
              message: payload.new.message,
              timestamp: Date.now(),
            },
          }))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Optimized chat bubble cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerChatBubbles((prev) => {
        const now = Date.now()
        const updated = Object.entries(prev).reduce((acc, [key, value]) => {
          if (now - value.timestamp <= 5000) {
            acc[key] = value
          }
          return acc
        }, {} as Record<string, { message: string; timestamp: number }>)
        
        return Object.keys(updated).length !== Object.keys(prev).length ? updated : prev
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Countdown for cinema
  useEffect(() => {
    if (!roomState.cinemaRoom || roomState.type !== 'cinema') return

    const room = cinemaRooms.find((r) => r.id === roomState.cinemaRoom.id)
    if (!room || !room.schedule_start) return

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const start = new Date(room.schedule_start!).getTime()
      const distance = start - now

      if (distance < 0) {
        setCountdown("Film en cours")
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)
        setCountdown(`${hours}h ${minutes}m ${seconds}s`)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [roomState.cinemaRoom, roomState.type, cinemaRooms])

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase())
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase())
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // Camera angle tracking
  useEffect(() => {
    const interval = setInterval(() => {
      if (orbitControlsRef.current) {
        const angle = orbitControlsRef.current.getAzimuthalAngle()
        cameraAngle.current = angle
      }
    }, 16)

    return () => clearInterval(interval)
  }, [])

  // Movement system with improved rotation
  useEffect(() => {
    const interval = setInterval(() => {
      let forward = 0
      let right = 0
      const speed = 0.15

      if (keysPressed.current.has("w") || keysPressed.current.has("z") || keysPressed.current.has("arrowup")) forward += speed
      if (keysPressed.current.has("s") || keysPressed.current.has("arrowdown")) forward -= speed
      if (keysPressed.current.has("a") || keysPressed.current.has("q") || keysPressed.current.has("arrowleft")) right += speed
      if (keysPressed.current.has("d") || keysPressed.current.has("arrowright")) right -= speed

      if (forward !== 0 || right !== 0) {
        const camAngle = cameraAngle.current
        const forwardAngle = camAngle + Math.PI

        const dx = Math.sin(forwardAngle) * forward + Math.cos(forwardAngle) * right
        const dz = Math.cos(forwardAngle) * forward - Math.sin(forwardAngle) * right

        if (dx !== 0 || dz !== 0) {
          const targetRotation = Math.atan2(dx, dz)
          setMyRotation(prev => smoothRotation(prev, targetRotation))
        }
        
        setMovement({ x: dx, z: dz })
        
        setMyPosition((prev) => {
          const worldBounds = roomState.type === 'world' ? 30 : 50
          const newX = Math.max(-worldBounds, Math.min(worldBounds, prev.x + dx))
          const newZ = Math.max(-worldBounds, Math.min(worldBounds, prev.z + dz))

          if (checkCollision(newX, newZ, collisionZones)) {
            return prev
          }

          const newPos = {
            x: newX,
            y: -0.35,
            z: newZ,
          }

          updatePositionDebounced(newPos)
          return newPos
        })
      } else {
        setMovement({ x: 0, z: 0 })
      }
    }, 50)

    return () => clearInterval(interval)
  }, [userId, collisionZones, roomState.type, updatePositionDebounced])

  // Fullscreen handling
  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (err) {
      console.error("Fullscreen error:", err)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Avatar customization
  useEffect(() => {
    const loadAvatarStyle = async () => {
      const { data } = await supabase.from("interactive_profiles").select("avatar_style").eq("user_id", userId).single()
      if (data?.avatar_style) {
        setMyAvatarStyle(data.avatar_style)
      }
    }
    loadAvatarStyle()
  }, [userId])

  const saveAvatarStyle = async (newStyle: any) => {
    setMyAvatarStyle(newStyle)
    await supabase.from("interactive_profiles").update({ avatar_style: newStyle }).eq("user_id", userId)
  }

  useEffect(() => {
    const loadCustomizationOptions = async () => {
      const { data } = await supabase.from("avatar_customization_options").select("*").order("category")
      if (data) {
        setCustomizationOptions(data)
      }
    }
    loadCustomizationOptions()
  }, [])

  // Player actions broadcast
  useEffect(() => {
    const channel = supabase
      .channel("world-actions")
      .on("broadcast", { event: "player-action" }, (payload: any) => {
        if (payload.userId && payload.userId !== userId) {
          setPlayerActions((prev) => ({
            ...prev,
            [payload.userId]: {
              action: payload.action,
              timestamp: Date.now(),
              ...(payload.action === "emoji" && { emoji: payload.emoji }),
            },
          }))

          setTimeout(
            () => {
              setPlayerActions((prev) => {
                const newActions = { ...prev }
                delete newActions[payload.userId]
                return newActions
              })
            },
            payload.action === "emoji" ? 3000 : 2000,
          )
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  // Handlers
  const handleEmoji = (emoji: string) => {
    if (!userProfile) return

    setCurrentEmoji(emoji)
    setShowQuickActions(false)

    const channel = supabase.channel("world-updates")
    channel.send({
      type: "broadcast",
      event: "player-action",
      payload: {
        userId: userProfile.user_id,
        action: "emoji",
        emoji: emoji,
        timestamp: Date.now(),
      },
    })

    setTimeout(() => setCurrentEmoji(null), 3000)
  }

  const handleJump = () => {
    if (!userProfile) return

    setIsJumping(true)

    supabase.channel("world-actions").send({
      type: "broadcast",
      event: "player-action",
      payload: {
        userId: userProfile.user_id,
        action: "jump",
        timestamp: Date.now(),
      },
    })

    setTimeout(() => setIsJumping(false), 500)
  }

  const sendMessage = async () => {
    if (!userProfile || !userProfile.id || !worldSettings.enableChat) return

    if (chatInput.trim()) {
      const message = {
        user_id: userProfile.id,
        username: myProfile?.username || userProfile.username || "Joueur",
        message: chatInput.trim(),
        room: roomState.cinemaRoom ? `cinema_${roomState.cinemaRoom.id}` : "world",
        created_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("interactive_chat_messages").insert(message)

      if (error) {
        console.error("[v0] Error sending message:", error)
      } else {
        setPlayerChatBubbles((prev) => ({
          ...prev,
          [userProfile.id]: {
            message: chatInput.trim(),
            timestamp: Date.now(),
          },
        }))
      }

      setChatInput("")
    }
  }

  const handleJoystickMove = useCallback(
    (dx: number, dz: number) => {
      setMyPosition((prev) => {
        const speed = 0.15
        const worldBounds = roomState.type === 'world' ? 30 : 50
        const newX = Math.max(-worldBounds, Math.min(worldBounds, prev.x + dx * speed))
        const newZ = Math.max(-worldBounds, Math.min(worldBounds, prev.z + dz * speed))

        if (checkCollision(newX, newZ, collisionZones)) {
          return prev
        }

        const newPos = {
          x: newX,
          y: -0.35,
          z: newZ,
        }

        updatePositionDebounced(newPos)
        return newPos
      })

      if (dx !== 0 || dz !== 0) {
        setMovement({ x: dx, z: dz })
      } else {
        setMovement({ x: 0, z: 0 })
      }
    },
    [userId, collisionZones, roomState.type, updatePositionDebounced],
  )

  const handleEnterArcade = () => {
    setIsLoadingRoom(true)
    setShowArcade(false)

    dispatchRoom({ type: 'ENTER_ARCADE', currentPosition: myPosition })

    const arcadePos = { x: -2.6145599903373125, y: -0.35, z: 10.641204270993434 }
    setMyPosition(arcadePos)

    supabase
      .from("interactive_profiles")
      .update({
        position_x: arcadePos.x,
        position_y: arcadePos.y,
        position_z: arcadePos.z,
        current_room: "arcade",
      })
      .eq("user_id", userId)
      .then(() => {
        setIsLoadingRoom(false)
      })
  }

  const handleLeaveArcade = () => {
    setMyPosition(roomState.savedPosition)
    
    dispatchRoom({ type: 'LEAVE_ROOM', savedPosition: roomState.savedPosition })

    supabase
      .from("interactive_profiles")
      .update({
        position_x: roomState.savedPosition.x,
        position_y: roomState.savedPosition.y,
        position_z: roomState.savedPosition.z,
        current_room: null,
      })
      .eq("user_id", userId)
      .then()
  }

  const handleSelectArcadeMachine = (machine: any) => {
    setCurrentArcadeMachine(machine)
    setShowArcade(false)
  }

  const handleCloseArcadeMachine = () => {
    setCurrentArcadeMachine(null)
  }

  const handleEnterCinemaRoom = async (room: any) => {
    setIsLoadingRoom(true)
    
    dispatchRoom({ type: 'ENTER_CINEMA', room, currentPosition: myPosition })
    setShowCinema(false)

    const cinemaSpawnPos = { x: -0.7003322451885853, y: -0.35, z: 11.633941158451258 }
    setMyPosition(cinemaSpawnPos)

    await supabase
      .from("interactive_profiles")
      .update({
        current_room: `cinema_${room.id}`,
        position_x: cinemaSpawnPos.x,
        position_y: cinemaSpawnPos.y,
        position_z: cinemaSpawnPos.z,
      })
      .eq("user_id", userId)

    const capacity = room.capacity || 50
    const seatsPerRow = 10
    const rows = Math.ceil(capacity / seatsPerRow)

    const generatedSeats = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < seatsPerRow; col++) {
        const seatNumber = row * seatsPerRow + col
        if (seatNumber >= capacity) break

        generatedSeats.push({
          seat_number: seatNumber,
          row_number: row,
          position_x: (col - 4.5) * 1.5,
          position_y: 0.4,
          position_z: row * 2 + 2,
          color: "#374151",
          is_occupied: false,
        })
      }
    }

    setCinemaSeats(generatedSeats)
    setIsLoadingRoom(false)
  }

  const handleLeaveRoom = async () => {
    if (mySeat) {
      await supabase.from("interactive_cinema_seats").delete().eq("room_id", roomState.cinemaRoom.id).eq("user_id", userId)
      setMySeat(null)
    }

    setMyPosition(roomState.savedPosition)
    dispatchRoom({ type: 'LEAVE_ROOM', savedPosition: roomState.savedPosition })
    setCountdown("")

    await supabase
      .from("interactive_profiles")
      .update({
        current_room: null,
        position_x: roomState.savedPosition.x,
        position_y: roomState.savedPosition.y,
        position_z: roomState.savedPosition.z,
      })
      .eq("user_id", userId)
  }

  const handleSitInAnySeat = async () => {
    if (!roomState.cinemaRoom) return

    const occupiedSeats = cinemaSeats.filter((s) => s.user_id && s.user_id !== userId)
    const availableSeat = cinemaSeats.find((s) => !occupiedSeats.find((os) => os.seat_number === s.seat_number))

    if (!availableSeat) return

    await handleSitInSeat(availableSeat.seat_number)
  }

  const handleSitInSeat = async (seatNumber: number) => {
    if (mySeat === seatNumber) {
      await supabase.from("interactive_cinema_seats").delete().eq("room_id", roomState.cinemaRoom.id).eq("user_id", userId)
      setMySeat(null)
      setMyPosition({ x: 0, y: 0.5, z: 0 })
    } else {
      const seatData = cinemaSeats.find((s) => s.seat_number === seatNumber)
      if (!seatData) return

      const { error } = await supabase.from("interactive_cinema_seats").upsert({
        room_id: roomState.cinemaRoom.id,
        user_id: userId,
        seat_number: seatNumber,
        row_number: seatData.row_number,
        is_occupied: true,
        color: "#374151",
        position_x: seatData.position_x,
        position_y: seatData.position_y,
        position_z: seatData.position_z,
      })

      if (!error) {
        setMySeat(seatNumber)
        setMyPosition({ x: seatData.position_x, y: seatData.position_y, z: seatData.position_z })

        await supabase
          .from("interactive_profiles")
          .update({
            position_x: seatData.position_x,
            position_y: seatData.position_y,
            position_z: seatData.position_z,
          })
          .eq("user_id", userId)
      }
    }
  }

  const handleEnterStadium = () => {
    setIsLoadingRoom(true)
    setShowStadium(false)

    dispatchRoom({ type: 'ENTER_STADIUM', currentPosition: myPosition })

    const stadiumPos = { x: 0, y: 0.5, z: 0 }
    setMyPosition(stadiumPos)

    supabase
      .from("interactive_profiles")
      .update({
        position_x: stadiumPos.x,
        position_y: stadiumPos.y,
        position_z: stadiumPos.z,
        current_room: "stadium",
      })
      .eq("user_id", userId)
      .then(() => {
        setIsLoadingRoom(false)
      })
  }

  const handleLeaveStadium = () => {
    setMyPosition(roomState.savedPosition)
    
    dispatchRoom({ type: 'LEAVE_ROOM', savedPosition: roomState.savedPosition })

    supabase
      .from("interactive_profiles")
      .update({
        position_x: roomState.savedPosition.x,
        position_y: roomState.savedPosition.y,
        position_z: roomState.savedPosition.z,
        current_room: null,
      })
      .eq("user_id", userId)
      .then()
  }

  const handleQuickAction = (action: string) => {
    if (!userProfile) return

    setQuickAction(action)
    setShowQuickActions(false)

    supabase.channel("world-actions").send({
      type: "broadcast",
      event: "player-action",
      payload: {
        userId: userProfile.user_id,
        action,
        timestamp: Date.now(),
      },
    })

    setTimeout(() => setQuickAction(null), 3000)
  }

  const handleQuitWorld = async () => {
    const isInSpecialRoom = roomState.type !== 'world'

    const positionToSave = isInSpecialRoom
      ? { x: 0, y: 0.5, z: 0 }
      : { x: myPosition.x, y: myPosition.y, z: myPosition.z }

    await supabase
      .from("interactive_profiles")
      .update({
        position_x: positionToSave.x,
        position_y: positionToSave.y,
        position_z: positionToSave.z,
        is_online: false,
        last_seen: new Date().toISOString(),
      })
      .eq("user_id", userId)

    router.push("/")
  }

  // Render loading state
  if (isLoadingRoom) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-white text-2xl">Chargement de la salle...</div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen">
      <Canvas
        camera={povMode ? undefined : { position: [0, 8, 12], fov: 60 }}
        style={{ width: "100vw", height: "100vh" }}
        shadows
        gl={{
          antialias: graphicsQuality !== "low",
          alpha: false,
          powerPreference: graphicsQuality === "high" ? "high-performance" : "default",
        }}
      >
        {povMode && (
          <PerspectiveCamera makeDefault position={[myPosition.x, myPosition.y + 1.5, myPosition.z]} fov={75} />
        )}

        {worldSettings.worldMode === "day" && (
          <>
            <Sky sunPosition={[100, 20, 100]} inclination={0.6} azimuth={0.25} />
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[10, 20, 10]}
              intensity={1.5}
              castShadow
              shadow-mapSize={graphicsQuality === "high" ? [2048, 2048] : [1024, 1024]}
            />
          </>
        )}

        {worldSettings.worldMode === "night" && (
          <>
            <Sky sunPosition={[100, -20, 100]} inclination={0.1} azimuth={0.25} />
            <ambientLight intensity={0.15} />
            <directionalLight
              position={[10, 20, 10]}
              intensity={0.3}
              color="#4466ff"
              castShadow
              shadow-mapSize={graphicsQuality === "high" ? [2048, 2048] : [1024, 1024]}
            />
          </>
        )}

        {worldSettings.worldMode === "sunset" && (
          <>
            <Sky sunPosition={[100, 2, 100]} inclination={0.3} azimuth={0.1} />
            <ambientLight intensity={0.3} />
            <directionalLight
              position={[10, 5, 10]}
              intensity={1.0}
              color="#ff8844"
              castShadow
              shadow-mapSize={graphicsQuality === "high" ? [2048, 2048] : [1024, 1024]}
            />
          </>
        )}

        <fog attach="fog" args={["#87CEEB", 10, 50]} />
        <hemisphereLight intensity={0.3} groundColor="#6b7280" />

        {/* World rendering based on room state */}
        {roomState.type === 'world' && (
          <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[60, 60]} />
              <meshStandardMaterial color="#4ade80" roughness={0.95} metalness={0} />
            </mesh>

            {/* Buildings */}
            <group position={[-25, 0, 0]}>
              <mesh position={[0, 3, 0]} castShadow>
                <boxGeometry args={[10, 6, 10]} />
                <meshStandardMaterial color="#8b5cf6" roughness={0.7} metalness={0.2} />
              </mesh>
              <mesh position={[0, 6.5, 0]} castShadow>
                <boxGeometry args={[10.5, 0.5, 10.5]} />
                <meshStandardMaterial color="#6b21a8" roughness={0.6} metalness={0.3} />
              </mesh>
              <mesh position={[0, 7, 0]}>
                <boxGeometry args={[8, 0.6, 0.3]} />
                <meshStandardMaterial
                  color="#f59e0b"
                  emissive="#f59e0b"
                  emissiveIntensity={1.5}
                  roughness={0.3}
                  metalness={0.5}
                />
              </mesh>
              <pointLight position={[0, 7, 0]} intensity={2} distance={10} color="#f59e0b" />
              <Html position={[0, 8, 0]} center depthTest={true} occlude zIndexRange={[0, 0]}>
                <button
                  onClick={handleEnterArcade}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 whitespace-nowrap shadow-2xl font-bold flex items-center gap-2 transform hover:scale-105 transition-transform"
                >
                  🕹️ Entrer à l'Arcade
                </button>
              </Html>
            </group>

            <group position={[25, 0, -15]}>
              <mesh position={[0, 3.5, 0]} castShadow>
                <boxGeometry args={[12, 7, 10]} />
                <meshStandardMaterial color="#16a34a" roughness={0.7} metalness={0.1} />
              </mesh>
              <mesh position={[0, 7.5, 0]} castShadow>
                <boxGeometry args={[12.5, 0.5, 10.5]} />
                <meshStandardMaterial color="#15803d" roughness={0.6} metalness={0.2} />
              </mesh>
              <mesh position={[0, 8, 0]}>
                <boxGeometry args={[10, 0.7, 0.3]} />
                <meshStandardMaterial
                  color="#22c55e"
                  emissive="#22c55e"
                  emissiveIntensity={1.5}
                  roughness={0.3}
                  metalness={0.5}
                />
              </mesh>
              <pointLight position={[0, 8, 0]} intensity={2} distance={10} color="#22c55e" />
              <Html position={[0, 9, 0]} center depthTest={true} occlude zIndexRange={[0, 0]}>
                <button
                  onClick={handleEnterStadium}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 whitespace-nowrap shadow-2xl font-bold flex items-center gap-2 transform hover:scale-105 transition-transform"
                >
                  ⚽ Entrer au Stade
                </button>
              </Html>
            </group>

            <group position={[15, 0, 0]}>
              <mesh position={[0, 2.5, 0]} castShadow>
                <boxGeometry args={[8, 5, 8]} />
                <meshStandardMaterial color="#1e3a8a" roughness={0.7} metalness={0.1} />
              </mesh>
              <mesh position={[0, 5.5, 0]} castShadow>
                <boxGeometry args={[8.5, 0.5, 8.5]} />
                <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.2} />
              </mesh>
              <mesh position={[0, 6, 0]}>
                <boxGeometry args={[7, 0.8, 0.3]} />
                <meshStandardMaterial
                  color="#fbbf24"
                  emissive="#fbbf24"
                  emissiveIntensity={1.5}
                  roughness={0.3}
                  metalness={0.5}
                />
              </mesh>
              <pointLight position={[0, 6, 0]} intensity={2} distance={10} color="#fbbf24" />
              <Html position={[0, 7, 0]} center depthTest={true} occlude zIndexRange={[0, 0]}>
                <button
                  onClick={() => setShowCinema(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 whitespace-nowrap shadow-2xl font-bold flex items-center gap-2 transform hover:scale-105 transition-transform"
                >
                  🎬 Cinéma
                </button>
              </Html>
            </group>

            {(graphicsQuality === "low"
              ? [[-15, -15], [15, -15]]
              : [[-15, -15], [-8, -18], [8, -18], [15, -15], [-18, 10], [18, 10], [-10, 15], [10, 15]]
            ).map(([x, z], i) => (
              <RealisticTree key={`tree-${i}`} position={[x, 0, z]} />
            ))}

            {(graphicsQuality === "low"
              ? [[0, -10]]
              : [[-10, -10], [0, -10], [10, -10], [-10, 10], [10, 10]]
            ).map((z, i) => (
              <RealisticLamppost key={`lamp-${i}`} position={[-20, 0, z[1]]} />
            ))}
          </>
        )}

        {roomState.type === 'arcade' && (
          <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
              <planeGeometry args={[50, 40]} />
              <meshStandardMaterial color="#2d1b4e" />
            </mesh>

            <mesh position={[0, 5, -20]}>
              <boxGeometry args={[50, 10, 0.5]} />
              <meshStandardMaterial color="#1a0f2e" />
            </mesh>
            <mesh position={[-25, 5, 0]}>
              <boxGeometry args={[0.5, 10, 40]} />
              <meshStandardMaterial color="#1a0f2e" />
            </mesh>
            <mesh position={[25, 5, 0]}>
              <boxGeometry args={[0.5, 10, 40]} />
              <meshStandardMaterial color="#1a0f2e" />
            </mesh>

            <mesh position={[0, 10, 0]}>
              <boxGeometry args={[50, 0.5, 40]} />
              <meshStandardMaterial color="#0f0a1e" />
            </mesh>

            {[-15, -5, 5, 15].map((x) => (
              <group key={x} position={[x, 9.5, 0]}>
                <mesh>
                  <boxGeometry args={[1, 0.2, 35]} />
                  <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={2} />
                </mesh>
                <pointLight position={[0, 0, 0]} intensity={3} distance={15} color="#ff00ff" />
              </group>
            ))}

            {arcadeMachines.slice(0, 12).map((machine, idx) => {
              const row = Math.floor(idx / 4)
              const col = idx % 4
              const x = -15 + col * 10
              const z = -10 + row * 10

              return (
                <group key={machine.id} position={[x, 0, z]}>
                  <mesh position={[0, 1.5, 0]} castShadow>
                    <boxGeometry args={[2.5, 3, 1.5]} />
                    <meshStandardMaterial
                      color={["#e11d48", "#8b5cf6", "#0ea5e9", "#f59e0b"][idx % 4]}
                      roughness={0.3}
                      metalness={0.7}
                    />
                  </mesh>
                  <mesh position={[0, 2, 0.76]}>
                    <planeGeometry args={[2, 1.5]} />
                    <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
                  </mesh>
                  <mesh position={[0, 0.8, 1]} rotation={[-Math.PI / 6, 0, 0]}>
                    <boxGeometry args={[2.3, 0.3, 0.8]} />
                    <meshStandardMaterial color="#1a1a1a" />
                  </mesh>
                  <Html position={[0, 3.5, 0]} center>
                    <div className="bg-black/80 text-white px-3 py-1 rounded text-sm font-bold whitespace-nowrap">
                      {machine.name}
                    </div>
                  </Html>
                  <Html position={[0, 0.5, 1.5]} center>
                    <button
                      onClick={() => handleSelectArcadeMachine(machine)}
                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-bold transform hover:scale-110 transition-all shadow-lg"
                    >
                      🎮 Jouer
                    </button>
                  </Html>
                  <pointLight position={[0, 4, 0]} intensity={1.5} distance={8} color="#ff00ff" />
                </group>
              )
            })}

            <group position={[0, 0, 18]}>
              <mesh position={[0, 2.5, 0]}>
                <boxGeometry args={[4, 5, 0.3]} />
                <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={1} />
              </mesh>
              <Html position={[0, 5.5, 0]} center>
                <button
                  onClick={handleLeaveArcade}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg"
                >
                  🚪 Sortir de l'Arcade
                </button>
              </Html>
            </group>

            <Html position={[0, 1, 15]} center>
              <button
                onClick={() => setShowArcade(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-bold shadow-xl flex items-center gap-2"
              >
                <Gamepad2 className="w-5 h-5" />
                Voir toutes les machines
              </button>
            </Html>
          </>
        )}

        {roomState.type === 'stadium' && (
          <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
              <planeGeometry args={[60, 40]} />
              <meshStandardMaterial color="#1c7430" />
            </mesh>

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <planeGeometry args={[58, 38]} />
              <meshStandardMaterial color="#ffffff" opacity={0.1} transparent />
            </mesh>

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
              <ringGeometry args={[8, 8.2, 64]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>

            {[-15, 15].map((z) => (
              <group key={`goal-${z}`} position={[0, 0, z]}>
                <mesh position={[-3.5, 1.5, 0]}>
                  <boxGeometry args={[0.2, 3, 0.2]} />
                  <meshStandardMaterial color="#ffffff" />
                </mesh>
                <mesh position={[3.5, 1.5, 0]}>
                  <boxGeometry args={[0.2, 3, 0.2]} />
                  <meshStandardMaterial color="#ffffff" />
                </mesh>
                <mesh position={[0, 3, 0]}>
                  <boxGeometry args={[7, 0.2, 0.2]} />
                  <meshStandardMaterial color="#ffffff" />
                </mesh>
              </group>
            ))}

            {[
              { x: 0, z: -25, rot: 0, w: 70, h: 15 },
              { x: 0, z: 25, rot: Math.PI, w: 70, h: 15 },
              { x: -35, z: 0, rot: Math.PI / 2, w: 60, h: 15 },
              { x: 35, z: 0, rot: -Math.PI / 2, w: 60, h: 15 },
            ].map((wall) => (
              <group key={`stadium-wall-${wall.x}-${wall.z}`} position={[wall.x, 0, wall.z]} rotation={[0, wall.rot, 0]}>
                <mesh position={[0, wall.h / 2, 0]}>
                  <boxGeometry args={[wall.w, wall.h, 2]} />
                  <meshStandardMaterial color="#2d4a3e" />
                </mesh>
                {[0, 1, 2, 3, 4].map((row) => (
                  <mesh key={`${wall.x}-${wall.z}-row-${row}`} position={[0, 3 + row * 2, -1 - row * 0.5]}>
                    <boxGeometry args={[wall.w - 2, 0.5, 2]} />
                    <meshStandardMaterial color={row % 2 === 0 ? "#1e3a8a" : "#3b82f6"} />
                  </mesh>
                ))}
              </group>
            ))}

            <group position={[0, 10, -24]}>
              <mesh>
                <boxGeometry args={[40, 20, 1]} />
                <meshStandardMaterial color="#000000" />
              </mesh>
              {stadium?.embed_url && (
                <Html transform position={[0, 0, 0.6]} style={{ width: "3500px", height: "1800px" }}>
                  <iframe
                    src={stadium.embed_url}
                    className="w-full h-full rounded"
                    allowFullScreen
                    allow="autoplay; fullscreen"
                  />
                </Html>
              )}
            </group>

            {[
              [-25, 20, -15],
              [25, 20, -15],
              [-25, 20, 15],
              [25, 20, 15],
            ].map((pos) => (
              <group key={`stadium-light-${pos[0]}-${pos[2]}`} position={pos as [number, number, number]}>
                <mesh>
                  <cylinderGeometry args={[0.5, 0.5, 4]} />
                  <meshStandardMaterial color="#333333" />
                </mesh>
                <spotLight
                  position={[0, 0, 0]}
                  angle={0.6}
                  penumbra={0.5}
                  intensity={2}
                  castShadow
                  target-position={[0, 0, 0]}
                />
              </group>
            ))}

            <Html position={[0, 2, 20]} center>
              <button
                onClick={handleLeaveStadium}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Quitter le Stade
              </button>
            </Html>
          </>
        )}

        {roomState.type === 'cinema' && roomState.cinemaRoom && (
          <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
              <planeGeometry args={[30, 40]} />
              <meshStandardMaterial color="#2d1010" />
            </mesh>

            <mesh position={[0, 3, -20]}>
              <boxGeometry args={[30, 6, 0.5]} />
              <meshStandardMaterial color="#1a0f0a" />
            </mesh>
            <mesh position={[-15, 3, 0]}>
              <boxGeometry args={[0.5, 6, 40]} />
              <meshStandardMaterial color="#1a0f0a" />
            </mesh>
            <mesh position={[15, 3, 0]}>
              <boxGeometry args={[0.5, 6, 40]} />
              <meshStandardMaterial color="#1a0f0a" />
            </mesh>

            {(() => {
              const room = cinemaRooms.find((r) => r.id === roomState.cinemaRoom.id)
              if (!room) return null

              const isMovieStarted = room.schedule_start && new Date(room.schedule_start).getTime() < Date.now()

              return (
                <group position={[0, 3, -20]}>
                  <mesh>
                    <planeGeometry args={[14, 8]} />
                    <meshStandardMaterial color="#1a1a1a" />
                  </mesh>
                  <mesh position={[0, 0, 0.1]}>
                    <planeGeometry args={[13.5, 7.5]} />
                    <meshStandardMaterial color="#000000" />
                  </mesh>

                  {!isMovieStarted && (
                    <>
                      <Html position={[0, 1, 0.2]} center depthTest={false} zIndexRange={[100, 0]}>
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
                    </>
                  )}

                  {isMovieStarted && room.embed_url && !showMovieFullscreen && (
                    <Html transform style={{ width: "1300px", height: "720px" }}>
                      <iframe
                        src={room.embed_url}
                        className="w-full h-full rounded"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </Html>
                  )}
                </group>
              )
            })()}

            {cinemaSeats.map((seat) => {
              const isMySeat = mySeat === seat.seat_number

              return (
                <group key={seat.id || `seat-${seat.seat_number}-${seat.position_x}-${seat.position_z}`} position={[seat.position_x, seat.position_y, seat.position_z]}>
                  <mesh castShadow>
                    <boxGeometry args={[1, 0.8, 0.9]} />
                    <meshStandardMaterial color={isMySeat ? "#ef4444" : seat.color} />
                  </mesh>
                </group>
              )
            })}
          </>
        )}

        {/* Player avatars */}
        {otherPlayers
          .filter((p) => {
            const playerIsInSameRoom =
              roomState.currentRoom === p.current_room || (roomState.currentRoom === null && p.current_room === null)
            const hasValidProfile = (p.user_profiles?.username || p.username) ? true : false
            const isAtDefaultPosition = (p.position_x === 0 && p.position_z === 0 && (p.position_y === 0 || p.position_y === 0.5))
            return playerIsInSameRoom && hasValidProfile && !isAtDefaultPosition
          })
          .map((player) => {
            const playerProfile = player.user_profiles
            const avatarStyle = player.avatar_style || { bodyColor: "#ef4444", headColor: "#fbbf24", faceSmiley: "😊" }
            const playerAction = playerActions[player.user_id]

            return (
              <group
                key={player.user_id}
                position={[player.position_x || 0, player.position_y || 0, player.position_z || 0]}
              >
                <RealisticAvatar position={[0, 0, 0]} avatarStyle={avatarStyle} isMoving={false} />

                {worldSettings.showStatusBadges && (
                  <Html position={[0, 2.3, 0]} center depthTest={true} occlude zIndexRange={[0, 0]}>
                    <div className="flex flex-col items-center gap-1 pointer-events-none">
                      <div className="flex items-center gap-1 bg-black/80 px-2 py-1 rounded-full backdrop-blur-sm">
                        <span className="text-white text-xs font-medium">
                          {player.username || playerProfile?.username || "Joueur"}
                        </span>
                        {playerProfile?.is_admin && <Shield className="w-3 h-3 text-red-500" />}
                        {playerProfile?.is_vip_plus && !playerProfile?.is_admin && (
                          <Crown className="w-3 h-3 text-purple-400" />
                        )}
                        {playerProfile?.is_vip && !playerProfile?.is_vip_plus && !playerProfile?.is_admin && (
                          <Star className="w-3 h-3 text-yellow-400" />
                        )}
                      </div>
                      {playerChatBubbles[player.user_id] &&
                        Date.now() - playerChatBubbles[player.user_id].timestamp < 5000 && (
                          <div className="bg-white text-black text-xs px-3 py-1 rounded-lg max-w-[200px] break-words shadow-lg">
                            {playerChatBubbles[player.user_id].message}
                          </div>
                        )}
                      {playerAction && playerAction.action === "emoji" && (
                        <div className="text-4xl animate-bounce">{playerAction.emoji}</div>
                      )}
                    </div>
                  </Html>
                )}
              </group>
            )
          })}

        {!povMode && userProfile && (
          <group position={[myPosition.x, myPosition.y, myPosition.z]}>
            <group rotation={[0, myRotation, 0]}>
              <RealisticAvatar position={[0, 0, 0]} avatarStyle={myAvatarStyle} isMoving={isMoving} />
            </group>

            <Html position={[0, 2.3, 0]} center distanceFactor={10} zIndexRange={[0, 0]}>
              <div className="flex flex-col items-center gap-1 pointer-events-none">
                {worldSettings.showStatusBadges && (
                  <div className="flex items-center gap-1 bg-black/80 px-2 py-1 rounded-full backdrop-blur-sm">
                    <span className="text-white text-xs font-medium">{userProfile.username || "Vous"}</span>
                    {userProfile.is_admin && <Shield className="w-3 h-3 text-red-500" />}
                    {userProfile.is_vip_plus && !userProfile.is_admin && <Crown className="w-3 h-3 text-purple-400" />}
                    {userProfile.is_vip && !userProfile.is_vip_plus && !userProfile.is_admin && (
                      <Star className="w-3 h-3 text-yellow-400" />
                    )}
                  </div>
                )}
                {playerChatBubbles[userProfile.id] &&
                  Date.now() - playerChatBubbles[userProfile.id].timestamp < 5000 && (
                    <div className="bg-white text-black text-xs px-3 py-1 rounded-lg max-w-[200px] break-words shadow-lg">
                      {playerChatBubbles[userProfile.id].message}
                    </div>
                  )}
                {currentEmoji && <div className="text-4xl animate-bounce">{currentEmoji}</div>}
              </div>
            </Html>
          </group>
        )}

        {!povMode && (
          <>
            <CameraFollower
              characterPosition={myPosition}
              orbitControlsRef={orbitControlsRef}
            />
            <OrbitControls
              ref={orbitControlsRef}
              target={[myPosition.x, myPosition.y + 1, myPosition.z]}
              maxPolarAngle={Math.PI / 2.5}
              minDistance={6}
              maxDistance={25}
            />
          </>
        )}
      </Canvas>

      {/* UI Components - Continue in next part */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-4">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="bg-gradient-to-r from-blue-600 to-blue-500 backdrop-blur-lg text-white p-4 rounded-full hover:from-blue-700 hover:to-blue-600 transition-all shadow-2xl border-4 border-white/40 active:scale-95"
        >
          <Menu className="w-8 h-8" />
        </button>

        {showMenu && (
          <div className="absolute top-0 left-20 mt-0 bg-black/95 backdrop-blur-xl rounded-xl p-4 w-80 space-y-3 shadow-2xl border-2 border-white/30">
            <div className="text-white mb-3 pb-3 border-b border-white/20">
              <div className="font-bold text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                {myProfile?.username || "Vous"}
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
                <Users className="w-4 h-4" />
                <span>{onlineCount} en ligne</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSettings(true)
                setShowMenu(false)
              }}
              className="w-full bg-blue-500/90 text-white py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 text-base font-medium transition-colors"
            >
              <Settings className="w-5 h-5" />
              Paramètres
            </button>

            <button
              onClick={() => {
                setShowAvatarCustomizer(true)
                setShowMenu(false)
              }}
              className="w-full bg-purple-500/90 text-white py-3 rounded-lg hover:bg-purple-600 flex items-center justify-center gap-2 text-base font-medium transition-colors"
            >
              <Palette className="w-5 h-5" />
              Avatar
            </button>

            {worldSettings.enableChat && (
              <button
                onClick={() => {
                  setShowChat(true)
                  setShowMenu(false)
                }}
                className="w-full bg-green-500/90 text-white py-3 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 text-base font-medium transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                Chat
              </button>
            )}

            <button
              onClick={() => {
                setShowMap(true)
                setShowMenu(false)
              }}
              className="w-full bg-cyan-500/90 text-white py-3 rounded-lg hover:bg-cyan-600 flex items-center justify-center gap-2 text-base font-medium transition-colors"
            >
              <Map className="w-5 h-5" />
              Carte
            </button>

            <button
              onClick={handleQuitWorld}
              className="w-full bg-gray-600/90 text-white py-3 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2 text-base font-medium transition-colors border-t border-white/20 mt-2 pt-2"
            >
              <LogOut className="w-5 h-5" />
              Quitter
            </button>
          </div>
        )}
      </div>

      {(!isFullscreen || isMobileMode) && (
        <div className="absolute top-4 right-4 z-10 flex gap-3">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="bg-white/20 backdrop-blur-lg text-white p-3 rounded-lg hover:bg-white/30 transition-colors shadow-lg"
            title="Actions rapides"
          >
            <Smile className="w-6 h-6" />
          </button>

          <button
            onClick={handleFullscreen}
            className="bg-white/20 backdrop-blur-lg text-white p-3 rounded-lg hover:bg-white/30 transition-colors shadow-lg"
            title="Mode Immersif"
          >
            <Maximize2 className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Rest of UI continues... */}
      {!isMobileMode && (
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
          ⌨️ Touches ZQSD ou Flèches pour se déplacer
        </div>
      )}

      {isMobileMode && <MobileJoystick onMove={handleJoystickMove} />}

      {showAFKWarning && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-red-600 text-white p-8 rounded-2xl max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">Déconnexion AFK</h2>
            <p className="mb-4">Vous avez été inactif pendant plus de 3 heures.</p>
            <p>Redirection en cours...</p>
          </div>
        </div>
      )}

      {/* Modals will be added in separate files for better organization */}
    </div>
  )
}

function MobileJoystick({ onMove }: { onMove: (dx: number, dz: number) => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    if (isDragging) {
      const animate = () => {
        const maxDistance = 60
        onMove(position.x / maxDistance, position.y / maxDistance)
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      onMove(0, 0)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isDragging, position.x, position.y, onMove])

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true)
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    let dx = clientX - centerX
    let dy = clientY - centerY

    const distance = Math.sqrt(dx * dx + dy * dy)
    const maxDistance = 60

    if (distance > maxDistance) {
      dx = (dx / distance) * maxDistance
      dy = (dy / distance) * maxDistance
    }

    setPosition({ x: dx, y: dy })
  }

  const handleEnd = () => {
    setIsDragging(false)
    setPosition({ x: 0, y: 0 })
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-24 left-8 w-36 h-36 bg-white/20 backdrop-blur-lg rounded-full z-20 md:hidden border-4 border-white/30"
      onTouchStart={(e) => {
        e.preventDefault()
        handleStart(e.touches[0].clientX, e.touches[0].clientY)
      }}
      onTouchMove={(e) => {
        e.preventDefault()
        if (isDragging) handleMove(e.touches[0].clientX, e.touches[0].clientY)
      }}
      onTouchEnd={handleEnd}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => isDragging && handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      <div
        className="absolute w-14 h-14 bg-white/60 rounded-full top-1/2 left-1/2 shadow-lg transition-transform"
        style={{
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-white/50 text-xs font-medium">
        Déplacer
      </div>
    </div>
  )
}
                  