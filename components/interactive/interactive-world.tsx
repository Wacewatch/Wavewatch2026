"use client"

import { useEffect, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Stars } from "@react-three/drei"
import { Scene3D } from "./scene-3d"
import { ChatPanel } from "./chat-panel"
import { Controls } from "./controls"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { Users, Wifi } from 'lucide-react'

interface InteractiveWorldProps {
  userId: string
  username: string
  isAdmin: boolean
}

export interface OtherUser {
  userId: string
  username: string
  position: { x: number; y: number; z: number }
  rotation: number
  avatarStyle?: any
}

export function InteractiveWorld({ userId, username, isAdmin }: InteractiveWorldProps) {
  const [position, setPosition] = useState({ x: 0, y: 0, z: 15 })
  const [rotation, setRotation] = useState(0)
  const [otherUsers, setOtherUsers] = useState<OtherUser[]>([])
  const [activeChatBubbles, setActiveChatBubbles] = useState<Map<string, { message: string; username: string; timestamp: number }>>(new Map())
  const channelRef = useRef<RealtimeChannel | null>(null)
  const lastUpdateRef = useRef<number>(0)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to presence channel
    const channel = supabase.channel("interactive-world", {
      config: {
        presence: {
          key: userId,
        },
      },
    })

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        const users: OtherUser[] = []

        Object.keys(state).forEach((key) => {
          if (key !== userId) {
            const presences = state[key] as any[]
            if (presences && presences.length > 0) {
              const presence = presences[0]
              users.push({
                userId: key,
                username: presence.username || "Utilisateur",
                position: presence.position || { x: 0, y: 0, z: 0 },
                rotation: presence.rotation || 0,
                avatarStyle: presence.avatarStyle,
              })
            }
          }
        })

        setOtherUsers(users)
      })
      .on("broadcast", { event: "chat_message" }, ({ payload }) => {
        if (payload.userId !== userId) {
          setActiveChatBubbles(prev => {
            const newMap = new Map(prev)
            newMap.set(payload.userId, {
              message: payload.message,
              username: payload.username,
              timestamp: Date.now()
            })
            return newMap
          })
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true)
          await channel.track({
            username,
            position: { x: 0, y: 0, z: 15 },
            rotation: 0,
            online_at: new Date().toISOString(),
          })
        }
      })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [userId, username])

  // Update position in realtime (throttled)
  useEffect(() => {
    const now = Date.now()
    if (now - lastUpdateRef.current < 50) return

    lastUpdateRef.current = now

    if (channelRef.current) {
      channelRef.current.track({
        username,
        position,
        rotation,
        online_at: new Date().toISOString(),
      })
    }
  }, [position, rotation, username])

  const handleMove = (direction: "forward" | "backward" | "left" | "right") => {
    const speed = 0.5
    const newPosition = { ...position }

    switch (direction) {
      case "forward":
        newPosition.z -= speed * Math.cos(rotation)
        newPosition.x -= speed * Math.sin(rotation)
        break
      case "backward":
        newPosition.z += speed * Math.cos(rotation)
        newPosition.x += speed * Math.sin(rotation)
        break
      case "left":
        setRotation((r) => r + 0.1)
        break
      case "right":
        setRotation((r) => r - 0.1)
        break
    }

    newPosition.x = Math.max(-45, Math.min(45, newPosition.x))
    newPosition.z = Math.max(-70, Math.min(25, newPosition.z))

    setPosition(newPosition)
  }

  const handleChatBubbleExpire = (userId: string) => {
    setActiveChatBubbles(prev => {
      const newMap = new Map(prev)
      newMap.delete(userId)
      return newMap
    })
  }

  return (
    <div className="fixed inset-0" style={{ background: "linear-gradient(to bottom, #0a0a1e 0%, #1a1a2e 100%)" }}>
      <Canvas shadows gl={{ antialias: true, alpha: false }} dpr={[1, 2]}>
        <PerspectiveCamera 
          makeDefault 
          position={[position.x, position.y + 8, position.z + 15]} 
          fov={75}
        />
        <OrbitControls
          target={[position.x, position.y + 2, position.z]}
          enablePan={false}
          minDistance={8}
          maxDistance={30}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          enableDamping
          dampingFactor={0.05}
        />
        <Stars radius={300} depth={60} count={5000} factor={7} saturation={0} fade speed={1} />
        <Scene3D 
          playerPosition={position} 
          playerRotation={rotation} 
          otherUsers={otherUsers}
          activeChatBubbles={activeChatBubbles}
          onChatBubbleExpire={handleChatBubbleExpire}
        />
      </Canvas>

      <div className="absolute top-6 left-6 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-md rounded-xl p-5 border-2 shadow-2xl"
           style={{ borderColor: "hsl(var(--primary))" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {username[0].toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              WaveWatch World
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              {username}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 rounded-full">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="font-medium">{isConnected ? 'Connecté' : 'Connexion...'}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 rounded-full">
            <Users className="w-4 h-4" />
            <span className="font-bold">{otherUsers.length + 1}</span>
            <span className="text-muted-foreground">en ligne</span>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      <ChatPanel userId={userId} username={username} />

      {/* Controls */}
      <Controls onMove={handleMove} />

      <div className="absolute top-6 right-6 bg-background/80 backdrop-blur-md rounded-lg px-4 py-2 border text-xs text-muted-foreground">
        Position: X:{position.x.toFixed(1)} Z:{position.z.toFixed(1)}
      </div>
    </div>
  )
}
