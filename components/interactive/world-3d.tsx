'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sky, Html, PerspectiveCamera } from '@react-three/drei'
import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Maximize, Minimize, MessageSquare, Send, Settings, Crown, Shield, X, LogOut, User, Users, Palette, Menu, Eye, Play, Smile, EyeOff } from 'lucide-react'
import * as THREE from 'three'

interface WorldProps {
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
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.6, 0.9, 0.35]} />
        <meshStandardMaterial color={avatarStyle.bodyColor} metalness={0.1} roughness={0.8} />
      </mesh>
      
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial color={avatarStyle.skinTone || avatarStyle.headColor} metalness={0.1} roughness={0.6} />
      </mesh>
      
      {avatarStyle.hairStyle === 'short' && (
        <mesh position={[0, 1.4, 0]} castShadow>
          <sphereGeometry args={[0.34, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={avatarStyle.hairColor || '#3d2817'} metalness={0} roughness={1} />
        </mesh>
      )}
      {avatarStyle.hairStyle === 'long' && (
        <>
          <mesh position={[0, 1.4, 0]} castShadow>
            <sphereGeometry args={[0.36, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.5]} />
            <meshStandardMaterial color={avatarStyle.hairColor || '#3d2817'} metalness={0} roughness={1} />
          </mesh>
          <mesh position={[0, 0.95, -0.3]} castShadow>
            <boxGeometry args={[0.5, 0.6, 0.2]} />
            <meshStandardMaterial color={avatarStyle.hairColor || '#3d2817'} metalness={0} roughness={1} />
          </mesh>
        </>
      )}
      
      {avatarStyle.accessory === 'glasses' && (
        <>
          <mesh position={[-0.15, 1.2, 0.28]}>
            <torusGeometry args={[0.08, 0.02, 8, 16]} />
            <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.15, 1.2, 0.28]}>
            <torusGeometry args={[0.08, 0.02, 8, 16]} />
            <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 1.2, 0.28]}>
            <boxGeometry args={[0.12, 0.02, 0.02]} />
            <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.2} />
          </mesh>
        </>
      )}
      {avatarStyle.accessory === 'hat' && (
        <>
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.15, 16]} />
            <meshStandardMaterial color="#ef4444" metalness={0.2} roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.6, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.35, 0.2, 16]} />
            <meshStandardMaterial color="#ef4444" metalness={0.2} roughness={0.8} />
          </mesh>
        </>
      )}
      
      <group position={[-0.45, 0.5, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.2, 0.7, 0.2]} />
          <meshStandardMaterial color={avatarStyle.bodyColor} metalness={0.1} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.6, 0]}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color={avatarStyle.skinTone || avatarStyle.headColor} metalness={0.1} roughness={0.6} />
        </mesh>
      </group>
      
      <group position={[0.45, 0.5, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.2, 0.7, 0.2]} />
          <meshStandardMaterial color={avatarStyle.bodyColor} metalness={0.1} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.6, 0]}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color={avatarStyle.skinTone || avatarStyle.headColor} metalness={0.1} roughness={0.6} />
        </mesh>
      </group>
      
      {/* Legs - unchanged */}
      <group position={[-0.2, 0.35, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.22, 0.7, 0.22]} />
          <meshStandardMaterial color="#2563eb" metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.7, 0.1]}>
          <boxGeometry args={[0.24, 0.16, 0.32]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.1} roughness={0.9} />
        </mesh>
      </group>
      
      <group position={[0.2, 0.35, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.22, 0.7, 0.22]} />
          <meshStandardMaterial color="#2563eb" metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.7, 0.1]}>
          <boxGeometry args={[0.24, 0.16, 0.32]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.1} roughness={0.9} />
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

