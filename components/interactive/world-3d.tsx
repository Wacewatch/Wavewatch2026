"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Sky, Html, PerspectiveCamera, Billboard, Text } from "@react-three/drei"
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
  ExternalLink,
} from "lucide-react"
import type * as THREE from "three"
import { useRouter } from "next/navigation" // Assuming router is needed for navigation
import { HLSVideoScreen } from "./hls-video-screen"
import { VideoScreen } from "./video-screen"
import { ImageScreen } from "./image-screen"

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
function RealisticAvatar({
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
  const leftLegRef = useRef<THREE.Mesh>(null)
  const rightLegRef = useRef<THREE.Mesh>(null)
  const leftArmRef = useRef<THREE.Mesh>(null)
  const rightArmRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)

  const style = {
    bodyColor: avatarStyle?.bodyColor || "#3b82f6",
    headColor: avatarStyle?.headColor || "#fbbf24",
    skinTone: avatarStyle?.skinTone || avatarStyle?.headColor || "#fbbf24",
    hairStyle: avatarStyle?.hairStyle || "short",
    hairColor: avatarStyle?.hairColor || "#1f2937",
    accessory: avatarStyle?.accessory || "none",
    faceSmiley: avatarStyle?.faceSmiley || "😊",
  }

  useFrame((state, delta) => {
    if (isMoving) {
      timeRef.current += delta * 4 // Vitesse d'animation réduite (était 8)

      // Animate legs walking - amplitude réduite
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(timeRef.current) * 0.4
      if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(timeRef.current + Math.PI) * 0.4

      // Animate arms swinging (opposé aux jambes) - amplitude réduite
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(timeRef.current + Math.PI) * 0.25
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(timeRef.current) * 0.25
    } else {
      // Reset position when not moving
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0
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
      <mesh ref={leftArmRef} castShadow position={[-0.35, 1.2, 0]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color={style.skinTone} />
      </mesh>

      {/* Right Arm */}
      <mesh ref={rightArmRef} castShadow position={[0.35, 1.2, 0]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color={style.skinTone} />
      </mesh>

      {/* Left Leg */}
      <mesh ref={leftLegRef} castShadow position={[-0.15, 0.65, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color={style.bodyColor} />
      </mesh>

      {/* Right Leg */}
      <mesh ref={rightLegRef} castShadow position={[0.15, 0.65, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color={style.bodyColor} />
      </mesh>

      {/* Face Smiley - positioned on the front of the head */}
      <Html
        position={[0, 1.8, 0.35]}
        center
        distanceFactor={4}
        occlude
        zIndexRange={[0, 0]}
        style={{
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <div className="text-5xl">{style.faceSmiley}</div>
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

// CameraFollower - fait suivre la caméra avec le personnage
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

    // Calculer le déplacement du personnage
    const deltaX = characterPosition.x - lastPosition.current.x
    const deltaY = characterPosition.y - lastPosition.current.y
    const deltaZ = characterPosition.z - lastPosition.current.z

    // Déplacer la caméra du même vecteur pour suivre le personnage
    if (deltaX !== 0 || deltaY !== 0 || deltaZ !== 0) {
      camera.position.x += deltaX
      camera.position.y += deltaY
      camera.position.z += deltaZ

      // Mettre à jour la cible d'OrbitControls
      controls.target.set(
        characterPosition.x,
        characterPosition.y + 1,
        characterPosition.z
      )

      controls.update()
    }

    // Sauvegarder la position actuelle
    lastPosition.current = { ...characterPosition }
  })

  return null
}

// FirstPersonCamera - Caméra première personne avec contrôle souris
function FirstPersonCamera({
  position,
  rotation,
  onRotationChange
}: {
  position: { x: number; y: number; z: number }
  rotation: { yaw: number; pitch: number }
  onRotationChange: (yaw: number, pitch: number) => void
}) {
  const { camera, gl } = useThree()
  const isLocked = useRef(false)
  const rotationRef = useRef(rotation)
  const onRotationChangeRef = useRef(onRotationChange)

  // Keep refs updated
  useEffect(() => {
    rotationRef.current = rotation
  }, [rotation])

  useEffect(() => {
    onRotationChangeRef.current = onRotationChange
  }, [onRotationChange])

  useEffect(() => {
    const canvas = gl.domElement

    const handleClick = () => {
      if (!isLocked.current) {
        canvas.requestPointerLock().catch(() => {
          // Ignore error when user exits lock before request completes
        })
      }
    }

    const handleLockChange = () => {
      isLocked.current = document.pointerLockElement === canvas
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isLocked.current) return

      const sensitivity = 0.002
      const currentRotation = rotationRef.current
      const newYaw = currentRotation.yaw - e.movementX * sensitivity
      const newPitch = Math.max(
        -Math.PI / 2 + 0.1,
        Math.min(Math.PI / 2 - 0.1, currentRotation.pitch - e.movementY * sensitivity)
      )

      onRotationChangeRef.current(newYaw, newPitch)
    }

    canvas.addEventListener('click', handleClick)
    document.addEventListener('pointerlockchange', handleLockChange)
    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      canvas.removeEventListener('click', handleClick)
      document.removeEventListener('pointerlockchange', handleLockChange)
      document.removeEventListener('mousemove', handleMouseMove)
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock()
      }
    }
  }, [gl])

  useFrame(() => {
    // Position de la caméra à la hauteur des yeux
    camera.position.set(position.x, position.y + 1.6, position.z)

    // Direction de la caméra basée sur yaw et pitch
    const lookX = position.x + Math.sin(rotation.yaw) * Math.cos(rotation.pitch)
    const lookY = position.y + 1.6 + Math.sin(rotation.pitch)
    const lookZ = position.z + Math.cos(rotation.yaw) * Math.cos(rotation.pitch)

    camera.lookAt(lookX, lookY, lookZ)
  })

  return null
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

// InterpolatedPlayer - Gère l'interpolation fluide des positions des autres joueurs
function InterpolatedPlayer({
  player,
  avatarStyle,
  playerAction,
  worldSettings,
  playerChatBubbles,
}: {
  player: any
  avatarStyle: any
  playerAction: any
  worldSettings: any
  playerChatBubbles: Record<string, { message: string; timestamp: number }>
}) {
  const groupRef = useRef<THREE.Group>(null)
  const avatarGroupRef = useRef<THREE.Group>(null)

  // Position et rotation interpolées
  const currentPos = useRef({
    x: player.position_x || 0,
    y: player.position_y || 0,
    z: player.position_z || 0,
  })
  const currentRotation = useRef(player.rotation || 0)

  // Position cible (dernière reçue de la DB)
  const targetPos = useRef({
    x: player.position_x || 0,
    y: player.position_y || 0,
    z: player.position_z || 0,
  })
  const targetRotation = useRef(player.rotation || 0)

  // Détecter si le joueur bouge pour l'animation
  const [isMoving, setIsMoving] = useState(false)

  // Mettre à jour la position cible quand les données DB changent
  useEffect(() => {
    const newX = player.position_x || 0
    const newY = player.position_y || 0
    const newZ = player.position_z || 0

    // Calculer la distance entre la position actuelle et la nouvelle
    const distance = Math.sqrt(
      Math.pow(newX - currentPos.current.x, 2) +
      Math.pow(newY - currentPos.current.y, 2) +
      Math.pow(newZ - currentPos.current.z, 2)
    )

    // Si la distance est grande (téléportation: s'asseoir/se lever), appliquer directement sans interpolation
    const TELEPORT_THRESHOLD = 3 // Plus de 3 unités = téléportation
    if (distance > TELEPORT_THRESHOLD) {
      // Téléportation instantanée
      currentPos.current = { x: newX, y: newY, z: newZ }
      currentRotation.current = player.rotation || 0
      // Mettre à jour immédiatement le groupe si disponible
      if (groupRef.current) {
        groupRef.current.position.set(newX, newY, newZ)
      }
      if (avatarGroupRef.current) {
        avatarGroupRef.current.rotation.y = player.rotation || 0
      }
    }

    // Mettre à jour la cible (sera interpolée si distance < seuil)
    targetPos.current = { x: newX, y: newY, z: newZ }
    targetRotation.current = player.rotation || 0
  }, [player.position_x, player.position_y, player.position_z, player.rotation])

  // Interpolation à chaque frame
  useFrame(() => {
    if (!groupRef.current) return

    // Facteur d'interpolation (0.08 = lent et fluide, 0.15 = plus rapide)
    const lerpFactor = 0.1

    // Interpoler la position
    currentPos.current.x += (targetPos.current.x - currentPos.current.x) * lerpFactor
    currentPos.current.y += (targetPos.current.y - currentPos.current.y) * lerpFactor
    currentPos.current.z += (targetPos.current.z - currentPos.current.z) * lerpFactor

    // Interpoler la rotation (gérer le wraparound autour de PI)
    let rotationDiff = targetRotation.current - currentRotation.current
    // Normaliser la différence de rotation pour prendre le chemin le plus court
    while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2
    while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2
    currentRotation.current += rotationDiff * lerpFactor

    // Appliquer la position interpolée au groupe
    groupRef.current.position.set(
      currentPos.current.x,
      currentPos.current.y,
      currentPos.current.z
    )

    // Appliquer la rotation interpolée au groupe avatar
    if (avatarGroupRef.current) {
      avatarGroupRef.current.rotation.y = currentRotation.current
    }

    // Détecter si le joueur est en mouvement (pour l'animation)
    const distanceToTarget = Math.sqrt(
      Math.pow(targetPos.current.x - currentPos.current.x, 2) +
      Math.pow(targetPos.current.z - currentPos.current.z, 2)
    )
    const newIsMoving = distanceToTarget > 0.05
    if (newIsMoving !== isMoving) {
      setIsMoving(newIsMoving)
    }
  })

  const playerProfile = player.user_profiles

  return (
    <group ref={groupRef}>
      <group ref={avatarGroupRef}>
        <RealisticAvatar position={[0, 0, 0]} avatarStyle={avatarStyle} isMoving={isMoving} />
      </group>

      {worldSettings.showStatusBadges && (
        <Html
          position={[0, 2.6, 0]}
          center
          distanceFactor={10}
          zIndexRange={[0, 0]}
        >
          <div className="flex flex-col items-center gap-1 pointer-events-none">
            <div className="flex items-center gap-1 bg-black/80 px-3 py-1 rounded-full backdrop-blur-sm whitespace-nowrap">
              <span className="text-white text-xs font-medium whitespace-nowrap">
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
}

export default function InteractiveWorld({ userId, userProfile }: InteractiveWorldProps) {
  const router = useRouter() // Initialize router
  const [myProfile, setMyProfile] = useState<any>(null)
  const [otherPlayers, setOtherPlayers] = useState<any[]>([])
  const [onlineCount, setOnlineCount] = useState(0)
  const [myPosition, setMyPosition] = useState({ x: 0, y: -0.35, z: 0 })
  const [myRotation, setMyRotation] = useState(0) // State for player rotation
  const [savedMapPosition, setSavedMapPosition] = useState({ x: 0, y: 0.5, z: 0 }) // Save position before entering rooms
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

  // Liste locale des machines d'arcade (plus de connexion BDD)
  // Les URLs avec useProxy: true passent par /api/proxy/game pour contourner les timers/modales
  const localArcadeMachines = [
    { id: 1, name: "Game.Onl", url: "https://gam.onl", media: { type: 'video', src: "https://gam.onl/user/main/videos/arcade.mp4" }, openInNewTab: false },
    { id: 2, name: "RetroGames.onl", url: "https://www.retrogames.onl/", media: { type: 'image', src: "/arcade/RetroGames.onl.png" }, openInNewTab: false, useProxy: true },
    { id: 4, name: "RetroGames.me", url: "https://retrogames.me", media: { type: 'image', src: "/arcade/RetroGames.me.png" }, openInNewTab: false },
    { id: 5, name: "Venge.io", url: "https://venge.io", media: { type: 'image', src: "/arcade/Venge.io.png" }, openInNewTab: false },
    { id: 6, name: "WebRcade", url: "https://play.webrcade.com", media: { type: 'image', src: "/arcade/WebArcade.png" }, openInNewTab: false },
    { id: 7, name: "PointerPointer", url: "https://pointerpointer.com", media: { type: 'image', src: "https://pointerpointer.com/like3.jpg" }, openInNewTab: false },
  ]

  const [arcadeMachines, setArcadeMachines] = useState<any[]>(localArcadeMachines)
  const [showArcade, setShowArcade] = useState(false)
  const [currentArcadeMachine, setCurrentArcadeMachine] = useState<any>(null)
  const [pendingExternalMachine, setPendingExternalMachine] = useState<any>(null) // Pour la modal pub avant ouverture externe
  const [externalCountdown, setExternalCountdown] = useState(5) // Compte à rebours 5 secondes
  const [stadium, setStadium] = useState<any>(null)
  const [showStadium, setShowStadium] = useState(false)
  const [showMovieFullscreen, setShowMovieFullscreen] = useState(false)
  const [isCinemaMuted, setIsCinemaMuted] = useState(true) // Muted par défaut pour éviter le son automatique
  const [stadiumSeat, setStadiumSeat] = useState<{ row: number; side: string } | null>(null) // Siège dans le stade
  const [showMenu, setShowMenu] = useState(false) // Added this state

  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const [nearbyBuilding, setNearbyBuilding] = useState<{ name: string; type: string; emoji: string } | null>(null)

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
  const [fpsRotation, setFpsRotation] = useState({ yaw: 0, pitch: 0 })

  const [countdown, setCountdown] = useState<string>("")

  // Synchronized actions state
  const [playerActions, setPlayerActions] = useState<Record<string, { action: string; timestamp: number; emoji?: string }>>({})
  const actionsChannelRef = useRef<any>(null)
  const [quickAction, setQuickAction] = useState<string | null>(null) // State for current quick action animation
  const keysPressed = useRef<Set<string>>(new Set()) // Ref for tracking pressed keys
  const cameraAngle = useRef<number>(0) // Ref for tracking camera azimuth angle
  const orbitControlsRef = useRef<any>(null) // Ref for OrbitControls
  const lastDbUpdate = useRef<number>(0) // Throttle DB updates

  const isMoving = movement.x !== 0 || movement.z !== 0

  // Recalculate online count based on actually displayed players (with same filters as rendering)
  useEffect(() => {
    const actualPlayersInWorld = otherPlayers.filter((p) => {
      const playerIsInSameRoom =
        currentRoom === p.current_room || (currentRoom === null && p.current_room === null)
      const hasValidProfile = (p.user_profiles?.username || p.username) ? true : false
      const isAtDefaultPosition = (p.position_x === 0 && p.position_z === 0 && (p.position_y === 0 || p.position_y === 0.5))
      return playerIsInSameRoom && hasValidProfile && !isAtDefaultPosition
    })
    setOnlineCount(actualPlayersInWorld.length + 1) // +1 for current user
  }, [otherPlayers, currentRoom])

  useEffect(() => {
    if (controlMode === "pc") {
      setIsMobileMode(false)
    } else if (controlMode === "mobile") {
      setIsMobileMode(true)
    } else {
      // Mode auto : détecter automatiquement
      const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth < 1024
      setIsMobileMode(isTouchDevice || isSmallScreen)
    }
  }, [controlMode])

  // Désactiver le scroll quand un jeu arcade est ouvert
  useEffect(() => {
    if (currentArcadeMachine) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [currentArcadeMachine])

  const [lastActivity, setLastActivity] = useState(Date.now())
  const [showAFKWarning, setShowAFKWarning] = useState(false)
  const [showCollisionDebug, setShowCollisionDebug] = useState(false)

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
            window.location.href = "/"
          })
      }
    }, 60000) // Check every minute

    return () => {
      events.forEach((event) => window.removeEventListener(event, updateActivity))
      clearInterval(checkAFK)
    }
  }, [lastActivity, userId])

  // Collision zones definition with labels for debug visualization
  // ID format: TYPE_NUMBER (ex: BLDG_1, TREE_1, LAMP_1, BUSH_1)
  // Pour déplacer un élément, modifie les valeurs x et z correspondantes
  // lowQuality: false = visible en toutes qualités, true = masqué en qualité basse
  const allCollisionZones = [
    // ========== BÂTIMENTS (toujours visibles) ==========
    { id: "BLDG_CINEMA", x: 15, z: 0, width: 9, depth: 9, label: "Cinéma", color: "#ef4444", lowQuality: false },
    { id: "BLDG_ARCADE", x: 0, z: 15, width: 10, depth: 10, label: "Arcade", color: "#8b5cf6", lowQuality: false },
    { id: "BLDG_STADIUM", x: 25, z: -15, width: 12, depth: 10, label: "Stade", color: "#22c55e", lowQuality: false },
    // Bâtiments décoratifs (collision active mais pas d'interaction)
    { id: "BLDG_2", x: -15, z: 5, width: 5, depth: 4, label: "Bâtiment Bleu", color: "#0ea5e9", lowQuality: false },
    { id: "BLDG_3", x: -15, z: -8, width: 4, depth: 4, label: "Bâtiment Orange", color: "#f59e0b", lowQuality: false },

    // ========== ARBRES ==========
    // En mode low: seulement TREE_1 et TREE_4 sont visibles
    { id: "TREE_1", x: -15, z: -15, width: 2, depth: 2, label: "Arbre 1", color: "#166534", lowQuality: false },
    { id: "TREE_2", x: -8, z: -18, width: 2, depth: 2, label: "Arbre 2", color: "#166534", lowQuality: true },
    { id: "TREE_3", x: 8, z: -18, width: 2, depth: 2, label: "Arbre 3", color: "#166534", lowQuality: true },
    { id: "TREE_4", x: 15, z: -15, width: 2, depth: 2, label: "Arbre 4", color: "#166534", lowQuality: false },
    { id: "TREE_5", x: -18, z: 10, width: 2, depth: 2, label: "Arbre 5", color: "#166534", lowQuality: true },
    { id: "TREE_6", x: 18, z: 10, width: 2, depth: 2, label: "Arbre 6", color: "#166534", lowQuality: true },
    { id: "TREE_7", x: -10, z: 15, width: 2, depth: 2, label: "Arbre 7", color: "#166534", lowQuality: true },
    { id: "TREE_8", x: 10, z: 15, width: 2, depth: 2, label: "Arbre 8", color: "#166534", lowQuality: true },

    // ========== LAMPADAIRES ==========
    // En mode low: seulement le lampadaire central (z=-10) est visible, mais x=0 pas x=-20
    // Note: en mode low, le seul lampadaire est à position [0, -10] donc x=-20, z=-10
    { id: "LAMP_1", x: -20, z: -10, width: 1, depth: 1, label: "Lampadaire 1", color: "#fbbf24", lowQuality: false },
    { id: "LAMP_2", x: -20, z: 10, width: 1, depth: 1, label: "Lampadaire 2", color: "#fbbf24", lowQuality: true },

    // ========== BANCS (masqués en mode low) ==========
    { id: "BENCH_1", x: -18, z: -12, width: 2, depth: 1, label: "Banc 1", color: "#8b4513", lowQuality: true },
    { id: "BENCH_3", x: -18, z: 12, width: 2, depth: 1, label: "Banc 3", color: "#8b4513", lowQuality: true },

    // ========== FONTAINE (masquée en mode low) ==========
    { id: "FOUNTAIN_1", x: -15, z: 0, width: 6, depth: 6, label: "Fontaine", color: "#0ea5e9", lowQuality: true },

    // ========== BUISSONS (tous masqués en mode low) ==========
    { id: "BUSH_1", x: 5, z: -10, width: 2, depth: 2, label: "Buisson 1", color: "#4ade80", lowQuality: true },
    { id: "BUSH_2", x: -5, z: -10, width: 2, depth: 2, label: "Buisson 2", color: "#4ade80", lowQuality: true },
    { id: "BUSH_3", x: 10, z: 5, width: 2, depth: 2, label: "Buisson 3", color: "#4ade80", lowQuality: true },
    { id: "BUSH_4", x: -10, z: 5, width: 2, depth: 2, label: "Buisson 4", color: "#4ade80", lowQuality: true },
    { id: "BUSH_5", x: 12, z: -5, width: 2, depth: 2, label: "Buisson 5", color: "#4ade80", lowQuality: true },
    { id: "BUSH_6", x: -12, z: -5, width: 2, depth: 2, label: "Buisson 6", color: "#4ade80", lowQuality: true },
  ]

  // Filtrer les zones de collision selon la qualité graphique
  const collisionZonesData = graphicsQuality === "low"
    ? allCollisionZones.filter(zone => !zone.lowQuality)
    : allCollisionZones

  const checkCollision = (newX: number, newZ: number): boolean => {
    // Dans les salles spéciales (stade, arcade), pas de collision - libre mouvement
    if (currentRoom === "stadium" || currentRoom === "arcade") {
      return false
    }

    // Only check collisions in main world
    if (currentRoom !== null) {
      return false
    }

    for (const zone of collisionZonesData) {
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
        setWorldSettings(data.setting_value as any)
      }
    }

    loadWorldSettings()
  }, [])

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        // Calculer le timestamp d'il y a 30 secondes pour filtrer les joueurs inactifs
        const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString()

        const { data: profiles, error: profilesError } = await supabase
          .from("interactive_profiles")
          .select("*")
          .eq("is_online", true)
          .neq("user_id", userId)
          .gte("last_seen", thirtySecondsAgo)
          .not("position_x", "is", null)
          .not("position_y", "is", null)
          .not("position_z", "is", null)

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

    // Fonction pour mettre à jour le statut online
    const updateOnlineStatus = () => {
      supabase
        .from("interactive_profiles")
        .update({ is_online: true, last_seen: new Date().toISOString() })
        .eq("user_id", userId)
        .then()
    }

    // Mise à jour initiale
    updateOnlineStatus()

    loadPlayers()
    const interval = setInterval(loadPlayers, 5000)

    // Heartbeat toutes les 10 secondes pour maintenir le statut online
    const heartbeatInterval = setInterval(updateOnlineStatus, 10000)

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

    // Gérer la visibilité de la page (onglet actif/inactif)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateOnlineStatus()
        loadPlayers()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      clearInterval(interval)
      clearInterval(heartbeatInterval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      supabase.removeChannel(channel)
      // Mettre offline au cleanup (quand le composant est vraiment démonté)
      supabase
        .from("interactive_profiles")
        .update({ is_online: false, last_seen: new Date().toISOString() })
        .eq("user_id", userId)
        .then()
    }
  }, [userId])

  // Arcade machines sont maintenant définies localement dans localArcadeMachines

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
    }, 5000)

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
        setCustomizationOptions(data)
      }
    }

    loadCustomizationOptions()
  }, [])

  // Gestion des touches du clavier pour le déplacement
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

  // Suivi de l'angle de la caméra pour les mouvements
  useEffect(() => {
    const interval = setInterval(() => {
      if (orbitControlsRef.current) {
        const angle = orbitControlsRef.current.getAzimuthalAngle()
        cameraAngle.current = angle
      }
    }, 16) // ~60fps

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      // Bloquer les mouvements si assis dans le stade ou le cinéma
      if (stadiumSeat !== null || mySeat !== null) return

      let forward = 0
      let right = 0
      // Vitesse de base, doublée si Shift est enfoncé
      const baseSpeed = 0.15
      const isShiftPressed = keysPressed.current.has("shift")
      const speed = isShiftPressed ? baseSpeed * 2 : baseSpeed

      // Support QWERTY (WASD) et AZERTY (ZQSD) + Flèches
      if (keysPressed.current.has("w") || keysPressed.current.has("z") || keysPressed.current.has("arrowup")) forward += speed
      if (keysPressed.current.has("s") || keysPressed.current.has("arrowdown")) forward -= speed
      if (keysPressed.current.has("a") || keysPressed.current.has("q") || keysPressed.current.has("arrowleft")) right += speed
      if (keysPressed.current.has("d") || keysPressed.current.has("arrowright")) right -= speed

      if (forward !== 0 || right !== 0) {
        // Mouvement relatif à l'angle de la caméra
        let moveAngle: number
        if (povMode) {
          // En mode POV (première personne), utiliser fpsRotation.yaw directement
          moveAngle = fpsRotation.yaw
        } else {
          // En mode 3ème personne, utiliser l'angle de la caméra orbitale
          const camAngle = cameraAngle.current
          // La direction "avant" est opposée à la caméra (caméra regarde le personnage)
          moveAngle = camAngle + Math.PI
        }

        // Calculer le mouvement en coordonnées monde
        const dx = Math.sin(moveAngle) * forward + Math.cos(moveAngle) * right
        const dz = Math.cos(moveAngle) * forward - Math.sin(moveAngle) * right

        // Faire tourner le personnage vers la direction du mouvement
        if (dx !== 0 || dz !== 0) {
          const targetRotation = Math.atan2(dx, dz)
          setMyRotation(targetRotation)
        }
        setMovement({ x: dx, z: dz })
        setMyPosition((prev) => {
          // Limites différentes selon la salle
          let maxX = 28, maxZ = 28
          let minX = -28, minZ = -28
          if (currentRoom === "stadium") {
            maxX = 28 // Stade plus grand
            maxZ = 18
          } else if (currentRoom === "arcade") {
            maxX = 23
            maxZ = 18
          } else if (currentRoom?.startsWith("cinema_")) {
            // Limites du cinéma - zone rectangulaire
            minX = -8
            maxX = 8
            minZ = -5
            maxZ = 15
          }

          const newX = Math.max(minX, Math.min(maxX, prev.x + dx))
          const newZ = Math.max(minZ, Math.min(maxZ, prev.z + dz))

          // Ne pas vérifier les collisions dans le cinéma (pas de zones de collision définies)
          if (!currentRoom?.startsWith("cinema_") && checkCollision(newX, newZ)) {
            return prev // Don't move if collision detected
          }

          const newPos = {
            x: newX,
            y: -0.35,
            z: newZ,
          }

          // Throttle DB updates to every 300ms to reduce lag
          const now = Date.now()
          if (now - lastDbUpdate.current > 300) {
            lastDbUpdate.current = now
            const targetRotation = Math.atan2(dx, dz)
            supabase
              .from("interactive_profiles")
              .update({
                position_x: newPos.x,
                position_y: newPos.y,
                position_z: newPos.z,
                rotation: targetRotation,
              })
              .eq("user_id", userId)
              .then()
          }

          return newPos
        })
      } else {
        setMovement({ x: 0, z: 0 })
      }
    }, 50)

    return () => clearInterval(interval)
  }, [userId, isSeatsLocked, mySeat, stadiumSeat, povMode, fpsRotation.yaw, currentRoom, graphicsQuality]) // currentRoom for room-specific boundaries, graphicsQuality for collision zones

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
    const seatSpacing = 1.2 // Space between seats
    const rowSpacing = 1.8 // Space between rows

    // Add display positions to database seats - use user_id as source of truth
    const seatsWithPositions = data.map((seat) => {
      const seatsInThisRow = seatsByRow[seat.row_number].length
      // Find seat index within its row (0-based)
      const seatIndexInRow = seatsByRow[seat.row_number].findIndex(s => s.id === seat.id)
      // Center each row independently
      const rowOffset = (maxSeatsInAnyRow - seatsInThisRow) / 2

      return {
        ...seat,
        position_x: (seatIndexInRow + rowOffset - maxSeatsInAnyRow / 2 + 0.5) * seatSpacing,
        position_y: 0.4,
        position_z: (seat.row_number - 1) * rowSpacing + 2,
        // Use user_id as the single source of truth for occupancy
        is_occupied: !!seat.user_id,
      }
    })
    setCinemaSeats(seatsWithPositions)
  }, [currentCinemaRoom])

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

  // Libérer le siège quand l'utilisateur ferme la page ou quitte
  useEffect(() => {
    const releaseSeatOnExit = async () => {
      if (mySeat !== null && currentCinemaRoom && userId) {
        // Utiliser sendBeacon pour garantir l'envoi même si la page se ferme
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

  // Nettoyer les sièges abandonnés au chargement de la salle (occupés depuis plus de 30 min)
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

  const loadRoomMessages = useCallback(async () => {
    if (!currentCinemaRoom) return
    const { data } = await supabase
      .from("interactive_chat_messages")
      .select("*")
      .eq("room", `cinema_${currentCinemaRoom.id}`)
      .order("created_at", { ascending: false })
      .limit(50)

    if (data) setRoomMessages(data.reverse())
  }, [currentCinemaRoom])

  const handleNewMessage = useCallback((payload: any) => {
    setRoomMessages((prev) => [...prev, payload.new])
    setPlayerChatBubbles((prev) => ({
      ...prev,
      [payload.new.user_id]: {
        message: payload.new.message,
        timestamp: Date.now(),
      },
    }))
  }, [])

  useEffect(() => {
    if (!currentCinemaRoom) return

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
        handleNewMessage,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentCinemaRoom, loadRoomMessages, handleNewMessage])

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

  // Fonction pour basculer le mode POV en conservant la direction de vue
  const togglePovMode = useCallback(() => {
    if (!povMode && orbitControlsRef.current) {
      // Passage en mode première personne - calculer la direction actuelle de la caméra
      const controls = orbitControlsRef.current
      const azimuth = controls.getAzimuthalAngle() // Angle horizontal
      const polar = controls.getPolarAngle() // Angle vertical (0 = haut, PI = bas)

      // Convertir l'angle polaire en pitch (0 = horizontal, négatif = vers le bas)
      const pitch = Math.PI / 2 - polar

      // Le yaw de OrbitControls est l'opposé de ce qu'on veut pour FPS
      // En OrbitControls, la caméra regarde VERS le joueur depuis l'angle azimuth
      // En FPS, on veut regarder DEPUIS le joueur vers l'extérieur
      const yaw = azimuth + Math.PI

      setFpsRotation({ yaw, pitch })
    }
    setPovMode(!povMode)
  }, [povMode])

  const handleEmoji = (emoji: string) => {
    if (!userProfile) {
      return
    }

    setCurrentEmoji(emoji)
    setShowQuickActions(false)

    // Broadcast emoji action to other players via world-actions channel
    if (actionsChannelRef.current) {
      actionsChannelRef.current.send({
        type: "broadcast",
        event: "player-action",
        payload: {
          userId: userId,
          action: "emoji",
          emoji: emoji,
          timestamp: Date.now(),
        },
      })
    }

    setTimeout(() => setCurrentEmoji(null), 3000)
  }

  const handleJump = () => {
    if (!userProfile) {
      return
    }

    setIsJumping(true)

    // Broadcast jump action to other players
    if (actionsChannelRef.current) {
      actionsChannelRef.current.send({
        type: "broadcast",
        event: "player-action",
        payload: {
          userId: userId, // Use userId prop for consistency
          action: "jump",
          timestamp: Date.now(),
        },
      })
    }

    setTimeout(() => setIsJumping(false), 500)
  }

  const sendMessage = async () => {
    if (!userProfile || !userProfile.id) {
      return
    }

    if (!worldSettings.enableChat) {
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
    (joystickX: number, joystickY: number) => {
      // Bloquer les mouvements si assis dans le stade ou le cinéma
      if (stadiumSeat !== null || mySeat !== null) return

      // joystickX = gauche/droite (-1 à 1)
      // joystickY = haut/bas (-1 à 1, haut = négatif pour "avancer")

      if (joystickX === 0 && joystickY === 0) {
        setMovement({ x: 0, z: 0 })
        return
      }

      // Normaliser les inputs joystick pour avoir une vitesse constante (comme le clavier)
      // Le clavier utilise toujours speed = 0.15, pas de valeurs variables
      const magnitude = Math.sqrt(joystickX * joystickX + joystickY * joystickY)
      const normalizedX = magnitude > 0 ? joystickX / magnitude : 0
      const normalizedY = magnitude > 0 ? joystickY / magnitude : 0

      // Convertir les inputs joystick en forward/right comme le clavier
      // Utiliser les valeurs normalisées (toujours -1, 0, ou 1)
      const forward = -normalizedY // Inverser Y car joystick haut = avancer
      const right = -normalizedX   // Gauche/droite

      const baseSpeed = 0.15

      // Mouvement relatif à l'angle de la caméra (même logique que le clavier)
      let moveAngle: number
      if (povMode) {
        // En mode POV (première personne), utiliser fpsRotation.yaw directement
        moveAngle = fpsRotation.yaw
      } else {
        // En mode 3ème personne, utiliser l'angle de la caméra orbitale
        const camAngle = cameraAngle.current
        // La direction "avant" est opposée à la caméra (caméra regarde le personnage)
        moveAngle = camAngle + Math.PI
      }

      // Calculer le mouvement en coordonnées monde avec la même vitesse que le clavier
      const worldDx = (Math.sin(moveAngle) * forward + Math.cos(moveAngle) * right) * baseSpeed
      const worldDz = (Math.cos(moveAngle) * forward - Math.sin(moveAngle) * right) * baseSpeed

      // Faire tourner le personnage vers la direction du mouvement
      if (worldDx !== 0 || worldDz !== 0) {
        const targetRotation = Math.atan2(worldDx, worldDz)
        setMyRotation(targetRotation)
      }

      // Normaliser pour l'animation : toujours 1 ou 0, pas de valeurs intermédiaires
      const movementMagnitude = Math.sqrt(worldDx * worldDx + worldDz * worldDz)
      const normalizedMovementX = movementMagnitude > 0.01 ? worldDx / movementMagnitude : 0
      const normalizedMovementZ = movementMagnitude > 0.01 ? worldDz / movementMagnitude : 0
      setMovement({ x: normalizedMovementX, z: normalizedMovementZ })

      setMyPosition((prev) => {
        // Limites différentes selon la salle
        let maxX = 28, maxZ = 28
        let minX = -28, minZ = -28
        if (currentRoom === "stadium") {
          maxX = 28
          maxZ = 18
        } else if (currentRoom === "arcade") {
          maxX = 23
          maxZ = 18
        } else if (currentRoom?.startsWith("cinema_")) {
          // Limites du cinéma - zone rectangulaire
          minX = -8
          maxX = 8
          minZ = -5
          maxZ = 15
        }

        // worldDx et worldDz incluent déjà baseSpeed, pas besoin de multiplier à nouveau
        const newX = Math.max(minX, Math.min(maxX, prev.x + worldDx))
        const newZ = Math.max(minZ, Math.min(maxZ, prev.z + worldDz))

        // Ne pas vérifier les collisions dans le cinéma
        if (!currentRoom?.startsWith("cinema_") && checkCollision(newX, newZ)) {
          return prev // Don't move if collision detected
        }

        const newPos = {
          x: newX,
          y: -0.35,
          z: newZ,
        }

        // Throttle DB updates
        const now = Date.now()
        if (now - lastDbUpdate.current > 300) {
          lastDbUpdate.current = now
          const targetRotation = Math.atan2(worldDx, worldDz)
          supabase
            .from("interactive_profiles")
            .update({
              position_x: newPos.x,
              position_y: newPos.y,
              position_z: newPos.z,
              rotation: targetRotation,
            })
            .eq("user_id", userId)
            .then()
        }

        return newPos
      })
    },
    [userId, supabase, currentRoom, povMode, fpsRotation.yaw, stadiumSeat, mySeat, graphicsQuality],
  )

  // Handler pour le joystick de caméra (rotation de la vue)
  const handleCameraRotate = useCallback((deltaYaw: number, deltaPitch: number) => {
    if (povMode) {
      // En mode première personne, mettre à jour fpsRotation
      // Inverser le yaw pour que droite = regarder à droite
      setFpsRotation(prev => ({
        yaw: prev.yaw - deltaYaw,
        pitch: Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, prev.pitch + deltaPitch))
      }))
    } else if (orbitControlsRef.current) {
      // En mode 3ème personne, faire tourner l'OrbitControls autour du personnage
      const controls = orbitControlsRef.current
      // Rotation horizontale (yaw) - tourner autour du personnage
      const currentAzimuth = controls.getAzimuthalAngle()
      const currentPolar = controls.getPolarAngle()

      // Appliquer la rotation
      controls.minAzimuthAngle = -Infinity
      controls.maxAzimuthAngle = Infinity

      // Calculer les nouveaux angles (multiplicateur réduit pour une rotation plus lente)
      // Inverser le pitch pour que haut = regarder vers le haut
      const newAzimuth = currentAzimuth - deltaYaw * 0.8
      const newPolar = Math.max(0.3, Math.min(Math.PI / 2 - 0.1, currentPolar + deltaPitch * 0.8))

      // Appliquer via les limites temporaires
      controls.minAzimuthAngle = newAzimuth
      controls.maxAzimuthAngle = newAzimuth
      controls.minPolarAngle = newPolar
      controls.maxPolarAngle = newPolar
      controls.update()

      // Remettre les limites normales après l'update
      controls.minAzimuthAngle = -Infinity
      controls.maxAzimuthAngle = Infinity
      controls.minPolarAngle = 0.3
      controls.maxPolarAngle = Math.PI / 2 - 0.1
    }
  }, [povMode])

  function handleEnterArcade() {
    setShowArcade(false)
    setCurrentCinemaRoom(null)

    // Save current map position before entering arcade
    setSavedMapPosition({ x: myPosition.x, y: myPosition.y, z: myPosition.z })

    setCurrentRoom("arcade") // Set local state immediately

    // Teleport player to arcade room (spawn position)
    const arcadePos = { x: -2.6145599903373125, y: -0.35, z: 10.641204270993434 }
    const arcadeRotation = Math.PI // Tourner vers les machines (180°, regarde vers -z)
    setMyPosition(arcadePos)
    setMyRotation(arcadeRotation)

    // Positionner la caméra derrière le joueur
    if (orbitControlsRef.current) {
      const controls = orbitControlsRef.current
      controls.target.set(arcadePos.x, arcadePos.y + 1, arcadePos.z)
      controls.object.position.set(arcadePos.x, arcadePos.y + 8, arcadePos.z + 15)
      controls.update()
    }

    // Update position in database
    supabase
      .from("interactive_profiles")
      .update({
        position_x: arcadePos.x,
        position_y: arcadePos.y,
        position_z: arcadePos.z,
        rotation: arcadeRotation,
        current_room: "arcade",
      })
      .eq("user_id", userId)
      .then(() => {})
  }

  const handleLeaveArcade = () => {
    setMyPosition(savedMapPosition) // Restore saved position
    setCurrentRoom(null) // Clear local state

    supabase
      .from("interactive_profiles")
      .update({
        position_x: savedMapPosition.x,
        position_y: savedMapPosition.y,
        position_z: savedMapPosition.z,
        current_room: null,
      })
      .eq("user_id", userId)
      .then(() => {})
  }

  const handleSelectArcadeMachine = (machine: any) => {
    if (machine.openInNewTab) {
      // Afficher la modal avec compte à rebours avant d'ouvrir dans un nouvel onglet
      setPendingExternalMachine(machine)
      setExternalCountdown(5)
      setShowArcade(false)
    } else {
      setCurrentArcadeMachine(machine)
      setShowArcade(false) // Close the list of machines
    }
  }

  // Effet pour le compte à rebours
  useEffect(() => {
    if (pendingExternalMachine && externalCountdown > 0) {
      const timer = setTimeout(() => {
        setExternalCountdown(externalCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [pendingExternalMachine, externalCountdown])

  const handleOpenExternalMachine = () => {
    if (pendingExternalMachine && externalCountdown === 0) {
      window.open(pendingExternalMachine.url, '_blank')
      setPendingExternalMachine(null)
    }
  }

  const handleCloseExternalModal = () => {
    setPendingExternalMachine(null)
    setExternalCountdown(5)
  }

  const handleCloseArcadeMachine = () => {
    setCurrentArcadeMachine(null)
  }

  const handleEnterCinemaRoom = async (room: any) => {
    // Clear old seat data immediately to prevent stale state
    setCinemaSeats([])
    setMySeat(null)

    // Save current map position before entering cinema
    setSavedMapPosition({ x: myPosition.x, y: myPosition.y, z: myPosition.z })

    // Position d'arrivée dans le cinéma (au fond de la salle)
    const cinemaSpawnPos = { x: -0.7003322451885853, y: -0.35, z: 11.633941158451258 }
    setMyPosition(cinemaSpawnPos)

    setShowCinema(false)

    // Release only MY seat if I had one in this room (RLS prevents resetting others' seats)
    await supabase
      .from("interactive_cinema_seats")
      .update({ user_id: null, is_occupied: false, occupied_at: null })
      .eq("room_id", room.id)
      .eq("user_id", userId)

    // Update profile position
    await supabase
      .from("interactive_profiles")
      .update({
        current_room: `cinema_${room.id}`,
        position_x: cinemaSpawnPos.x,
        position_y: cinemaSpawnPos.y,
        position_z: cinemaSpawnPos.z,
      })
      .eq("user_id", userId)

    // Set room LAST - this triggers the useEffect which will load seats correctly
    setCurrentRoom(`cinema_${room.id}`) // Set local state for player filtering
    setCurrentCinemaRoom(room) // This triggers useEffect -> loadSeats()
  }

  const handleLeaveRoom = async () => {
    if (mySeat !== null && currentCinemaRoom) {
      await supabase.from("interactive_cinema_seats").update({
        user_id: null,
        is_occupied: false,
        occupied_at: null,
      }).eq("room_id", currentCinemaRoom.id).eq("user_id", userId)
      setMySeat(null)
    }

    // Clear seat data when leaving to prevent stale state on re-entry
    setCinemaSeats([])

    setCurrentCinemaRoom(null)
    setCurrentRoom(null) // Clear local state for player filtering
    setIsSeatsLocked(false) // Ensure seats are unlocked when leaving
    setCountdown("") // Clear countdown when leaving room

    setMyPosition(savedMapPosition) // Restore saved position

    await supabase
      .from("interactive_profiles")
      .update({
        current_room: null,
        position_x: savedMapPosition.x,
        position_y: savedMapPosition.y,
        position_z: savedMapPosition.z,
      })
      .eq("user_id", userId)
  }

  const handleSitInAnySeat = async () => {
    if (!currentCinemaRoom) return

    // Find first available seat (not occupied)
    const availableSeat = cinemaSeats.find((s) => !s.is_occupied)

    if (!availableSeat) {
      return
    }

    // S'asseoir sur ce siège
    const { error } = await supabase.from("interactive_cinema_seats").update({
      user_id: userId,
      is_occupied: true,
      occupied_at: new Date().toISOString(),
    }).eq("room_id", currentCinemaRoom.id).eq("row_number", availableSeat.row_number).eq("seat_number", availableSeat.seat_number)

    if (!error) {
      // Stocker un ID unique pour le siège (row * 100 + seat)
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
      console.error("Erreur s'asseoir:", error)
    }
  }

  // Se lever du siège actuel
  const handleSitInSeat = async (seatId: number) => {
    // Si on a un seatId, c'est qu'on veut se lever
    if (mySeat !== null) {
      await supabase.from("interactive_cinema_seats").update({
        user_id: null,
        is_occupied: false,
        occupied_at: null,
      }).eq("room_id", currentCinemaRoom.id).eq("user_id", userId)

      setMySeat(null)
      setMyPosition({ x: 0, y: 0.5, z: 0 }) // Reset position to cinema spawn
    }
  }

  function handleEnterStadium() {
    if (!stadium) return
    setShowStadium(false)
    setCurrentCinemaRoom(null)

    // Save current map position before entering stadium
    setSavedMapPosition({ x: myPosition.x, y: myPosition.y, z: myPosition.z })

    setCurrentRoom("stadium") // Set local state immediately

    // Teleport player to stadium viewing position
    const stadiumPos = { x: 0, y: 0.5, z: 0 } // Center position at spawn
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
      .then(() => {})
  }

  const handleLeaveStadium = () => {
    setStadiumSeat(null) // Reset stadium seat
    setMyPosition(savedMapPosition) // Restore saved position
    setCurrentRoom(null) // Clear local state

    supabase
      .from("interactive_profiles")
      .update({
        position_x: savedMapPosition.x,
        position_y: savedMapPosition.y,
        position_z: savedMapPosition.z,
        current_room: null,
      })
      .eq("user_id", userId)
      .then(() => {})
  }

  // S'asseoir sur un gradin du stade
  const handleSitInStadium = () => {
    if (stadiumSeat) return // Déjà assis

    // Déterminer le côté le plus proche en fonction de la position du joueur
    let side = "north" // côté z = -25 (derrière l'écran)
    if (myPosition.z > 12) side = "south"
    else if (myPosition.x < -15) side = "west"
    else if (myPosition.x > 15) side = "east"
    else if (myPosition.z < -12) side = "north"

    // Choisir une rangée aléatoire (0-4)
    const row = Math.floor(Math.random() * 5)

    // Calculer la position du siège selon le côté
    // Hauteur du gradin: base 1 + row * 1.5, hauteur box 1, donc surface à 1.5 + row * 1.5
    // On ajoute 1 pour que le joueur soit assis SUR le gradin (pas dedans)
    const seatY = 2.5 + row * 1.5
    let seatPos = { x: 0, y: seatY, z: 0 }
    let seatRotation = 0 // Rotation pour regarder vers le centre du stade (l'écran)
    switch (side) {
      case "north":
        seatPos = { x: myPosition.x, y: seatY, z: -25 - 2 - row * 1.2 }
        seatRotation = 0 // Regarder vers +z (sud, vers le centre)
        break
      case "south":
        seatPos = { x: myPosition.x, y: seatY, z: 25 + 2 + row * 1.2 }
        seatRotation = Math.PI // Regarder vers -z (nord, vers le centre)
        break
      case "west":
        seatPos = { x: -35 - 2 - row * 1.2, y: seatY, z: myPosition.z }
        seatRotation = -Math.PI / 2 // Regarder vers +x (est, vers le centre)
        break
      case "east":
        seatPos = { x: 35 + 2 + row * 1.2, y: seatY, z: myPosition.z }
        seatRotation = Math.PI / 2 // Regarder vers -x (ouest, vers le centre)
        break
    }

    setStadiumSeat({ row, side })
    setMyPosition(seatPos)
    setMyRotation(seatRotation)

    // Positionner la caméra derrière le joueur, regardant vers le centre du stade
    if (orbitControlsRef.current) {
      const controls = orbitControlsRef.current
      const maxDist = 25 // Distance max de zoom (dézoom maximum)

      // Calculer la position de la caméra derrière le joueur
      // La caméra doit être du côté opposé au centre (derrière le joueur)
      let cameraOffset = { x: 0, z: 0 }
      switch (side) {
        case "north":
          cameraOffset = { x: 0, z: -maxDist } // Caméra au nord du joueur
          break
        case "south":
          cameraOffset = { x: 0, z: maxDist } // Caméra au sud du joueur
          break
        case "west":
          cameraOffset = { x: -maxDist, z: 0 } // Caméra à l'ouest du joueur
          break
        case "east":
          cameraOffset = { x: maxDist, z: 0 } // Caméra à l'est du joueur
          break
      }

      // Mettre à jour la cible des OrbitControls (le joueur)
      controls.target.set(seatPos.x, seatPos.y + 1, seatPos.z)

      // Positionner la caméra derrière le joueur avec un léger angle vers le haut
      controls.object.position.set(
        seatPos.x + cameraOffset.x * 0.6,
        seatPos.y + 8, // Légèrement au-dessus
        seatPos.z + cameraOffset.z * 0.6
      )

      controls.update()
    }

    supabase
      .from("interactive_profiles")
      .update({
        position_x: seatPos.x,
        position_y: seatPos.y,
        position_z: seatPos.z,
        rotation: seatRotation,
      })
      .eq("user_id", userId)
      .then(() => {})
  }

  // Se lever du gradin
  const handleStandUpFromStadium = () => {
    if (!stadiumSeat) return

    // Retourner sur le terrain
    const standPos = { x: 0, y: 0.5, z: 0 }
    setStadiumSeat(null)
    setMyPosition(standPos)

    supabase
      .from("interactive_profiles")
      .update({
        position_x: standPos.x,
        position_y: standPos.y,
        position_z: standPos.z,
      })
      .eq("user_id", userId)
      .then(() => {})
  }

  function handleEnterBuilding() {
    if (!nearbyBuilding) return

    switch (nearbyBuilding.type) {
      case "arcade":
        handleEnterArcade()
        break
      case "cinema":
        setShowCinema(true)
        break
      case "stadium":
        handleEnterStadium()
        break
    }
  }

  // Gestion des touches F ou Enter pour entrer dans les bâtiments
  useEffect(() => {
    const handleInteractKey = (e: KeyboardEvent) => {
      if ((e.key === "f" || e.key === "F" || e.key === "Enter") && nearbyBuilding && currentRoom === null) {
        handleEnterBuilding()
      }
    }

    window.addEventListener("keydown", handleInteractKey)

    return () => {
      window.removeEventListener("keydown", handleInteractKey)
    }
  }, [nearbyBuilding, currentRoom])

  // Détecter la proximité des bâtiments
  useEffect(() => {
    if (currentRoom !== null) {
      setNearbyBuilding(null)
      return
    }

    const distanceToArcade = Math.sqrt(Math.pow(myPosition.x - 0, 2) + Math.pow(myPosition.z - 15, 2))
    const distanceToCinema = Math.sqrt(Math.pow(myPosition.x - 15, 2) + Math.pow(myPosition.z - 0, 2))
    const distanceToStadium = Math.sqrt(Math.pow(myPosition.x - 25, 2) + Math.pow(myPosition.z - (-15), 2))

    const proximityThreshold = 8

    if (distanceToArcade < proximityThreshold) {
      setNearbyBuilding({ name: "Arcade", type: "arcade", emoji: "🕹️" })
    } else if (distanceToCinema < proximityThreshold) {
      setNearbyBuilding({ name: "Cinéma", type: "cinema", emoji: "🎬" })
    } else if (distanceToStadium < proximityThreshold) {
      setNearbyBuilding({ name: "Stade", type: "stadium", emoji: "⚽" })
    } else {
      setNearbyBuilding(null)
    }
  }, [myPosition, currentRoom])

  useEffect(() => {
    const checkCapacity = async () => {
      const { count } = await supabase
        .from("interactive_profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_online", true)

      if (count && count >= worldSettings.maxCapacity) {
        // Could show a message to user here
      }
    }

    checkCapacity()
  }, [worldSettings.maxCapacity])

  useEffect(() => {
    const channel = supabase
      .channel("world-actions")
      .on("broadcast", { event: "player-action" }, ({ payload }: any) => {
        if (payload && payload.userId && payload.userId !== userId) {
          // Handle actions like jump and emoji
          setPlayerActions((prev) => ({
            ...prev,
            [payload.userId]: {
              action: payload.action,
              timestamp: Date.now(),
              ...(payload.action === "emoji" && { emoji: payload.emoji }),
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
          )
        }
      })
      .subscribe()

    // Store channel ref for sending actions
    actionsChannelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      actionsChannelRef.current = null
    }
  }, [userId])

  const broadcastAction = async (action: string) => {
    await supabase.channel("player-actions").send({
      type: "broadcast",
      event: "action",
      payload: { userId: userId, action }, // Use userId from props
    })
  }

  // Handle quick actions (emotes, jumps)
  const handleQuickAction = (action: string) => {
    if (!userProfile) {
      return
    }

    setQuickAction(action)
    setShowQuickActions(false)

    // Broadcast quick action to other players
    if (actionsChannelRef.current) {
      actionsChannelRef.current.send({
        type: "broadcast",
        event: "player-action",
        payload: {
          userId: userId, // Use userId prop for consistency
          action,
          timestamp: Date.now(),
        },
      })
    }

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

      setMyProfile(data)

      if (data) {
        const isInSpecialRoom = data.current_room === "stadium" || data.current_room === "arcade" || (data.current_room && data.current_room.startsWith('cinema_'))

        // Si l'utilisateur était dans une salle spéciale (cinéma, stade, arcade),
        // on le remet au spawn et on libère son siège car c'est un nouveau chargement de page
        if (isInSpecialRoom) {
          const spawnPosition = { x: 0, y: 0.5, z: 0 }
          setMyPosition(spawnPosition)
          setMyRotation(0)
          setCurrentRoom(null)
          setSavedMapPosition(spawnPosition)

          // Libérer le siège dans le cinéma si c'était une salle de cinéma
          if (data.current_room && data.current_room.startsWith('cinema_')) {
            const roomId = data.current_room.replace('cinema_', '')
            supabase
              .from('interactive_cinema_seats')
              .update({ is_occupied: false, user_id: null, occupied_at: null })
              .eq('user_id', data.user_id)
              .then(() => {
                console.log('[Cinema] Released seat on page reload')
              })
          }

          // Mettre à jour la BDD pour refléter la nouvelle position
          supabase
            .from('interactive_profiles')
            .update({
              current_room: null,
              position_x: spawnPosition.x,
              position_y: spawnPosition.y,
              position_z: spawnPosition.z,
            })
            .eq('user_id', userId)
            .then(() => {
              console.log('[Profile] Reset to spawn on page reload')
            })
        } else {
          // Comportement normal pour les joueurs sur la map
          const loadedPosition = { x: data.position_x, y: data.position_y, z: data.position_z }
          setMyPosition(loadedPosition)
          setMyRotation(data.rotation || 0)
          setCurrentRoom(data.current_room)
          setSavedMapPosition(loadedPosition)
        }
      }
    }

    loadMyProfile()
  }, [userId])

  const handleQuitWorld = async () => {
    // If user is in a special room (cinema, stadium, arcade), reset to spawn
    // Otherwise, save current position to restore it next time
    const isInSpecialRoom = currentRoom === "stadium" || currentRoom === "arcade" || (typeof currentRoom === 'object' && currentRoom !== null)

    const positionToSave = isInSpecialRoom
      ? { x: 0, y: 0.5, z: 0 }
      : { x: myPosition.x, y: myPosition.y, z: myPosition.z }

    // Save position in database
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
          <>
            <PerspectiveCamera makeDefault fov={75} />
            <FirstPersonCamera
              position={myPosition}
              rotation={fpsRotation}
              onRotationChange={(yaw, pitch) => setFpsRotation({ yaw, pitch })}
            />
          </>
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

        <hemisphereLight intensity={0.3} groundColor="#6b7280" />

        {/* Update rendering logic to use currentRoom state instead of userProfile */}
        {!currentCinemaRoom && currentRoom !== "stadium" && currentRoom !== "arcade" ? (
          <>
            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[60, 60]} />
              <meshStandardMaterial color="#4ade80" roughness={0.95} metalness={0} />
            </mesh>

            {/* Collision Debug Visualization */}
            {showCollisionDebug && (
              <>
                {/* World Boundary Walls (invisible walls at maxX=28, maxZ=28) */}
                {/* North wall (Z = 28) */}
                <mesh position={[0, 2, 28]}>
                  <boxGeometry args={[56, 4, 0.2]} />
                  <meshBasicMaterial color="#ff0000" transparent opacity={0.3} />
                </mesh>
                {/* South wall (Z = -28) */}
                <mesh position={[0, 2, -28]}>
                  <boxGeometry args={[56, 4, 0.2]} />
                  <meshBasicMaterial color="#ff0000" transparent opacity={0.3} />
                </mesh>
                {/* East wall (X = 28) */}
                <mesh position={[28, 2, 0]}>
                  <boxGeometry args={[0.2, 4, 56]} />
                  <meshBasicMaterial color="#ff0000" transparent opacity={0.3} />
                </mesh>
                {/* West wall (X = -28) */}
                <mesh position={[-28, 2, 0]}>
                  <boxGeometry args={[0.2, 4, 56]} />
                  <meshBasicMaterial color="#ff0000" transparent opacity={0.3} />
                </mesh>
                {/* Floor boundary indicator */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                  <planeGeometry args={[56, 56]} />
                  <meshBasicMaterial color="#ff0000" transparent opacity={0.1} wireframe />
                </mesh>
                {/* Boundary labels */}
                <Html position={[0, 4.5, 28]} center zIndexRange={[0, 0]}>
                  <div className="bg-red-600/90 text-white px-3 py-1 rounded text-xs font-bold pointer-events-none">
                    MUR NORD (Z=28)
                  </div>
                </Html>
                <Html position={[0, 4.5, -28]} center zIndexRange={[0, 0]}>
                  <div className="bg-red-600/90 text-white px-3 py-1 rounded text-xs font-bold pointer-events-none">
                    MUR SUD (Z=-28)
                  </div>
                </Html>
                <Html position={[28, 4.5, 0]} center zIndexRange={[0, 0]}>
                  <div className="bg-red-600/90 text-white px-3 py-1 rounded text-xs font-bold pointer-events-none">
                    MUR EST (X=28)
                  </div>
                </Html>
                <Html position={[-28, 4.5, 0]} center zIndexRange={[0, 0]}>
                  <div className="bg-red-600/90 text-white px-3 py-1 rounded text-xs font-bold pointer-events-none">
                    MUR OUEST (X=-28)
                  </div>
                </Html>

                {/* Collision zones */}
                {collisionZonesData.map((zone, idx) => (
                  <group key={`collision-debug-${zone.x}-${zone.z}-${zone.label}-${idx}`} position={[zone.x, 0.05, zone.z]}>
                    {/* Flat box showing collision area */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                      <planeGeometry args={[zone.width, zone.depth]} />
                      <meshBasicMaterial color={zone.color} transparent opacity={0.5} />
                    </mesh>
                    {/* Wireframe border */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                      <planeGeometry args={[zone.width, zone.depth]} />
                      <meshBasicMaterial color={zone.color} wireframe />
                    </mesh>
                    {/* Vertical box to show height */}
                    <mesh position={[0, 1.5, 0]}>
                      <boxGeometry args={[zone.width, 3, zone.depth]} />
                      <meshBasicMaterial color={zone.color} transparent opacity={0.15} />
                    </mesh>
                    {/* Label */}
                    <Html position={[0, 3.5, 0]} center zIndexRange={[0, 0]}>
                      <div className="bg-black/90 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-lg pointer-events-none" style={{ borderColor: zone.color, borderWidth: 2, borderStyle: "solid" }}>
                        <div className="font-bold text-sm" style={{ color: zone.color }}>{zone.id}</div>
                        <div className="opacity-80">{zone.label}</div>
                        <div className="text-[10px] opacity-60 mt-1">
                          pos: ({zone.x}, {zone.z}) | size: {zone.width}x{zone.depth}
                        </div>
                      </div>
                    </Html>
                  </group>
                ))}
              </>
            )}

            {/* Arcade building - Entre TREE_7 (-10, 15) et TREE_8 (10, 15) */}
            <group position={[0, 0, 15]}>
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

              {/* Building name - always visible and clickable */}
              <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
                <Html position={[0, 8, 0]} center zIndexRange={[0, 0]}>
                  <button
                    onClick={handleEnterArcade}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl shadow-2xl font-bold text-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-105 pointer-events-auto whitespace-nowrap"
                  >
                    🕹️ Arcade
                  </button>
                </Html>
              </Billboard>

              {/* Bouton d'entrée visible quand on est près */}
              {Math.sqrt(Math.pow(myPosition.x - 0, 2) + Math.pow(myPosition.z - 15, 2)) < 8 && (
                <Html position={[0, 2, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
                  <button
                    onClick={handleEnterArcade}
                    className="bg-purple-600/90 backdrop-blur-sm hover:bg-purple-700 text-white px-6 py-3 rounded-lg shadow-2xl text-base font-bold transition-all hover:scale-110 border-2 border-white/30 flex items-center gap-2"
                  >
                    Entrer <kbd className="bg-white/20 px-2 py-0.5 rounded text-sm">F</kbd>
                  </button>
                </Html>
              )}
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

              {/* Building name - always visible and clickable */}
              <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
                <Html position={[0, 9, 0]} center zIndexRange={[0, 0]}>
                  <button
                    onClick={handleEnterStadium}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-2xl font-bold text-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-105 pointer-events-auto whitespace-nowrap"
                  >
                    ⚽ Stade
                  </button>
                </Html>
              </Billboard>

              {/* Bouton d'entrée visible quand on est près */}
              {Math.sqrt(Math.pow(myPosition.x - 25, 2) + Math.pow(myPosition.z - (-15), 2)) < 8 && (
                <Html position={[0, 2, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
                  <button
                    onClick={handleEnterStadium}
                    className="bg-green-600/90 backdrop-blur-sm hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-2xl text-base font-bold transition-all hover:scale-110 border-2 border-white/30 flex items-center gap-2"
                  >
                    Entrer <kbd className="bg-white/20 px-2 py-0.5 rounded text-sm">F</kbd>
                  </button>
                </Html>
              )}
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

            {/* BLDG_3 - Bâtiment Orange */}
            <group position={[-15, 0, -8]}>
              <mesh position={[0, 3, 0]} castShadow receiveShadow>
                <boxGeometry args={[4, 6, 4]} />
                <meshStandardMaterial color="#f59e0b" />
              </mesh>
              {/* Toit plat avec bordure */}
              <mesh position={[0, 6.2, 0]} castShadow>
                <boxGeometry args={[4.2, 0.4, 4.2]} />
                <meshStandardMaterial color="#ea580c" />
              </mesh>
              {/* Petite structure sur le toit */}
              <mesh position={[0, 6.8, 0]} castShadow>
                <boxGeometry args={[1.5, 1, 1.5]} />
                <meshStandardMaterial color="#dc2626" />
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

              {/* Building name - always visible and clickable */}
              <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
                <Html position={[0, 7, 0]} center zIndexRange={[0, 0]}>
                  <button
                    onClick={() => setShowCinema(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-2xl font-bold text-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-105 pointer-events-auto whitespace-nowrap"
                  >
                    🎬 Cinéma
                  </button>
                </Html>
              </Billboard>

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

              {/* Bouton d'entrée visible quand on est près */}
              {Math.sqrt(Math.pow(myPosition.x - 15, 2) + Math.pow(myPosition.z - 0, 2)) < 8 && (
                <Html position={[0, 2, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
                  <button
                    onClick={() => setShowCinema(true)}
                    className="bg-blue-600/90 backdrop-blur-sm hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-2xl text-base font-bold transition-all hover:scale-110 border-2 border-white/30 flex items-center gap-2"
                  >
                    Entrer <kbd className="bg-white/20 px-2 py-0.5 rounded text-sm">F</kbd>
                  </button>
                </Html>
              )}
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

            {/* Bâtiments désactivés - décommenter pour réactiver

            {/* BLDG_1 - Bâtiment Sud-Ouest (Bibliothèque) */}
            {/*
            <group position={[-15, 0, -15]}>
              <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[5, 5, 5]} />
                <meshStandardMaterial color="#7c3aed" roughness={0.7} />
              </mesh>
              <mesh position={[0, 5.5, 0]} castShadow>
                <boxGeometry args={[5.3, 0.5, 5.3]} />
                <meshStandardMaterial color="#5b21b6" />
              </mesh>
              {[[-2, 2], [2, 2], [-2, -2], [2, -2]].map(([x, z]) => (
                <mesh key={`col-${x}-${z}`} position={[x, 2.5, z]} castShadow>
                  <cylinderGeometry args={[0.2, 0.25, 5, 8]} />
                  <meshStandardMaterial color="#e5e7eb" />
                </mesh>
              ))}
              <Html position={[0, 6.5, 0]} center>
                <div className="bg-purple-600/90 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
                  📚 Bibliothèque
                </div>
              </Html>
            </group>
            */}

            {/* BLDG_4 - Bâtiment Nord-Ouest (Musée) */}
            {/*
            <group position={[-20, 0, 15]}>
              <mesh position={[0, 3, 0]} castShadow receiveShadow>
                <boxGeometry args={[9, 6, 9]} />
                <meshStandardMaterial color="#dc2626" roughness={0.6} />
              </mesh>
              <mesh position={[0, 6.5, 0]} castShadow>
                <boxGeometry args={[9.3, 0.6, 9.3]} />
                <meshStandardMaterial color="#991b1b" />
              </mesh>
              <mesh position={[0, 7.5, 0]} castShadow>
                <sphereGeometry args={[2.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.3} />
              </mesh>
              {[-3, 0, 3].map((x) => (
                <mesh key={`museum-win-${x}`} position={[x, 3.5, 4.6]}>
                  <planeGeometry args={[1.8, 2.5]} />
                  <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.3} />
                </mesh>
              ))}
              <Html position={[0, 8.5, 0]} center>
                <div className="bg-red-600/90 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
                  🏛️ Musée
                </div>
              </Html>
            </group>
            */}

            {/* BLDG_5 - Bâtiment Nord-Est (Restaurant) */}
            {/*
            <group position={[20, 0, 10]}>
              <mesh position={[0, 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[7, 4, 7]} />
                <meshStandardMaterial color="#16a34a" roughness={0.7} />
              </mesh>
              <mesh position={[0, 4.5, 0]} castShadow>
                <boxGeometry args={[7.3, 0.5, 7.3]} />
                <meshStandardMaterial color="#15803d" />
              </mesh>
              <mesh position={[-2, 5, -2]} castShadow>
                <coneGeometry args={[1.2, 0.8, 8]} />
                <meshStandardMaterial color="#f97316" />
              </mesh>
              <mesh position={[2, 5, 2]} castShadow>
                <coneGeometry args={[1.2, 0.8, 8]} />
                <meshStandardMaterial color="#ef4444" />
              </mesh>
              <mesh position={[0, 4.8, 3.6]}>
                <boxGeometry args={[4, 0.8, 0.1]} />
                <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
              </mesh>
              <pointLight position={[0, 5, 3.6]} intensity={1.5} distance={8} color="#fbbf24" />
              <Html position={[0, 6, 0]} center>
                <div className="bg-green-600/90 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
                  🍽️ Restaurant
                </div>
              </Html>
            </group>
            */}

            {/* BLDG_6 - Bâtiment Nord (Centre Commercial) */}
            {/*
            <group position={[0, 0, 25]}>
              <mesh position={[0, 4, 0]} castShadow receiveShadow>
                <boxGeometry args={[12, 8, 12]} />
                <meshStandardMaterial color="#0891b2" roughness={0.5} />
              </mesh>
              <mesh position={[0, 8.5, 0]} castShadow>
                <boxGeometry args={[12.5, 0.6, 12.5]} />
                <meshStandardMaterial color="#0e7490" />
              </mesh>
              <mesh position={[0, 10, 0]} castShadow>
                <boxGeometry args={[4, 4, 4]} />
                <meshStandardMaterial color="#06b6d4" />
              </mesh>
              <mesh position={[0, 12.5, 0]} castShadow>
                <coneGeometry args={[2.5, 2, 4]} />
                <meshStandardMaterial color="#0891b2" />
              </mesh>
              <mesh position={[0, 2.5, 6.1]}>
                <planeGeometry args={[8, 4]} />
                <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={0.4} transparent opacity={0.8} />
              </mesh>
              <mesh position={[0, 1.5, 6.1]}>
                <boxGeometry args={[3, 3, 0.1]} />
                <meshStandardMaterial color="#164e63" />
              </mesh>
              <Html position={[0, 13.5, 0]} center>
                <div className="bg-cyan-600/90 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
                  🛒 Centre Commercial
                </div>
              </Html>
            </group>
            */}
            {/* Fin bâtiments désactivés */}

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
              [-12, 12].map((z) => (
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

            {graphicsQuality !== "low" && (
              <group position={[-15, 0, 0]}>
                <mesh position={[0, 0.3, 0]} castShadow>
                  <cylinderGeometry args={[2, 2.5, 0.6, 16]} />
                  <meshStandardMaterial color="#6b7280" roughness={0.3} metalness={0.8} />
                </mesh>
                <mesh position={[0, 1, 0]}>
                  <cylinderGeometry args={[0.3, 0.3, 1.4, 8]} />
                  <meshStandardMaterial color="#94a3b8" roughness={0.2} metalness={0.9} />
                </mesh>
                <mesh position={[0, 1.8, 0]}>
                  <sphereGeometry args={[0.4, 16, 16]} />
                  <meshStandardMaterial
                    color="#60a5fa"
                    emissive="#60a5fa"
                    emissiveIntensity={0.3}
                    transparent
                    opacity={0.7}
                  />
                </mesh>
                <pointLight position={[0, 2, 0]} intensity={1} distance={8} color="#60a5fa" />
              </group>
            )}

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

            {/* Arcade Machines - aligned at the back wall */}
            {arcadeMachines.slice(0, 7).map((machine, idx) => {
              // All machines at back wall, spread evenly
              const totalMachines = Math.min(arcadeMachines.length, 7)
              const spacing = 5
              const totalWidth = (totalMachines - 1) * spacing
              const x = -totalWidth / 2 + idx * spacing
              const z = -15
              const rotationY = 0  // All face forward

              return (
                <group key={machine.id} position={[x, 0, z]} rotation={[0, rotationY, 0]}>
                  {/* Machine Cabinet */}
                  <mesh position={[0, 1.5, 0]} castShadow>
                    <boxGeometry args={[2.5, 3, 1.5]} />
                    <meshStandardMaterial
                      color={["#e11d48", "#8b5cf6", "#0ea5e9", "#f59e0b"][idx % 4]}
                      roughness={0.3}
                      metalness={0.7}
                    />
                  </mesh>

                  {/* Screen - Video or Image from machine.media */}
                  <group position={[0, 2, 0.76]}>
                    {machine.media?.type === 'video' ? (
                      <VideoScreen
                        src={machine.media.src}
                        width={2}
                        height={1.5}
                        muted={true}
                        loop={true}
                      />
                    ) : machine.media?.type === 'image' ? (
                      <ImageScreen
                        src={machine.media.src}
                        width={2}
                        height={1.5}
                      />
                    ) : (
                      <mesh>
                        <planeGeometry args={[2, 1.5]} />
                        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
                      </mesh>
                    )}
                  </group>

                  {/* Control Panel */}
                  <mesh position={[0, 0.8, 1]} rotation={[-Math.PI / 6, 0, 0]}>
                    <boxGeometry args={[2.3, 0.3, 0.8]} />
                    <meshStandardMaterial color="#1a1a1a" />
                  </mesh>

                  {/* Machine name label - hide when a game or modal is open */}
                  {!currentArcadeMachine && !showArcade && !pendingExternalMachine && (
                    <Html position={[0, 3.5, 0]} center occlude>
                      <div className="bg-black/80 text-white px-3 py-1 rounded text-sm font-bold whitespace-nowrap">
                        {machine.name}
                      </div>
                    </Html>
                  )}

                  {/* Interaction button - hide when a game or modal is open */}
                  {!currentArcadeMachine && !showArcade && !pendingExternalMachine && (
                    <Html position={[0, 0.5, 1.5]} center occlude>
                      <button
                        onClick={() => handleSelectArcadeMachine(machine)}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded font-medium transition-all hover:scale-105 shadow-md"
                      >
                        Jouer
                      </button>
                    </Html>
                  )}

                  {/* Light above machine */}
                  <pointLight position={[0, 4, 0]} intensity={1.5} distance={8} color="#ff00ff" />
                </group>
              )
            })}

            {/* Button to show all machines list */}
            {!currentArcadeMachine && !showArcade && !pendingExternalMachine && (
              <Html position={[0, 1, 15]} center occlude>
                <button
                  onClick={() => setShowArcade(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-bold shadow-xl flex items-center gap-2"
                >
                  <Gamepad2 className="w-5 h-5" />
                  Voir toutes les machines
                </button>
              </Html>
            )}
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

            {/* Stadium stands (gradins) */}
            {[
              { x: 0, z: -25, rot: 0, w: 70 },
              { x: 0, z: 25, rot: Math.PI, w: 70 },
              { x: -35, z: 0, rot: Math.PI / 2, w: 60 },
              { x: 35, z: 0, rot: -Math.PI / 2, w: 60 },
            ].map((stand) => (
              <group key={`stadium-stand-${stand.x}-${stand.z}`} position={[stand.x, 0, stand.z]} rotation={[0, stand.rot, 0]}>
                {/* Seating rows (gradins visibles) */}
                {[0, 1, 2, 3, 4].map((row) => (
                  <mesh key={`${stand.x}-${stand.z}-row-${row}`} position={[0, 1 + row * 1.5, -2 - row * 1.2]}>
                    <boxGeometry args={[stand.w - 2, 1, 3]} />
                    <meshStandardMaterial color={row % 2 === 0 ? "#1e3a8a" : "#3b82f6"} />
                  </mesh>
                ))}
              </group>
            ))}

            {/* Écrans aux 4 côtés - visibles seulement quand assis du côté opposé */}
            {/* Flux HLS de test (même que salle cinéma 1) */}
            {/* Écran Nord (visible depuis tribune Sud) */}
            {stadiumSeat?.side === "south" && (
              <group position={[0, 8, -22]} rotation={[0, 0, 0]}>
                <mesh>
                  <boxGeometry args={[20, 12, 0.5]} />
                  <meshStandardMaterial color="#111111" />
                </mesh>
                <HLSVideoScreen
                  src="https://amg02162-newenconnect-amg02162c2-rakuten-us-1981.playouts.now.amagi.tv/ts-us-e2-n2/playlist/amg02162-newenconnect-100pour100docs-rakutenus/playlist.m3u8"
                  width={19}
                  height={11}
                  position={[0, 0, 0.3]}
                  autoplay={true}
                  muted={false}
                />
              </group>
            )}
            {/* Écran Sud (visible depuis tribune Nord) */}
            {stadiumSeat?.side === "north" && (
              <group position={[0, 8, 22]} rotation={[0, Math.PI, 0]}>
                <mesh>
                  <boxGeometry args={[20, 12, 0.5]} />
                  <meshStandardMaterial color="#111111" />
                </mesh>
                <HLSVideoScreen
                  src="https://amg02162-newenconnect-amg02162c2-rakuten-us-1981.playouts.now.amagi.tv/ts-us-e2-n2/playlist/amg02162-newenconnect-100pour100docs-rakutenus/playlist.m3u8"
                  width={19}
                  height={11}
                  position={[0, 0, 0.3]}
                  autoplay={true}
                  muted={false}
                />
              </group>
            )}
            {/* Écran Ouest (visible depuis tribune Est) */}
            {stadiumSeat?.side === "east" && (
              <group position={[-32, 8, 0]} rotation={[0, Math.PI / 2, 0]}>
                <mesh>
                  <boxGeometry args={[20, 12, 0.5]} />
                  <meshStandardMaterial color="#111111" />
                </mesh>
                <HLSVideoScreen
                  src="https://amg02162-newenconnect-amg02162c2-rakuten-us-1981.playouts.now.amagi.tv/ts-us-e2-n2/playlist/amg02162-newenconnect-100pour100docs-rakutenus/playlist.m3u8"
                  width={19}
                  height={11}
                  position={[0, 0, 0.3]}
                  autoplay={true}
                  muted={false}
                />
              </group>
            )}
            {/* Écran Est (visible depuis tribune Ouest) */}
            {stadiumSeat?.side === "west" && (
              <group position={[32, 8, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <mesh>
                  <boxGeometry args={[20, 12, 0.5]} />
                  <meshStandardMaterial color="#111111" />
                </mesh>
                <HLSVideoScreen
                  src="https://amg02162-newenconnect-amg02162c2-rakuten-us-1981.playouts.now.amagi.tv/ts-us-e2-n2/playlist/amg02162-newenconnect-100pour100docs-rakutenus/playlist.m3u8"
                  width={19}
                  height={11}
                  position={[0, 0, 0.3]}
                  autoplay={true}
                  muted={false}
                />
              </group>
            )}

            {/* Stadium lights */}
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

            {currentCinemaRoom &&
              currentCinemaRoom !== "world" &&
              (() => {
                const room = cinemaRooms.find((r) => r.id === currentCinemaRoom.id)
                if (!room) return null

                const isMovieStarted = room.schedule_start && new Date(room.schedule_start).getTime() < Date.now()

                return (
                  <group position={[0, 3, -20]}>
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
                )
              })()}

            {cinemaSeats.map((seat) => {
              // mySeat is stored as (row * 100 + seat_number), so calculate the same way for comparison
              const seatId = seat.row_number * 100 + seat.seat_number
              const isMySeat = mySeat === seatId
              // Use user_id as single source of truth for occupancy
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
        ) : null}

        {/* Player avatars with badges - using InterpolatedPlayer for smooth movement */}
        {otherPlayers
          .filter((p) => {
            const playerIsInSameRoom =
              currentRoom === p.current_room || (currentRoom === null && p.current_room === null)
            // Filter out players without valid username
            const hasValidProfile = (p.user_profiles?.username || p.username) ? true : false

            // Filter out players at default spawn position (not really in interactive)
            const isAtDefaultPosition = (p.position_x === 0 && p.position_z === 0 && (p.position_y === 0 || p.position_y === 0.5))

            return playerIsInSameRoom && hasValidProfile && !isAtDefaultPosition
          })
          .map((player) => (
            <InterpolatedPlayer
              key={player.user_id}
              player={player}
              avatarStyle={player.avatar_style || { bodyColor: "#ef4444", headColor: "#fbbf24", faceSmiley: "😊" }}
              playerAction={playerActions[player.user_id]}
              worldSettings={worldSettings}
              playerChatBubbles={playerChatBubbles}
            />
          ))}

        {!povMode && userProfile && (
          <group position={[myPosition.x, myPosition.y, myPosition.z]}>
            <group rotation={[0, myRotation, 0]}>
              <RealisticAvatar position={[0, 0, 0]} avatarStyle={myAvatarStyle} isMoving={isMoving} />
            </group>

            <Html position={[0, 2.6, 0]} center distanceFactor={10} zIndexRange={[0, 0]}>
              <div className="flex flex-col items-center gap-1 pointer-events-none">
                {worldSettings.showStatusBadges && (
                  <div className="flex items-center gap-1 bg-black/80 px-3 py-1 rounded-full backdrop-blur-sm whitespace-nowrap">
                    <span className="text-white text-xs font-medium whitespace-nowrap">{myProfile?.username || userProfile.username || "Vous"}</span>
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

      {/* Menu Button - caché quand un jeu arcade est ouvert */}
      {!currentArcadeMachine && (
      <div className={`absolute z-[100] flex flex-col ${isMobileMode ? 'top-4 left-4 gap-2' : 'top-6 left-6 gap-4'}`}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`bg-gradient-to-r from-blue-600 to-blue-500 backdrop-blur-lg text-white rounded-full hover:from-blue-700 hover:to-blue-600 transition-all shadow-2xl active:scale-95 ${isMobileMode ? 'p-2 border-2 border-white/40' : 'p-4 border-4 border-white/40'}`}
        >
          <Menu className={isMobileMode ? 'w-5 h-5' : 'w-8 h-8'} />
        </button>

        {showMenu && (
          <div className={`absolute top-0 mt-0 bg-black/95 backdrop-blur-xl rounded-xl shadow-2xl border-2 border-white/30 ${isMobileMode ? 'left-12 p-2 w-48 space-y-1' : 'left-20 p-4 w-80 space-y-3'}`}>
            <div className={`text-white border-b border-white/20 ${isMobileMode ? 'mb-2 pb-2' : 'mb-3 pb-3'}`}>
              <div className={`font-bold flex items-center gap-2 ${isMobileMode ? 'text-sm' : 'text-lg'}`}>
                <User className={isMobileMode ? 'w-4 h-4' : 'w-5 h-5'} />
                {myProfile?.username || "Vous"}
              </div>
              <div className={`flex items-center gap-2 text-white/60 mt-1 ${isMobileMode ? 'text-xs' : 'text-sm'}`}>
                <Users className={isMobileMode ? 'w-3 h-3' : 'w-4 h-4'} />
                <span>{onlineCount} en ligne</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSettings(true)
                setShowMenu(false)
              }}
              className={`w-full bg-blue-500/90 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 font-medium transition-colors ${isMobileMode ? 'py-2 text-xs' : 'py-3 text-base'}`}
            >
              <Settings className={isMobileMode ? 'w-4 h-4' : 'w-5 h-5'} />
              Paramètres
            </button>

            <button
              onClick={() => {
                setShowAvatarCustomizer(true)
                setShowMenu(false)
              }}
              className={`w-full bg-purple-500/90 text-white rounded-lg hover:bg-purple-600 flex items-center justify-center gap-2 font-medium transition-colors ${isMobileMode ? 'py-2 text-xs' : 'py-3 text-base'}`}
            >
              <Palette className={isMobileMode ? 'w-4 h-4' : 'w-5 h-5'} />
              Avatar
            </button>

            {worldSettings.enableChat && (
              <button
                onClick={() => {
                  setShowChat(true)
                  setShowMenu(false)
                }}
                className={`w-full bg-green-500/90 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 font-medium transition-colors ${isMobileMode ? 'py-2 text-xs' : 'py-3 text-base'}`}
              >
                <MessageSquare className={isMobileMode ? 'w-4 h-4' : 'w-5 h-5'} />
                Chat
              </button>
            )}

            <button
              onClick={() => {
                setShowMap(true)
                setShowMenu(false)
              }}
              className={`w-full bg-cyan-500/90 text-white rounded-lg hover:bg-cyan-600 flex items-center justify-center gap-2 font-medium transition-colors ${isMobileMode ? 'py-2 text-xs' : 'py-3 text-base'}`}
            >
              <Map className={isMobileMode ? 'w-4 h-4' : 'w-5 h-5'} />
              Carte
            </button>

            <button
              onClick={handleQuitWorld}
              className={`w-full bg-gray-600/90 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2 font-medium transition-colors border-t border-white/20 mt-2 pt-2 ${isMobileMode ? 'py-2 text-xs' : 'py-3 text-base'}`}
            >
              <LogOut className={isMobileMode ? 'w-4 h-4' : 'w-5 h-5'} />
              Quitter
            </button>
          </div>
        )}
      </div>
      )}

      {/* Bouton plein écran - caché en mode mobile */}
      {(!isFullscreen || isMobileMode) && !currentArcadeMachine && !isMobileMode && (
        <div className="absolute top-4 right-4 z-10 flex gap-3">
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
        isMobileMode ? (
          /* Mode mobile: input en bas de l'écran, style WhatsApp/Discord */
          <div className="fixed bottom-44 left-4 right-4 z-30 bg-black/90 backdrop-blur-lg rounded-2xl p-3 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-2">
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
                className="flex-1 bg-white/10 text-white px-4 py-3 rounded-xl outline-none text-sm"
                autoFocus
              />
              <button
                onClick={() => {
                  sendMessage()
                  setShowChatInput(false)
                }}
                className="bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 active:scale-95 transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowChatInput(false)}
                className="bg-gray-600 text-white p-3 rounded-xl hover:bg-gray-700 active:scale-95 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          /* Mode desktop: panneau à droite */
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
        )
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
          className="absolute bottom-24 right-36 z-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 shadow-lg flex items-center gap-2"
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

      {/* Boutons d'actions - positionnés différemment selon le mode mobile */}
      {isMobileMode ? (
        /* Mode mobile: boutons en haut à droite, alignés verticalement */
        <div className="fixed top-4 right-4 z-20 flex flex-col gap-2">
          {/* Bouton Plein écran */}
          <button
            onClick={handleFullscreen}
            className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-full shadow-xl flex items-center justify-center border-2 border-white/30"
            title="Mode Immersif"
          >
            <Maximize2 className="w-6 h-6 text-white" />
          </button>

          {/* Bouton changement de vue POV */}
          <button
            onClick={togglePovMode}
            className="w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-full shadow-xl flex items-center justify-center border-2 border-white/30"
            title={povMode ? "Vue troisième personne" : "Vue première personne"}
          >
            {povMode ? <Eye className="w-6 h-6 text-white" /> : <EyeOff className="w-6 h-6 text-white" />}
          </button>

          {/* Bouton Messages */}
          {worldSettings.enableChat && (
            <button
              onClick={() => setShowChatInput(true)}
              className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-xl flex items-center justify-center border-2 border-white/30"
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Bouton Emojis */}
          {worldSettings.enableEmojis && (
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-xl flex items-center justify-center border-2 border-white/30"
            >
              <Smile className="w-6 h-6 text-white" />
            </button>
          )}
        </div>
      ) : (
        /* Mode desktop: boutons en bas à droite */
        <>
          {/* Bouton Messages - à gauche du bouton emojis */}
          {worldSettings.enableChat && (
            <button
              onClick={() => setShowChatInput(true)}
              className="fixed bottom-6 right-28 w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-2xl flex items-center justify-center z-20 border-4 border-white/30 hover:scale-110 transition-transform"
            >
              <MessageCircle className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Bouton changement de vue POV - au dessus du bouton emojis */}
          <button
            onClick={togglePovMode}
            className="fixed bottom-28 right-6 w-16 h-16 bg-purple-600 hover:bg-purple-700 rounded-full shadow-2xl flex items-center justify-center z-20 border-4 border-white/30 hover:scale-110 transition-transform"
            title={povMode ? "Vue troisième personne" : "Vue première personne"}
          >
            {povMode ? <Eye className="w-8 h-8 text-white" /> : <EyeOff className="w-8 h-8 text-white" />}
          </button>

          {/* Bouton Emojis */}
          {worldSettings.enableEmojis && (
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="fixed bottom-6 right-6 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-2xl flex items-center justify-center z-20 border-4 border-white/30 hover:scale-110 transition-transform"
            >
              <Smile className="w-10 h-10 text-white" />
            </button>
          )}

        </>
      )}

      {/* Panel Quick Actions - positionné selon le mode */}
      {showQuickActions && (
        isMobileMode ? (
          /* Mode mobile: grille compacte en dessous des boutons */
          <div className="fixed top-[220px] right-4 z-20 bg-black/90 backdrop-blur-lg p-2 rounded-xl border-2 border-white/20 max-h-[50vh] overflow-y-auto w-[140px]">
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => handleQuickAction("jump")}
                className="bg-gray-800 text-white p-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
              {["😂", "👍", "❤️", "😭", "🔥", "🎉", "😎", "🤔", "😱", "💪", "🙏", "✨"].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmoji(emoji)}
                  className="text-2xl p-1 rounded-lg hover:bg-white/10 transition-colors text-center"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Mode desktop: colonne verticale */
          <div className="fixed bottom-28 right-6 z-20 bg-black/90 backdrop-blur-lg p-4 rounded-2xl border-2 border-white/20 max-h-[70vh] overflow-y-auto">
            <div className="flex flex-col gap-3">
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
        )
      )}

      {/* Boutons fixes en bas à droite - visible dans une salle */}
      {(currentCinemaRoom || currentRoom === "stadium" || currentRoom === "arcade") && (
        <div className="fixed bottom-6 right-48 z-30 flex items-center gap-3">
          {/* Bouton S'asseoir/Se lever - dans le cinéma */}
          {currentCinemaRoom && (
            mySeat === null ? (
              <button
                onClick={handleSitInAnySeat}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-center gap-2 transition-all hover:scale-105 border-2 border-white/20 w-[140px]"
              >
                <span className="text-lg">💺</span>
                <span className="font-medium">S'asseoir</span>
              </button>
            ) : (
              <button
                onClick={() => handleSitInSeat(mySeat)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-center gap-2 transition-all hover:scale-105 border-2 border-white/20 w-[140px]"
              >
                <span className="text-lg">🚶</span>
                <span className="font-medium">Se lever</span>
              </button>
            )
          )}
          {/* Bouton Mute/Unmute - dans le cinéma */}
          {currentCinemaRoom && (
            <button
              onClick={() => setIsCinemaMuted(!isCinemaMuted)}
              className={`${isCinemaMuted ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-center gap-2 transition-all hover:scale-105 border-2 border-white/20 w-[140px]`}
            >
              <span className="text-lg">{isCinemaMuted ? '🔇' : '🔊'}</span>
              <span className="font-medium">{isCinemaMuted ? 'Unmute' : 'Mute'}</span>
            </button>
          )}
          {/* Bouton S'asseoir/Se lever - dans le stade */}
          {currentRoom === "stadium" && (
            stadiumSeat === null ? (
              <button
                onClick={handleSitInStadium}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-center gap-2 transition-all hover:scale-105 border-2 border-white/20 w-[140px]"
              >
                <span className="text-lg">💺</span>
                <span className="font-medium">S'asseoir</span>
              </button>
            ) : (
              <button
                onClick={handleStandUpFromStadium}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-center gap-2 transition-all hover:scale-105 border-2 border-white/20 w-[140px]"
              >
                <span className="text-lg">🚶</span>
                <span className="font-medium">Se lever</span>
              </button>
            )
          )}
          {/* Bouton Sortir */}
          <button
            onClick={currentCinemaRoom ? handleLeaveRoom : currentRoom === "arcade" ? handleLeaveArcade : handleLeaveStadium}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-center gap-2 transition-all hover:scale-105 border-2 border-white/20 w-[140px]"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sortir</span>
          </button>
        </div>
      )}



      {!isMobileMode && (
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
          {povMode ? (
            <>🎮 Cliquez pour contrôler la caméra | ESC pour libérer | ZQSD pour bouger | Shift = Sprint</>
          ) : (
            <>⌨️ Touches ZQSD ou Flèches pour se déplacer | Shift = Sprint</>
          )}
        </div>
      )}

      {isMobileMode && <MobileJoystick onMove={handleJoystickMove} />}
      {isMobileMode && <CameraJoystick onRotate={handleCameraRotate} />}

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
                  onClick={togglePovMode}
                  className={`w-12 h-6 rounded-full transition-colors ${povMode ? "bg-blue-500" : "bg-gray-600"}`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      povMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Debug Collisions - uniquement en développement local */}
              {process.env.NODE_ENV === "development" && (
                <div className="flex items-center justify-between">
                  <label className="text-white font-medium">Debug Collisions</label>
                  <button
                    onClick={() => setShowCollisionDebug(!showCollisionDebug)}
                    className={`w-12 h-6 rounded-full transition-colors ${showCollisionDebug ? "bg-red-500" : "bg-gray-600"}`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        showCollisionDebug ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              )}

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
        <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden" style={{ touchAction: 'none' }}>
          {/* Header avec z-index élevé pour rester au-dessus de l'iframe */}
          <div className="bg-purple-900 px-4 py-3 flex items-center justify-between border-b-2 border-purple-400 relative z-[100]">
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
          {/* Container pour l'iframe avec overlay bloquant le menu */}
          <div className="flex-1 relative">
            {/* Overlay en haut à gauche pour bloquer le menu hamburger de webRcade */}
            <div className="absolute top-0 left-0 w-24 h-24 z-10 bg-transparent" />
            {/* Iframe - le contenu interne (comme le menu webRcade) reste dans son contexte */}
            {/* Si useProxy est true, on passe par /api/proxy/game pour contourner les timers/modales */}
            <iframe
              src={currentArcadeMachine.useProxy
                ? `/api/proxy/game?url=${encodeURIComponent(currentArcadeMachine.url)}`
                : currentArcadeMachine.url}
              className="absolute inset-0 w-full h-full border-0"
              allow="gamepad *; fullscreen *; autoplay *; clipboard-write *; encrypted-media *"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
            />
          </div>
        </div>
      )}

      {/* Modal avec compte à rebours avant ouverture externe */}
      {pendingExternalMachine && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl max-w-lg w-full p-6 border-2 border-purple-400 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-white">
                <Gamepad2 className="w-6 h-6 text-pink-400" />
                <span className="font-bold text-xl">{pendingExternalMachine.name}</span>
              </div>
              <button
                onClick={handleCloseExternalModal}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Compte à rebours */}
            <div className="flex flex-col items-center justify-center py-8">
              {externalCountdown > 0 ? (
                <>
                  <div className="text-7xl font-bold text-white mb-4 animate-pulse">
                    {externalCountdown}
                  </div>
                  <p className="text-white/70 text-lg">
                    Veuillez patienter...
                  </p>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-4">🎮</div>
                  <p className="text-white text-lg font-medium">
                    Prêt à jouer !
                  </p>
                </>
              )}
            </div>

            <p className="text-white/60 text-sm mb-6 text-center">
              Ce jeu va s&apos;ouvrir dans un nouvel onglet
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCloseExternalModal}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleOpenExternalMachine}
                disabled={externalCountdown > 0}
                className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  externalCountdown > 0
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                }`}
              >
                <ExternalLink className="w-5 h-5" />
                {externalCountdown > 0 ? `Attendre ${externalCountdown}s` : 'Jouer'}
              </button>
            </div>
          </div>
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

      {/* Écran vidéo du stade - s'affiche quand le joueur est assis dans les gradins */}
      {currentRoom === "stadium" && stadiumSeat !== null && stadium?.embed_url && (
        <div className="fixed inset-0 bg-black z-40 flex flex-col">
          <div className="bg-green-900 px-4 py-3 flex items-center justify-between border-b-2 border-green-400">
            <div className="flex items-center gap-3 text-white">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-lg">{stadium.match_title || "Match en direct"}</span>
              <span className="text-sm text-green-300">• Tribune {stadiumSeat.side.toUpperCase()} - Rangée {stadiumSeat.row + 1}</span>
            </div>
            <button
              onClick={handleStandUpFromStadium}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
            >
              <span className="text-lg">🚶</span>
              Se lever
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
                            handleEnterCinemaRoom(room)
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

    </div>
  )
}

function MobileJoystick({ onMove }: { onMove: (dx: number, dz: number) => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()
  const touchIdRef = useRef<number | null>(null) // Track specific touch

  useEffect(() => {
    if (isDragging) {
      // Utiliser setInterval à 50ms comme le clavier pour avoir la même cadence
      const update = () => {
        const maxDistance = 60
        onMove(position.x / maxDistance, position.y / maxDistance)
      }
      update() // Premier appel immédiat
      intervalRef.current = setInterval(update, 50) // Même intervalle que le clavier
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      onMove(0, 0)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isDragging, position.x, position.y, onMove])

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
    touchIdRef.current = null
    setIsDragging(false)
    setPosition({ x: 0, y: 0 })
  }

  // Find the touch with matching ID from TouchList
  const findTouch = (touches: TouchList, id: number): Touch | null => {
    for (let i = 0; i < touches.length; i++) {
      if (touches[i].identifier === id) return touches[i]
    }
    return null
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-24 left-8 w-36 h-36 bg-white/20 backdrop-blur-lg rounded-full z-20 border-4 border-white/30 select-none touch-none"
      onTouchStart={(e) => {
        e.stopPropagation()
        if (touchIdRef.current === null) {
          const touch = e.changedTouches[0]
          touchIdRef.current = touch.identifier
          setIsDragging(true)
          handleMove(touch.clientX, touch.clientY)
        }
      }}
      onTouchMove={(e) => {
        e.stopPropagation()
        if (touchIdRef.current !== null) {
          const touch = findTouch(e.touches, touchIdRef.current)
          if (touch) handleMove(touch.clientX, touch.clientY)
        }
      }}
      onTouchEnd={(e) => {
        e.stopPropagation()
        if (touchIdRef.current !== null) {
          const touch = findTouch(e.changedTouches, touchIdRef.current)
          if (touch) handleEnd()
        }
      }}
      onTouchCancel={handleEnd}
      onMouseDown={(e) => {
        setIsDragging(true)
        handleMove(e.clientX, e.clientY)
      }}
      onMouseMove={(e) => isDragging && handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      <div
        className="absolute w-14 h-14 bg-white/60 rounded-full top-1/2 left-1/2 shadow-lg transition-transform pointer-events-none"
        style={{
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        }}
      />
    </div>
  )
}

// Joystick pour la rotation de la caméra (côté droit)
function CameraJoystick({ onRotate }: { onRotate: (deltaYaw: number, deltaPitch: number) => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()
  const touchIdRef = useRef<number | null>(null) // Track specific touch

  useEffect(() => {
    if (isDragging) {
      const update = () => {
        const maxDistance = 60
        const sensitivity = 0.012 // Sensibilité de rotation (réduite pour une rotation plus lente)
        onRotate(
          (position.x / maxDistance) * sensitivity,
          -(position.y / maxDistance) * sensitivity // Inverser Y pour que haut = regarder en haut
        )
      }
      update()
      intervalRef.current = setInterval(update, 16) // ~60fps pour une rotation fluide
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isDragging, position.x, position.y, onRotate])

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
    touchIdRef.current = null
    setIsDragging(false)
    setPosition({ x: 0, y: 0 })
  }

  // Find the touch with matching ID from TouchList
  const findTouch = (touches: TouchList, id: number): Touch | null => {
    for (let i = 0; i < touches.length; i++) {
      if (touches[i].identifier === id) return touches[i]
    }
    return null
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-24 right-8 w-36 h-36 bg-blue-500/20 backdrop-blur-lg rounded-full z-20 border-4 border-blue-400/30 select-none touch-none"
      onTouchStart={(e) => {
        e.stopPropagation()
        if (touchIdRef.current === null) {
          const touch = e.changedTouches[0]
          touchIdRef.current = touch.identifier
          setIsDragging(true)
          handleMove(touch.clientX, touch.clientY)
        }
      }}
      onTouchMove={(e) => {
        e.stopPropagation()
        if (touchIdRef.current !== null) {
          const touch = findTouch(e.touches, touchIdRef.current)
          if (touch) handleMove(touch.clientX, touch.clientY)
        }
      }}
      onTouchEnd={(e) => {
        e.stopPropagation()
        if (touchIdRef.current !== null) {
          const touch = findTouch(e.changedTouches, touchIdRef.current)
          if (touch) handleEnd()
        }
      }}
      onTouchCancel={handleEnd}
      onMouseDown={(e) => {
        setIsDragging(true)
        handleMove(e.clientX, e.clientY)
      }}
      onMouseMove={(e) => isDragging && handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      {/* Icône de caméra au centre */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-300/50 text-2xl pointer-events-none">
        👁️
      </div>
      <div
        className="absolute w-14 h-14 bg-blue-400/60 rounded-full top-1/2 left-1/2 shadow-lg transition-transform pointer-events-none"
        style={{
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        }}
      />
    </div>
  )
}
