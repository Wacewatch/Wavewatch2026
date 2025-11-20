"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Sky, Html, PerspectiveCamera } from "@react-three/drei"
import { useEffect, useRef, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
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
import { useRouter } from "next/navigation" // Assuming router is needed for navigation

// Initialize Supabase client
const supabase = createClient()

interface WorldProps {
  userId: string
  userProfile: any
}

interface InteractiveWorldProps {
  userId: string
  userProfile: any
}

// RealisticAvatar is only used inside Canvas
function RealisticAvatarComponent({
  position,
  avatarStyle,
  isMoving,
}: {
  position: [number, number, number]
  avatarStyle: {
    bodyColor?: string
    headColor?: string
    skinTone?: string
    hairStyle?: string
    hairColor?: string
    accessory?: string
    faceSmiley?: string
  }
  isMoving: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [time, setTime] = useState(0)

  const style = {
    bodyColor: avatarStyle?.bodyColor || "#3b82f6",
    headColor: avatarStyle?.headColor || "#fbbf24",
    skinTone: avatarStyle?.skinTone || avatarStyle?.headColor || "#fbbf24",
    hairStyle: avatarStyle?.hairStyle || "short",
    hairColor: avatarStyle?.hairColor || "#1f2937",
    accessory: avatarStyle?.accessory || "none",
    faceSmiley: avatarStyle?.faceSmiley || "😊",
  }

  // The useFrame hook must be called at the top level of the component, not inside a conditional block.
  // Moved useFrame outside of the try-catch block and into the main component body.
  useFrame((state, delta) => {
    if (isMoving && groupRef.current) {
      setTime((t) => t + delta * 5)
      // Animate legs walking
      const leftLeg = groupRef.current.children[3]
      const rightLeg = groupRef.current.children[4]
      if (leftLeg) leftLeg.rotation.x = Math.sin(time) * 0.5
      if (rightLeg) rightLeg.rotation.x = Math.sin(time + Math.PI) * 0.5

      // Animate arms swinging
      const leftArm = groupRef.current.children[1]
      const rightArm = groupRef.current.children[2]
      if (leftArm) leftArm.rotation.x = Math.sin(time + Math.PI) * 0.3
      if (rightArm) rightArm.rotation.x = Math.sin(time) * 0.3
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Torso - height divided by 2 */}
      <mesh castShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[0.5, 0.6, 0.3]} />
        <meshStandardMaterial color={style.bodyColor} />
      </mesh>

      {/* Head */}
      <mesh castShadow position={[0, 1.8, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color={style.skinTone} />
      </mesh>

      {/* Hair */}
      {style.hairStyle === "short" && (
        <mesh castShadow position={[0, 2.05, 0]}>
          <boxGeometry args={[0.42, 0.15, 0.42]} />
          <meshStandardMaterial color={style.hairColor} />
        </mesh>
      )}
      {style.hairStyle === "long" && (
        <>
          <mesh castShadow position={[0, 2.05, 0]}>
            <boxGeometry args={[0.42, 0.15, 0.42]} />
            <meshStandardMaterial color={style.hairColor} />
          </mesh>
          <mesh castShadow position={[0, 1.7, 0.2]}>
            <boxGeometry args={[0.42, 0.4, 0.1]} />
            <meshStandardMaterial color={style.hairColor} />
          </mesh>
        </>
      )}

      {/* Left Arm */}
      <mesh castShadow position={[-0.35, 1.2, 0]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color={style.skinTone} />
      </mesh>

      {/* Right Arm */}
      <mesh castShadow position={[0.35, 1.2, 0]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color={style.skinTone} />
      </mesh>

      {/* Left Leg */}
      <mesh castShadow position={[-0.15, 0.65, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color={style.bodyColor} />
      </mesh>

      {/* Right Leg */}
      <mesh castShadow position={[0.15, 0.65, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color={style.bodyColor} />
      </mesh>

      {/* Face Smiley */}
      <Html
        position={[0, 1.8, 0.21]}
        center
        distanceFactor={1}
        style={{
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <div className="text-2xl">{style.faceSmiley}</div>
      </Html>

      {/* Accessory */}
      {style.accessory === "hat" && (
        <mesh castShadow position={[0, 2.25, 0]}>
          <cylinderGeometry args={[0.25, 0.3, 0.15, 16]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      )}
      {style.accessory === "glasses" && (
        <mesh position={[0, 1.85, 0.22]}>
          <boxGeometry args={[0.35, 0.08, 0.02]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      )}
    </group>
  )
}

function RealisticTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Trunk with texture */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.35, 3, 12]} />
        <meshStandardMaterial color="#6b4423" roughness={1} metalness={0} />
      </mesh>

      {/* Foliage layers */}
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
}

function RealisticLamppost({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.2, 8]} />
        <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Pole */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 5, 12]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Lamp holder */}
      <mesh position={[0, 4.8, 0.3]} castShadow>
        <boxGeometry args={[0.2, 0.3, 0.8]} />
        <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Light bulb */}
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

      {/* Light */}
      <pointLight position={[0, 4.6, 0.3]} intensity={3} distance={15} color="#fbbf24" castShadow />
    </group>
  )
}

export default function InteractiveWorld({ userId, userProfile }: InteractiveWorldProps) {
  const router = useRouter() // Initialize router
  const [myProfile, setMyProfile] = useState<any>(null)
  const [otherPlayers, setOtherPlayers] = useState<any[]>([])
  const [onlineCount, setOnlineCount] = useState(0)
  const [myPosition, setMyPosition] = useState({ x: 0, y: 0.5, z: 0 })
  const [myRotation, setMyRotation] = useState(0) // State for player rotation
  const [myAvatarStyle, setMyAvatarStyle] = useState({
    bodyColor: "#3b82f6",
    headColor: "#fbbf24",
    hairStyle: "short",
    hairColor: "#1f2937",
    skinTone: "#fbbf24",
    accessory: "none",
    faceSmiley: "😊", // Added default face smiley
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
  const [showCinema, setShowCinema] = useState(false) // State for cinema modal
  const [showUserCard, setShowUserCard] = useState(false)
  const [currentCinemaRoom, setCurrentCinemaRoom] = useState<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [roomMessages, setRoomMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState("")
  const [cinemaRooms, setCinemaRooms] = useState<any[]>([])
  const [cinemaSeats, setCinemaSeats] = useState<any[]>([])
  const [mySeat, setMySeat] = useState<number | null>(null)
  const [isSeatsLocked, setIsSeatsLocked] = useState(false)
  const [playerChatBubbles, setPlayerChatBubbles] = useState<Record<string, { message: string; timestamp: number }>>({})

  // Map state
  const [showMap, setShowMap] = useState(false)
  const [arcadeMachines, setArcadeMachines] = useState<any[]>([])
  const [showArcade, setShowArcade] = useState(false)
  const [currentArcadeMachine, setCurrentArcadeMachine] = useState<any>(null)
  const [stadium, setStadium] = useState<any>(null)
  const [showStadium, setShowStadium] = useState(false)
  const [showMovieFullscreen, setShowMovieFullscreen] = useState(false)
  const [showMenu, setShowMenu] = useState(false) // Added this state

  const [currentRoom, setCurrentRoom] = useState<string | null>(null)

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

  const [countdown, setCountdown] = useState<string>("")

  // Synchronized actions state
  const [playerActions, setPlayerActions] = useState<Record<string, { action: string; timestamp: number }>>({})
  const [quickAction, setQuickAction] = useState<string | null>(null) // State for current quick action animation
  const keysPressed = useRef<Set<string>>(new Set()) // Ref for tracking pressed keys

  const isMoving = movement.x !== 0 || movement.z !== 0

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
      console.log("[v0] Mobile mode:", isMobileMode, "Control mode:", controlMode)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    window.addEventListener("orientationchange", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("orientationchange", checkMobile)
    }
  }, [controlMode, isMobileMode])

  const [lastActivity, setLastActivity] = useState(Date.now())
  const [showAFKWarning, setShowAFKWarning] = useState(false)

  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now())
      setShowAFKWarning(false)
    }

    const events = ["mousedown", "mousemove", "keydown", "touchstart", "touchmove", "wheel"]
    events.forEach((event) => window.addEventListener(event, updateActivity))

    const checkAFK = setInterval(() => {
      const inactiveTime = Date.now() - lastActivity
      const threeHours = 3 * 60 * 60 * 1000 // 3 hours in milliseconds

      if (inactiveTime > threeHours) {
        setShowAFKWarning(true)
        // Disconnect user
        supabase
          .from("interactive_profiles")
          .update({ is_online: false, last_seen: new Date().toISOString() })
          .eq("user_id", userId)
          .then(() => {
            console.log("[v0] User disconnected due to AFK")
            window.location.href = "/"
          })
      }
    }, 60000) // Check every minute

    return () => {
      events.forEach((event) => window.removeEventListener(event, updateActivity))
      clearInterval(checkAFK)
    }
  }, [lastActivity, userId])

  const checkCollision = (newX: number, newZ: number): boolean => {
    // Collision zones for objects in the world
    const collisionZones = [
      // Buildings in main world (only check if NOT in a room)
      currentRoom === null && { x: 15, z: 0, width: 9, depth: 9 },
      currentRoom === null && { x: -15, z: -15, width: 5, depth: 5 },
      currentRoom === null && { x: -15, z: 5, width: 5, depth: 4 },
      currentRoom === null && { x: -15, z: -8, width: 4, depth: 4 },
      currentRoom === null && { x: -25, z: 0, width: 8, depth: 8 },
      currentRoom === null && { x: 25, z: -10, width: 10, depth: 10 },
      currentRoom === null && { x: -20, z: 15, width: 9, depth: 9 },
      currentRoom === null && { x: 20, z: 10, width: 7, depth: 7 },
      currentRoom === null && { x: 0, z: 25, width: 12, depth: 12 },

      // Trees
      currentRoom === null && { x: -15, z: -15, width: 2, depth: 2 },
      currentRoom === null && { x: -8, z: -18, width: 2, depth: 2 },
      currentRoom === null && { x: 8, z: -18, width: 2, depth: 2 },
      currentRoom === null && { x: 15, z: -15, width: 2, depth: 2 },
      currentRoom === null && { x: -18, z: 10, width: 2, depth: 2 },
      currentRoom === null && { x: 18, z: 10, width: 2, depth: 2 },
      currentRoom === null && { x: -10, z: 15, width: 2, depth: 2 },
      currentRoom === null && { x: 10, z: 15, width: 2, depth: 2 },

      // Lampposts
      currentRoom === null && { x: -20, z: -10, width: 1, depth: 1 },
      currentRoom === null && { x: -20, z: 0, width: 1, depth: 1 },
      currentRoom === null && { x: -20, z: 10, width: 1, depth: 1 },

      // Fountain
      currentRoom === null && { x: -15, z: 0, width: 6, depth: 6 },

      // Bushes
      currentRoom === null && { x: 5, z: -10, width: 2, depth: 2 },
      currentRoom === null && { x: -5, z: -10, width: 2, depth: 2 },
      currentRoom === null && { x: 10, z: 5, width: 2, depth: 2 },
      currentRoom === null && { x: -10, z: 5, width: 2, depth: 2 },
      currentRoom === null && { x: 12, z: -5, width: 2, depth: 2 },
      currentRoom === null && { x: -12, z: -5, width: 2, depth: 2 },

      // Arcade Room boundaries (if player is inside)
      currentRoom === "arcade" && { x: 0, z: 0, width: 50, depth: 40 },
      // Stadium Room (if player is inside)
      currentRoom === "stadium" && { x: 0, z: 0, width: 60, depth: 40 },
    ].filter(Boolean) // Filter out null values from the conditional zones

    for (const zone of collisionZones) {
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

  useEffect(() => {
    const loadWorldSettings = async () => {
      const { data, error } = await supabase
        .from("interactive_world_settings")
        .select("setting_value")
        .eq("setting_key", "world_config")
        .maybeSingle()

      if (data && data.setting_value) {
        console.log("[v0] Loaded world settings:", data.setting_value)
        setWorldSettings(data.setting_value as any)
      }
    }

    loadWorldSettings()
  }, [])

  useEffect(() => {
    const loadPlayers = async () => {
      console.log("[v0] Loading other players...")

      try {
        const { data: profiles, error: profilesError } = await supabase
          .from("interactive_profiles")
          .select("*")
          .eq("is_online", true)
          .neq("user_id", userId)

        if (profilesError) {
          console.error("[v0] Error loading profiles:", profilesError)
          return
        }

        console.log("[v0] Found profiles:", profiles?.length || 0)

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

          console.log("[v0] Merged player data:", mergedData.length)
          setOtherPlayers(mergedData)
          setOnlineCount(mergedData.length + 1)
        } else {
          setOtherPlayers([])
          setOnlineCount(1)
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
          console.log("[v0] Player data changed, reloading...")
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

  useEffect(() => {
    const loadArcadeMachines = async () => {
      const { data } = await supabase.from("retrogaming_sources").select("*").eq("is_active", true).order("name")

      if (data) setArcadeMachines(data)
    }

    loadArcadeMachines()
  }, [])

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

  useEffect(() => {
    // Seats are never locked anymore
    setIsSeatsLocked(false)
  }, [currentCinemaRoom])

  useEffect(() => {
    if (!currentCinemaRoom || currentCinemaRoom === "world") return

    const room = cinemaRooms.find((r) => r.id === currentCinemaRoom.id) // Use currentCinemaRoom directly
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
    }, 1000)

    return () => clearInterval(interval)
  }, [currentCinemaRoom, cinemaRooms]) // Added currentCinemaRoom to dependencies

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
        console.log("[v0] Loaded customization options:", data.length)
        setCustomizationOptions(data)
      }
    }

    loadCustomizationOptions()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // if (isSeatsLocked && mySeat !== null) return // Removed seat lock check
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
  }, [isSeatsLocked, mySeat]) // isSeatsLocked is now effectively unused

  useEffect(() => {
    const interval = setInterval(() => {
      // if (isSeatsLocked && mySeat !== null) return // Removed seat lock check

      let dx = 0
      let dz = 0
      const speed = 0.15

      if (keysPressed.current.has("w") || keysPressed.current.has("arrowup")) dz -= speed
      if (keysPressed.current.has("s") || keysPressed.current.has("arrowdown")) dz += speed
      if (keysPressed.current.has("a") || keysPressed.current.has("arrowleft")) dx -= speed
      if (keysPressed.current.has("d") || keysPressed.current.has("arrowright")) dx += speed

      if (dx !== 0 || dz !== 0) {
        setMovement({ x: dx, z: dz })
        setMyPosition((prev) => {
          const newX = Math.max(-20, Math.min(20, prev.x + dx))
          const newZ = Math.max(-20, Math.min(20, prev.z + dz))

          if (checkCollision(newX, newZ)) {
            return prev // Don't move if collision detected
          }

          const newPos = {
            x: newX,
            y: 0.5,
            z: newZ,
          }

          supabase
            .from("interactive_profiles")
            .update({
              position_x: newPos.x,
              position_y: newPos.y,
              position_z: newPos.z,
            })
            .eq("user_id", userId)
            .then()

          return newPos
        })
      } else {
        setMovement({ x: 0, z: 0 })
      }
    }, 50)

    return () => clearInterval(interval)
  }, [userId, isSeatsLocked, mySeat]) // isSeatsLocked is now effectively unused

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

  useEffect(() => {
    const loadCinemaRooms = async () => {
      const { data } = await supabase
        .from("interactive_cinema_rooms")
        .select("*")
        .eq("is_open", true)
        .order("room_number")

      if (data) setCinemaRooms(data)
    }

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
  }, [])

  useEffect(() => {
    if (!currentCinemaRoom) return

    const loadSeats = async () => {
      const { data } = await supabase.from("interactive_cinema_seats").select("*").eq("room_id", currentCinemaRoom.id)

      if (data) setCinemaSeats(data)
    }

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
  }, [currentCinemaRoom])

  useEffect(() => {
    if (!currentCinemaRoom) return

    const loadRoomMessages = async () => {
      const { data } = await supabase
        .from("interactive_chat_messages")
        .select("*")
        .eq("room", `cinema_${currentCinemaRoom.id}`)
        .order("created_at", { ascending: false })
        .limit(50)

      if (data) setRoomMessages(data.reverse())
    }

    loadRoomMessages()

    const channel = supabase
      .channel(`chat_cinema_${currentCinemaRoom.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "interactive_chat_messages",
          filter: `room=eq.cinema_${currentCinemaRoom.id}`,
        },
        (payload) => {
          setRoomMessages((prev) => [...prev, payload.new])
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
  }, [currentCinemaRoom])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setPlayerChatBubbles((prev) => {
        const updated = { ...prev }
        Object.keys(updated).forEach((key) => {
          if (now - updated[key].timestamp > 5000) {
            delete updated[key]
          }
        })
        return updated
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleEmoji = (emoji: string) => {
    if (!userProfile) {
      console.log("[v0] Cannot send emoji: userProfile is null")
      return
    }

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
    if (!userProfile) {
      console.log("[v0] Cannot jump: userProfile is null")
      return
    }

    setIsJumping(true)

    // Broadcast jump action to other players
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
    if (!userProfile || !userProfile.id) {
      console.log("[v0] Cannot send message: userProfile is missing")
      return
    }

    if (!worldSettings.enableChat) {
      console.log("[v0] Chat is disabled by admin")
      return
    }

    if (chatInput.trim()) {
      const message = {
        user_id: userProfile.id, // Use id instead of user_id
        username: myProfile?.username || userProfile.username || "Joueur",
        message: chatInput.trim(),
        room: currentCinemaRoom ? `cinema_${currentCinemaRoom.id}` : "world",
        created_at: new Date().toISOString(),
      }

      console.log("[v0] Sending message:", message)

      const { error } = await supabase.from("interactive_chat_messages").insert(message)

      if (error) {
        console.error("[v0] Error sending message:", error)
      } else {
        console.log("[v0] Message sent successfully")
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
      // if (isSeatsLocked && mySeat !== null) return // Removed seat lock check

      setMyPosition((prev) => {
        const speed = 0.15
        const newX = Math.max(-20, Math.min(20, prev.x + dx * speed))
        const newZ = Math.max(-20, Math.min(20, prev.z + dz * speed))

        if (checkCollision(newX, newZ)) {
          return prev // Don't move if collision detected
        }

        const newPos = {
          x: newX,
          y: 0.5,
          z: newZ,
        }

        supabase
          .from("interactive_profiles")
          .update({
            position_x: newPos.x,
            position_y: newPos.y,
            position_z: newPos.z,
          })
          .eq("user_id", userId)
          .then()

        return newPos
      })

      if (dx !== 0 || dz !== 0) {
        setMovement({ x: dx, z: dz })
      } else {
        setMovement({ x: 0, z: 0 })
      }
    },
    [userId, supabase, isSeatsLocked, mySeat],
  ) // isSeatsLocked and mySeat are now effectively unused here

  const handleEnterArcade = () => {
    setShowArcade(false)
    setCurrentCinemaRoom(null)
    setCurrentRoom("arcade") // Set local state immediately

    // Teleport player to arcade room
    const arcadePos = { x: 0, y: 0.5, z: 0 } // Center of arcade room
    setMyPosition(arcadePos)

    // Update position in database
    supabase
      .from("interactive_profiles")
      .update({
        position_x: arcadePos.x,
        position_y: arcadePos.y,
        position_z: arcadePos.z,
        current_room: "arcade",
      })
      .eq("user_id", userId)
      .then(() => console.log("[v0] Teleported to arcade room"))
  }

  const handleLeaveArcade = () => {
    const mainPos = { x: 0, y: 0.5, z: 0 }
    setMyPosition(mainPos)
    setCurrentRoom(null) // Clear local state

    supabase
      .from("interactive_profiles")
      .update({
        position_x: mainPos.x,
        position_y: mainPos.y,
        position_z: mainPos.z,
        current_room: null,
      })
      .eq("user_id", userId)
      .then(() => console.log("[v0] Left arcade room"))
  }

  const handleSelectArcadeMachine = (machine: any) => {
    setCurrentArcadeMachine(machine)
    setShowArcade(false) // Close the list of machines
  }

  const handleCloseArcadeMachine = () => {
    setCurrentArcadeMachine(null)
  }

  const handleEnterCinemaRoom = async (room: any) => {
    setCurrentCinemaRoom(room)
    setShowCinema(false)

    setMyPosition({ x: 0, y: 0.5, z: 0 })

    await supabase
      .from("interactive_profiles")
      .update({
        current_room: `cinema_${room.id}`,
        position_x: 0,
        position_y: 0.5,
        position_z: 0,
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
  }

  const handleLeaveRoom = async () => {
    if (mySeat) {
      await supabase.from("interactive_cinema_seats").delete().eq("room_id", currentCinemaRoom.id).eq("user_id", userId)
      setMySeat(null)
    }

    setCurrentCinemaRoom(null)
    setIsSeatsLocked(false) // Ensure seats are unlocked when leaving
    setCountdown("") // Clear countdown when leaving room

    setMyPosition({ x: 0, y: 0.5, z: 0 }) // Reset position to world origin

    await supabase
      .from("interactive_profiles")
      .update({
        current_room: null,
        position_x: 0,
        position_y: 0.5,
        position_z: 0,
      })
      .eq("user_id", userId)
  }

  const handleSitInAnySeat = async () => {
    if (!currentCinemaRoom) return

    // Find first available seat (not occupied by anyone)
    const occupiedSeats = cinemaSeats.filter((s) => s.user_id && s.user_id !== userId)
    const availableSeat = cinemaSeats.find((s) => !occupiedSeats.find((os) => os.seat_number === s.seat_number))

    if (!availableSeat) {
      console.log("[v0] No available seats")
      return
    }

    await handleSitInSeat(availableSeat.seat_number)
  }

  const handleSitInSeat = async (seatNumber: number) => {
    // if (isSeatsLocked && mySeat !== null && mySeat !== seatNumber) { // Removed seat lock check
    //   return
    // }

    if (mySeat === seatNumber) {
      // Stand up
      await supabase.from("interactive_cinema_seats").delete().eq("room_id", currentCinemaRoom.id).eq("user_id", userId)

      setMySeat(null)
      setMyPosition({ x: 0, y: 0.5, z: 0 }) // Reset position to world origin
    } else {
      // Sit down - Calculate position based on seat number
      // Get the seat data from the generatedSeats array
      const seatData = cinemaSeats.find((s) => s.seat_number === seatNumber)
      if (!seatData) return // Should not happen if cinemaSeats is populated correctly

      const { error } = await supabase.from("interactive_cinema_seats").upsert({
        room_id: currentCinemaRoom.id,
        user_id: userId,
        seat_number: seatNumber,
        row_number: seatData.row_number,
        is_occupied: true,
        // Add a default color if not specified
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
    if (!stadium) return
    setShowStadium(false)
    setCurrentCinemaRoom(null)
    setCurrentRoom("stadium") // Set local state immediately

    // Teleport player to stadium viewing position
    const stadiumPos = { x: 0, y: 0.5, z: 10 } // Center position facing the screen
    setMyPosition(stadiumPos)

    // Update position in database
    supabase
      .from("interactive_profiles")
      .update({
        position_x: stadiumPos.x,
        position_y: stadiumPos.y,
        position_z: stadiumPos.z,
        current_room: "stadium",
      })
      .eq("user_id", userId)
      .then(() => console.log("[v0] Teleported to stadium"))
  }

  const handleLeaveStadium = () => {
    const mainPos = { x: 0, y: 0.5, z: 0 }
    setMyPosition(mainPos)
    setCurrentRoom(null) // Clear local state

    supabase
      .from("interactive_profiles")
      .update({
        position_x: mainPos.x,
        position_y: mainPos.y,
        position_z: mainPos.z,
        current_room: null,
      })
      .eq("user_id", userId)
      .then(() => console.log("[v0] Left stadium"))
  }

  useEffect(() => {
    const checkCapacity = async () => {
      const { count } = await supabase
        .from("interactive_profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_online", true)

      if (count && count >= worldSettings.maxCapacity) {
        console.log("[v0] World is at max capacity:", count, "/", worldSettings.maxCapacity)
        // Could show a message to user here
      }
    }

    checkCapacity()
  }, [worldSettings.maxCapacity])

  useEffect(() => {
    const channel = supabase
      .channel("world-actions")
      .on("broadcast", { event: "player-action" }, (payload: any) => {
        if (payload.userId && payload.userId !== userId) {
          // Handle actions like jump and emoji
          setPlayerActions((prev) => ({
            ...prev,
            [payload.userId]: {
              action: payload.action,
              timestamp: Date.now(),
              ...(payload.action === "emoji" && { emoji: payload.emoji }), // Include emoji if it's an emoji action
            },
          }))

          // Clear the action after a duration
          setTimeout(
            () => {
              setPlayerActions((prev) => {
                const newActions = { ...prev }
                delete newActions[payload.userId]
                return newActions
              })
            },
            payload.action === "emoji" ? 3000 : 2000,
          ) // Emojis last longer
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const broadcastAction = async (action: string) => {
    console.log("[v0] Broadcasting action:", action)
    await supabase.channel("player-actions").send({
      type: "broadcast",
      event: "action",
      payload: { userId: userId, action }, // Use userId from props
    })
  }

  // Handle quick actions (emotes, jumps)
  const handleQuickAction = (action: string) => {
    if (!userProfile) {
      console.log("[v0] Cannot perform quick action: userProfile is null")
      return
    }

    setQuickAction(action)
    setShowQuickActions(false)

    // Broadcast quick action to other players
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

  useEffect(() => {
    if (!userId) return

    const loadMyProfile = async () => {
      const { data, error } = await supabase.from("interactive_profiles").select("*").eq("user_id", userId).single()

      if (error) {
        console.error("[v0] Error loading my profile:", error)
        return
      }

      console.log("[v0] Loaded my profile:", data)
      setMyProfile(data)

      if (data) {
        setMyPosition({ x: data.position_x, y: data.position_y, z: data.position_z })
        setMyRotation(data.rotation || 0)
        setCurrentRoom(data.current_room) // Initialize local currentRoom state
      }
    }

    loadMyProfile()
  }, [userId])

  const handleQuitWorld = async () => {
    // Save current position
    await supabase
      .from("interactive_profiles")
      .update({
        position_x: myPosition.x,
        position_y: myPosition.y,
        position_z: myPosition.z,
      })
      .eq("user_id", userId)

    // Redirect to home
    router.push("/")
  }

  return (
    <div className="relative w-full h-screen">
      <Canvas
        // Pass povMode to camera
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

        {/* Update rendering logic to use currentRoom state instead of userProfile */}
        {!currentCinemaRoom && currentRoom !== "stadium" && currentRoom !== "arcade" ? (
          <>
            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[60, 60]} />
              <meshStandardMaterial color="#4ade80" roughness={0.95} metalness={0} />
            </mesh>

            {/* Arcade building - was Arcade Building - Now OPEN */}
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

            {/* Stadium building - was Stadium Building - Now OPEN */}
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

            <group position={[15, 0, -5]}>
              {/* Building */}
              <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[6, 5, 5]} />
                <meshStandardMaterial color="#9333ea" />
              </mesh>
              {/* Roof */}
              <mesh position={[0, 5.2, 0]} castShadow>
                <coneGeometry args={[4, 1.5, 4]} />
                <meshStandardMaterial color="#7e22ce" />
              </mesh>
              {/* Sign */}
              <Html position={[0, 4, 2.6]} center depthTest={true} occlude zIndexRange={[0, 0]}>
                <div className="bg-yellow-400 text-purple-900 px-6 py-3 rounded-lg font-bold text-center shadow-xl border-4 border-purple-900">
                  <div className="text-xl">🕹️ ARCADE 🕹️</div>
                  <div className="text-sm mt-1">Ouverture Prochainement</div>
                </div>
              </Html>
            </group>

            {/* Additional decorative buildings */}
            <group position={[-15, 0, 5]}>
              <mesh position={[0, 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[5, 4, 4]} />
                <meshStandardMaterial color="#0ea5e9" />
              </mesh>
              <mesh position={[0, 4.5, 0]} castShadow>
                <boxGeometry args={[5.2, 1, 4.2]} />
                <meshStandardMaterial color="#0284c7" />
              </mesh>
            </group>

            <group position={[-15, 0, -8]}>
              <mesh position={[0, 3, 0]} castShadow receiveShadow>
                <boxGeometry args={[4, 6, 4]} />
                <meshStandardMaterial color="#f59e0b" />
              </mesh>
              <mesh position={[0, 6.5, 0]} castShadow>
                <coneGeometry args={[3, 1.5, 4]} />
                <meshStandardMaterial color="#ea580c" />
              </mesh>
            </group>

            {/* Cinema Building */}
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

              {[-2, 0, 2].map((x) => (
                <mesh key={`window-${x}`} position={[x, 3, 4.1]}>
                  <planeGeometry args={[1.5, 1.8]} />
                  <meshStandardMaterial
                    color="#60a5fa"
                    emissive="#60a5fa"
                    emissiveIntensity={0.5}
                    metalness={0.8}
                    roughness={0.1}
                  />
                </mesh>
              ))}

              <mesh position={[-3, 1.2, 4.1]} castShadow>
                <boxGeometry args={[1.5, 2.4, 0.1]} />
                <meshStandardMaterial color="#7c2d12" roughness={0.8} metalness={0.1} />
              </mesh>
              <mesh position={[-3, 1.2, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
              </mesh>

              <mesh position={[-3, 0.1, 5.5]}>
                <boxGeometry args={[2, 0.2, 2]} />
                <meshStandardMaterial color="#6b7280" roughness={0.9} metalness={0} />
              </mesh>

              <Html position={[0, 7, 0]} center depthTest={true} occlude zIndexRange={[0, 0]}>
                <button
                  onClick={() => setShowCinema(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 whitespace-nowrap shadow-2xl font-bold flex items-center gap-2 transform hover:scale-105 transition-transform"
                >
                  🎬 Cinéma
                </button>
              </Html>
            </group>

            {/* Additional decorative closed buildings */}
            <group position={[-15, 0, 5]}>
              <mesh position={[0, 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[5, 4, 4]} />
                <meshStandardMaterial color="#0ea5e9" />
              </mesh>
              <mesh position={[0, 4.5, 0]} castShadow>
                <boxGeometry args={[5.2, 1, 4.2]} />
                <meshStandardMaterial color="#0284c7" />
              </mesh>
            </group>

            <group position={[-15, 0, -8]}>
              <mesh position={[0, 3, 0]} castShadow receiveShadow>
                <boxGeometry args={[4, 6, 4]} />
                <meshStandardMaterial color="#f59e0b" />
              </mesh>
              <mesh position={[0, 6.5, 0]} castShadow>
                <coneGeometry args={[3, 1.5, 4]} />
                <meshStandardMaterial color="#ea580c" />
              </mesh>
            </group>

            {(graphicsQuality === "low"
              ? [
                  [-15, -15],
                  [15, -15],
                ]
              : [
                  [-15, -15],
                  [-8, -18],
                  [8, -18],
                  [15, -15],
                  [-18, 10],
                  [18, 10],
                  [-10, 15],
                  [10, 15],
                ]
            ).map(([x, z], i) => (
              <RealisticTree key={`tree-${i}`} position={[x, 0, z]} />
            ))}

            {(graphicsQuality === "low"
              ? [[0, -10]]
              : [
                  [-10, -10],
                  [0, -10],
                  [10, -10],
                  [-10, 10],
                  [10, 10],
                ]
            ).map((z, i) => (
              <RealisticLamppost key={`lamp-${i}`} position={[-20, 0, z[1]]} />
            ))}

            {graphicsQuality !== "low" &&
              [-12, 0, 12].map((z) => (
                <group key={`bench-${z}`} position={[-18, 0, z]}>
                  <mesh position={[0, 0.4, 0]} castShadow>
                    <boxGeometry args={[2, 0.1, 0.8]} />
                    <meshStandardMaterial color="#8b4513" roughness={0.9} />
                  </mesh>
                  <mesh position={[-0.8, 0.2, 0]} castShadow>
                    <boxGeometry args={[0.1, 0.4, 0.8]} />
                    <meshStandardMaterial color="#6b4423" roughness={0.9} />
                  </mesh>
                  <mesh position={[0.8, 0.2, 0]} castShadow>
                    <boxGeometry args={[0.1, 0.4, 0.8]} />
                    <meshStandardMaterial color="#6b4423" roughness={0.9} />
                  </mesh>
                </group>
              ))}

            {graphicsQuality !== "low" &&
              [
                [5, -10],
                [-5, -10],
                [10, 5],
                [-10, 5],
                [12, -5],
                [-12, -5],
              ].map(([x, z], i) => (
                <group key={`bush-${i}`} position={[x, 0, z]}>
                  <mesh position={[0, 0.5, 0]} castShadow>
                    <sphereGeometry args={[0.8, 8, 8]} />
                    <meshStandardMaterial color="#2d5016" roughness={0.95} />
                  </mesh>
                  <mesh position={[0.4, 0.6, 0.3]} castShadow>
                    <sphereGeometry args={[0.5, 8, 8]} />
                    <meshStandardMaterial color="#3a6b1e" roughness={0.95} />
                  </mesh>
                </group>
              ))}
          </>
        ) : currentRoom === "arcade" ? (
          <>
            {/* Arcade Room Interior */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
              <planeGeometry args={[50, 40]} />
              <meshStandardMaterial color="#2d1b4e" />
            </mesh>

            {/* Walls */}
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

            {/* Ceiling with neon lights */}
            <mesh position={[0, 10, 0]}>
              <boxGeometry args={[50, 0.5, 40]} />
              <meshStandardMaterial color="#0f0a1e" />
            </mesh>

            {/* Neon strip lights */}
            {[-15, -5, 5, 15].map((x) => (
              <group key={x} position={[x, 9.5, 0]}>
                <mesh>
                  <boxGeometry args={[1, 0.2, 35]} />
                  <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={2} />
                </mesh>
                <pointLight position={[0, 0, 0]} intensity={3} distance={15} color="#ff00ff" />
              </group>
            ))}

            {/* Arcade Machines - arranged in rows */}
            {arcadeMachines.slice(0, 12).map((machine, idx) => {
              const row = Math.floor(idx / 4)
              const col = idx % 4
              const x = -15 + col * 10
              const z = -10 + row * 10

              return (
                <group key={machine.id} position={[x, 0, z]}>
                  {/* Machine Cabinet */}
                  <mesh position={[0, 1.5, 0]} castShadow>
                    <boxGeometry args={[2.5, 3, 1.5]} />
                    <meshStandardMaterial
                      color={["#e11d48", "#8b5cf6", "#0ea5e9", "#f59e0b"][idx % 4]}
                      roughness={0.3}
                      metalness={0.7}
                    />
                  </mesh>

                  {/* Screen */}
                  <mesh position={[0, 2, 0.76]}>
                    <planeGeometry args={[2, 1.5]} />
                    <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
                  </mesh>

                  {/* Control Panel */}
                  <mesh position={[0, 0.8, 1]} rotation={[-Math.PI / 6, 0, 0]}>
                    <boxGeometry args={[2.3, 0.3, 0.8]} />
                    <meshStandardMaterial color="#1a1a1a" />
                  </mesh>

                  {/* Machine name label */}
                  <Html position={[0, 3.5, 0]} center>
                    <div className="bg-black/80 text-white px-3 py-1 rounded text-sm font-bold whitespace-nowrap">
                      {machine.name}
                    </div>
                  </Html>

                  {/* Interaction button */}
                  <Html position={[0, 0.5, 1.5]} center>
                    <button
                      onClick={() => handleSelectArcadeMachine(machine)}
                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-bold transform hover:scale-110 transition-all shadow-lg"
                    >
                      🎮 Jouer
                    </button>
                  </Html>

                  {/* Light above machine */}
                  <pointLight position={[0, 4, 0]} intensity={1.5} distance={8} color="#ff00ff" />
                </group>
              )
            })}

            {/* Exit door at back */}
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

            {/* Button to show all machines list */}
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
        ) : currentRoom === "stadium" ? (
          <>
            {/* Stadium Interior - Proper football stadium */}
            {/* Field */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
              <planeGeometry args={[60, 40]} />
              <meshStandardMaterial color="#1c7430" />
            </mesh>

            {/* Field lines */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <planeGeometry args={[58, 38]} />
              <meshStandardMaterial color="#ffffff" opacity={0.1} transparent />
            </mesh>

            {/* Center circle */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
              <ringGeometry args={[8, 8.2, 64]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>

            {/* Goals */}
            {[-15, 15].map((z, idx) => (
              <group key={idx} position={[0, 0, z]}>
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

            {/* Stadium walls and stands */}
            {[
              { x: 0, z: -25, rot: 0, w: 70, h: 15 },
              { x: 0, z: 25, rot: Math.PI, w: 70, h: 15 },
              { x: -35, z: 0, rot: Math.PI / 2, w: 60, h: 15 },
              { x: 35, z: 0, rot: -Math.PI / 2, w: 60, h: 15 },
            ].map((wall, idx) => (
              <group key={idx} position={[wall.x, 0, wall.z]} rotation={[0, wall.rot, 0]}>
                {/* Stadium structure */}
                <mesh position={[0, wall.h / 2, 0]}>
                  <boxGeometry args={[wall.w, wall.h, 2]} />
                  <meshStandardMaterial color="#2d4a3e" />
                </mesh>

                {/* Seating rows */}
                {[0, 1, 2, 3, 4].map((row) => (
                  <mesh key={row} position={[0, 3 + row * 2, -1 - row * 0.5]}>
                    <boxGeometry args={[wall.w - 2, 0.5, 2]} />
                    <meshStandardMaterial color={row % 2 === 0 ? "#1e3a8a" : "#3b82f6"} />
                  </mesh>
                ))}
              </group>
            ))}

            {/* Giant screen at one end */}
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

            {/* Stadium lights */}
            {[
              [-25, 20, -15],
              [25, 20, -15],
              [-25, 20, 15],
              [25, 20, 15],
            ].map((pos, idx) => (
              <group key={idx} position={pos as [number, number, number]}>
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

            {/* Exit button */}
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
        ) : currentCinemaRoom ? (
          <>
            {/* Cinema Interior */}
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

            {currentCinemaRoom &&
              currentCinemaRoom !== "world" &&
              (() => {
                const room = cinemaRooms.find((r) => r.id === currentCinemaRoom.id)
                if (!room) return null

                const isMovieStarted = room.schedule_start && new Date(room.schedule_start).getTime() < Date.now()

                return (
                  <group position={[0, 3, -20]}>
                    {/* Cinema Screen Background */}
                    <mesh>
                      <planeGeometry args={[14, 8]} />
                      <meshStandardMaterial color="#1a1a1a" />
                    </mesh>

                    {/* Screen Border */}
                    <mesh position={[0, 0, 0.1]}>
                      <planeGeometry args={[13.5, 7.5]} />
                      <meshStandardMaterial color="#000000" />
                    </mesh>

                    {/* Movie Info and Countdown - Display before movie starts */}
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

                    {/* Movie Iframe - Display when movie has started */}
                    {isMovieStarted && room.embed_url && (
                      <Html transform position={[0, 0, 0.2]} style={{ width: "1300px", height: "720px" }}>
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
              const isMySeat = mySeat === seat.seat_number // Use seat.seat_number for comparison

              return (
                <group key={seat.seat_number} position={[seat.position_x, seat.position_y, seat.position_z]}>
                  <mesh castShadow>
                    <boxGeometry args={[1, 0.8, 0.9]} />
                    <meshStandardMaterial color={isMySeat ? "#ef4444" : seat.color} />
                  </mesh>
                </group>
              )
            })}
          </>
        ) : null}

        {/* Player avatars with badges */}
        {otherPlayers
          .filter((p) => {
            const playerIsInSameRoom =
              currentRoom === p.current_room || (currentRoom === null && p.current_room === null)
            return playerIsInSameRoom
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
                <RealisticAvatarComponent position={[0, 0, 0]} avatarStyle={avatarStyle} isMoving={false} />

                {worldSettings.showStatusBadges && (
                  <Html
                    position={[player.position_x || 0, 2.3, player.position_z || 0]}
                    center
                    depthTest={true}
                    occlude
                    zIndexRange={[0, 0]}
                  >
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

        {!povMode && (
          <OrbitControls
            target={[myPosition.x, myPosition.y, myPosition.z]}
            maxPolarAngle={Math.PI / 2.5}
            minDistance={6}
            maxDistance={25}
          />
        )}
      </Canvas>

      {/* Menu Button */}
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

      {showChatInput && !isFullscreen && (
        <div className="absolute top-20 right-4 w-80 bg-black/80 backdrop-blur-lg rounded-lg z-10 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-bold text-sm">Envoyer un message</h3>
            <button onClick={() => setShowChatInput(false)} className="text-white/60 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage()
                  setShowChatInput(false)
                }
              }}
              placeholder="Votre message..."
              className="flex-1 bg-white/10 text-white px-3 py-2 rounded-lg outline-none text-sm"
              autoFocus
            />
            <button
              onClick={() => {
                sendMessage()
                setShowChatInput(false)
              }}
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {isFullscreen && (
        <button
          onClick={handleFullscreen}
          className="absolute top-4 right-4 z-50 bg-red-500/80 backdrop-blur-lg text-white p-3 rounded-full hover:bg-red-600/80 transition-colors shadow-lg"
          title="Quitter le plein écran"
        >
          <Minimize className="w-6 h-6" />
        </button>
      )}

      {mySeat !== null && currentCinemaRoom?.embed_url && !showMovieFullscreen && (
        <button
          onClick={() => setShowMovieFullscreen(true)}
          className="absolute bottom-24 right-4 z-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 shadow-lg flex items-center gap-2"
        >
          <Play className="w-5 h-5" />
          Voir le Film en Plein Écran
        </button>
      )}

      {showMovieFullscreen && currentCinemaRoom?.embed_url && (
        <div className="absolute inset-0 bg-black z-40 flex flex-col">
          <div className="bg-black/90 backdrop-blur-lg px-4 py-3 flex justify-between items-center">
            <h3 className="text-white font-bold">{currentCinemaRoom.movie_title}</h3>
            <button
              onClick={() => setShowMovieFullscreen(false)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2"
            >
              <EyeOff className="w-4 h-4" />
              Quitter
            </button>
          </div>
          <div className="flex-1">
            <iframe
              src={currentCinemaRoom.embed_url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {showChat && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-black/90 backdrop-blur-xl rounded-xl w-full max-w-md h-[600px] flex flex-col border-2 border-white/30 shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-white/20">
              <h3 className="text-white font-bold text-lg">
                {currentCinemaRoom ? `Chat - Salle ${currentCinemaRoom.room_number}` : "Chat Global"}
              </h3>
              <button onClick={() => setShowChat(false)} className="text-white/60 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {(currentCinemaRoom ? roomMessages : messages).map((msg, i) => (
                <div key={i} className="bg-white/10 rounded-lg p-3">
                  <div className="text-blue-400 font-semibold text-sm">{msg.username || "Anonyme"}</div>
                  <div className="text-white text-sm mt-1">{msg.message}</div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/20">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && chatInput.trim()) {
                      sendMessage()
                    }
                  }}
                  placeholder="Votre message..."
                  className="flex-1 bg-white/10 text-white px-4 py-3 rounded-lg outline-none placeholder-white/40"
                  autoFocus
                />
                <button
                  onClick={sendMessage}
                  disabled={!chatInput.trim()}
                  className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAvatarCustomizer && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-black/90 backdrop-blur-xl rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto border-2 border-white/30 shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-white/20">
              <h3 className="text-white font-bold text-2xl">Personnaliser Avatar</h3>
              <button
                onClick={() => setShowAvatarCustomizer(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Skin Tone */}
              <div>
                <label className="text-white font-semibold mb-3 block">Teinte de peau</label>
                <div className="grid grid-cols-6 gap-3">
                  {["#fbbf24", "#f59e0b", "#d97706", "#92400e", "#7c2d12", "#451a03"].map((color) => (
                    <button
                      key={color}
                      onClick={() => saveAvatarStyle({ ...myAvatarStyle, skinTone: color })}
                      className={`w-12 h-12 rounded-full border-4 transition-all ${
                        myAvatarStyle.skinTone === color ? "border-white scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Body Color */}
              <div>
                <label className="text-white font-semibold mb-3 block">Couleur du corps</label>
                <div className="grid grid-cols-6 gap-3">
                  {["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"].map((color) => (
                    <button
                      key={color}
                      onClick={() => saveAvatarStyle({ ...myAvatarStyle, bodyColor: color })}
                      className={`w-12 h-12 rounded-full border-4 transition-all ${
                        myAvatarStyle.bodyColor === color ? "border-white scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Hair Style */}
              <div>
                <label className="text-white font-semibold mb-3 block">Style de cheveux</label>
                <div className="grid grid-cols-3 gap-3">
                  {["short", "long", "none"].map((style) => {
                    const option = customizationOptions.find((o) => o.category === "hair_style" && o.value === style)
                    const isLocked =
                      option?.is_premium && !userProfile?.is_vip && !userProfile?.is_vip_plus && !userProfile?.is_admin

                    return (
                      <button
                        key={style}
                        onClick={() => !isLocked && saveAvatarStyle({ ...myAvatarStyle, hairStyle: style })}
                        disabled={isLocked}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          myAvatarStyle.hairStyle === style
                            ? "border-blue-500 bg-blue-500/20"
                            : "border-white/20 bg-white/5"
                        } ${isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"}`}
                      >
                        <div className="text-white font-medium flex items-center justify-center gap-2">
                          {isLocked && <Crown className="w-4 h-4 text-yellow-400" />}
                          {option?.label || style}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Hair Color */}
              <div>
                <label className="text-white font-semibold mb-3 block">Couleur des cheveux</label>
                <div className="grid grid-cols-6 gap-3">
                  {["#1f2937", "#92400e", "#fbbf24", "#ef4444", "#8b5cf6", "#ec4899"].map((color) => (
                    <button
                      key={color}
                      onClick={() => saveAvatarStyle({ ...myAvatarStyle, hairColor: color })}
                      className={`w-12 h-12 rounded-full border-4 transition-all ${
                        myAvatarStyle.hairColor === color ? "border-white scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Face Smiley */}
              <div>
                <label className="text-white font-semibold mb-3 block">Visage (Smiley)</label>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { emoji: "😊", label: "Souriant", premium: false },
                    { emoji: "😎", label: "Cool", premium: false },
                    { emoji: "🤓", label: "Intello", premium: false },
                    { emoji: "😇", label: "Ange", premium: true, level: "vip" },
                    { emoji: "🤩", label: "Star", premium: true, level: "vip" },
                    { emoji: "😈", label: "Diable", premium: true, level: "vip_plus" },
                    { emoji: "🤖", label: "Robot", premium: true, level: "vip_plus" },
                    { emoji: "👽", label: "Alien", premium: true, level: "vip_plus" },
                    { emoji: "🔥", label: "Feu", premium: true, level: "admin" },
                    { emoji: "⭐", label: "Étoile", premium: true, level: "admin" },
                  ].map((face) => {
                    const isLocked =
                      face.premium &&
                      ((face.level === "vip" &&
                        !userProfile?.is_vip &&
                        !userProfile?.is_vip_plus &&
                        !userProfile?.is_admin) ||
                        (face.level === "vip_plus" && !userProfile?.is_vip_plus && !userProfile?.is_admin) ||
                        (face.level === "admin" && !userProfile?.is_admin))

                    return (
                      <button
                        key={face.emoji}
                        onClick={() => !isLocked && saveAvatarStyle({ ...myAvatarStyle, faceSmiley: face.emoji })}
                        disabled={isLocked}
                        className={`p-3 rounded-lg border-2 transition-all relative ${
                          myAvatarStyle.faceSmiley === face.emoji
                            ? "border-blue-500 bg-blue-500/20 scale-110"
                            : "border-white/20 bg-white/5"
                        } ${isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"}`}
                        title={face.label}
                      >
                        <div className="text-3xl">{face.emoji}</div>
                        {isLocked && (
                          <div className="absolute top-1 right-1">
                            <Crown className="w-3 h-3 text-yellow-400" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Accessory */}
              <div>
                <label className="text-white font-semibold mb-3 block">Accessoire</label>
                <div className="grid grid-cols-3 gap-3">
                  {["none", "glasses", "hat"].map((acc) => {
                    const option = customizationOptions.find((o) => o.category === "accessory" && o.value === acc)
                    const isLocked =
                      option?.is_premium && !userProfile?.is_vip && !userProfile?.is_vip_plus && !userProfile?.is_admin

                    return (
                      <button
                        key={acc}
                        onClick={() => !isLocked && saveAvatarStyle({ ...myAvatarStyle, accessory: acc })}
                        disabled={isLocked}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          myAvatarStyle.accessory === acc
                            ? "border-blue-500 bg-blue-500/20"
                            : "border-white/20 bg-white/5"
                        } ${isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"}`}
                      >
                        <div className="text-white font-medium flex items-center justify-center gap-2">
                          {isLocked && <Crown className="w-4 h-4 text-yellow-400" />}
                          {option?.label || acc}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/20">
              <button
                onClick={() => setShowAvatarCustomizer(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 font-bold text-lg"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {worldSettings.enableEmojis && (
        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="fixed bottom-6 right-6 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-2xl flex items-center justify-center z-20 border-4 border-white/30 hover:scale-110 transition-transform"
        >
          <Smile className="w-10 h-10 text-white" />
        </button>
      )}

      {showQuickActions && (
        <div className="fixed bottom-28 right-6 z-20 bg-black/90 backdrop-blur-lg p-4 rounded-2xl border-2 border-white/20 max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col gap-3">
            {currentCinemaRoom && (
              <>
                {mySeat === null ? (
                  <button
                    onClick={handleSitInAnySeat}
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap font-medium"
                  >
                    💺 S'asseoir
                  </button>
                ) : (
                  <button
                    onClick={() => handleSitInSeat(mySeat)}
                    className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 whitespace-nowrap font-medium"
                  >
                    🚶 Se lever
                  </button>
                )}
                <button
                  onClick={handleLeaveRoom}
                  className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 whitespace-nowrap font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Sortir
                </button>
                <div className="border-t border-white/20 my-1"></div>
              </>
            )}
            {currentRoom === "stadium" && (
              <>
                <button
                  onClick={handleLeaveStadium}
                  className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 whitespace-nowrap font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Quitter le Stade
                </button>
                <div className="border-t border-white/20 my-1"></div>
              </>
            )}
            <button
              onClick={() => handleQuickAction("jump")}
              className="bg-gray-800 text-white p-4 rounded-full shadow-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <ArrowUp className="w-6 h-6" />
            </button>
            {["😂", "👍", "❤️", "😭", "🔥", "🎉", "😎", "🤔", "😱", "💪", "🙏", "✨"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmoji(emoji)}
                className="text-4xl p-2 rounded-full hover:bg-white/10 transition-colors text-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {isMobileMode && !isFullscreen && (
        <button
          onClick={() => setPovMode(!povMode)}
          className="fixed bottom-6 left-6 z-20 w-20 h-20 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform border-4 border-white/30"
        >
          {povMode ? <Eye className="w-10 h-10 text-white" /> : <EyeOff className="w-10 h-10 text-white" />}
        </button>
      )}

      {isMobileMode && worldSettings.enableChat && (
        <button
          onClick={() => setShowChatInput(true)}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-20 h-20 bg-green-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform border-4 border-white/30"
        >
          <MessageCircle className="w-10 h-10 text-white" />
        </button>
      )}

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

      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full border-2 border-blue-500/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Paramètres
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white font-medium block mb-2">Mode de Contrôle</label>
                <select
                  value={controlMode}
                  onChange={(e) => setControlMode(e.target.value as "auto" | "pc" | "mobile")}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                >
                  <option value="auto">Automatique</option>
                  <option value="pc">PC (Clavier)</option>
                  <option value="mobile">Mobile (Joystick)</option>
                </select>
              </div>

              <div>
                <label className="text-white font-medium block mb-2">Qualité Graphique</label>
                <select
                  value={graphicsQuality}
                  onChange={(e) => setGraphicsQuality(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-white font-medium">Mode POV</label>
                <button
                  onClick={() => setPovMode(!povMode)}
                  className={`w-12 h-6 rounded-full transition-colors ${povMode ? "bg-blue-500" : "bg-gray-600"}`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      povMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium mt-6"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {showMap && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 max-w-2xl w-full mx-4 shadow-2xl border-2 border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <Map className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
                Carte du Monde
              </h2>
              <button onClick={() => setShowMap(false)} className="text-white hover:text-red-400 transition-colors">
                <X className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => {
                  setShowCinema(true)
                  setShowMap(false)
                }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-4 md:p-6 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-4"
              >
                <div className="bg-white/20 p-3 md:p-4 rounded-lg">
                  <Building2 className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg md:text-xl">🎬 Cinéma</div>
                  <div className="text-xs md:text-sm opacity-90">Ouvert - Cliquez pour voir les salles</div>
                </div>
              </button>

              <button
                onClick={() => {
                  handleEnterArcade()
                  setShowMap(false)
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-4 md:p-6 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-4"
              >
                <div className="bg-white/20 p-3 md:p-4 rounded-lg">
                  <Gamepad2 className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg md:text-xl">🕹️ Arcade</div>
                  <div className="text-xs md:text-sm opacity-90">Ouvert - Jouez aux jeux rétro</div>
                </div>
              </button>

              <button
                onClick={() => {
                  handleEnterStadium()
                  setShowMap(false)
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-4 md:p-6 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-4"
              >
                <div className="bg-white/20 p-3 md:p-4 rounded-lg">
                  <Trophy className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg md:text-xl">⚽ Stade</div>
                  <div className="text-xs md:text-sm opacity-90">Ouvert - Regardez les matchs en live</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {showArcade && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 rounded-2xl p-6 md:p-8 max-w-4xl w-full my-8 shadow-2xl border-2 border-purple-400/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 text-pink-400" />
                🕹️ Arcade - Jeux Rétro
              </h2>
              <button onClick={() => setShowArcade(false)} className="text-white hover:text-red-400 transition-colors">
                <X className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
              {arcadeMachines.map((machine) => (
                <button
                  key={machine.id}
                  onClick={() => handleSelectArcadeMachine(machine)}
                  className="bg-gradient-to-br from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-xl transition-all transform hover:scale-105 shadow-lg text-left"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-lg">{machine.name}</div>
                  </div>
                  {machine.description && <div className="text-sm opacity-90 line-clamp-2">{machine.description}</div>}
                  <div className="mt-2 text-xs opacity-75">{machine.category || "Jeu Rétro"}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentArcadeMachine && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="bg-purple-900 px-4 py-3 flex items-center justify-between border-b-2 border-purple-400">
            <div className="flex items-center gap-3 text-white">
              <Gamepad2 className="w-5 h-5 text-pink-400" />
              <span className="font-bold text-lg">{currentArcadeMachine.name}</span>
            </div>
            <button
              onClick={handleCloseArcadeMachine}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
            >
              <X className="w-5 h-5" />
              Fermer
            </button>
          </div>
          <iframe
            src={currentArcadeMachine.url}
            className="flex-1 w-full h-full border-0"
            allow="gamepad; fullscreen"
            allowFullScreen
          />
        </div>
      )}

      {showStadium && stadium && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-2xl border-2 border-green-400/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />⚽ {stadium.name}
              </h2>
              <button onClick={() => setShowStadium(false)} className="text-white hover:text-red-400 transition-colors">
                <X className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="font-bold text-white text-lg mb-2">{stadium.match_title || "Match en direct"}</h3>
                {stadium.schedule_start && (
                  <div className="text-green-200 text-sm">
                    Début: {new Date(stadium.schedule_start).toLocaleString("fr-FR")}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleEnterStadium}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Entrer dans le Stade
            </button>
          </div>
        </div>
      )}

      {currentRoom === "stadium" && stadium?.embed_url && (
        <div className="fixed inset-0 bg-black z-40 flex flex-col">
          <div className="bg-green-900 px-4 py-3 flex items-center justify-between border-b-2 border-green-400">
            <div className="flex items-center gap-3 text-white">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-lg">{stadium.match_title || "Match en direct"}</span>
            </div>
            <button
              onClick={handleLeaveStadium}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
            >
              <LogOut className="w-5 h-5" />
              Quitter le Stade
            </button>
          </div>
          <iframe
            src={stadium.embed_url}
            className="flex-1 w-full h-full border-0"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </div>
      )}

      {showCinema && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-purple-400/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <Film className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
                Salles de Cinéma
              </h2>
              <button onClick={() => setShowCinema(false)} className="text-white hover:text-red-400 transition-colors">
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
                      <div className="flex items-start justify-between mb-3">
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
                          <h3 className="text-white font-semibold text-sm mb-1">{room.movie_title}</h3>
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
                        {room.schedule_start && (
                          <div className="text-purple-300 text-xs">
                            {new Date(room.schedule_start).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          if (!isFull && isOpen) {
                            setCurrentCinemaRoom(room)
                            setShowCinema(false)
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
      )}

      {!povMode && userProfile && (
        <group position={[myPosition.x, myPosition.y, myPosition.z]}>
          <RealisticAvatarComponent position={[0, 0, 0]} avatarStyle={myAvatarStyle} isMoving={isMoving} />

          {worldSettings.showStatusBadges && (
            <Html position={[0, 2.3, 0]} center depthTest={true} occlude zIndexRange={[0, 0]}>
              <div className="flex flex-col items-center gap-1 pointer-events-none">
                <div className="flex items-center gap-1 bg-black/80 px-2 py-1 rounded-full backdrop-blur-sm">
                  <span className="text-white text-xs font-medium">{userProfile.username || "Vous"}</span>
                  {userProfile.is_admin && <Shield className="w-3 h-3 text-red-500" />}
                  {userProfile.is_vip_plus && !userProfile.is_admin && <Crown className="w-3 h-3 text-purple-400" />}
                  {userProfile.is_vip && !userProfile.is_vip_plus && !userProfile.is_admin && (
                    <Star className="w-3 h-3 text-yellow-400" />
                  )}
                </div>
                {playerChatBubbles[userProfile.id] &&
                  Date.now() - playerChatBubbles[userProfile.id].timestamp < 5000 && (
                    <div className="bg-white text-black text-xs px-3 py-1 rounded-lg max-w-[200px] break-words shadow-lg">
                      {playerChatBubbles[userProfile.id].message}
                    </div>
                  )}
                {currentEmoji && <div className="text-4xl animate-bounce">{currentEmoji}</div>}
              </div>
            </Html>
          )}
        </group>
      )}
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
