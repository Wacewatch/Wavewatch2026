"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Text } from "@react-three/drei"
import { useEffect, useRef, useState, useMemo } from "react"
import { createClient } from "@/lib/supabase-client"
import { Menu, Map, MessageCircle, X, Send, Smile } from "lucide-react"
import type * as THREE from "three"

// Types
type AvatarStyle = {
  skinColor: string
  hairColor: string
  shirtColor: string
  pantsColor: string
}

type Position = [number, number, number]

type OtherPlayer = {
  id: string
  username: string
  position: Position
  avatarStyle: AvatarStyle
  grade?: string
  currentEmoji?: string
  emojiTimestamp?: number
  currentMessage?: string
  messageTimestamp?: number
  isJumping?: boolean
}

type CinemaRoom = {
  id: number
  room_number: number
  room_name: string
  capacity: number
  theme: string
  movie_title: string
  tmdb_id: string
  poster_url: string
  embed_url: string
  start_time: string
  end_time: string
  access_level: "public" | "vip" | "admin"
  is_open: boolean
  current_occupancy: number
}

type ArcadeMachine = {
  id: number
  name: string
  description: string
  embed_url: string
  thumbnail_url: string
  category: string
}

type StadiumData = {
  id: number
  match_title: string
  embed_url: string
  start_time: string
  end_time: string
  is_active: boolean
}

