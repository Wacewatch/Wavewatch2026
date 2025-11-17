"use client"

import { useEffect, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { PerspectiveCamera } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Maximize2, MessageCircle, Send } from 'lucide-react'
import { createClient } from "@/lib/supabase/client"
import * as THREE from "three"

interface SimpleWorldProps {
  profile: any
}

function Player({ position, color, username, isCurrentUser }: any) {
  return (
    <group position={position}>
      {/* Avatar cube */}
      <mesh castShadow>
        <boxGeometry args={[0.8, 1.8, 0.8]} />
        <meshStandardMaterial color={isCurrentUser ? "#4a9eff" : color} />
      </mesh>
      {/* Username label */}
      {username && (
        <mesh position={[0, 2.2, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}
    </group>
  )
}

function Joystick({ onMove }: { onMove: (x: number, z: number) => void }) {
  const [dragging, setDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!dragging || !containerRef.current) return
      e.preventDefault()
      
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const touch = e.touches[0]
      const deltaX = (touch.clientX - centerX) / 50
      const deltaY = (touch.clientY - centerY) / 50
      
      const clampedX = Math.max(-1, Math.min(1, deltaX))
      const clampedY = Math.max(-1, Math.min(1, deltaY))
      
      setPosition({ x: clampedX * 50, y: clampedY * 50 })
      onMove(clampedX, -clampedY)
    }

    const handleTouchEnd = () => {
      setDragging(false)
      setPosition({ x: 0, y: 0 })
      onMove(0, 0)
    }

    if (dragging) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [dragging, onMove])

  return (
    <div className="md:hidden absolute bottom-24 left-4">
      <div
        ref={containerRef}
        className="relative w-32 h-32 bg-black/50 rounded-full border-2 border-white/30"
        onTouchStart={() => setDragging(true)}
      >
        <div
          className="absolute w-12 h-12 bg-white/80 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform"
          style={{
            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`
          }}
        />
      </div>
      <p className="text-white text-xs text-center mt-2">Déplacement</p>
    </div>
  )
}

function Scene({ profile, otherPlayers, onPositionUpdate }: any) {
  const playerRef = useRef<THREE.Group>(null)
  const [movement, setMovement] = useState({ x: 0, z: 0 })
  const keysPressed = useRef<Set<string>>(new Set())

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

  useFrame(() => {
    let x = 0
    let z = 0

    if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) z -= 1
    if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) z += 1
    if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) x -= 1
    if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) x += 1

    // Mobile joystick movement
    if (movement.x !== 0 || movement.z !== 0) {
      x = movement.x
      z = movement.z
    }

    if (playerRef.current && (x !== 0 || z !== 0)) {
      const speed = 0.1
      playerRef.current.position.x += x * speed
      playerRef.current.position.z += z * speed

      // Limiter aux bordures
      playerRef.current.position.x = Math.max(-20, Math.min(20, playerRef.current.position.x))
      playerRef.current.position.z = Math.max(-20, Math.min(20, playerRef.current.position.z))

      // Update position in database
      onPositionUpdate(playerRef.current.position.x, playerRef.current.position.z)
    }
  })

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 15, 20]} />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#2a4858" />
      </mesh>

      {/* Current player */}
      <group ref={playerRef} position={[0, 0, 0]}>
        <Player 
          position={[0, 1, 0]} 
          color="#4a9eff" 
          username={profile.username}
          isCurrentUser={true}
        />
      </group>

      {otherPlayers.map((player: any) => (
        <Player
          key={player.id}
          position={[player.position_x || 0, 1, player.position_z || 0]}
          color="#ff6b6b"
          username={player.username}
          isCurrentUser={false}
        />
      ))}

      {/* Quelques cubes décoratifs */}
      <mesh position={[-5, 0.5, -5]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      
      <mesh position={[5, 0.5, -5]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#888" />
      </mesh>
    </>
  )
}

export function SimpleWorld({ profile }: SimpleWorldProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [otherPlayers, setOtherPlayers] = useState<any[]>([])
  const [showChat, setShowChat] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [movement, setMovement] = useState({ x: 0, z: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const lastUpdateRef = useRef<number>(0)

  useEffect(() => {
    const loadPlayers = async () => {
      const { data } = await supabase
        .from('interactive_profiles')
        .select('*')
        .neq('id', profile.id)
        .limit(20)
      
      if (data) setOtherPlayers(data)
    }

    loadPlayers()

    // Subscribe to player position changes
    const channel = supabase
      .channel('world-positions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'interactive_profiles',
        filter: `id=neq.${profile.id}`
      }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setOtherPlayers(prev => {
            const index = prev.findIndex(p => p.id === payload.new.id)
            if (index >= 0) {
              const updated = [...prev]
              updated[index] = payload.new
              return updated
            }
            return [...prev, payload.new]
          })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile.id])

  const updatePosition = async (x: number, z: number) => {
    const now = Date.now()
    if (now - lastUpdateRef.current < 100) return // Throttle to 10Hz
    lastUpdateRef.current = now

    await supabase
      .from('interactive_profiles')
      .update({ 
        position_x: x, 
        position_z: z,
        last_active: new Date().toISOString()
      })
      .eq('id', profile.id)
  }

  const sendMessage = async () => {
    if (!chatMessage.trim()) return

    await supabase
      .from('interactive_chat_messages')
      .insert({
        user_id: profile.user_id,
        username: profile.username,
        message: chatMessage.trim()
      })

    setChatMessage("")
  }

  useEffect(() => {
    const loadMessages = async () => {
      const { data } = await supabase
        .from('interactive_chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (data) setChatMessages(data.reverse())
    }

    loadMessages()

    const channel = supabase
      .channel('world-chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'interactive_chat_messages'
      }, (payload) => {
        setChatMessages(prev => [...prev, payload.new].slice(-50))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">WaveWatch World</h1>
            <p className="text-gray-400 text-sm">
              Bienvenue, {profile.username} | {otherPlayers.length} joueur(s) en ligne
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setShowChat(!showChat)}
              variant="outline"
              size="icon"
              className="bg-black/50 border-gray-700 hover:bg-black/70"
            >
              <MessageCircle className="h-5 w-5 text-white" />
            </Button>
            <Button
              onClick={toggleFullscreen}
              variant="outline"
              size="icon"
              className="bg-black/50 border-gray-700 hover:bg-black/70"
            >
              <Maximize2 className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas 3D */}
      <Canvas
        shadows
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: true }}
      >
        <Scene 
          profile={profile} 
          otherPlayers={otherPlayers}
          onPositionUpdate={updatePosition}
        />
      </Canvas>

      <Joystick onMove={(x, z) => setMovement({ x, z })} />

      {showChat && (
        <div className="absolute right-4 top-20 w-80 h-96 bg-black/90 border border-gray-700 rounded-lg flex flex-col">
          <div className="p-3 border-b border-gray-700">
            <h3 className="text-white font-semibold">Chat Global</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chatMessages.map((msg, i) => (
              <div key={i} className="text-sm">
                <span className="text-blue-400 font-semibold">{msg.username}:</span>
                <span className="text-gray-300 ml-2">{msg.message}</span>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-700 flex gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Tapez un message..."
              className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 text-sm"
            />
            <Button onClick={sendMessage} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Contrôles info */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white p-4 rounded-lg border border-gray-700">
        <p className="text-sm font-semibold mb-2">Contrôles:</p>
        <p className="text-xs text-gray-400 hidden md:block">WASD ou Flèches = Déplacement</p>
        <p className="text-xs text-gray-400 md:hidden">Joystick = Déplacement</p>
        <p className="text-xs text-gray-400">Souris = Rotation caméra</p>
      </div>
    </div>
  )
}
