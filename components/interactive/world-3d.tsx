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

interface WorldProps {
  userId: string
  userProfile: any
}

interface InteractiveWorldProps {
  userId: string
  userProfile: any
}

function RealisticAvatar({
  position,
  avatarStyle,
  isMoving
}: {
  position: [number, number, number]
  avatarStyle: any
  isMoving: boolean
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
      {/* Torso - height divided by 2 */}
      <mesh position={[0, 0.375, 0]} castShadow>
        <boxGeometry args={[0.6, 0.45, 0.35]} />
        <meshStandardMaterial color={avatarStyle.bodyColor} metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial color={avatarStyle.skinTone || avatarStyle.headColor} metalness={0.1} roughness={0.6} />
      </mesh>

      {avatarStyle.faceSmiley && (
        <Html position={[0, 0.85, 0.32]} center depthTest={true} zIndexRange={[10, 0]}>
          <div className="text-2xl pointer-events-none">
            {avatarStyle.faceSmiley}
          </div>
        </Html>
      )}

      {/* Hair styles */}
      {avatarStyle.hairStyle === 'short' && (
        <mesh position={[0, 1.05, 0]} castShadow>
          <sphereGeometry args={[0.34, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={avatarStyle.hairColor || '#3d2817'} metalness={0} roughness={1} />
        </mesh>
      )}
      {avatarStyle.hairStyle === 'long' && (
        <>
          <mesh position={[0, 1.05, 0]} castShadow>
            <sphereGeometry args={[0.36, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.5]} />
            <meshStandardMaterial color={avatarStyle.hairColor || '#3d2817'} metalness={0} roughness={1} />
          </mesh>
          <mesh position={[0, 0.6, -0.3]} castShadow>
            <boxGeometry args={[0.5, 0.6, 0.2]} />
            <meshStandardMaterial color={avatarStyle.hairColor || '#3d2817'} metalness={0} roughness={1} />
          </mesh>
        </>
      )}

      {/* Accessories */}
      {avatarStyle.accessory === 'glasses' && (
        <>
          <mesh position={[-0.15, 0.85, 0.28]}>
            <torusGeometry args={[0.08, 0.02, 8, 16]} />
            <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.15, 0.85, 0.28]}>
            <torusGeometry args={[0.08, 0.02, 8, 16]} />
            <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.85, 0.28]}>
            <boxGeometry args={[0.12, 0.02, 0.02]} />
            <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.2} />
          </mesh>
        </>
      )}
      {avatarStyle.accessory === 'hat' && (
        <>
          <mesh position={[0, 1.15, 0]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.15, 16]} />
            <meshStandardMaterial color="#ef4444" metalness={0.2} roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.25, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.35, 0.2, 16]} />
            <meshStandardMaterial color="#ef4444" metalness={0.2} roughness={0.8} />
          </mesh>
        </>
      )}

      {/* Left Arm */}
      <group position={[-0.45, 0.3, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.2, 0.7, 0.2]} />
          <meshStandardMaterial color={avatarStyle.bodyColor} metalness={0.1} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.6, 0]}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color={avatarStyle.skinTone || avatarStyle.headColor} metalness={0.1} roughness={0.6} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group position={[0.45, 0.3, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.2, 0.7, 0.2]} />
          <meshStandardMaterial color={avatarStyle.bodyColor} metalness={0.1} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.6, 0]}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color={avatarStyle.skinTone || avatarStyle.headColor} metalness={0.1} roughness={0.6} />
        </mesh>
      </group>

      {/* Legs - unchanged position */}
      <group position={[-0.2, 0.15, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.22, 0.7, 0.22]} />
          <meshStandardMaterial color="#2563eb" metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.7, 0.1]}>
          <boxGeometry args={[0.24, 0.15, 0.3]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.2} roughness={0.8} />
        </mesh>
      </group>

      <group position={[0.2, 0.15, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.22, 0.7, 0.22]} />
          <meshStandardMaterial color="#2563eb" metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.7, 0.1]}>
          <boxGeometry args={[0.24, 0.15, 0.3]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.2} roughness={0.8} />
        </mesh>
      </group>
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
  // Removed unused onlineProfiles state
  const [myProfile, setMyProfile] = useState<any>(null)
  const [onlineCount, setOnlineCount] = useState(0)
  const [myPosition, setMyPosition] = useState({ x: 0, y: 0.5, z: 0 })
  const [myAvatarStyle, setMyAvatarStyle] = useState({
    bodyColor: '#3b82f6',
    headColor: '#fbbf24',
    hairStyle: 'short',
    hairColor: '#1f2937',
    skinTone: '#fbbf24',
    accessory: 'none',
    faceSmiley: '😊' // Added default face smiley
  })
  const [customizationOptions, setCustomizationOptions] = useState<any[]>([])
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [currentEmoji, setCurrentEmoji] = useState<string | null>(null)
  const [isJumping, setIsJumping] = useState(false)

  const [movement, setMovement] = useState({ x: 0, z: 0 })
  const [showChat, setShowChat] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false)
  const [showCinema, setShowShowCinema] = useState(false) // Corrected typo from original code
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

  // Synchronized actions state
  const [playerActions, setPlayerActions] = useState<Record<string, { action: string; timestamp: number }>>({})
  const [quickAction, setQuickAction] = useState<string | null>(null) // State for current quick action animation
  const [otherPlayers, setOtherPlayers] = useState<any[]>([])

  const keysPressed = useRef<Set<string>>(new Set())
  const supabase = createClient()
  const [myRotation, setMyRotation] = useState(0) // Added for rotation

  const [showMenu, setShowMenu] = useState(false)
  const [showMapMenu, setShowMapMenu] = useState(false)
  const [showEmojiMenu, setShowEmojiMenu] = useState(false) // Added for emoji menu

  useEffect(() => {
    const checkMobile = () => {
      if (controlMode === 'mobile') {
        setIsMobileMode(true)
      } else if (controlMode === 'pc') {
        setIsMobileMode(false)
      } else {
        // Auto detection
        setIsMobileMode(
          'ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          window.innerWidth < 768
        )
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [controlMode])

  const [lastActivity, setLastActivity] = useState(Date.now())
  const [showAFKWarning, setShowAFKWarning] = useState(false)

  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now())
      setShowAFKWarning(false)
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'touchmove', 'wheel']
    events.forEach(event => window.addEventListener(event, updateActivity))

    const checkAFK = setInterval(() => {
      const inactiveTime = Date.now() - lastActivity
      const threeHours = 3 * 60 * 60 * 1000 // 3 hours in milliseconds

      if (inactiveTime > threeHours) {
        setShowAFKWarning(true)
        // Disconnect user
        supabase
          .from('interactive_profiles')
          .update({ is_online: false, last_seen: new Date().toISOString() })
          .eq('user_id', userId)
          .then(() => {
            console.log('[v0] User disconnected due to AFK')
            window.location.href = '/'
          })
      }
    }, 60000) // Check every minute

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity))
      clearInterval(checkAFK)
    }
  }, [lastActivity, userId])

  const checkCollision = (newX: number, newZ: number): boolean => {
    // Collision zones for objects in the world
    const collisionZones = [
      // Cinema building (main)
      { x: 40, z: 0, width: 12, depth: 12 },

      // Arcade building
      { x: -40, z: -40, width: 10, depth: 8 },

      // Shopping mall
      { x: -50, z: 10, width: 15, depth: 20 },

      // Restaurant
      { x: 30, z: -40, width: 12, depth: 10 },

      // Hotel
      { x: -30, z: 40, width: 18, depth: 15 },

      // Museum
      { x: 50, z: 30, width: 20, depth: 16 },

      // Park fountain - REMOVED
      // { x: 0, z: 0, width: 8, depth: 8 },

      // Trees (more spread out across larger world)
      { x: -60, z: -50, width: 3, depth: 3 },
      { x: -45, z: -60, width: 3, depth: 3 },
      { x: 45, z: -60, width: 3, depth: 3 },
      { x: 60, z: -50, width: 3, depth: 3 },
      { x: -65, z: 30, width: 3, depth: 3 },
      { x: 65, z: 30, width: 3, depth: 3 },
      { x: -50, z: 55, width: 3, depth: 3 },
      { x: 50, z: 55, width: 3, depth: 3 },
      { x: -20, z: -30, width: 3, depth: 3 },
      { x: 20, z: -30, width: 3, depth: 3 },
      { x: -30, z: 20, width: 3, depth: 3 },
      { x: 30, z: 20, width: 3, depth: 3 },
      { x: -40, z: -20, width: 3, depth: 3 },
      { x: 40, z: -20, width: 3, depth: 3 },
      { x: -55, z: 0, width: 3, depth: 3 },
      { x: 55, z: 0, width: 3, depth: 3 },

      // Lampposts along pathways
      { x: -70, z: -30, width: 1, depth: 1 },
      { x: -70, z: 0, width: 1, depth: 1 },
      { x: -70, z: 30, width: 1, depth: 1 },
      { x: 70, z: -30, width: 1, depth: 1 },
      { x: 70, z: 0, width: 1, depth: 1 },
      { x: 70, z: 30, width: 1, depth: 1 },
      { x: 0, z: -70, width: 1, depth: 1 },
      { x: -30, z: -70, width: 1, depth: 1 },
      { x: 30, z: -70, width: 1, depth: 1 },
      { x: 0, z: 70, width: 1, depth: 1 },
      { x: -30, z: 70, width: 1, depth: 1 },
      { x: 30, z: 70, width: 1, depth: 1 },

      // Bushes and decorations
      { x: 15, z: -20, width: 2, depth: 2 },
      { x: -15, z: -20, width: 2, depth: 2 },
      { x: 25, z: 15, width: 2, depth: 2 },
      { x: -25, z: 15, width: 2, depth: 2 },
      { x: 35, z: -15, width: 2, depth: 2 },
      { x: -35, z: -15, width: 2, depth: 2 },
      { x: 10, z: 35, width: 2, depth: 2 },
      { x: -10, z: 35, width: 2, depth: 2 },
      { x: 5, z: -10, width: 2, depth: 2 },
      { x: -5, z: -10, width: 2, depth: 2 },
      { x: 20, z: 5, width: 2, depth: 2 },
      { x: -20, z: 5, width: 2, depth: 2 },
    ]

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
        .from('interactive_world_settings')
        .select('setting_value')
        .eq('setting_key', 'world_config')
        .maybeSingle()

      if (data && data.setting_value) {
        console.log('[v0] Loaded world settings:', data.setting_value)
        setWorldSettings(data.setting_value as any)
      }
    }

    loadWorldSettings()
  }, [])

  useEffect(() => {
    const loadPlayers = async () => {
      console.log('[v0] Loading other players...')

      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('interactive_profiles')
          .select('*')
          .eq('is_online', true)
          .neq('user_id', userId)

        if (profilesError) {
          console.error('[v0] Error loading profiles:', profilesError)
          return
        }

        console.log('[v0] Found profiles:', profiles?.length || 0)

        if (profiles && profiles.length > 0) {
          const userIds = profiles.map(p => p.user_id)

          const { data: userProfiles, error: userProfilesError } = await supabase
            .from('user_profiles')
            .select('user_id, username, is_admin, is_vip, is_vip_plus')
            .in('user_id', userIds)

          if (userProfilesError) {
            console.error('[v0] Error loading user profiles:', userProfilesError)
          }

          const mergedData = profiles.map(profile => ({
            ...profile,
            user_profiles:
              userProfiles?.find(up => up?.user_id === profile.user_id) || {
              username: profile.username,
              is_admin: false,
              is_vip: false,
              is_vip_plus: false
            }
          }))

          console.log('[v0] Merged player data:', mergedData.length)
          setOtherPlayers(mergedData)
          setOnlineCount(mergedData.length + 1)
        } else {
          setOtherPlayers([])
          setOnlineCount(1)
        }
      } catch (err) {
        console.error('[v0] Failed to load players:', err)
      }
    }

    supabase
      .from('interactive_profiles')
      .update({ is_online: true, last_seen: new Date().toISOString() })
      .eq('user_id', userId)
      .then()

    loadPlayers()
    const interval = setInterval(loadPlayers, 5000)

    const channel = supabase
      .channel('players')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'interactive_profiles'
      }, () => {
        console.log('[v0] Player data changed, reloading...')
        loadPlayers()
      })
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
      supabase
        .from('interactive_profiles')
        .update({ is_online: false, last_seen: new Date().toISOString() })
        .eq('user_id', userId)
        .then()
    }
  }, [userId])

  useEffect(() => {
    // Seats are never locked anymore
    setIsSeatsLocked(false)
  }, [currentCinemaRoom])

  useEffect(() => {
    if (!currentCinemaRoom || currentCinemaRoom === 'world') return

    const room = cinemaRooms.find(r => r.id === currentCinemaRoom.id) // Use currentCinemaRoom directly
    if (!room || !room.schedule_start) return

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const start = new Date(room.schedule_start!).getTime()
      const distance = start - now

      if (distance < 0) {
        setCountdown('Film en cours')
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
      console.error('Fullscreen error:', err)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    const loadAvatarStyle = async () => {
      const { data } = await supabase
        .from('interactive_profiles')
        .select('avatar_style')
        .eq('user_id', userId)
        .single()

      if (data?.avatar_style) {
        setMyAvatarStyle(data.avatar_style)
      }
    }

    loadAvatarStyle()
  }, [userId])

  const saveAvatarStyle = async (newStyle: any) => {
    setMyAvatarStyle(newStyle)
    await supabase
      .from('interactive_profiles')
      .update({ avatar_style: newStyle })
      .eq('user_id', userId)
  }

  useEffect(() => {
    const loadCustomizationOptions = async () => {
      const { data } = await supabase
        .from('avatar_customization_options')
        .select('*')
        .order('category')

      if (data) {
        console.log('[v0] Loaded customization options:', data.length)
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

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isSeatsLocked, mySeat]) // isSeatsLocked is now effectively unused

  useEffect(() => {
    const interval = setInterval(() => {
      // if (isSeatsLocked && mySeat !== null) return // Removed seat lock check

      let dx = 0
      let dz = 0
      const speed = 0.15

      if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) dz -= speed
      if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) dz += speed
      if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) dx -= speed
      if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) dx += speed

      if (dx !== 0 || dz !== 0) {
        setMovement({ x: dx, z: dz })
        setMyPosition(prev => {
          const newX = Math.max(-20, Math.min(20, prev.x + dx))
          const newZ = Math.max(-20, Math.min(20, prev.z + dz))

          if (checkCollision(newX, newZ)) {
            return prev // Don't move if collision detected
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
        setMovement({ x: 0, z: 0 })
      }
    }, 50)

    return () => clearInterval(interval)
  }, [userId, isSeatsLocked, mySeat]) // isSeatsLocked is now effectively unused

  useEffect(() => {
    const loadMessages = async () => {
      const { data } = await supabase
        .from('interactive_chat_messages')
        .select('*')
        .eq('room', 'world')
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) setMessages(data.reverse())
    }

    loadMessages()

    const channel = supabase
      .channel('chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'interactive_chat_messages',
        filter: 'room=eq.world'
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
        setPlayerChatBubbles(prev => ({
          ...prev,
          [payload.new.user_id]: {
            message: payload.new.message,
            timestamp: Date.now()
          }
        }))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    const loadCinemaRooms = async () => {
      const { data } = await supabase
        .from('interactive_cinema_rooms')
        .select('*')
        .eq('is_open', true)
        .order('room_number')

      if (data) setCinemaRooms(data)
    }

    loadCinemaRooms()

    const channel = supabase
      .channel('cinema_rooms')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'interactive_cinema_rooms'
      }, loadCinemaRooms)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (!currentCinemaRoom) return

    const loadSeats = async () => {
      const { data } = await supabase
        .from('interactive_cinema_seats')
        .select('*')
        .eq('room_id', currentCinemaRoom.id)

      if (data) setCinemaSeats(data)
    }

    loadSeats()

    const channel = supabase
      .channel(`cinema_seats_${currentCinemaRoom.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'interactive_cinema_seats',
        filter: `room_id=eq.${currentCinemaRoom.id}`
      }, loadSeats)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentCinemaRoom])

  useEffect(() => {
    if (!currentCinemaRoom) return

    const loadRoomMessages = async () => {
      const { data } = await supabase
        .from('interactive_chat_messages')
        .select('*')
        .eq('room', `cinema_${currentCinemaRoom.id}`)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) setRoomMessages(data.reverse())
    }

    loadRoomMessages()

    const channel = supabase
      .channel(`chat_cinema_${currentCinemaRoom.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'interactive_chat_messages',
        filter: `room=eq.cinema_${currentCinemaRoom.id}`
      }, (payload) => {
        setRoomMessages(prev => [...prev, payload.new])
        setPlayerChatBubbles(prev => ({
          ...prev,
          [payload.new.user_id]: {
            message: payload.new.message,
            timestamp: Date.now()
          }
        }))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentCinemaRoom])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setPlayerChatBubbles(prev => {
        const updated = { ...prev }
        Object.keys(updated).forEach(key => {
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
      console.log('[v0] Cannot send emoji: userProfile is null')
      return
    }

    setCurrentEmoji(emoji)
    setShowQuickActions(false)

    // Broadcast emoji to other players using correct ID
    supabase.channel('world-actions').send({
      type: 'broadcast',
      event: 'player-emoji',
      payload: {
        userId: userProfile.id, // Changed from user_id to id
        emoji: emoji,
        timestamp: Date.now()
      }
    })

    setTimeout(() => setCurrentEmoji(null), 3000)
  }

  const handleJump = () => {
    if (!userProfile) {
      console.log('[v0] Cannot jump: userProfile is null')
      return
    }

    setIsJumping(true)

    // Broadcast jump action to other players using correct ID
    supabase.channel('world-actions').send({
      type: 'broadcast',
      event: 'player-action',
      payload: {
        userId: userProfile.id, // Changed from user_id to id
        action: 'jump',
        timestamp: Date.now()
      }
    })

    setTimeout(() => setIsJumping(false), 500)
  }

  const sendMessage = async () => {
    if (!userProfile || !userProfile.id) {
      console.log('[v0] Cannot send message: userProfile is missing')
      return
    }

    if (!worldSettings.enableChat) {
      console.log('[v0] Chat is disabled by admin')
      return
    }

    if (chatInput.trim()) {
      const message = {
        user_id: userProfile.id, // Use id instead of user_id
        username: myProfile?.username || userProfile.username || 'Joueur',
        message: chatInput.trim(),
        room: currentCinemaRoom ? `cinema_${currentCinemaRoom.id}` : 'world',
        created_at: new Date().toISOString()
      }

      console.log('[v0] Sending message:', message)

      const { error } = await supabase.from('interactive_chat_messages').insert(message)

      if (error) {
        console.error('[v0] Error sending message:', error)
      } else {
        console.log('[v0] Message sent successfully')
        setPlayerChatBubbles(prev => ({
          ...prev,
          [userProfile.id]: {
            message: chatInput.trim(),
            timestamp: Date.now()
          }
        }))
      }

      setChatInput('')
    }
  }

  const handleJoystickMove = useCallback((dx: number, dz: number) => {
    // if (isSeatsLocked && mySeat !== null) return // Removed seat lock check

    setMyPosition(prev => {
      const speed = 0.15
      const newX = Math.max(-20, Math.min(20, prev.x + dx * speed))
      const newZ = Math.max(-20, Math.min(20, prev.z + dz * speed))

      if (checkCollision(newX, newZ)) {
        return prev // Don't move if collision detected
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
          position_z: newPos.z
        })
        .eq('user_id', userId)
        .then()

      return newPos
    })
    
    if (dx !== 0 || dz !== 0) {
      setMovement({ x: dx, z: dz })
    } else {
      setMovement({ x: 0, z: 0 })
    }
  }, [userId, supabase]) // Removed isSeatsLocked and mySeat from dependencies as they are effectively unused

  const handleJoystickStop = useCallback(() => {
    setMovement({ x: 0, z: 0 }) // Stop movement when joystick is released
  }, [])

  const handleEnterRoom = async (room: any) => {
    setCurrentCinemaRoom(room)
    setShowShowCinema(false) // Corrected typo
    setShowCinema(false) // Also ensuring the old state is cleared

    setMyPosition({ x: 0, y: 0, z: 25 }) // Spawn at the entrance of the cinema

    await supabase
      .from('interactive_profiles')
      .update({
        current_room: `cinema_${room.id}`,
        position_x: 0,
        position_y: 0, // Will be adjusted by seat later
        position_z: 25
      })
      .eq('user_id', userId)

    // Generate seats on enter
    const capacity = room.capacity || 50
    const seatsPerRow = 10
    const rows = Math.ceil(capacity / seatsPerRow)
    const seatSpacingX = 1.5
    const seatSpacingZ = 2
    const startZ = 20
    const startX = -(seatsPerRow - 1) * seatSpacingX / 2

    const generatedSeats = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < seatsPerRow; col++) {
        const seatNumber = row * seatsPerRow + col
        if (seatNumber >= capacity) break

        const seatX = startX + col * seatSpacingX
        const seatZ = startZ - row * seatSpacingZ

        generatedSeats.push({
          seat_number: seatNumber,
          row_number: row,
          position_x: seatX,
          position_y: 0.5, // Ground level for seats
          position_z: seatZ,
          color: '#991b1b', // Default red
          is_occupied: false,
          user_id: null // Ensure user_id is null initially
        })
      }
    }
    setCinemaSeats(generatedSeats)
  }

  const handleLeaveRoom = async () => {
    if (mySeat !== null) { // Check if user is seated
      try {
        await supabase
          .from('interactive_cinema_seats')
          .delete()
          .eq('room_id', currentCinemaRoom.id)
          .eq('user_id', userId)
        setMySeat(null)
      } catch (error) {
        console.error('[v0] Error unseating:', error)
      }
    }

    setCurrentCinemaRoom(null)
    setIsSeatsLocked(false) // Ensure seats are unlocked when leaving
    setCountdown('') // Clear countdown when leaving room

    setMyPosition({ x: 0, y: 0.5, z: 25 }) // Reset position to world entrance

    await supabase
      .from('interactive_profiles')
      .update({
        current_room: null,
        position_x: 0,
        position_y: 0.5,
        position_z: 25
      })
      .eq('user_id', userId)
  }


  const handleSitInSeat = async (seatNumber?: number) => {
    if (!userProfile || !currentCinemaRoom) return

    try {
      // If no seat number provided, find first available seat

      let targetSeat = seatNumber

      if (!targetSeat) {
        const availableSeats = cinemaSeats.filter(seat => !seat.user_id)
        if (availableSeats.length === 0) {
          alert('Toutes les places sont occupées!')
          return
        }
        targetSeat = availableSeats[0].seat_number
      }

      const seat = cinemaSeats.find(s => s.seat_number === targetSeat)
      if (!seat) return

      if (mySeat === targetSeat) {
        // Stand up
        await supabase
          .from('interactive_cinema_seats')
          .update({ user_id: null })
          .eq('room_id', currentCinemaRoom.id)
          .eq('seat_number', targetSeat)

        setMySeat(null)
        setMyPosition({ x: 0, y: 0.5, z: 25 }) // Return to cinema entrance
      } else {
        if (seat.user_id && seat.user_id !== userProfile.id) { // Check if seat is occupied by someone else
          alert('Cette place est déjà occupée!')
          return
        }

        // Release old seat
        if (mySeat !== null) {
          await supabase
            .from('interactive_cinema_seats')
            .update({ user_id: null })
            .eq('room_id', currentCinemaRoom.id)
            .eq('seat_number', mySeat)
        }

        // Take new seat
        await supabase
          .from('interactive_cinema_seats')
          .update({ user_id: userProfile.id })
          .eq('room_id', currentCinemaRoom.id)
          .eq('seat_number', targetSeat)

        setMySeat(targetSeat)
        setMyPosition({ x: seat.position_x, y: seat.position_y + 0.5, z: seat.position_z }) // Adjust y for avatar height
      }
    } catch (error) {
      console.error('[v0] Error sitting:', error)
    }
  }

  const handleExitRoom = async () => {
    if (mySeat !== null) {
      try {
        await supabase
          .from('interactive_cinema_seats')
          .update({ user_id: null })
          .eq('room_id', currentCinemaRoom.id)
          .eq('seat_number', mySeat)
        setMySeat(null)
      } catch (error) {
        console.error('[v0] Error leaving seat:', error)
      }
    }
    handleLeaveRoom()
  }


  useEffect(() => {
    const checkCapacity = async () => {
      const { count } = await supabase
        .from('interactive_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_online', true)

      if (count && count >= worldSettings.maxCapacity) {
        console.log('[v0] World is at max capacity:', count, '/', worldSettings.maxCapacity)
        // Could show a message to user here
      }
    }

    checkCapacity()
  }, [worldSettings.maxCapacity])

  useEffect(() => {
    const channel = supabase.channel('world-actions')
      .on('broadcast', { event: 'player-emoji' }, (payload: any) => {
        if (payload.userId && payload.userId !== userId) {
          setPlayerActions(prev => ({
            ...prev,
            [payload.userId]: {
              action: 'emoji',
              emoji: payload.emoji,
              timestamp: Date.now()
            }
          }))

          setTimeout(() => {
            setPlayerActions(prev => {
              const newActions = { ...prev }
              delete newActions[payload.userId]
              return newActions
            })
          }, 3000)
        }
      })
      .on('broadcast', { event: 'player-action' }, (payload: any) => {
        if (payload.userId && payload.userId !== userId) {
          setPlayerActions(prev => ({
            ...prev,
            [payload.userId]: {
              action: payload.action,
              timestamp: Date.now()
            }
          }))

          setTimeout(() => {
            setPlayerActions(prev => {
              const newActions = { ...prev }
              delete newActions[payload.userId]
              return newActions
            })
          }, 2000)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const broadcastAction = async (action: string) => {
    console.log('[v0] Broadcasting action:', action)
    await supabase.channel('player-actions').send({
      type: 'broadcast',
      event: 'action',
      payload: { userId: userId, action } // Use userId from props
    })
  }

  // Handle quick actions (emotes, jumps)
  const handleQuickAction = (action: string) => {
    if (!userProfile) {
      console.log('[v0] Cannot perform quick action: userProfile is null')
      return
    }

    setQuickAction(action)
    setShowQuickActions(false)

    // Broadcast quick action to other players
    supabase.channel('world-actions').send({
      type: 'broadcast',
      event: 'player-action',
      payload: {
        userId: userProfile.user_id,
        action,
        timestamp: Date.now()
      }
    })

    setTimeout(() => setQuickAction(null), 3000)
  }

  useEffect(() => {
    if (!userId || !userProfile) {
      console.log('[v0] No user ID or profile, skipping profile load')
      return
    }

    const loadMyProfile = async () => {
      try {
        const { data: profiles, error } = await supabase
          .from('interactive_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (error) throw error

        if (profiles) {
          console.log('[v0] Loaded my profile:', profiles)
          setMyProfile(profiles)
          setMyPosition({
            x: profiles.position_x || 0,
            y: profiles.position_y || 0.5,
            z: profiles.position_z || 50
          })
          setMyRotation(profiles.rotation || 0)
          
          if (profiles.current_room && profiles.current_room.startsWith('cinema_')) {
            console.log('[v0] User was stuck in cinema room, resetting...')
            await supabase
              .from('interactive_profiles')
              .update({ current_room: null })
              .eq('user_id', userId)
            setCurrentCinemaRoom(null)
          }

          if (profiles.avatar_style) {
            setMyAvatarStyle({
              ...myAvatarStyle,
              ...profiles.avatar_style
            })
          }
        }
      } catch (error) {
        console.error('[v0] Error loading profile:', error)
      }
    }
    
    loadMyProfile()
  }, [userId, userProfile])

  // Function to determine if it's the current user's avatar
  const isMe = (playerId: string) => playerId === userId;

  const handleTakeSeat = async () => {
    if (!currentCinemaRoom) return;
    setShowEmojiMenu(false); // Close menu when taking a seat
    await handleSitInSeat();
  };


  return (
    <div className="fixed inset-0 bg-black z-50">
      <Canvas
        // Pass povMode to camera
        camera={povMode ? undefined : { position: [0, 8, 12], fov: 60 }}
        style={{ width: '100vw', height: '100vh' }}
        shadows
        gl={{
          antialias: graphicsQuality !== 'low',
          alpha: false,
          powerPreference: graphicsQuality === 'high' ? 'high-performance' : 'default'
        }}
      >
        {povMode && (
          <PerspectiveCamera
            makeDefault
            position={[myPosition.x, myPosition.y + 1.5, myPosition.z]} // Adjust for eye level
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
            <ambientLight intensity={0.4} />
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
            <ambientLight intensity={0.15} />
            <directionalLight
              position={[10, 20, 10]}
              intensity={0.3}
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
            <ambientLight intensity={0.3} />
            <directionalLight
              position={[10, 5, 10]}
              intensity={1.0}
              color="#ff8844"
              castShadow
              shadow-mapSize={graphicsQuality === 'high' ? [2048, 2048] : [1024, 1024]}
            />
          </>
        )}

        <fog attach="fog" args={['#87CEEB', 10, 50]} />
        <hemisphereLight intensity={0.3} groundColor="#6b7280" />

        {!currentCinemaRoom ? (
          <>
            {/* Ground - larger natural terrain */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[200, 200]} />
              <meshStandardMaterial color="#4ade80" />
            </mesh>

            {/* Central Park with Fountain - REMOVED FOUNTAIN */}
            <group position={[0, 0, 0]}>
              {/* Park benches only */}
              {[
                [8, 8], [-8, 8], [8, -8], [-8, -8]
              ].map(([x, z], i) => (
                <group key={`bench-${i}`} position={[x, 0, z]}>
                  <mesh position={[0, 0.4, 0]} castShadow>
                    <boxGeometry args={[2, 0.2, 0.8]} />
                    <meshStandardMaterial color="#6d28d9" />
                  </mesh>
                  <mesh position={[0, 0.8, -0.3]} castShadow>
                    <boxGeometry args={[2, 0.6, 0.2]} />
                    <meshStandardMaterial color="#6d28d9" />
                  </mesh>
                </group>
              ))}
            </group>

            {/* Cinema Building - Main Attraction */}
            <group position={[40, 0, 0]}>
              {/* Building */}
              <mesh position={[0, 5, 0]} castShadow>
                <boxGeometry args={[12, 10, 12]} />
                <meshStandardMaterial color="#1e40af" />
              </mesh>
              {/* Roof */}
              <mesh position={[0, 10.5, 0]} castShadow>
                <coneGeometry args={[8, 2, 4]} />
                <meshStandardMaterial color="#1e3a8a" />
              </mesh>
              <Text
                position={[0, 8, 6.1]}
                fontSize={1.2}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                🎬 CINÉMA
              </Text>
              {/* Door */}
              <mesh position={[0, 2, 6.1]} castShadow>
                <boxGeometry args={[3, 4, 0.2]} />
                <meshStandardMaterial color="#3b82f6" />
              </mesh>
            </group>

            {/* Arcade Building */}
            <group position={[-40, 0, -40]}>
              <mesh position={[0, 4, 0]} castShadow>
                <boxGeometry args={[10, 8, 8]} />
                <meshStandardMaterial color="#7c3aed" />
              </mesh>
              <Text
                position={[0, 6, 4.1]}
                fontSize={0.8}
                color="#fbbf24"
                anchorX="center"
                anchorY="middle"
              >
                🕹️ ARCADE
              </Text>
              <Text
                position={[0, 4.5, 4.1]}
                fontSize={0.5}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                Ouverture Prochainement
              </Text>
            </group>

            {/* Shopping Mall */}
            <group position={[-50, 0, 10]}>
              <mesh position={[0, 8, 0]} castShadow>
                <boxGeometry args={[15, 16, 20]} />
                <meshStandardMaterial color="#dc2626" />
              </mesh>
              <Text
                position={[0, 10, 10.1]}
                fontSize={1}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                maxWidth={12}
              >
                CENTRE{'\n'}COMMERCIAL
              </Text>
            </group>

            {/* Restaurant */}
            <group position={[30, 0, -40]}>
              <mesh position={[0, 5, 0]} castShadow>
                <boxGeometry args={[12, 10, 10]} />
                <meshStandardMaterial color="#f97316" />
              </mesh>
              <Text
                position={[0, 7, 5.1]}
                fontSize={0.9}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                🍽️ RESTAURANT
              </Text>
            </group>

            {/* Hotel */}
            <group position={[-30, 0, 40]}>
              <mesh position={[0, 10, 0]} castShadow>
                <boxGeometry args={[18, 20, 15]} />
                <meshStandardMaterial color="#4338ca" />
              </mesh>
              <Text
                position={[0, 15, 7.6]}
                fontSize={1.1}
                color="#fbbf24"
                anchorX="center"
                anchorY="middle"
              >
                🏨 HÔTEL
              </Text>
            </group>

            {/* Museum */}
            <group position={[50, 0, 30]}>
              <mesh position={[0, 7, 0]} castShadow>
                <boxGeometry args={[20, 14, 16]} />
                <meshStandardMaterial color="#0891b2" />
              </mesh>
              {/* Columns */}
              {[-6, -2, 2, 6].map((x) => (
                <mesh key={x} position={[x, 3, 8.5]} castShadow>
                  <cylinderGeometry args={[0.5, 0.5, 6, 8]} />
                  <meshStandardMaterial color="#e2e8f0" />
                </mesh>
              ))}
              <Text
                position={[0, 12, 8.1]}
                fontSize={1}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                🏛️ MUSÉE
              </Text>
            </group>

            {/* Trees - varied across the world */}
            {[
              [-60, -50], [-45, -60], [45, -60], [60, -50],
              [-65, 30], [65, 30], [-50, 55], [50, 55],
              [-20, -30], [20, -30], [-30, 20], [30, 20],
              [-40, -20], [40, -20], [-55, 0], [55, 0]
            ].map(([x, z], i) => (
              <group key={`tree-${i}`} position={[x, 0, z]}>
                {/* Trunk */}
                <mesh position={[0, 2, 0]} castShadow>
                  <cylinderGeometry args={[0.4, 0.5, 4, 8]} />
                  <meshStandardMaterial color="#4a5568" />
                </mesh>
                {/* Foliage */}
                <mesh position={[0, 5, 0]} castShadow>
                  <coneGeometry args={[2.5, 4, 8]} />
                  <meshStandardMaterial color="#166534" />
                </mesh>
              </group>
            ))}

            {/* Bushes - decorative elements */}
            {[
              [15, -20], [-15, -20], [25, 15], [-25, 15],
              [35, -15], [-35, -15], [10, 35], [-10, 35],
              [5, -10], [-5, -10], [20, 5], [-20, 5]
            ].map(([x, z], i) => (
              <mesh key={`bush-${i}`} position={[x, 0.8, z]} castShadow>
                <sphereGeometry args={[1.5, 8, 8]} />
                <meshStandardMaterial color="#15803d" />
              </mesh>
            ))}

            {/* Lampposts along main paths */}
            {[
              [-70, -30], [-70, 0], [-70, 30],
              [70, -30], [70, 0], [70, 30],
              [0, -70], [-30, -70], [30, -70],
              [0, 70], [-30, 70], [30, 70]
            ].map(([x, z], i) => (
              <group key={`lamp-${i}`} position={[x, 0, z]}>
                <mesh position={[0, 3, 0]} castShadow>
                  <cylinderGeometry args={[0.2, 0.2, 6, 8]} />
                  <meshStandardMaterial color="#1f2937" />
                </mesh>
                <mesh position={[0, 6, 0]}>
                  <sphereGeometry args={[0.5, 8, 8]} />
                  <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={0.5} />
                </mesh>
                <pointLight position={[0, 6, 0]} intensity={0.5} distance={15} color="#fef08a" />
              </group>
            ))}

            {/* Benches around park - MOVED TO CENTRAL PARK SECTION ABOVE */}

            {/* Render other players */}
            {otherPlayers.map((player) => (
              <group key={player.user_id}>
                {!player.current_room?.startsWith('cinema_') && (
                  <>
                    <RealisticAvatar
                      position={[player.position_x, player.position_y, player.position_z]}
                      avatarStyle={player.avatar_style || myAvatarStyle}
                      isMoving={player.movement_x !== 0 || player.movement_z !== 0}
                    />

                    {/* Player Name & Badge - Changed to use proper z-index */}
                    {!isMe(player.user_id) && (
                      <Html
                        position={[player.position_x, player.position_y + 1.5, player.position_z]}
                        center
                        depthTest={true}
                        zIndexRange={[10, 0]}
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
                    )}

                    {/* Chat bubbles for other players */}
                    {playerChatBubbles[player.user_id] && (
                      <Html
                        position={[player.position_x, player.position_y + 1.8, player.position_z]}
                        center
                        depthTest={false}
                        zIndexRange={[20, 0]}
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

            {myProfile && (
              <>
                <RealisticAvatar
                  position={[myPosition.x, myPosition.y, myPosition.z]}
                  avatarStyle={myAvatarStyle}
                  isMoving={movement.x !== 0 || movement.z !== 0}
                />
                {console.log('[v0] Rendering player avatar at:', myPosition, 'Avatar style:', myAvatarStyle)}
              </>
            )}

            {/* My Chat Bubble */}
            {currentEmoji && !currentCinemaRoom && (
              <Html
                position={[myPosition.x, myPosition.y + 1.8, myPosition.z]}
                center
                depthTest={false}
                zIndexRange={[20, 0]}
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

            {/* Larger cinema floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[50, 60]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>

            {/* Walls with theme colors */}
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

            {/* Ceiling with lights */}
            <mesh position={[0, 12, 0]} receiveShadow>
              <boxGeometry args={[50, 0.5, 60]} />
              <meshStandardMaterial color="#0f0f0f" />
            </mesh>

            {/* Ceiling lights */}
            {[-15, -5, 5, 15].map((x) =>
              [-20, -10, 0, 10, 20].map((z) => (
                <pointLight
                  key={`light-${x}-${z}`}
                  position={[x, 11, z]}
                  intensity={0.3}
                  distance={15}
                  color="#fef3c7"
                />
              ))
            )}

            {/* Stage lighting */}
            <spotLight
              position={[0, 10, -10]}
              angle={0.5}
              penumbra={0.5}
              intensity={1}
              castShadow
              target-position={[0, 0, -28]}
            />

            {/* Curtains on sides */}
            <mesh position={[-24, 6, -25]} castShadow>
              <boxGeometry args={[1, 10, 10]} />
              <meshStandardMaterial color="#7f1d1d" />
            </mesh>
            <mesh position={[24, 6, -25]} castShadow>
              <boxGeometry args={[1, 10, 10]} />
              <meshStandardMaterial color="#7f1d1d" />
            </mesh>

            <group position={[0, 6, -28]}>
              <mesh castShadow>
                <boxGeometry args={[24, 12, 0.3]} />
                <meshStandardMaterial color="#1f2937" />
              </mesh>

              {currentCinemaRoom?.embed_url && (
                <Html position={[0, 0, 0.2]} transform occlude zIndexRange={[10, 0]}>
                  <iframe
                    src={currentCinemaRoom.embed_url}
                    className="w-[800px] h-[450px] pointer-events-auto"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </Html>
              )}
            </group>

            {cinemaSeats.map((seat) => {
              const isMySeat = mySeat === seat.seat_number
              const isOccupied = seat.user_id && seat.user_id !== userProfile?.id

              return (
                <group key={seat.seat_number} position={[seat.position_x, seat.position_y, seat.position_z]}>
                  {/* Seat base - red velvet style */}
                  <mesh castShadow>
                    <boxGeometry args={[1.2, 0.5, 1.2]} />
                    <meshStandardMaterial
                      color={isMySeat ? '#dc2626' : isOccupied ? '#7f1d1d' : '#991b1b'}
                      roughness={0.7}
                    />
                  </mesh>
                  {/* Seat back - tall and comfortable */}
                  <mesh position={[0, 0.7, -0.4]} castShadow>
                    <boxGeometry args={[1.2, 1.2, 0.3]} />
                    <meshStandardMaterial
                      color={isMySeat ? '#dc2626' : isOccupied ? '#7f1d1d' : '#991b1b'}
                      roughness={0.7}
                    />
                  </mesh>
                  {/* Left armrest */}
                  <mesh position={[-0.6, 0.4, 0]} castShadow>
                    <boxGeometry args={[0.15, 0.8, 1]} />
                    <meshStandardMaterial color="#4a1d1d" />
                  </mesh>
                  {/* Right armrest */}
                  <mesh position={[0.6, 0.4, 0]} castShadow>
                    <boxGeometry args={[0.15, 0.8, 1]} />
                    <meshStandardMaterial color="#4a1d1d" />
                  </mesh>
                </group>
              )
            })}
            {/* Render other players' avatars and chat bubbles */}
            {otherPlayers.map((player) => {
              const isPlayerMe = isMe(player.user_id);
              return (
                <group key={player.user_id}>
                  <RealisticAvatar
                    position={[player.position_x, player.position_y, player.position_z]}
                    avatarStyle={player.avatar_style || myAvatarStyle}
                    isMoving={player.movement_x !== 0 || player.movement_z !== 0}
                  />
                  {!isPlayerMe && (
                    <Html
                      position={[player.position_x, player.position_y + 1.5, player.position_z]}
                      center
                      depthTest={true}
                      zIndexRange={[10, 0]}
                    >
                      <div className="flex flex-col items-center gap-1 pointer-events-none">
                        <div className="bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap shadow-lg">
                          {player.user_profiles?.username || player.username}
                          {player.user_profiles?.is_admin && <Shield className="inline-block w-4 h-4 ml-1 text-red-400" />}
                          {player.user_profiles?.is_vip_plus && <Crown className="inline-block w-4 h-4 ml-1 text-yellow-400" />}
                          {player.user_profiles?.is_vip && !player.user_profiles?.is_vip_plus && <Star className="inline-block w-4 h-4 ml-1 text-purple-400" />}
                        </div>
                      </div>
                    </Html>
                  )}
                  {/* Chat bubbles for other players */}
                  {playerChatBubbles[player.user_id] && (
                    <Html
                      position={[player.position_x, player.position_y + 1.8, player.position_z]}
                      center
                      depthTest={false}
                      zIndexRange={[20, 0]}
                    >
                      <div className="text-sm bg-black/70 text-white px-3 py-1 rounded-full animate-fade-in-out">
                        {playerChatBubbles[player.user_id].message}
                      </div>
                    </Html>
                  )}
                </group>
              );
            })}
          </>
        )}
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Menu principal - Top Left */}
        <div className="absolute top-4 left-4 z-50 pointer-events-auto">
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
                  {myProfile?.username || 'Vous'}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
                  <Users className="w-4 h-4" />
                  <span>{onlineCount} en ligne</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowMapMenu(true)
                  setShowMenu(false)
                }}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 flex items-center justify-center gap-2 text-base font-medium transition-colors shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Carte
              </button>

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
            </div>
          )}
        </div>

        {/* Top Right Icons */}
        <div className="absolute top-4 right-4 z-50 flex gap-3 pointer-events-auto">
          {worldSettings.enableChat && !isFullscreen && !showChatInput && (
            <button
              onClick={() => setShowChatInput(true)}
              className="bg-white/20 backdrop-blur-lg text-white p-3 rounded-lg hover:bg-white/30 transition-colors shadow-lg"
              title="Écrire un message"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
          )}

          <button
            onClick={handleFullscreen}
            className="bg-white/20 backdrop-blur-lg text-white p-3 rounded-lg hover:bg-white/30 transition-colors shadow-lg"
            title="Mode Immersif"
          >
            <Maximize2 className="w-6 h-6" />
          </button>
        </div>

        {/* Chat Input */}
        {showChatInput && !isFullscreen && (
          <div className="absolute top-20 right-4 w-80 bg-black/80 backdrop-blur-lg rounded-lg z-60 p-4 pointer-events-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-bold text-sm">Envoyer un message</h3>
              <button
                onClick={() => setShowChatInput(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
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

        {/* Fullscreen Exit Button */}
        {isFullscreen && (
          <button
            onClick={handleFullscreen}
            className="absolute top-4 right-4 z-60 bg-red-500/80 backdrop-blur-lg text-white p-3 rounded-full hover:bg-red-600/80 transition-colors shadow-lg"
            title="Quitter le plein écran"
          >
            <Minimize className="w-6 h-6" />
          </button>
        )}

        {mySeat !== null && currentCinemaRoom?.embed_url && !showMovieFullscreen && (
          <Html position={[0, 6.5, -23]} center zIndexRange={[30, 0]}>
            <button
              onClick={() => setShowMovieFullscreen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg"
            >
              <Maximize className="w-4 h-4" />
              Plein Écran
            </button>
          </Html>
        )}

        {showMovieFullscreen && currentCinemaRoom?.embed_url && (
          <Html fullscreen zIndexRange={[80, 0]}>
            <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[80] flex items-center justify-center">
              <button
                onClick={() => setShowMovieFullscreen(false)}
                className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full z-[90] transition-all shadow-lg"
              >
                <X className="w-6 h-6" />
              </button>
              <iframe
                src={currentCinemaRoom.embed_url}
                className="w-[90vw] h-[90vh] rounded-lg shadow-2xl"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Html>
        )}

        {/* Cinema Rooms Menu */}
        {showCinema && (
          <div className="fixed inset-0 bg-black/98 backdrop-blur-xl z-[70] flex items-center justify-center p-4 overflow-y-auto pointer-events-auto">
            <div className="bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-4xl border-2 border-purple-500/30 my-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                  <Film className="w-7 h-7 sm:w-8 sm:h-8" />
                  Salles de Cinéma
                </h2>
                <button
                  onClick={() => setShowCinema(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

              <div className="grid gap-4 sm:gap-6">
                {cinemaRooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-gradient-to-br from-gray-800/80 to-purple-900/30 rounded-xl p-4 sm:p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {room.poster_url && (
                        <img
                          src={room.poster_url || "/placeholder.svg"}
                          alt={room.movie_title || room.room_name}
                          className="w-full sm:w-32 h-48 sm:h-40 object-cover rounded-lg shadow-lg"
                          onError={(e) => {
                            console.error('[v0] Failed to load poster:', room.poster_url)
                            e.currentTarget.src = '/abstract-movie-poster.png'
                          }}
                        />
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                            {room.room_name}
                          </h3>
                          {room.is_open ? (
                            <span className="flex items-center gap-1 text-sm text-green-400">
                              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                              Ouvert
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-sm text-red-400">
                              <Lock className="w-4 h-4" />
                              Fermé
                            </span>
                          )}
                        </div>

                        {room.movie_title && (
                          <p className="text-white/90 font-semibold mb-2">{room.movie_title}</p>
                        )}

                        {room.start_time && (
                          <p className="text-white/70 text-sm mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Début: {new Date(room.start_time).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}

                        <p className="text-white/60 text-sm mb-3">
                          Capacité: {room.capacity}
                        </p>

                        <div className="flex items-center gap-2 mb-4">
                          {room.access_level === 'public' && (
                            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium border border-green-500/30">
                              Public
                            </span>
                          )}
                          {room.access_level === 'vip' && (
                            <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-medium border border-purple-500/30 flex items-center gap-1">
                              <Star className="w-3 h-3" /> VIP
                            </span>
                          )}
                          {room.access_level === 'vip_plus' && (
                            <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-medium border border-yellow-500/30 flex items-center gap-1">
                              <Crown className="w-3 h-3" /> VIP+
                            </span>
                          )}
                          {room.access_level === 'admin' && (
                            <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-medium border border-red-500/30 flex items-center gap-1">
                              <Shield className="w-3 h-3" /> Admin
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleEnterRoom(room)}
                          disabled={!room.is_open}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 sm:py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                        >
                          Entrer dans la Salle
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Map Menu */}
        {showMapMenu && (
          <div className="fixed inset-0 bg-black/98 backdrop-blur-xl z-[70] flex items-center justify-center p-4 overflow-y-auto pointer-events-auto">
            <div className="bg-gradient-to-br from-gray-900 via-blue-900/30 to-gray-900 rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-4xl border-2 border-blue-500/30 my-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  Carte du Monde
                </h2>
                <button
                  onClick={() => setShowMapMenu(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Cinema - Open */}
                <button
                  onClick={() => {
                    setShowCinema(true)
                    setShowMapMenu(false)
                  }}
                  className="bg-gradient-to-br from-purple-600/80 to-blue-600/80 rounded-xl p-4 sm:p-6 hover:scale-105 transition-transform border-2 border-white/20 text-left pointer-events-auto"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-4xl sm:text-6xl">🎬</div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">Cinéma</h3>
                    <div className="flex items-center gap-2 text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm sm:text-base font-semibold">Ouvert</span>
                    </div>
                  </div>
                </button>

                {/* Arcade - Closed */}
                <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl p-4 sm:p-6 border-2 border-white/10 cursor-not-allowed opacity-60">
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-4xl sm:text-6xl">🕹️</div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">Arcade</h3>
                    <div className="flex items-center gap-2 text-red-400">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm sm:text-base font-semibold">Fermé</span>
                    </div>
                  </div>
                </div>

                {/* Football Stadium - Closed */}
                <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl p-4 sm:p-6 border-2 border-white/10 cursor-not-allowed opacity-60">
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-4xl sm:text-6xl">⚽</div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">Stade de Foot</h3>
                    <div className="flex items-center gap-2 text-red-400">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm sm:text-base font-semibold">Fermé</span>
                    </div>
                  </div>
                </div>

                {/* Shopping Center - Closed */}
                <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl p-4 sm:p-6 border-2 border-white/10 cursor-not-allowed opacity-60">
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-4xl sm:text-6xl">🏬</div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">Centre Commercial</h3>
                    <div className="flex items-center gap-2 text-red-400">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm sm:text-base font-semibold">Fermé</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowMapMenu(false)}
                  className="bg-cyan-500 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-cyan-600 transition-colors font-medium text-sm sm:text-base pointer-events-auto"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Menu */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-lg z-[70] flex items-center justify-center p-4 pointer-events-auto">
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
                  <label className="text-white font-medium block mb-2">
                    Mode de Contrôle
                  </label>
                  <select
                    value={controlMode}
                    onChange={(e) => setControlMode(e.target.value as 'auto' | 'pc' | 'mobile')}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                  >
                    <option value="auto">Automatique</option>
                    <option value="pc">PC (Clavier)</option>
                    <option value="mobile">Mobile (Joystick)</option>
                  </select>
                </div>

                <div>
                  <label className="text-white font-medium block mb-2">
                    Qualité Graphique
                  </label>
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
                    className={`w-12 h-6 rounded-full transition-colors ${
                      povMode ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        povMode ? 'translate-x-6' : 'translate-x-1'
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

        {/* Emoji Menu */}
        {showEmojiMenu && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] pointer-events-auto">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full border-2 border-orange-500/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Smile className="w-6 h-6" />
                  Actions Rapides
                </h2>
                <button
                  onClick={() => setShowEmojiMenu(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {currentCinemaRoom && (
                  <div className="border-t border-white/20 pt-4 space-y-3">
                    <p className="text-white/70 text-sm font-medium">Actions Cinéma</p>
                    
                    {mySeat === null && (
                      <button
                        onClick={handleTakeSeat}
                        disabled={isSeatsLocked}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
                      >
                        <Play className="w-5 h-5" />
                        {isSeatsLocked ? 'Salle Complète' : "S'asseoir"}
                      </button>
                    )}

                    <button
                      onClick={handleExitRoom}
                      className="w-full bg-red-500/90 text-white py-3 rounded-lg hover:bg-red-600 transition-all font-medium flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      Sortir du Cinéma
                    </button>
                  </div>
                )}

                <div className="border-t border-white/20 pt-4 space-y-3">
                  <p className="text-white/70 text-sm font-medium">Émotes</p>
                  <div className="grid grid-cols-4 gap-2">
                    {['😊', '😂', '😍', '😎', '🤔', '😢', '😡', '🎉', '👍', '❤️', '🔥', '⭐'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          handleEmoji(emoji)
                          setShowEmojiMenu(false)
                        }}
                        className="text-3xl hover:scale-110 transition-transform bg-white/10 hover:bg-white/20 rounded-lg p-3"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/20 pt-4">
                  <button
                    onClick={() => {
                      handleJump()
                      setShowEmojiMenu(false)
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-lg hover:from-green-600 hover:to-teal-600 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <ArrowUp className="w-5 h-5" />
                    Sauter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Controls - Always visible if mobile mode */}
      {isMobileMode && (
        <>
          {worldSettings.enableChat && (
            <button
              onClick={() => setShowChatInput(true)}
              className="fixed top-28 left-1/2 transform -translate-x-1/2 z-[30] w-16 h-16 bg-green-500/90 backdrop-blur-sm rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform border-4 border-white/30 pointer-events-auto"
            >
              <MessageCircle className="w-8 h-8 text-white" />
            </button>
          )}

          <button
            onClick={() => setShowEmojiMenu(!showEmojiMenu)}
            className="fixed bottom-6 right-6 z-[30] w-20 h-20 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform border-4 border-white/30 pointer-events-auto"
          >
            <Smile className="w-10 h-10 text-white" />
          </button>
        </>
      )}

      {isMobileMode && (
        <MobileJoystick
          onMove={handleJoystickMove}
          onStop={handleJoystickStop}
          className="fixed bottom-6 left-6 z-[30]"
        />
      )}
    </div>
  )
}

function MobileJoystick({ onMove, onStop, className }: { onMove: (dx: number, dz: number) => void; onStop: () => void; className: string }) {
  const [isDragging, setIsDragging] = useState(false)
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const animate = () => {
      const maxDistance = 60
      if (isDragging) {
        onMove(joystickPosition.x / maxDistance, joystickPosition.y / maxDistance)
        animationRef.current = requestAnimationFrame(animate)
      } else {
        onMove(0, 0)
      }
    }

    if (isDragging) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      onStop()
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isDragging, joystickPosition.x, joystickPosition.y, onMove, onStop])

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

    setJoystickPosition({ x: dx, y: dy })
  }

  const handleEnd = () => {
    setIsDragging(false)
    setJoystickPosition({ x: 0, y: 0 })
  }

  return (
    <div
      ref={containerRef}
      className={`${className} w-36 h-36 bg-white/20 backdrop-blur-lg rounded-full z-50 md:hidden border-4 border-white/30`}
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
          transform: `translate(calc(-50% + ${joystickPosition.x}px), calc(-50% + ${joystickPosition.y}px))`
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-white/50 text-xs font-medium">
        Déplacer
      </div>
    </div>
  )
}