// Composant Avatar Réaliste
function RealisticAvatar({
  position,
  avatarStyle,
  username,
  grade,
  showBadge = true,
  currentEmoji,
  currentMessage,
}: {
  position: Position
  avatarStyle: AvatarStyle
  username: string
  grade?: string
  showBadge?: boolean
  currentEmoji?: string
  currentMessage?: string
}) {
  const groupRef = useRef<THREE.Group>(null)

  return (
    <group ref={groupRef} position={position}>
      {/* Corps */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.4, 0.6, 0.25]} />
        <meshStandardMaterial color={avatarStyle.shirtColor} />
      </mesh>

      {/* Tête */}
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={avatarStyle.skinColor} />
      </mesh>

      {/* Cheveux */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.27, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={avatarStyle.hairColor} />
      </mesh>

      {/* Jambes */}
      <mesh position={[-0.12, 0.3, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color={avatarStyle.pantsColor} />
      </mesh>
      <mesh position={[0.12, 0.3, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color={avatarStyle.pantsColor} />
      </mesh>

      {/* Bras */}
      <mesh position={[-0.3, 0.9, 0]}>
        <boxGeometry args={[0.12, 0.5, 0.12]} />
        <meshStandardMaterial color={avatarStyle.skinColor} />
      </mesh>
      <mesh position={[0.3, 0.9, 0]}>
        <boxGeometry args={[0.12, 0.5, 0.12]} />
        <meshStandardMaterial color={avatarStyle.skinColor} />
      </mesh>

      {/* Nom d'utilisateur */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {username}
      </Text>

      {/* Badge de grade */}
      {showBadge && grade && (
        <Text
          position={[0, 1.8, 0]}
          fontSize={0.1}
          color="#FFD700"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.015}
          outlineColor="black"
        >
          {grade}
        </Text>
      )}

      {/* Emoji ou Message au-dessus de l'avatar */}
      {currentMessage && (
        <group position={[0, 2.3, 0]}>
          {/* Bulle de chat */}
          <mesh>
            <planeGeometry args={[currentMessage.length * 0.08 + 0.3, 0.4]} />
            <meshBasicMaterial color="white" opacity={0.9} transparent />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.12} color="black" anchorX="center" anchorY="middle" maxWidth={2}>
            {currentMessage}
          </Text>
        </group>
      )}

      {currentEmoji && !currentMessage && (
        <Text position={[0, 2.3, 0]} fontSize={0.3} anchorX="center" anchorY="middle">
          {currentEmoji}
        </Text>
      )}
    </group>
  )
}

export default function InteractiveWorld() {
  const supabase = createClient()

  // États
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [position, setPosition] = useState<Position>([0, 0.5, 0])
  const [otherPlayers, setOtherPlayers] = useState<Map<string, OtherPlayer>>(new Map())
  const [showMenu, setShowMenu] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showCinema, setShowCinema] = useState(false)
  const [showArcade, setShowArcade] = useState(false)
  const [showStadium, setShowStadium] = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<string>("world")
  const [cinemaRooms, setCinemaRooms] = useState<CinemaRoom[]>([])
  const [arcadeMachines, setArcadeMachines] = useState<ArcadeMachine[]>([])
  const [stadium, setStadium] = useState<StadiumData | null>(null)
  const [selectedCinemaRoom, setSelectedCinemaRoom] = useState<number | null>(null)
  const [selectedArcadeMachine, setSelectedArcadeMachine] = useState<number | null>(null)
  const [chatMessage, setChatMessage] = useState("")
  const [currentMessage, setCurrentMessage] = useState("")
  const [currentEmoji, setCurrentEmoji] = useState("")
  const [playerActions, setPlayerActions] = useState<
    Map<string, { emoji?: string; message?: string; timestamp: number; isJumping?: boolean }>
  >(new Map())
  const [povMode, setPovMode] = useState(false)
  const [worldSettings, setWorldSettings] = useState({
    maxCapacity: 100,
    worldMode: "day",
    enableChat: true,
    enableEmojis: true,
    enableJumping: true,
    playerInteractionsEnabled: true,
    showStatusBadges: true,
  })

  const moveSpeed = 0.1
  const keysPressed = useRef<Set<string>>(new Set())
  const channelRef = useRef<any>(null)

  // Styles d'avatar
  const myAvatarStyle: AvatarStyle = useMemo(
    () => ({
      skinColor: userProfile?.avatar_skin_color || "#FFD4A3",
      hairColor: userProfile?.avatar_hair_color || "#8B4513",
      shirtColor: userProfile?.avatar_shirt_color || "#4A90E2",
      pantsColor: userProfile?.avatar_pants_color || "#2C3E50",
    }),
    [userProfile],
  )

  // Charger l'utilisateur et le profil
  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUser(user)

        // Charger le profil interactif
        const { data: profile } = await supabase
          .from("interactive_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle()

        if (profile) {
          setUserProfile(profile)
          setPosition([profile.position_x, profile.position_y, profile.position_z])
          setCurrentRoom(profile.current_room || "world")
        } else {
          // Créer un nouveau profil
          const { data: userProfileData } = await supabase
            .from("user_profiles")
            .select("username")
            .eq("id", user.id)
            .single()

          const { data: newProfile } = await supabase
            .from("interactive_profiles")
            .insert({
              user_id: user.id,
              username: userProfileData?.username || "Joueur",
              position_x: 0,
              position_y: 0.5,
              position_z: 0,
              current_room: "world",
            })
            .select()
            .single()

          if (newProfile) {
            setUserProfile(newProfile)
          }
        }
      }
    }

    loadUser()
  }, [])

  // Charger les données du monde
  useEffect(() => {
    const loadWorldData = async () => {
      // Charger les salles de cinéma
      const { data: rooms } = await supabase
        .from("interactive_cinema_rooms")
        .select("*")
        .eq("is_open", true)
        .order("room_number")

      if (rooms) {
        setCinemaRooms(rooms)
      }

      // Charger les machines d'arcade
      const { data: machines } = await supabase.from("retrogaming_sources").select("*").order("name")

      if (machines) {
        setArcadeMachines(
          machines.map((m) => ({
            id: m.id,
            name: m.name,
            description: m.description || "",
            embed_url: m.url,
            thumbnail_url: m.thumbnail || "",
            category: m.category || "Autre",
          })),
        )
      }

      // Charger le stade
      const { data: stadiumData } = await supabase
        .from("interactive_stadium")
        .select("*")
        .eq("is_active", true)
        .maybeSingle()

      if (stadiumData) {
        setStadium(stadiumData)
      }

      // Charger les paramètres du monde
      const { data: settings } = await supabase
        .from("interactive_world_settings")
        .select("setting_value")
        .eq("setting_key", "world_config")
        .maybeSingle()

      if (settings?.setting_value) {
        setWorldSettings((prev) => ({ ...prev, ...settings.setting_value }))
      }
    }

    loadWorldData()
  }, [])

  // Broadcast et synchronisation en temps réel
  useEffect(() => {
    if (!user || !userProfile) return

    const channel = supabase.channel("world-updates")

    // S'abonner aux mouvements des autres joueurs
    channel
      .on("broadcast", { event: "player-move" }, ({ payload }) => {
        if (payload.userId !== user.id) {
          setOtherPlayers((prev) => {
            const updated = new Map(prev)
            updated.set(payload.userId, {
              id: payload.userId,
              username: payload.username,
              position: payload.position,
              avatarStyle: payload.avatarStyle,
              grade: payload.grade,
              currentEmoji: payload.currentEmoji,
              currentMessage: payload.currentMessage,
              isJumping: payload.isJumping,
            })
            return updated
          })
        }
      })
      .on("broadcast", { event: "player-action" }, ({ payload }) => {
        if (payload.userId !== user.id) {
          setPlayerActions((prev) => {
            const updated = new Map(prev)
            updated.set(payload.userId, {
              emoji: payload.emoji,
              message: payload.message,
              timestamp: Date.now(),
              isJumping: payload.isJumping,
            })
            return updated
          })

          // Mettre à jour l'autre joueur
          setOtherPlayers((prev) => {
            const updated = new Map(prev)
            const player = updated.get(payload.userId)
            if (player) {
              updated.set(payload.userId, {
                ...player,
                currentEmoji: payload.emoji,
                currentMessage: payload.message,
                isJumping: payload.isJumping,
              })
            }
            return updated
          })

          // Effacer après 5 secondes
          setTimeout(() => {
            setOtherPlayers((prev) => {
              const updated = new Map(prev)
              const player = updated.get(payload.userId)
              if (player) {
                updated.set(payload.userId, {
                  ...player,
                  currentEmoji: undefined,
                  currentMessage: undefined,
                  isJumping: false,
                })
              }
              return updated
            })
          }, 5000)
        }
      })
      .subscribe()

    channelRef.current = channel

    // Broadcast ma position
    const broadcastInterval = setInterval(() => {
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "player-move",
          payload: {
            userId: user.id,
            username: userProfile.username,
            position,
            avatarStyle: myAvatarStyle,
            grade: userProfile.grade,
            currentEmoji,
            currentMessage,
          },
        })
      }
    }, 100)

    return () => {
      clearInterval(broadcastInterval)
      channel.unsubscribe()
    }
  }, [user, userProfile, position, myAvatarStyle, currentEmoji, currentMessage])

  // Gestion des contrôles clavier
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

  // Boucle de mouvement
  useEffect(() => {
    if (currentRoom !== "world") return

    const moveInterval = setInterval(() => {
      let newX = position[0]
      let newZ = position[2]

      if (keysPressed.current.has("z") || keysPressed.current.has("w")) {
        newZ -= moveSpeed
      }
      if (keysPressed.current.has("s")) {
        newZ += moveSpeed
      }
      if (keysPressed.current.has("q") || keysPressed.current.has("a")) {
        newX -= moveSpeed
      }
      if (keysPressed.current.has("d")) {
        newX += moveSpeed
      }

      // Limites du monde
      newX = Math.max(-50, Math.min(50, newX))
      newZ = Math.max(-50, Math.min(50, newZ))

      if (newX !== position[0] || newZ !== position[2]) {
        const newPosition: Position = [newX, position[1], newZ]
        setPosition(newPosition)

        // Sauvegarder dans la base de données
        if (userProfile) {
          supabase
            .from("interactive_profiles")
            .update({
              position_x: newX,
              position_y: position[1],
              position_z: newZ,
            })
            .eq("user_id", user.id)
            .then()
        }
      }
    }, 50)

    return () => clearInterval(moveInterval)
  }, [position, currentRoom, userProfile, user])

  // Fonctions d'interaction
  const handleSendMessage = () => {
    if (!chatMessage.trim() || !worldSettings.enableChat) return

    setCurrentMessage(chatMessage)
    setChatMessage("")

    // Broadcast le message
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "player-action",
        payload: {
          userId: user.id,
          message: chatMessage,
          timestamp: Date.now(),
        },
      })
    }

    // Effacer après 5 secondes
    setTimeout(() => {
      setCurrentMessage("")
    }, 5000)

    setShowChat(false)
  }

  const handleSendEmoji = (emoji: string) => {
    if (!worldSettings.enableEmojis) return

    setCurrentEmoji(emoji)

    // Broadcast l'emoji
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "player-action",
        payload: {
          userId: user.id,
          emoji,
          timestamp: Date.now(),
        },
      })
    }

    // Effacer après 3 secondes
    setTimeout(() => {
      setCurrentEmoji("")
    }, 3000)

    setShowEmojis(false)
  }

  const handleEnterCinemaRoom = async (roomId: number) => {
    const room = cinemaRooms.find((r) => r.id === roomId)
    if (!room) return

    // Mettre à jour la position et la salle
    await supabase
      .from("interactive_profiles")
      .update({
        current_room: `cinema-${roomId}`,
        position_x: 0,
        position_y: 0.5,
        position_z: -8,
      })
      .eq("user_id", user.id)

    setCurrentRoom(`cinema-${roomId}`)
    setPosition([0, 0.5, -8])
    setSelectedCinemaRoom(roomId)
    setShowCinema(false)
  }

  const handleLeaveCinema = async () => {
    await supabase
      .from("interactive_profiles")
      .update({
        current_room: "world",
        position_x: 0,
        position_y: 0.5,
        position_z: 0,
      })
      .eq("user_id", user.id)

    setCurrentRoom("world")
    setPosition([0, 0.5, 0])
    setSelectedCinemaRoom(null)
  }

  const handleEnterArcade = async () => {
    await supabase
      .from("interactive_profiles")
      .update({
        current_room: "arcade",
        position_x: 0,
        position_y: 0.5,
        position_z: 0,
      })
      .eq("user_id", user.id)

    setCurrentRoom("arcade")
    setPosition([0, 0.5, 0])
    setShowArcade(false)
  }

  const handleLeaveArcade = async () => {
    await supabase
      .from("interactive_profiles")
      .update({
        current_room: "world",
        position_x: 0,
        position_y: 0.5,
        position_z: 0,
      })
      .eq("user_id", user.id)

    setCurrentRoom("world")
    setPosition([0, 0.5, 0])
  }

  const handleEnterStadium = async () => {
    await supabase
      .from("interactive_profiles")
      .update({
        current_room: "stadium",
        position_x: 0,
        position_y: 0.5,
        position_z: -15,
      })
      .eq("user_id", user.id)

    setCurrentRoom("stadium")
    setPosition([0, 0.5, -15])
    setShowStadium(false)
  }

  const handleLeaveStadium = async () => {
    await supabase
      .from("interactive_profiles")
      .update({
        current_room: "world",
        position_x: 0,
        position_y: 0.5,
        position_z: 0,
      })
      .eq("user_id", user.id)

    setCurrentRoom("world")
    setPosition([0, 0.5, 0])
  }

  if (!user || !userProfile) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-2xl">Chargement du monde interactif...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-sky-400 to-sky-200">
      {/* Canvas 3D */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 5, 10]} />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={30}
        />

        {/* Lumières */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.5} />

        {/* Monde principal */}
        {currentRoom === "world" && (
          <>
            {/* Sol */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color="#7EC850" />
            </mesh>

            {/* Grille */}
            <gridHelper args={[100, 50, "#555555", "#777777"]} />

            {/* Bâtiments */}
            {/* Cinéma */}
            <group position={[10, 0, -10]}>
              <mesh castShadow>
                <boxGeometry args={[4, 3, 4]} />
                <meshStandardMaterial color="#4A5D9F" />
              </mesh>
              <Text
                position={[0, 4, 0]}
                fontSize={0.4}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="black"
              >
                🎬 Cinéma
              </Text>
            </group>

            {/* Arcade */}
            <group position={[-10, 0, -10]}>
              <mesh castShadow>
                <boxGeometry args={[4, 3, 4]} />
                <meshStandardMaterial color="#9B59B6" />
              </mesh>
              <Text
                position={[0, 4, 0]}
                fontSize={0.4}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="black"
              >
                🕹️ Arcade
              </Text>
            </group>

            {/* Stade */}
            <group position={[0, 0, -20]}>
              <mesh castShadow>
                <boxGeometry args={[8, 2, 6]} />
                <meshStandardMaterial color="#27AE60" />
              </mesh>
              <Text
                position={[0, 3, 0]}
                fontSize={0.4}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="black"
              >
                ⚽ Stade
              </Text>
            </group>

            {/* Mon avatar */}
            {!povMode && (
              <RealisticAvatar
                position={position}
                avatarStyle={myAvatarStyle}
                username={userProfile.username}
                grade={userProfile.grade}
                showBadge={worldSettings.showStatusBadges}
                currentEmoji={currentEmoji}
                currentMessage={currentMessage}
              />
            )}

            {/* Autres joueurs */}
            {Array.from(otherPlayers.values()).map((player) => (
              <RealisticAvatar
                key={player.id}
                position={player.position}
                avatarStyle={player.avatarStyle}
                username={player.username}
                grade={player.grade}
                showBadge={worldSettings.showStatusBadges}
                currentEmoji={player.currentEmoji}
                currentMessage={player.currentMessage}
              />
            ))}
          </>
        )}

        {/* Salle de cinéma */}
        {currentRoom.startsWith("cinema-") && selectedCinemaRoom && (
          <>
            {/* Sol */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[30, 30]} />
              <meshStandardMaterial color="#2C3E50" />
            </mesh>

            {/* Murs */}
            <mesh position={[0, 3, -10]}>
              <boxGeometry args={[30, 6, 0.5]} />
              <meshStandardMaterial color="#34495E" />
            </mesh>
            <mesh position={[-15, 3, 0]}>
              <boxGeometry args={[0.5, 6, 20]} />
              <meshStandardMaterial color="#34495E" />
            </mesh>
            <mesh position={[15, 3, 0]}>
              <boxGeometry args={[0.5, 6, 20]} />
              <meshStandardMaterial color="#34495E" />
            </mesh>

            {/* Écran géant */}
            <mesh position={[0, 4, -9.5]}>
              <planeGeometry args={[20, 10]} />
              <meshStandardMaterial color="#000000" />
            </mesh>

            {/* Mon avatar */}
            {!povMode && (
              <RealisticAvatar
                position={position}
                avatarStyle={myAvatarStyle}
                username={userProfile.username}
                grade={userProfile.grade}
                showBadge={worldSettings.showStatusBadges}
                currentEmoji={currentEmoji}
                currentMessage={currentMessage}
              />
            )}

            {/* Autres joueurs dans le cinéma */}
            {Array.from(otherPlayers.values())
              .filter((p) => p.id !== user.id)
              .map((player) => (
                <RealisticAvatar
                  key={player.id}
                  position={player.position}
                  avatarStyle={player.avatarStyle}
                  username={player.username}
                  grade={player.grade}
                  showBadge={worldSettings.showStatusBadges}
                  currentEmoji={player.currentEmoji}
                  currentMessage={player.currentMessage}
                />
              ))}
          </>
        )}

        {/* Salle d'arcade */}
        {currentRoom === "arcade" && (
          <>
            {/* Sol */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[40, 30]} />
              <meshStandardMaterial color="#1A1A2E" />
            </mesh>

            {/* Murs */}
            <mesh position={[0, 3, -15]}>
              <boxGeometry args={[40, 6, 0.5]} />
              <meshStandardMaterial color="#16213E" />
            </mesh>
            <mesh position={[-20, 3, 0]}>
              <boxGeometry args={[0.5, 6, 30]} />
              <meshStandardMaterial color="#16213E" />
            </mesh>
            <mesh position={[20, 3, 0]}>
              <boxGeometry args={[0.5, 6, 30]} />
              <meshStandardMaterial color="#16213E" />
            </mesh>

            {/* Machines d'arcade */}
            {arcadeMachines.slice(0, 12).map((machine, index) => {
              const row = Math.floor(index / 4)
              const col = index % 4
              const xPos = -12 + col * 8
              const zPos = -10 + row * 8

              return (
                <group key={machine.id} position={[xPos, 0, zPos]}>
                  {/* Machine */}
                  <mesh castShadow>
                    <boxGeometry args={[2, 3, 1.5]} />
                    <meshStandardMaterial color="#9B59B6" />
                  </mesh>
                  {/* Écran */}
                  <mesh position={[0, 1.5, 0.76]}>
                    <planeGeometry args={[1.5, 1.5]} />
                    <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={0.3} />
                  </mesh>
                  {/* Nom de la machine */}
                  <Text position={[0, 3.5, 0]} fontSize={0.2} color="#E74C3C" anchorX="center" anchorY="middle">
                    {machine.name.slice(0, 20)}
                  </Text>
                </group>
              )
            })}

            {/* Lumières néon */}
            <pointLight position={[-15, 5, -10]} intensity={1} color="#FF00FF" distance={20} />
            <pointLight position={[15, 5, -10]} intensity={1} color="#00FFFF" distance={20} />
            <pointLight position={[-15, 5, 10]} intensity={1} color="#FFFF00" distance={20} />
            <pointLight position={[15, 5, 10]} intensity={1} color="#FF00FF" distance={20} />

            {/* Mon avatar */}
            {!povMode && (
              <RealisticAvatar
                position={position}
                avatarStyle={myAvatarStyle}
                username={userProfile.username}
                grade={userProfile.grade}
                showBadge={worldSettings.showStatusBadges}
                currentEmoji={currentEmoji}
                currentMessage={currentMessage}
              />
            )}
          </>
        )}

        {/* Stade de football */}
        {currentRoom === "stadium" && (
          <>
            {/* Terrain */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[60, 40]} />
              <meshStandardMaterial color="#2ECC71" />
            </mesh>

            {/* Lignes du terrain */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[8.5, 9, 32]} />
              <meshStandardMaterial color="white" />
            </mesh>

            {/* Gradins */}
            {/* Nord */}
            <mesh position={[0, 2, -25]} castShadow>
              <boxGeometry args={[60, 4, 5]} />
              <meshStandardMaterial color="#3498DB" />
            </mesh>
            {/* Sud */}
            <mesh position={[0, 2, 25]} castShadow>
              <boxGeometry args={[60, 4, 5]} />
              <meshStandardMaterial color="#3498DB" />
            </mesh>
            {/* Est */}
            <mesh position={[32, 2, 0]} castShadow>
              <boxGeometry args={[5, 4, 40]} />
              <meshStandardMaterial color="#3498DB" />
            </mesh>
            {/* Ouest */}
            <mesh position={[-32, 2, 0]} castShadow>
              <boxGeometry args={[5, 4, 40]} />
              <meshStandardMaterial color="#3498DB" />
            </mesh>

            {/* Écran géant */}
            <mesh position={[0, 12, -27]}>
              <planeGeometry args={[40, 20]} />
              <meshStandardMaterial color="#000000" />
            </mesh>

            {/* Projecteurs */}
            <pointLight position={[-25, 15, -20]} intensity={2} castShadow distance={50} />
            <pointLight position={[25, 15, -20]} intensity={2} castShadow distance={50} />
            <pointLight position={[-25, 15, 20]} intensity={2} castShadow distance={50} />
            <pointLight position={[25, 15, 20]} intensity={2} castShadow distance={50} />

            {/* Mon avatar */}
            {!povMode && (
              <RealisticAvatar
                position={position}
                avatarStyle={myAvatarStyle}
                username={userProfile.username}
                grade={userProfile.grade}
                showBadge={worldSettings.showStatusBadges}
                currentEmoji={currentEmoji}
                currentMessage={currentMessage}
              />
            )}
          </>
        )}
      </Canvas>

      {/* UI Overlay */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {/* Menu principal */}
        <div className="pointer-events-auto absolute left-4 top-4">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-110"
          >
            <Menu className="h-8 w-8" />
          </button>
        </div>

        {/* Boutons d'action */}
        <div className="pointer-events-auto absolute right-4 top-4 flex gap-2">
          <button
            onClick={() => setShowEmojis(!showEmojis)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500 text-white shadow-lg transition-transform hover:scale-110"
            title="Emojis"
          >
            <Smile className="h-6 w-6" />
          </button>
          <button
            onClick={() => setPovMode(!povMode)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg transition-transform hover:scale-110"
            title={povMode ? "Vue normale" : "Vue FPS"}
          >
            {povMode ? "👤" : "👁️"}
          </button>
        </div>

        {/* Menu déroulant */}
        {showMenu && (
          <div className="pointer-events-auto absolute left-4 top-24 w-64 rounded-lg bg-slate-800/95 p-4 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Menu</h3>
              <button onClick={() => setShowMenu(false)} className="text-white hover:text-red-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowMap(true)
                  setShowMenu(false)
                }}
                className="flex w-full items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                <Map className="h-5 w-5" />
                Carte
              </button>
              <button
                onClick={() => {
                  setShowChat(true)
                  setShowMenu(false)
                }}
                className="flex w-full items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                disabled={!worldSettings.enableChat}
              >
                <MessageCircle className="h-5 w-5" />
                Chat
              </button>
              {currentRoom.startsWith("cinema-") && (
                <button
                  onClick={handleLeaveCinema}
                  className="flex w-full items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                >
                  Quitter le cinéma
                </button>
              )}
              {currentRoom === "arcade" && (
                <button
                  onClick={handleLeaveArcade}
                  className="flex w-full items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                >
                  Quitter l'arcade
                </button>
              )}
              {currentRoom === "stadium" && (
                <button
                  onClick={handleLeaveStadium}
                  className="flex w-full items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                >
                  Quitter le stade
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Carte */}
        {showMap && (
          <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-2xl rounded-lg bg-slate-800 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Carte du Monde</h2>
                <button onClick={() => setShowMap(false)} className="text-white hover:text-red-400">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    setShowCinema(true)
                    setShowMap(false)
                  }}
                  className="rounded-lg bg-blue-600 p-6 text-white transition-colors hover:bg-blue-700"
                >
                  <div className="mb-2 text-4xl">🎬</div>
                  <div className="font-bold">Cinéma</div>
                  <div className="text-sm opacity-80">{cinemaRooms.length} salles</div>
                </button>
                <button
                  onClick={() => {
                    handleEnterArcade()
                    setShowMap(false)
                  }}
                  className="rounded-lg bg-purple-600 p-6 text-white transition-colors hover:bg-purple-700"
                >
                  <div className="mb-2 text-4xl">🕹️</div>
                  <div className="font-bold">Arcade</div>
                  <div className="text-sm opacity-80">{arcadeMachines.length} jeux</div>
                </button>
                <button
                  onClick={() => {
                    setShowStadium(true)
                    setShowMap(false)
                  }}
                  className="rounded-lg bg-green-600 p-6 text-white transition-colors hover:bg-green-700"
                >
                  <div className="mb-2 text-4xl">⚽</div>
                  <div className="font-bold">Stade</div>
                  <div className="text-sm opacity-80">Match en direct</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Cinéma */}
        {showCinema && (
          <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-slate-800 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Salles de Cinéma</h2>
                <button onClick={() => setShowCinema(false)} className="text-white hover:text-red-400">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {cinemaRooms.map((room) => (
                  <div key={room.id} className="rounded-lg bg-slate-700 p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-white">{room.room_name}</h3>
                        <p className="text-sm text-blue-400">{room.theme}</p>
                      </div>
                      <div
                        className={`rounded px-2 py-1 text-xs ${
                          room.current_occupancy >= room.capacity ? "bg-red-600" : "bg-green-600"
                        } text-white`}
                      >
                        {room.current_occupancy}/{room.capacity}
                      </div>
                    </div>
                    <p className="mb-3 text-sm text-white">{room.movie_title}</p>
                    <button
                      onClick={() => handleEnterCinemaRoom(room.id)}
                      disabled={room.current_occupancy >= room.capacity}
                      className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-600"
                    >
                      {room.current_occupancy >= room.capacity ? "Complet" : "Entrer"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal Stade */}
        {showStadium && stadium && (
          <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-lg bg-slate-800 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Stade de Football</h2>
                <button onClick={() => setShowStadium(false)} className="text-white hover:text-red-400">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="mb-4">
                <h3 className="mb-2 text-xl font-bold text-white">{stadium.match_title}</h3>
                <p className="text-sm text-gray-400">Match en direct • Rejoignez d'autres supporters !</p>
              </div>
              <button
                onClick={handleEnterStadium}
                className="w-full rounded-lg bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700"
              >
                Entrer au Stade
              </button>
            </div>
          </div>
        )}

        {/* Modal Chat */}
        {showChat && (
          <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-slate-800 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Envoyer un message</h2>
                <button onClick={() => setShowChat(false)} className="text-white hover:text-red-400">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage()
                  }}
                  placeholder="Votre message..."
                  className="flex-1 rounded-lg bg-slate-700 px-4 py-2 text-white placeholder-gray-400"
                  maxLength={100}
                />
                <button
                  onClick={handleSendMessage}
                  className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Menu Emojis */}
        {showEmojis && (
          <div className="pointer-events-auto absolute right-4 top-20 rounded-lg bg-slate-800/95 p-4 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Emojis</h3>
              <button onClick={() => setShowEmojis(false)} className="text-white hover:text-red-400">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {["😊", "😂", "😍", "😎", "👍", "👋", "🎉", "❤️"].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSendEmoji(emoji)}
                  className="rounded-lg bg-slate-700 p-2 text-2xl transition-transform hover:scale-110"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Iframe pour le contenu (cinéma, arcade, stade) */}
        {currentRoom.startsWith("cinema-") &&
          selectedCinemaRoom &&
          cinemaRooms.find((r) => r.id === selectedCinemaRoom)?.embed_url && (
            <div className="pointer-events-auto absolute right-4 top-4 h-64 w-96 overflow-hidden rounded-lg shadow-xl">
              <iframe
                src={cinemaRooms.find((r) => r.id === selectedCinemaRoom)?.embed_url}
                className="h-full w-full"
                allowFullScreen
              />
            </div>
          )}

        {currentRoom === "arcade" && selectedArcadeMachine && (
          <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/90">
            <div className="relative h-[90vh] w-[90vw]">
              <button
                onClick={() => setSelectedArcadeMachine(null)}
                className="absolute right-4 top-4 z-10 rounded-full bg-red-600 p-2 text-white hover:bg-red-700"
              >
                <X className="h-6 w-6" />
              </button>
              <iframe
                src={arcadeMachines.find((m) => m.id === selectedArcadeMachine)?.embed_url}
                className="h-full w-full rounded-lg"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {currentRoom === "stadium" && stadium?.embed_url && (
          <div className="pointer-events-auto absolute bottom-4 right-4 h-64 w-96 overflow-hidden rounded-lg shadow-xl">
            <iframe src={stadium.embed_url} className="h-full w-full" allowFullScreen />
          </div>
        )}
      </div>
    </div>
  )
}