export default function InteractiveWorld({ userId, userProfile }: WorldProps) {
  const [otherPlayers, setOtherPlayers] = useState<any[]>([])
  const [onlineCount, setOnlineCount] = useState(0)
  const [myPosition, setMyPosition] = useState({ x: 0, y: 0.5, z: 0 })
  const [myAvatarStyle, setMyAvatarStyle] = useState({
    bodyColor: '#3b82f6',
    headColor: '#fbbf24',
    hairStyle: 'short',
    hairColor: '#1f2937',
    skinTone: '#fbbf24',
    accessory: 'none'
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
  
  const [graphicsQuality, setGraphicsQuality] = useState('medium')
  const [isMobileMode, setIsMobileMode] = useState(false)
  
  const keysPressed = useRef<Set<string>>(new Set())
  const supabase = createClient()

  const [showMenu, setShowMenu] = useState(false)
  const [povMode, setPovMode] = useState(false)
  const [showMovieFullscreen, setShowMovieFullscreen] = useState(false)
  const [showChatInput, setShowChatInput] = useState(false)

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
    if (!currentCinemaRoom || !currentCinemaRoom.schedule_start) return

    const checkSeatsLock = () => {
      const now = new Date()
      const startTime = new Date(currentCinemaRoom.schedule_start)
      const fiveMinutesBeforeStart = new Date(startTime.getTime() - 5 * 60 * 1000)

      if (now >= fiveMinutesBeforeStart && now < startTime) {
        setIsSeatsLocked(true)
      } else if (now >= startTime) {
        setIsSeatsLocked(true)
      } else {
        setIsSeatsLocked(false)
      }
    }

    checkSeatsLock()
    const interval = setInterval(checkSeatsLock, 10000)

    return () => clearInterval(interval)
  }, [currentCinemaRoom])
  
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
      if (isSeatsLocked && mySeat !== null) return
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
  }, [isSeatsLocked, mySeat])
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (isSeatsLocked && mySeat !== null) return
      
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
          const newPos = {
            x: Math.max(-20, Math.min(20, prev.x + dx)),
            y: 0.5,
            z: Math.max(-20, Math.min(20, prev.z + dz))
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
  }, [userId, isSeatsLocked, mySeat])

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
    setCurrentEmoji(emoji)
    setShowQuickActions(false)
    setTimeout(() => setCurrentEmoji(null), 3000)
  }

  const handleJump = () => {
    if (!isJumping) {
      setIsJumping(true)
      setTimeout(() => setIsJumping(false), 600)
    }
  }

  const sendMessage = async () => {
    if (!chatInput.trim()) return
    
    await supabase.from('interactive_chat_messages').insert({
      user_id: userId,
      username: userProfile?.username || 'Anonyme',
      message: chatInput.trim(),
      room: currentCinemaRoom ? `cinema_${currentCinemaRoom.id}` : 'world'
    })
    
    setChatInput('')
  }

  const handleJoystickMove = useCallback((dx: number, dz: number) => {
    if (isSeatsLocked && mySeat !== null) return
    
    setMyPosition(prev => {
      const speed = 0.15
      const newPos = {
        x: Math.max(-20, Math.min(20, prev.x + dx * speed)),
        y: 0.5,
        z: Math.max(-20, Math.min(20, prev.z + dz * speed)) // Fixed: removed negative sign
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
    
    if (dx !== 0 || dz !== 0) {
      setMovement({ x: dx, z: dz })
    } else {
      setMovement({ x: 0, z: 0 })
    }
  }, [userId, supabase, isSeatsLocked, mySeat])

  const handleEnterRoom = async (room: any) => {
    setCurrentCinemaRoom(room)
    setShowCinema(false)

    setMyPosition({ x: 0, y: 0.5, z: -5 })

    await supabase
      .from('interactive_profiles')
      .update({
        current_room: `cinema_${room.id}`,
        position_x: 0,
        position_y: 0.5,
        position_z: -5
      })
      .eq('user_id', userId)
  }

  const handleLeaveRoom = async () => {
    if (mySeat) {
      await supabase
        .from('interactive_cinema_seats')
        .delete()
        .eq('room_id', currentCinemaRoom.id)
        .eq('user_id', userId)
      setMySeat(null)
    }

    setCurrentCinemaRoom(null)
    setIsSeatsLocked(false)

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
  }

  const handleSitInSeat = async (seatNumber: number) => {
    if (isSeatsLocked && mySeat !== null && mySeat !== seatNumber) {
      return
    }

    if (mySeat === seatNumber) {
      // Stand up
      await supabase
        .from('interactive_cinema_seats')
        .delete()
        .eq('room_id', currentCinemaRoom.id)
        .eq('user_id', userId)
      
      setMySeat(null)
      setMyPosition({ x: 0, y: 0.5, z: 5 })
    } else {
      // Sit down - Calculate position based on seat number
      const row = Math.floor(seatNumber / 10)
      const col = seatNumber % 10
      const seatX = (col - 4.5) * 2
      const seatZ = row * 2 + 5

      const { error } = await supabase
        .from('interactive_cinema_seats')
        .upsert({
          room_id: currentCinemaRoom.id,
          user_id: userId,
          seat_number: seatNumber,
          row_number: row,
          is_occupied: true
        })

      if (!error) {
        setMySeat(seatNumber)
        setMyPosition({ x: seatX, y: 0.5, z: seatZ })
        
        await supabase
          .from('interactive_profiles')
          .update({
            position_x: seatX,
            position_y: 0.5,
            position_z: seatZ
          })
          .eq('user_id', userId)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black">
      <Canvas
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
            position={[myPosition.x, myPosition.y + 1.6, myPosition.z + 0.5]}
            fov={75}
          />
        )}

        <Sky 
          sunPosition={[100, 20, 100]} 
          inclination={0.6}
          azimuth={0.25}
        />
        <fog attach="fog" args={['#87CEEB', 10, 50]} />
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={1.5} 
          castShadow
          shadow-mapSize={graphicsQuality === 'high' ? [2048, 2048] : [1024, 1024]}
        />
        <hemisphereLight intensity={0.3} groundColor="#6b7280" />
        
        {!currentCinemaRoom ? (
          <>
            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[60, 60]} />
              <meshStandardMaterial 
                color="#4ade80" 
                roughness={0.95}
                metalness={0}
              />
            </mesh>
            
            {/* Path */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
              <planeGeometry args={[3, 40]} />
              <meshStandardMaterial color="#8b7355" roughness={1} metalness={0} />
            </mesh>
            
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
              
              <Html position={[0, 7, 0]} center>
                <button
                  onClick={() => setShowCinema(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 whitespace-nowrap shadow-2xl font-bold flex items-center gap-2 transform hover:scale-105 transition-transform"
                >
                  🎬 Entrer au Cinéma
                </button>
              </Html>
            </group>
            
            {(graphicsQuality === 'low' 
              ? [[-15, -15], [15, -15]] 
              : [[-15, -15], [-8, -18], [8, -18], [15, -15], [-18, 10], [18, 10], [-10, 15], [10, 15]]
            ).map(([x, z], i) => (
              <RealisticTree key={`tree-${i}`} position={[x, 0, z]} />
            ))}
            
            {(graphicsQuality === 'low' 
              ? [[0, -10]] 
              : [[-10, -10], [0, -10], [10, -10], [-10, 10], [10, 10]]
            ).map((z, i) => (
              <RealisticLamppost key={`lamp-${i}`} position={[-20, 0, z[1]]} />
            ))}
            
            {graphicsQuality !== 'low' && [-12, 0, 12].map((z) => (
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

            {graphicsQuality !== 'low' && (
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
                  <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.3} transparent opacity={0.7} />
                </mesh>
                <pointLight position={[0, 2, 0]} intensity={1} distance={8} color="#60a5fa" />
              </group>
            )}

            {graphicsQuality !== 'low' && [
              [5, -10], [-5, -10], [10, 5], [-10, 5], [12, -5], [-12, -5]
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
        ) : (
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

            <group position={[0, 3, -19]}>
              <mesh>
                <planeGeometry args={[20, 10]} />
                <meshStandardMaterial color="#111111" />
              </mesh>
              
              {currentCinemaRoom.embed_url && mySeat !== null && (
                <Html
                  transform
                  occlude
                  position={[0, 0, 0.1]}
                  style={{
                    width: '2000px',
                    height: '1000px',
                    pointerEvents: 'auto'
                  }}
                >
                  <iframe
                    src={currentCinemaRoom.embed_url}
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </Html>
              )}
            </group>

            {/* Seats */}
            {Array.from({ length: Math.min(currentCinemaRoom.capacity || 30, 60) }).map((_, i) => {
              const row = Math.floor(i / 10)
              const col = i % 10
              const seatX = (col - 4.5) * 2
              const seatZ = row * 2 + 5
              const isOccupied = cinemaSeats.some(s => s.seat_number === i)
              const isMySeat = mySeat === i

              return (
                <group key={`seat-${i}`} position={[seatX, 0, seatZ]}>
                  <mesh position={[0, 0.3, 0]}>
                    <boxGeometry args={[0.8, 0.6, 0.8]} />
                    <meshStandardMaterial color={isMySeat ? '#22c55e' : isOccupied ? '#ef4444' : '#374151'} />
                  </mesh>
                  <mesh position={[0, 0.8, -0.3]}>
                    <boxGeometry args={[0.8, 0.8, 0.2]} />
                    <meshStandardMaterial color={isMySeat ? '#22c55e' : isOccupied ? '#ef4444' : '#374151'} />
                  </mesh>
                  {!isOccupied || isMySeat ? (
                    <Html position={[0, 1.2, 0]} center>
                      <button
                        onClick={() => handleSitInSeat(i)}
                        disabled={isSeatsLocked && mySeat !== null && mySeat !== i}
                        className={`text-xs px-2 py-1 rounded ${
                          isSeatsLocked && mySeat !== i
                            ? 'bg-gray-500 cursor-not-allowed' 
                            : isMySeat 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-blue-500 hover:bg-blue-600'
                        } text-white whitespace-nowrap`}
                      >
                        {isSeatsLocked && mySeat !== i ? '🔒 Bloqué' : isMySeat ? '🚶 Se lever' : '💺 S\'asseoir'}
                      </button>
                    </Html>
                  ) : null}
                </group>
              )
            })}

            {isSeatsLocked && (
              <Html position={[0, 5, -5]} center>
                <div className="bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-lg text-center">
                  <div className="font-bold text-lg">🔒 Début imminent!</div>
                  <div className="text-sm">Les places sont verrouillées</div>
                </div>
              </Html>
            )}

            <Html position={[0, 2, 19]} center>
              <button
                onClick={handleLeaveRoom}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 whitespace-nowrap shadow-lg flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Sortir du Cinéma
              </button>
            </Html>
          </>
        )}

        <RealisticAvatar 
          position={[myPosition.x, myPosition.y + (isJumping ? 1 : 0), myPosition.z]}
          avatarStyle={myAvatarStyle}
          isMoving={movement.x !== 0 || movement.z !== 0}
        />
        
        <group position={[myPosition.x, myPosition.y, myPosition.z]}>
          {userProfile?.is_admin && (
            <Html position={[0, 2.2, 0]} center>
              <div className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1 whitespace-nowrap shadow-lg">
                <Shield className="w-3 h-3" />
                Admin
              </div>
            </Html>
          )}
          {userProfile?.is_vip_plus && !userProfile?.is_admin && (
            <Html position={[0, 2.2, 0]} center>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1 whitespace-nowrap shadow-lg">
                <Crown className="w-3 h-3" />
                VIP+
              </div>
            </Html>
          )}
          {userProfile?.is_vip && !userProfile?.is_vip_plus && !userProfile?.is_admin && (
            <Html position={[0, 2.2, 0]} center>
              <div className="bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1 whitespace-nowrap shadow-lg">
                <Crown className="w-3 h-3" />
                VIP
              </div>
            </Html>
          )}

          {currentEmoji && (
            <Html position={[0, 3, 0]} center>
              <div className="text-5xl animate-bounce">
                {currentEmoji}
              </div>
            </Html>
          )}

          {playerChatBubbles[userId] && (
            <Html position={[0, 2.8, 0]} center>
              <div className="bg-white/95 text-black px-3 py-2 rounded-lg shadow-xl max-w-xs text-sm border-2 border-blue-500">
                {playerChatBubbles[userId].message}
              </div>
            </Html>
          )}
        </group>
        
        {otherPlayers
          .filter(p => !currentCinemaRoom || p.current_room === `cinema_${currentCinemaRoom.id}`)
          .map((player) => {
            const playerProfile = player.user_profiles
            const avatarStyle = player.avatar_style || { bodyColor: '#ef4444', headColor: '#fbbf24' }
            
            return (
              <group key={player.user_id}>
                <RealisticAvatar 
                  position={[player.position_x || 0, 0.5, player.position_z || 0]}
                  avatarStyle={avatarStyle}
                  isMoving={false}
                />
                
                <Html position={[player.position_x || 0, 2.7, player.position_z || 0]} center>
                  <div className="flex flex-col items-center gap-1">
                    {playerProfile?.is_admin && (
                      <div className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1 whitespace-nowrap shadow-lg">
                        <Shield className="w-3 h-3" />
                        Admin
                      </div>
                    )}
                    {playerProfile?.is_vip_plus && !playerProfile?.is_admin && (
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1 whitespace-nowrap shadow-lg">
                        <Crown className="w-3 h-3" />
                        VIP+
                      </div>
                    )}
                    {playerProfile?.is_vip && !playerProfile?.is_vip_plus && !playerProfile?.is_admin && (
                      <div className="bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1 whitespace-nowrap shadow-lg">
                        <Crown className="w-3 h-3" />
                        VIP
                      </div>
                    )}
                    <div className="bg-black/80 text-white px-2 py-0.5 rounded text-xs whitespace-nowrap shadow-lg">
                      {player.username || playerProfile?.username || 'Joueur'}
                    </div>
                  </div>
                </Html>

                {playerChatBubbles[player.user_id] && (
                  <Html position={[player.position_x || 0, 3.3, player.position_z || 0]} center>
                    <div className="bg-white/95 text-black px-3 py-2 rounded-lg shadow-xl max-w-xs text-sm border-2 border-green-500">
                      {playerChatBubbles[player.user_id].message}
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
      
      {!isFullscreen && (
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="bg-white/20 backdrop-blur-lg text-white p-3 rounded-lg hover:bg-white/30 transition-colors shadow-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {showMenu && (
            <div className="absolute top-14 left-0 mt-2 bg-black/90 backdrop-blur-lg rounded-lg p-4 w-72 space-y-3 shadow-2xl border border-white/20">
              <div className="text-white mb-3 pb-3 border-b border-white/20">
                <div className="font-bold text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {userProfile?.username || 'Joueur'}
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
                className="w-full bg-blue-500/80 text-white py-2.5 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 text-sm"
              >
                <Settings className="w-4 h-4" />
                Paramètres
              </button>
              
              <button
                onClick={() => {
                  setShowAvatarCustomizer(true)
                  setShowMenu(false)
                }}
                className="w-full bg-purple-500/80 text-white py-2.5 rounded-lg hover:bg-purple-600 flex items-center justify-center gap-2 text-sm"
              >
                <Palette className="w-4 h-4" />
                Avatar
              </button>

              <button
                onClick={() => {
                  setShowChat(true)
                  setShowMenu(false)
                }}
                className="w-full bg-green-500/80 text-white py-2.5 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                Chat
              </button>
            </div>
          )}
        </div>
      )}
      
      {!isFullscreen && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setShowChatInput(!showChatInput)}
            className="bg-white/20 backdrop-blur-lg text-white p-2 rounded-lg hover:bg-white/30 transition-colors"
            title="Écrire un message"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleFullscreen}
            className="bg-white/20 backdrop-blur-lg text-white p-2 rounded-lg hover:bg-white/30 transition-colors"
            title="Mode Immersif"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      )}

      {showChatInput && !isFullscreen && (
        <div className="absolute top-20 right-4 w-80 bg-black/80 backdrop-blur-lg rounded-lg z-10 p-4">
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
      
      {showChat && !isFullscreen && (
        <div className="absolute top-20 right-4 w-80 h-96 bg-black/70 backdrop-blur-lg rounded-lg z-10 flex flex-col p-4">
          <h3 className="text-white font-bold mb-2">
            {currentCinemaRoom ? `Chat - Salle ${currentCinemaRoom.room_number}` : 'Chat Global'}
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-2 mb-3">
            {(currentCinemaRoom ? roomMessages : messages).map((msg, i) => (
              <div key={i} className="bg-white/10 rounded p-2 text-sm">
                <div className="text-blue-400 font-semibold">{msg.username || 'Anonyme'}</div>
                <div className="text-white">{msg.message}</div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Votre message..."
              className="flex-1 bg-white/10 text-white px-3 py-2 rounded-lg outline-none"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      {showSettings && !isFullscreen && (
        <div className="absolute top-20 left-4 w-80 bg-black/80 backdrop-blur-lg rounded-lg z-10 flex flex-col p-4 max-h-[500px] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold">Paramètres</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm mb-2 block">Qualité Graphique</label>
              <select
                value={graphicsQuality}
                onChange={(e) => setGraphicsQuality(e.target.value)}
                className="w-full bg-white/10 text-white px-3 py-2 rounded-lg outline-none"
              >
                <option value="low" className="bg-black">Basse (Performance)</option>
                <option value="medium" className="bg-black">Moyenne (Équilibre)</option>
                <option value="high" className="bg-black">Haute (Qualité)</option>
              </select>
              <p className="text-white/50 text-xs mt-1">
                Basse qualité: Moins d'éléments 3D, meilleure performance
              </p>
            </div>
            
            <div>
              <label className="text-white text-sm mb-2 block">Mode d'affichage</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsMobileMode(false)}
                  className={`flex-1 py-2 rounded-lg ${
                    !isMobileMode ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60'
                  }`}
                >
                  PC
                </button>
                <button
                  onClick={() => setIsMobileMode(true)}
                  className={`flex-1 py-2 rounded-lg ${
                    isMobileMode ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60'
                  }`}
                >
                  Mobile
                </button>
              </div>
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">Mode Caméra</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPovMode(false)}
                  className={`flex-1 py-2 rounded-lg ${
                    !povMode ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60'
                  }`}
                >
                  <Eye className="w-4 h-4 inline mr-1" />
                  Vue Extérieure
                </button>
                <button
                  onClick={() => setPovMode(true)}
                  className={`flex-1 py-2 rounded-lg ${
                    povMode ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60'
                  }`}
                >
                  <Eye className="w-4 h-4 inline mr-1" />
                  POV
                </button>
              </div>
              <p className="text-white/50 text-xs mt-1">
                POV: Vue à la première personne
              </p>
            </div>
            
            <div className="pt-4 border-t border-white/20">
              <p className="text-white/60 text-xs">
                Ces paramètres permettent d'optimiser l'expérience selon votre appareil.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {showAvatarCustomizer && !isFullscreen && (
        <div className="absolute top-20 left-4 w-80 bg-black/80 backdrop-blur-lg rounded-lg z-10 flex flex-col p-4 max-h-[500px] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold">Personnaliser Avatar</h3>
            <button
              onClick={() => setShowAvatarCustomizer(false)}
              className="text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {['body_color', 'skin_tone', 'hair_style', 'hair_color', 'accessory'].map((category) => {
              const options = customizationOptions.filter(opt => opt.category === category)
              if (options.length === 0) return null
              
              const availableOptions = options.filter(opt => {
                if (!opt.is_premium) return true
                if (userProfile?.is_admin) return true
                if (userProfile?.is_vip_plus && opt.label?.includes('VIP+')) return true
                if (userProfile?.is_vip && opt.label?.includes('VIP') && !opt.label?.includes('VIP+')) return true
                return false
              })
              
              return (
                <div key={category}>
                  <label className="text-white text-sm mb-2 block capitalize">{category.replace('_', ' ')}</label>
                  <div className="grid grid-cols-5 gap-2">
                    {availableOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => {
                          const key = category === 'body_color' ? 'bodyColor' :
                                      category === 'skin_tone' ? 'skinTone' :
                                      category === 'hair_style' ? 'hairStyle' :
                                      category === 'hair_color' ? 'hairColor' :
                                      'accessory'
                          saveAvatarStyle({ ...myAvatarStyle, [key]: option.value })
                        }}
                        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xs ${
                          myAvatarStyle[category === 'body_color' ? 'bodyColor' : 
                                       category === 'skin_tone' ? 'skinTone' : 
                                       category === 'hair_style' ? 'hairStyle' : 
                                       category === 'hair_color' ? 'hairColor' : 'accessory'] === option.value
                            ? 'border-white' 
                            : 'border-transparent'
                        }`}
                        style={category.includes('color') || category === 'skin_tone' ? { backgroundColor: option.value } : {}}
                        title={`${option.label}${opt.is_premium ? ' (Premium)' : ''}`}
                      >
                        {!category.includes('color') && !category.includes('skin') && option.label?.slice(0, 3)}
                        {option.is_premium && <Crown className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
            
            <div className="pt-4 border-t border-white/20">
              <p className="text-white/60 text-xs">
                Options avec couronne: réservées VIP/VIP+/Admin
              </p>
            </div>
          </div>
        </div>
      )}

      {showCinema && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-lg z-30 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-blue-900 to-purple-900 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Salles de Cinéma</h2>
              <button
                onClick={() => setShowCinema(false)}
                className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cinemaRooms.length === 0 ? (
                <div className="col-span-2 text-center text-white/60 py-12">
                  Aucune salle disponible pour le moment
                </div>
              ) : (
                cinemaRooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-white/10 backdrop-blur rounded-lg p-4 hover:bg-white/20 transition-all"
                  >
                    {room.movie_poster && (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${room.movie_poster}`}
                        alt={room.movie_title}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3 className="text-white font-bold text-lg mb-1">
                      Salle {room.room_number} - {room.name}
                    </h3>
                    <p className="text-white/80 text-sm mb-2">{room.movie_title}</p>
                    <div className="flex items-center justify-between text-xs text-white/60 mb-3">
                      <span>Capacité: {room.capacity}</span>
                      <span className={`px-2 py-1 rounded ${
                        room.access_level === 'vip' ? 'bg-yellow-500' :
                        room.access_level === 'vip_plus' ? 'bg-purple-500' :
                        'bg-green-500'
                      }`}>
                        {room.access_level === 'vip' ? 'VIP' :
                         room.access_level === 'vip_plus' ? 'VIP+' :
                         'Public'}
                      </span>
                    </div>
                    {room.schedule_start && (
                      <p className="text-white/60 text-xs mb-3">
                        Séance: {new Date(room.schedule_start).toLocaleString('fr-FR')}
                      </p>
                    )}
                    <button
                      onClick={() => handleEnterRoom(room)}
                      className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Entrer dans la Salle
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 z-10 bg-black/50 backdrop-blur-lg text-white p-3 rounded-lg text-sm hidden md:block">
        <div>Contrôles: WASD ou Flèches</div>
        <div>Souris: Rotation caméra</div>
      </div>
      
      {(!isFullscreen || isMobileMode) && <MobileJoystick onMove={handleJoystickMove} />}

      {!isFullscreen && !showMenu && (
        <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="bg-yellow-500 text-white p-3 rounded-full hover:bg-yellow-600 transition-colors shadow-lg"
            title="Actions Rapides"
          >
            <Smile className="w-6 h-6" />
          </button>

          {showQuickActions && (
            <div className="bg-black/80 backdrop-blur-lg rounded-lg p-3 mb-2 grid grid-cols-3 gap-2">
              <button
                onClick={() => handleEmoji('😊')}
                className="text-3xl hover:scale-125 transition-transform bg-white/10 rounded-lg p-2"
              >
                😊
              </button>
              <button
                onClick={() => handleEmoji('😢')}
                className="text-3xl hover:scale-125 transition-transform bg-white/10 rounded-lg p-2"
              >
                😢
              </button>
              <button
                onClick={() => handleEmoji('😡')}
                className="text-3xl hover:scale-125 transition-transform bg-white/10 rounded-lg p-2"
              >
                😡
              </button>
              <button
                onClick={() => handleEmoji('👍')}
                className="text-3xl hover:scale-125 transition-transform bg-white/10 rounded-lg p-2"
              >
                👍
              </button>
              <button
                onClick={() => handleEmoji('❤️')}
                className="text-3xl hover:scale-125 transition-transform bg-white/10 rounded-lg p-2"
              >
                ❤️
              </button>
              <button
                onClick={handleJump}
                className="text-2xl hover:scale-125 transition-transform bg-green-500 rounded-lg p-2 font-bold text-white"
              >
                🦘
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Existing UI code... */}
      
      {showAvatarCustomizer && !isFullscreen && (
        <div className="absolute top-20 left-4 w-80 bg-black/80 backdrop-blur-lg rounded-lg z-10 flex flex-col p-4 max-h-[500px] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold">Personnaliser Avatar</h3>
            <button
              onClick={() => setShowAvatarCustomizer(false)}
              className="text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {['body_color', 'skin_tone', 'hair_style', 'hair_color', 'accessory'].map((category) => {
              const options = customizationOptions.filter(opt => opt.category === category)
              if (options.length === 0) return null
              
              const availableOptions = options.filter(opt => {
                if (!opt.is_premium) return true
                if (userProfile?.is_admin) return true
                if (userProfile?.is_vip_plus && opt.label?.includes('VIP+')) return true
                if (userProfile?.is_vip && opt.label?.includes('VIP') && !opt.label?.includes('VIP+')) return true
                return false
              })
              
              return (
                <div key={category}>
                  <label className="text-white text-sm mb-2 block capitalize">{category.replace('_', ' ')}</label>
                  <div className="grid grid-cols-5 gap-2">
                    {availableOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => {
                          const key = category === 'body_color' ? 'bodyColor' :
                                      category === 'skin_tone' ? 'skinTone' :
                                      category === 'hair_style' ? 'hairStyle' :
                                      category === 'hair_color' ? 'hairColor' :
                                      'accessory'
                          saveAvatarStyle({ ...myAvatarStyle, [key]: option.value })
                        }}
                        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xs ${
                          myAvatarStyle[category === 'body_color' ? 'bodyColor' : 
                                       category === 'skin_tone' ? 'skinTone' : 
                                       category === 'hair_style' ? 'hairStyle' : 
                                       category === 'hair_color' ? 'hairColor' : 'accessory'] === option.value
                            ? 'border-white' 
                            : 'border-transparent'
                        }`}
                        style={category.includes('color') || category === 'skin_tone' ? { backgroundColor: option.value } : {}}
                        title={`${option.label}${opt.is_premium ? ' (Premium)' : ''}`}
                      >
                        {!category.includes('color') && !category.includes('skin') && option.label?.slice(0, 3)}
                        {option.is_premium && <Crown className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
            
            <div className="pt-4 border-t border-white/20">
              <p className="text-white/60 text-xs">
                Options avec couronne: réservées VIP/VIP+/Admin
              </p>
            </div>
          </div>
        </div>
      )}

      {showCinema && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-lg z-30 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-blue-900 to-purple-900 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Salles de Cinéma</h2>
              <button
                onClick={() => setShowCinema(false)}
                className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cinemaRooms.length === 0 ? (
                <div className="col-span-2 text-center text-white/60 py-12">
                  Aucune salle disponible pour le moment
                </div>
              ) : (
                cinemaRooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-white/10 backdrop-blur rounded-lg p-4 hover:bg-white/20 transition-all"
                  >
                    {room.movie_poster && (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${room.movie_poster}`}
                        alt={room.movie_title}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3 className="text-white font-bold text-lg mb-1">
                      Salle {room.room_number} - {room.name}
                    </h3>
                    <p className="text-white/80 text-sm mb-2">{room.movie_title}</p>
                    <div className="flex items-center justify-between text-xs text-white/60 mb-3">
                      <span>Capacité: {room.capacity}</span>
                      <span className={`px-2 py-1 rounded ${
                        room.access_level === 'vip' ? 'bg-yellow-500' :
                        room.access_level === 'vip_plus' ? 'bg-purple-500' :
                        'bg-green-500'
                      }`}>
                        {room.access_level === 'vip' ? 'VIP' :
                         room.access_level === 'vip_plus' ? 'VIP+' :
                         'Public'}
                      </span>
                    </div>
                    {room.schedule_start && (
                      <p className="text-white/60 text-xs mb-3">
                        Séance: {new Date(room.schedule_start).toLocaleString('fr-FR')}
                      </p>
                    )}
                    <button
                      onClick={() => handleEnterRoom(room)}
                      className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Entrer dans la Salle
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 z-10 bg-black/50 backdrop-blur-lg text-white p-3 rounded-lg text-sm hidden md:block">
        <div>Contrôles: WASD ou Flèches</div>
        <div>Souris: Rotation caméra</div>
      </div>
      
      {(!isFullscreen || isMobileMode) && <MobileJoystick onMove={handleJoystickMove} />}
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
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-white/50 text-xs font-medium">
        Déplacer
      </div>
    </div>
  )
}
