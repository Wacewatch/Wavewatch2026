"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Canvas } from "@react-three/fiber"
import { PerspectiveCamera, Stars } from "@react-three/drei"
import { Scene3D } from "./scene-3d"
import { ChatPanel } from "./chat-panel"
import { Controls } from "./controls"
import { AvatarCustomizer } from "./avatar-customizer"
import { WorldSettings } from "./world-settings"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { Users, Maximize, Minimize, Settings, Crown } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface InteractiveWorldProps {
  userId: string
  username: string
  userRole: 'member' | 'vip' | 'vip_plus' | 'admin'
  avatarStyle: any
}

export interface OtherUser {
  userId: string
  username: string
  position: { x: number; y: number; z: number }
  rotation: number
  avatarStyle?: any
  userRole?: 'member' | 'vip' | 'vip_plus' | 'admin'
}

export function InteractiveWorld({ userId, username, userRole, avatarStyle }: InteractiveWorldProps) {
  const [position, setPosition] = useState({ x: 0, y: 0, z: 15 })
  const [rotation, setRotation] = useState(0)
  const [otherUsers, setOtherUsers] = useState<OtherUser[]>([])
  const [activeChatBubbles, setActiveChatBubbles] = useState<Map<string, { message: string; username: string; timestamp: number }>>(new Map())
  const [isConnected, setIsConnected] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [currentAvatarStyle, setCurrentAvatarStyle] = useState(avatarStyle)
  const [showSettings, setShowSettings] = useState(false)
  const [controlMode, setControlMode] = useState<'keyboard' | 'joystick'>('keyboard')
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium')
  
  const channelRef = useRef<RealtimeChannel | null>(null)
  const lastUpdateRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase.channel("interactive-world", {
      config: {
        presence: {
          key: userId,
        },
        broadcast: {
          self: false
        }
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
                userRole: presence.userRole || 'member',
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

          setTimeout(() => {
            setActiveChatBubbles(prev => {
              const newMap = new Map(prev)
              newMap.delete(payload.userId)
              return newMap
            })
          }, 5000)
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true)
          await channel.track({
            username,
            position: { x: 0, y: 0, z: 15 },
            rotation: 0,
            avatarStyle: currentAvatarStyle,
            userRole,
            online_at: new Date().toISOString(),
          })
        }
      })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [userId, username, userRole, currentAvatarStyle])

  useEffect(() => {
    const now = Date.now()
    if (now - lastUpdateRef.current < 100) return

    lastUpdateRef.current = now

    if (channelRef.current && isConnected) {
      channelRef.current.track({
        username,
        position,
        rotation,
        avatarStyle: currentAvatarStyle,
        userRole,
        online_at: new Date().toISOString(),
      })
    }
  }, [position, rotation, username, isConnected, currentAvatarStyle, userRole])

  const handleMove = useCallback((direction: "forward" | "backward" | "left" | "right") => {
    const speed = 0.3
    
    setPosition(prevPos => {
      const newPosition = { ...prevPos }

      switch (direction) {
        case "forward":
          newPosition.z -= speed * Math.cos(rotation)
          newPosition.x -= speed * Math.sin(rotation)
          break
        case "backward":
          newPosition.z += speed * Math.cos(rotation)
          newPosition.x += speed * Math.sin(rotation)
          break
      }

      newPosition.x = Math.max(-45, Math.min(45, newPosition.x))
      newPosition.z = Math.max(-70, Math.min(25, newPosition.z))

      return newPosition
    })

    if (direction === "left") {
      setRotation(r => r + 0.05)
    } else if (direction === "right") {
      setRotation(r => r - 0.05)
    }
  }, [rotation])

  const handleAvatarUpdate = useCallback(async (newStyle: any) => {
    setCurrentAvatarStyle(newStyle)
    
    const supabase = createClient()
    await supabase
      .from("interactive_profiles")
      .update({ avatar_style: newStyle })
      .eq("user_id", userId)
  }, [userId])

  const getRoleBadge = () => {
    switch (userRole) {
      case 'admin': return <Crown className="w-4 h-4 text-yellow-400" />
      case 'vip_plus': return <Crown className="w-4 h-4 text-purple-400" />
      case 'vip': return <Crown className="w-4 h-4 text-blue-400" />
      default: return null
    }
  }

  return (
    <div ref={containerRef} className="fixed inset-0" style={{ background: "linear-gradient(to bottom, #0a0a1e 0%, #1a1a2e 100%)" }}>
      <Canvas 
        shadows 
        gl={{ 
          antialias: quality === 'high', 
          alpha: false,
          powerPreference: quality === 'low' ? 'low-power' : 'high-performance'
        }} 
        dpr={quality === 'low' ? [0.5, 1] : quality === 'medium' ? [1, 1.5] : [1, 2]}
        performance={{ min: quality === 'low' ? 0.3 : quality === 'medium' ? 0.5 : 0.7 }}
      >
        <PerspectiveCamera 
          makeDefault 
          position={[position.x, position.y + 8, position.z + 15]} 
          fov={75}
        />
        <Stars radius={300} depth={60} count={3000} factor={6} saturation={0} fade speed={0.5} />
        <Scene3D 
          playerPosition={position} 
          playerRotation={rotation}
          playerAvatarStyle={currentAvatarStyle}
          playerRole={userRole}
          otherUsers={otherUsers}
          activeChatBubbles={activeChatBubbles}
        />
      </Canvas>

      <div className="absolute top-6 left-6 bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl rounded-xl p-5 border-2 shadow-2xl"
           style={{ borderColor: "hsl(var(--primary))" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {username[0].toUpperCase()}
            </div>
            {getRoleBadge() && (
              <div className="absolute -top-1 -right-1 bg-background rounded-full p-1">
                {getRoleBadge()}
              </div>
            )}
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
        
        <div className="flex items-center gap-3 text-sm mb-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 rounded-full">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="font-medium">{isConnected ? 'Connecté' : 'Connexion...'}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 rounded-full">
            <Users className="w-4 h-4" />
            <span className="font-bold">{otherUsers.length + 1}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowSettings(true)}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            <Settings className="w-4 h-4 mr-2" />
            Paramètres
          </Button>
          <Button
            onClick={() => setShowCustomizer(true)}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            <Settings className="w-4 h-4 mr-2" />
            Avatar
          </Button>
          <Button
            onClick={toggleFullscreen}
            size="sm"
            variant="outline"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <ChatPanel userId={userId} username={username} />
      <Controls onMove={handleMove} mode={controlMode} />

      {showCustomizer && (
        <AvatarCustomizer
          userId={userId}
          userRole={userRole}
          currentStyle={currentAvatarStyle}
          onClose={() => setShowCustomizer(false)}
          onSave={handleAvatarUpdate}
        />
      )}

      <WorldSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        controlMode={controlMode}
        onControlModeChange={setControlMode}
        quality={quality}
        onQualityChange={setQuality}
      />
    </div>
  )
}
