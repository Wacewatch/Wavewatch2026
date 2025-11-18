'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sky, Html, PerspectiveCamera, Text } from '@react-three/drei'
import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Maximize, Minimize, MessageSquare, Send, Settings, Crown, Shield, X, LogOut, User, Users, Palette, Menu, Eye, Play, Smile, EyeOff, ArrowUp, Frown, ThumbsUp, Heart, Angry, ChevronLeft, Maximize2, MessageCircle, Sparkles, Star, Lock, Film, Clock } from 'lucide-react'
import * as THREE from 'three'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import MobileJoystick from '@/components/interactive/mobile-joystick'

type AvatarStyle = {
  bodyColor: string
  headColor: string
  hairStyle: string
  hairColor: string
  skinTone: string
  accessory: string
  faceSmiley: string
}

type InteractiveWorldProps = {
  userId: string
  userProfile: any
}


function RealisticAvatar({
  position,
  avatarStyle,
  isMoving = false
}: {
  position: [number, number, number]
  avatarStyle: AvatarStyle
  isMoving?: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [time, setTime] = useState(0)

  useFrame((state, delta) => {
    if (isMoving && groupRef.current) {
      setTime(t => t + delta * 5)
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
      {/* Torso */}
      <mesh position={[0, 0.375, 0]} castShadow>
        <boxGeometry args={[0.6, 0.45, 0.35]} />
        <meshStandardMaterial color={avatarStyle.bodyColor} metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial color={avatarStyle.skinTone || avatarStyle.headColor} metalness={0.1} roughness={0.6} />
      </mesh>

      {/* Face Emoji */}
      {avatarStyle.faceSmiley && (
        <Html position={[0, 0.85, 0.32]} center>
          <div className="text-2xl pointer-events-none select-none">
            {avatarStyle.faceSmiley}
          </div>
        </Html>
      )}

      {/* Hair */}
      {avatarStyle.hairStyle === 'short' && (
        <mesh position={[0, 1.05, 0]} castShadow>
          <sphereGeometry args={[0.34, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={avatarStyle.hairColor || '#3d2817'} metalness={0} roughness={1} />
        </mesh>
      )}

      {avatarStyle.hairStyle === 'long' && (
        <>
          <mesh position={[0, 1.05, 0]} castShadow>
            <sphereGeometry args={[0.34, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={avatarStyle.hairColor || '#3d2817'} metalness={0} roughness={1} />
          </mesh>
          <mesh position={[0, 0.65, -0.25]} castShadow>
            <boxGeometry args={[0.5, 0.6, 0.1]} />
            <meshStandardMaterial color={avatarStyle.hairColor || '#3d2817'} metalness={0} roughness={1} />
          </mesh>
        </>
      )}

      {avatarStyle.hairStyle === 'bald' && null}

      {/* Left Arm */}
      <mesh position={[-0.45, 0.3, 0]} castShadow>
        <boxGeometry args={[0.2, 0.5, 0.2]} />
        <meshStandardMaterial color={avatarStyle.bodyColor} metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Right Arm */}
      <mesh position={[0.45, 0.3, 0]} castShadow>
        <boxGeometry args={[0.2, 0.5, 0.2]} />
        <meshStandardMaterial color={avatarStyle.bodyColor} metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Left Leg */}
      <mesh position={[-0.2, -0.15, 0]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={avatarStyle.bodyColor} metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Right Leg */}
      <mesh position={[0.2, -0.15, 0]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={avatarStyle.bodyColor} metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Accessory - glasses */}
      {avatarStyle.accessory === 'glasses' && (
        <mesh position={[0, 0.88, 0.3]} castShadow>
          <torusGeometry args={[0.15, 0.02, 8, 16]} />
          <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.2} />
        </mesh>
      )}

      {/* Accessory - hat */}
      {avatarStyle.accessory === 'hat' && (
        <mesh position={[0, 1.25, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.2, 32]} />
          <meshStandardMaterial color="#1f2937" metalness={0.1} roughness={0.8} />
        </mesh>
      )}
    </group>
  )
}


export default function InteractiveWorld({ userId, userProfile }: InteractiveWorldProps) {
  const [myProfile, setMyProfile] = useState<any>(null)
  const [onlineCount, setOnlineCount] = useState(0)
  const [myPosition, setMyPosition] = useState({ x: 0, y: 0.5, z: 0 })
  const [myAvatarStyle, setMyAvatarStyle] = useState<AvatarStyle>({
    bodyColor: '#3b82f6',
    headColor: '#fbbf24',
    hairStyle: 'short',
    hairColor: '#1f2937',
    skinTone: '#fbbf24',
    accessory: 'none',
    faceSmiley: '😊'
  })
  const [customizationOptions, setCustomizationOptions] = useState<any[]>([])
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [currentEmoji, setCurrentEmoji] = useState<string | null>(null)
  const [isJumping, setIsJumping] = useState(false)

  const [movement, setMovement] = useState({ x: 0, z: 0 })
  const [showChat, setShowChat] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false)
  const [showCinema, setShowCinema] = useState(false)
  const [showUserCard, setShowUserCard] = useState(false)
  const [currentCinemaRoom, setCurrentCinemaRoom] = useState<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [roomMessages, setRoomMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [cinemaRooms, setCinemaRooms] = useState<any[]>([])
  const [cinemaSeats, setCinemaSeats] = useState<any[]>([])
  const [mySeat, setMySeat] = useState<number | null>(null)
  const [isSeatsLocked, setIsSeatsLocked] = useState(false)
  const [playerChatBubbles, setPlayerChatBubbles] = useState<Record<string, { message: string, timestamp: number }>>({})

  const [worldSettings, setWorldSettings] = useState({
    maxCapacity: 100,
    worldMode: 'day',
    voiceChatEnabled: false,
    playerInteractionsEnabled: true,
    showStatusBadges: true,
    enableChat: true,
    enableEmojis: true,
    enableJumping: true,
  })

  const [graphicsQuality, setGraphicsQuality] = useState('medium')
  const [controlMode, setControlMode] = useState<'auto' | 'pc' | 'mobile'>('auto')
  const [isMobileMode, setIsMobileMode] = useState(false)
  const [povMode, setPovMode] = useState(false)
  const [showMovieFullscreen, setShowMovieFullscreen] = useState(false)
  const [showChatInput, setShowChatInput] = useState(false)

  const [countdown, setCountdown] = useState<string>('')

  const [playerActions, setPlayerActions] = useState<Record<string, { action: string; timestamp: number }>>({})
  const [quickAction, setQuickAction] = useState<string | null>(null)
  const [otherPlayers, setOtherPlayers] = useState<any[]>([])

  const keysPressed = useRef<Set<string>>(new Set())
  const supabase = createClient()
  const [myRotation, setMyRotation] = useState(0)

  const [showMenu, setShowMenu] = useState(false)
  const [showMapMenu, setShowMapMenu] = useState(false)
  const [showEmojiMenu, setShowEmojiMenu] = useState(false)


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase())
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase())
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      let dx = 0
      let dz = 0
      const speed = 0.2

      if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) dz -= speed
      if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) dz += speed
      if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) dx -= speed
      if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) dx += speed

      if (dx !== 0 || dz !== 0) {
        setMovement({ x: dx, z: dz })
        setMyPosition(prev => {
          const newX = Math.max(-80, Math.min(80, prev.x + dx))
          const newZ = Math.max(-80, Math.min(80, prev.z + dz))

          if (checkCollision(newX, newZ)) {
            return prev
          }

          const newPos = {
            x: newX,
            y: 0.5,
            z: newZ
          }

          supabase
            .from('interactive_profiles')
            .update({
              position_x: newPos.x,
              position_y: newPos.y,
              position_z: newPos.z
            })
            .eq('user_id', userId)
            .then()

          return newPos
        })
      } else {
        if (movement.x !== 0 || movement.z !== 0) {
          setMovement({ x: 0, z: 0 })
        }
      }
    }, 30)

    return () => clearInterval(interval)
  }, [movement, userId])

  const handleJoystickMove = useCallback((dx: number, dz: number) => {
    const speed = 0.2
    const newX = Math.max(-80, Math.min(80, myPosition.x + dx * speed))
    const newZ = Math.max(-80, Math.min(80, myPosition.z + dz * speed))

    if (!checkCollision(newX, newZ)) {
      const newPos = {
        x: newX,
        y: 0.5,
        z: newZ
      }

      setMyPosition(newPos)
      setMovement({ x: dx, z: dz })

      supabase
        .from('interactive_profiles')
        .update({
          position_x: newPos.x,
          position_z: newPos.z
        })
        .eq('user_id', userId)
        .then()
    }
  }, [myPosition, userId])

  const handleJoystickStop = useCallback(() => {
    setMovement({ x: 0, z: 0 })
  }, [])

  const handleSitInSeat = async (seatNumber: number) => {
    if (!userProfile || !currentCinemaRoom) return

    try {
      const seat = cinemaSeats.find(s => s.seat_number === seatNumber)
      if (!seat) return

      if (seat.is_occupied && seat.user_id !== userId) {
        alert('Cette place est déjà occupée!')
        return
      }

      if (mySeat !== null) {
        await supabase
          .from('interactive_cinema_seats')
          .update({ is_occupied: false, user_id: null })
          .eq('room_id', currentCinemaRoom.id)
          .eq('seat_number', mySeat)
      }

      await supabase
        .from('interactive_cinema_seats')
        .upsert({
          room_id: currentCinemaRoom.id,
          seat_number: seatNumber,
          user_id: userId,
          is_occupied: true
        })

      setMySeat(seatNumber)
      setMyPosition({ 
        x: seat.position_x, 
        y: seat.position_y + 0.5, 
        z: seat.position_z 
      })

      const { data: updatedSeats } = await supabase
        .from('interactive_cinema_seats')
        .select('*')
        .eq('room_id', currentCinemaRoom.id)

      if (updatedSeats) {
        setCinemaSeats(updatedSeats)
      }
    } catch (error) {
      console.error('[v0] Error sitting:', error)
    }
  }

  const handleEnterRoom = async (room: any) => {
    setCurrentCinemaRoom(room)
    setShowCinema(false)

    setMyPosition({ x: 0, y: 0.5, z: 25 })

    await supabase
      .from('interactive_profiles')
      .update({
        current_room: `cinema_${room.id}`,
        position_x: 0,
        position_y: 0.5,
        position_z: 25
      })
      .eq('user_id', userId)
      .then()
  }

  const handleLeaveRoom = async () => {
    setCurrentCinemaRoom(null)
    setMySeat(null)
    setIsSeatsLocked(false)
    setCountdown('')

    setMyPosition({ x: 0, y: 0.5, z: 0 })

    await supabase
      .from('interactive_profiles')
      .update({
        current_room: null,
        position_x: 0,
        position_y: 0.5,
        position_z: 0
      })
      .eq('user_id', userId)
      .then()
  }

  const loadMyProfile = async () => {
    const { data: profiles, error } = await supabase
      .from('interactive_profiles')
      .select('*, user_profiles(*)')
      .eq('user_id', userId)
      .single()

    if (profiles && !error) {
      console.log('[v0] Loaded my profile:', profiles)
      setMyProfile(profiles)
      setMyAvatarStyle(profiles.avatar_style || myAvatarStyle)
      setMyPosition({
        x: profiles.position_x || 0,
        y: profiles.position_y || 0.5,
        z: profiles.position_z || 0
      })
      setMyRotation(profiles.rotation || 0)
    }
  }

  useEffect(() => {
    loadMyProfile()
  }, [userId])

  const checkCollision = (x: number, z: number) => {
    // Implement collision detection logic here
    return false
  }

  const isMe = (playerId: string) => {
    return playerId === userId
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-sky-400 to-sky-200">
      <Canvas
        camera={povMode ? undefined : { position: [0, 10, 15], fov: 60 }}
        style={{ width: '100vw', height: '100vh' }}
        shadows
        gl={{
          antialias: graphicsQuality !== 'low',
          alpha: false,
          powerPreference: graphicsQuality === 'high' ? 'high-performance' : 'default'
        }}
      >
        {!povMode && (
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 6}
            maxDistance={25}
            minDistance={5}
            target={[myPosition.x, myPosition.y, myPosition.z]}
          />
        )}

        {povMode && (
          <PerspectiveCamera
            makeDefault
            position={[myPosition.x, myPosition.y + 1.5, myPosition.z]}
            fov={75}
          />
        )}

        {worldSettings.worldMode === 'day' && (
          <>
            <Sky
              sunPosition={[100, 20, 100]}
              inclination={0.6}
              azimuth={0.25}
            />
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[10, 20, 10]}
              intensity={1.5}
              castShadow
              shadow-mapSize={graphicsQuality === 'high' ? [2048, 2048] : [1024, 1024]}
            />
          </>
        )}

        {worldSettings.worldMode === 'night' && (
          <>
            <Sky
              sunPosition={[100, -20, 100]}
              inclination={0.1}
              azimuth={0.25}
            />
            <ambientLight intensity={0.2} />
            <directionalLight
              position={[10, 20, 10]}
              intensity={0.4}
              color="#4466ff"
              castShadow
              shadow-mapSize={graphicsQuality === 'high' ? [2048, 2048] : [1024, 1024]}
            />
          </>
        )}

        {worldSettings.worldMode === 'sunset' && (
          <>
            <Sky
              sunPosition={[100, 2, 100]}
              inclination={0.3}
              azimuth={0.1}
            />
            <ambientLight intensity={0.35} />
            <directionalLight
              position={[10, 5, 10]}
              intensity={1.2}
              color="#ff8844"
              castShadow
              shadow-mapSize={graphicsQuality === 'high' ? [2048, 2048] : [1024, 1024]}
            />
          </>
        )}

        <fog attach="fog" args={['#87CEEB', 20, 100]} />
        <hemisphereLight intensity={0.35} groundColor="#6b7280" />

        {!currentCinemaRoom ? (
          <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[200, 200]} />
              <meshStandardMaterial color="#4ade80" />
            </mesh>

            {otherPlayers.map((player) => (
              <group key={player.user_id}>
                {!player.current_room?.startsWith('cinema_') && (
                  <>
                    <RealisticAvatar
                      position={[player.position_x || 0, player.position_y || 0.5, player.position_z || 0]}
                      avatarStyle={player.avatar_style || myAvatarStyle}
                      isMoving={false}
                    />

                    <Html
                      position={[player.position_x || 0, (player.position_y || 0.5) + 1.5, player.position_z || 0]}
                      center
                      distanceFactor={8}
                    >
                      <div className="flex flex-col items-center gap-1 pointer-events-none">
                        <div className="bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap shadow-lg">
                          {player.user_profiles?.username || player.username}
                          {player.user_profiles?.is_admin && (
                            <Shield className="inline-block w-4 h-4 ml-1 text-red-400" />
                          )}
                          {player.user_profiles?.is_vip_plus && (
                            <Crown className="inline-block w-4 h-4 ml-1 text-yellow-400" />
                          )}
                          {player.user_profiles?.is_vip && !player.user_profiles?.is_vip_plus && (
                            <Star className="inline-block w-4 h-4 ml-1 text-purple-400" />
                          )}
                        </div>
                      </div>
                    </Html>

                    {playerChatBubbles[player.user_id] && (
                      <Html
                        position={[player.position_x || 0, (player.position_y || 0.5) + 1.8, player.position_z || 0]}
                        center
                        distanceFactor={8}
                      >
                        <div className="text-sm bg-black/70 text-white px-3 py-1 rounded-full animate-fade-in-out">
                          {playerChatBubbles[player.user_id].message}
                        </div>
                      </Html>
                    )}
                  </>
                )}
              </group>
            ))}

            <RealisticAvatar
              position={[myPosition.x, myPosition.y, myPosition.z]}
              avatarStyle={myAvatarStyle}
              isMoving={movement.x !== 0 || movement.z !== 0}
            />

            {currentEmoji && !currentCinemaRoom && (
              <Html
                position={[myPosition.x, myPosition.y + 1.8, myPosition.z]}
                center
                distanceFactor={8}
              >
                <div className="text-xl animate-fade-in-out">
                  {currentEmoji}
                </div>
              </Html>
            )}
          </>
        ) : (
          <>
            <ambientLight intensity={0.3} />
            <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[50, 60]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>

            <mesh position={[0, 6, -30]} castShadow>
              <boxGeometry args={[50, 12, 0.5]} />
              <meshStandardMaterial color={
                currentCinemaRoom.theme === 'luxury' ? '#4c1d95' :
                currentCinemaRoom.theme === 'standard' ? '#1e40af' :
                currentCinemaRoom.theme === 'imax' ? '#1f2937' : '#7c2d12'
              } />
            </mesh>
            <mesh position={[-25, 6, 0]} castShadow>
              <boxGeometry args={[0.5, 12, 60]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[25, 6, 0]} castShadow>
              <boxGeometry args={[0.5, 12, 60]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>

            <mesh position={[0, 5, -29]} castShadow>
              <planeGeometry args={[20, 11.25]} />
              <meshStandardMaterial color="#000000" emissive="#ffffff" emissiveIntensity={0.3} />
            </mesh>

            {cinemaSeats.map((seat) => (
              <group
                key={seat.seat_number}
                position={[seat.position_x, seat.position_y, seat.position_z]}
                onClick={() => handleSitInSeat(seat.seat_number)}
              >
                <mesh castShadow>
                  <boxGeometry args={[1, 0.8, 1]} />
                  <meshStandardMaterial 
                    color={seat.is_occupied ? '#dc2626' : '#22c55e'}
                    emissive={seat.is_occupied ? '#7f1d1d' : '#166534'}
                    emissiveIntensity={0.3}
                  />
                </mesh>
              </group>
            ))}

            <RealisticAvatar
              position={[myPosition.x, myPosition.y, myPosition.z]}
              avatarStyle={myAvatarStyle}
              isMoving={false}
            />
          </>
        )}
      </Canvas>

      <MobileJoystick
        onMove={handleJoystickMove}
        onStop={handleJoystickStop}
        className="fixed bottom-8 left-8"
      />

      <Button
        onClick={() => setShowMenu(!showMenu)}
        className="fixed top-4 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </Button>

      <Button
        onClick={() => setShowChat(!showChat)}
        className="fixed top-4 right-20 z-50 bg-white/20 hover:bg-white/30 backdrop-blur-lg text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>

      <Button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="fixed top-4 right-4 z-50 bg-white/20 hover:bg-white/30 backdrop-blur-lg text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
      >
        {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
      </Button>

      <Button
        onClick={() => setShowEmojiMenu(!showEmojiMenu)}
        className="fixed bottom-8 right-8 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
      >
        <Smile className="w-6 h-6" />
      </Button>

      {showEmojiMenu && (
        <div className="fixed bottom-28 right-8 z-50 bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-2xl">
          <div className="grid grid-cols-4 gap-2">
            {['👋', '❤️', '😂', '👍', '😊', '🎉', '🔥', '⭐'].map((emoji) => (
              <Button
                key={emoji}
                onClick={() => {
                  setCurrentEmoji(emoji)
                  setTimeout(() => setCurrentEmoji(null), 3000)
                  setShowEmojiMenu(false)
                }}
                className="w-12 h-12 text-2xl bg-white hover:bg-gray-100 rounded-xl"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      )}

      {showCinema && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-white/95 backdrop-blur-lg p-6 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Salles de cinéma</h2>
              <Button onClick={() => setShowCinema(false)} variant="ghost" size="icon">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cinemaRooms.map((room) => (
                <Card
                  key={room.id}
                  className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleEnterRoom(room)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Film className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{room.name}</h3>
                      <p className="text-sm text-gray-600">{room.theme}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Capacité: {room.capacity} places
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}

      {currentCinemaRoom && (
        <Button
          onClick={handleLeaveRoom}
          className="fixed top-20 left-4 z-50 bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-3 shadow-lg"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Quitter la salle
        </Button>
      )}

      {showChat && (
        <div className="fixed bottom-28 right-4 z-40 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl w-96 max-h-[500px] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-bold">Chat</h3>
            <Button onClick={() => setShowChat(false)} variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((msg, i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-3">
                <div className="font-medium text-sm">{msg.username}</div>
                <div className="text-sm">{msg.message}</div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Tapez un message..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // Send message logic here
                    setChatInput('')
                  }
                }}
              />
              <Button size="icon">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
