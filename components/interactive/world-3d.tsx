'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sky, Text, Html } from '@react-three/drei'
import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Maximize, MessageSquare, Send, Settings, Crown, Shield } from 'lucide-react'
import * as THREE from 'three'
import { CinemaBuilding } from './cinema-building'

interface WorldProps {
  userId: string
  userProfile: any
}

export default function InteractiveWorld({ userId, userProfile }: WorldProps) {
  const router = useRouter()
  const [otherPlayers, setOtherPlayers] = useState<any[]>([])
  const [myPosition, setMyPosition] = useState({ x: 0, y: 0.5, z: 0 })
  const [myAvatarStyle, setMyAvatarStyle] = useState({
    bodyColor: '#3b82f6',
    headColor: '#fbbf24',
    accessory: 'none'
  })
  const [movement, setMovement] = useState({ x: 0, z: 0 })
  const [showChat, setShowChat] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const keysPressed = useRef<Set<string>>(new Set())
  const supabase = createClient()

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }

  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    
    if (isMobile) {
      const enterFullscreen = async () => {
        try {
          await document.documentElement.requestFullscreen()
        } catch (err) {
          console.log('Fullscreen not available')
        }
      }
      
      const enterLandscape = async () => {
        try {
          if ('orientation' in screen && 'lock' in screen.orientation) {
            await (screen.orientation as any).lock('landscape')
          }
        } catch (err) {
          console.log('Orientation lock not available')
        }
      }
      
      const timeout = setTimeout(() => {
        enterFullscreen()
        enterLandscape()
      }, 500)
      
      return () => clearTimeout(timeout)
    }
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
      const speed = 0.1
      
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
  }, [userId])
  
  useEffect(() => {
    const loadPlayers = async () => {
      const { data } = await supabase
        .from('interactive_profiles')
        .select('*, user_profiles!inner(username, is_admin, is_vip, is_vip_plus)')
        .neq('user_id', userId)
      
      if (data) setOtherPlayers(data)
    }
    
    loadPlayers()
    
    const channel = supabase
      .channel('players')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'interactive_profiles'
      }, loadPlayers)
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  useEffect(() => {
    const loadMessages = async () => {
      const { data } = await supabase
        .from('interactive_chat_messages')
        .select('*')
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
        table: 'interactive_chat_messages'
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  
  const sendMessage = async () => {
    if (!chatInput.trim()) return
    
    await supabase.from('interactive_chat_messages').insert({
      user_id: userId,
      username: userProfile?.username || 'Anonyme',
      message: chatInput.trim()
    })
    
    setChatInput('')
  }

  const handleJoystickMove = useCallback((dx: number, dz: number) => {
    setMyPosition(prev => {
      const speed = 0.15
      const newPos = {
        x: Math.max(-20, Math.min(20, prev.x + dx * speed)),
        y: 0.5,
        z: Math.max(-20, Math.min(20, prev.z + dz * speed))
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
  }, [userId, supabase])

  const handleEnterCinema = () => {
    router.push('/cinema')
  }

  return (
    <div className="fixed inset-0 bg-black">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ width: '100vw', height: '100vh' }}
        gl={{ antialias: true, alpha: false }}
      >
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Sol */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#4ade80" />
        </mesh>
        
        {/* Simple bâtiment */}
        <group position={[15, 0, 0]}>
          <mesh position={[0, 2, 0]}>
            <boxGeometry args={[5, 4, 5]} />
            <meshStandardMaterial color="#1e40af" />
          </mesh>
          <mesh position={[0, 4.5, 0]}>
            <boxGeometry args={[6, 0.5, 0.5]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
          </mesh>
          <Html position={[0, 5, 0]} center>
            <button
              onClick={handleEnterCinema}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 whitespace-nowrap"
            >
              🎬 Cinéma
            </button>
          </Html>
        </group>
        
        {/* Arbres */}
        {[-15, -5, 5, 15].map((x) => (
          <group key={`tree-${x}`} position={[x, 0, -15]}>
            <mesh position={[0, 1, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 2]} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
            <mesh position={[0, 2.5, 0]}>
              <coneGeometry args={[1, 2, 8]} />
              <meshStandardMaterial color="#22c55e" />
            </mesh>
          </group>
        ))}
        
        {/* Lampadaires */}
        {[-10, 0, 10].map((z) => (
          <group key={`lamp-${z}`} position={[-18, 0, z]}>
            <mesh position={[0, 2, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 4]} />
              <meshStandardMaterial color="#374151" />
            </mesh>
            <mesh position={[0, 4, 0]}>
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
            </mesh>
            <pointLight position={[0, 4, 0]} intensity={1} distance={10} color="#fbbf24" />
          </group>
        ))}
        
        {/* Mon avatar personnalisé */}
        <group position={[myPosition.x, myPosition.y, myPosition.z]}>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.4, 0.6, 0.3]} />
            <meshStandardMaterial color={myAvatarStyle.bodyColor} />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color={myAvatarStyle.headColor} />
          </mesh>
          <mesh position={[-0.35, 0.3, 0]}>
            <boxGeometry args={[0.15, 0.5, 0.15]} />
            <meshStandardMaterial color={myAvatarStyle.bodyColor} />
          </mesh>
          <mesh position={[0.35, 0.3, 0]}>
            <boxGeometry args={[0.15, 0.5, 0.15]} />
            <meshStandardMaterial color={myAvatarStyle.bodyColor} />
          </mesh>
          <mesh position={[-0.15, -0.15, 0]}>
            <boxGeometry args={[0.15, 0.5, 0.15]} />
            <meshStandardMaterial color="#1e40af" />
          </mesh>
          <mesh position={[0.15, -0.15, 0]}>
            <boxGeometry args={[0.15, 0.5, 0.15]} />
            <meshStandardMaterial color="#1e40af" />
          </mesh>
          
          {/* Badge Admin/VIP */}
          {userProfile?.is_admin && (
            <Html position={[0, 1.8, 0]} center>
              <div className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1 whitespace-nowrap">
                <Shield className="w-3 h-3" />
                Admin
              </div>
            </Html>
          )}
          {userProfile?.is_vip_plus && !userProfile?.is_admin && (
            <Html position={[0, 1.8, 0]} center>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1 whitespace-nowrap">
                <Crown className="w-3 h-3" />
                VIP+
              </div>
            </Html>
          )}
          {userProfile?.is_vip && !userProfile?.is_vip_plus && !userProfile?.is_admin && (
            <Html position={[0, 1.8, 0]} center>
              <div className="bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1 whitespace-nowrap">
                <Crown className="w-3 h-3" />
                VIP
              </div>
            </Html>
          )}
        </group>
        
        {/* Autres joueurs avec badges */}
        {otherPlayers.map((player) => {
          const playerProfile = player.user_profiles
          const avatarStyle = player.avatar_style || { bodyColor: '#ef4444', headColor: '#fbbf24' }
          
          return (
            <group
              key={player.user_id}
              position={[player.position_x || 0, 0.5, player.position_z || 0]}
            >
              <mesh position={[0, 0.4, 0]}>
                <boxGeometry args={[0.4, 0.6, 0.3]} />
                <meshStandardMaterial color={avatarStyle.bodyColor || '#ef4444'} />
              </mesh>
              <mesh position={[0, 0.9, 0]}>
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshStandardMaterial color={avatarStyle.headColor || '#fbbf24'} />
              </mesh>
              <mesh position={[-0.35, 0.3, 0]}>
                <boxGeometry args={[0.15, 0.5, 0.15]} />
                <meshStandardMaterial color={avatarStyle.bodyColor || '#ef4444'} />
              </mesh>
              <mesh position={[0.35, 0.3, 0]}>
                <boxGeometry args={[0.15, 0.5, 0.15]} />
                <meshStandardMaterial color={avatarStyle.bodyColor || '#ef4444'} />
              </mesh>
              <mesh position={[-0.15, -0.15, 0]}>
                <boxGeometry args={[0.15, 0.5, 0.15]} />
                <meshStandardMaterial color="#991b1b" />
              </mesh>
              <mesh position={[0.15, -0.15, 0]}>
                <boxGeometry args={[0.15, 0.5, 0.15]} />
                <meshStandardMaterial color="#991b1b" />
              </mesh>
              
              {/* Nom + Badge */}
              <Html position={[0, 1.8, 0]} center>
                <div className="flex flex-col items-center gap-1">
                  {playerProfile?.is_admin && (
                    <div className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1 whitespace-nowrap">
                      <Shield className="w-3 h-3" />
                      Admin
                    </div>
                  )}
                  {playerProfile?.is_vip_plus && !playerProfile?.is_admin && (
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1 whitespace-nowrap">
                      <Crown className="w-3 h-3" />
                      VIP+
                    </div>
                  )}
                  {playerProfile?.is_vip && !playerProfile?.is_vip_plus && !playerProfile?.is_admin && (
                    <div className="bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1 whitespace-nowrap">
                      <Crown className="w-3 h-3" />
                      VIP
                    </div>
                  )}
                  <div className="bg-black/70 text-white px-2 py-0.5 rounded text-xs whitespace-nowrap">
                    {player.username || playerProfile?.username || 'Joueur'}
                  </div>
                </div>
              </Html>
            </group>
          )
        })}
        
        <OrbitControls
          target={[myPosition.x, myPosition.y, myPosition.z]}
          maxPolarAngle={Math.PI / 2.5}
          minDistance={5}
          maxDistance={20}
        />
      </Canvas>
      
      {/* UI Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <button
          onClick={() => router.push('/')}
          className="bg-white/20 backdrop-blur-lg text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
        >
          ← Retour
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-white/20 backdrop-blur-lg text-white p-2 rounded-lg hover:bg-white/30 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setShowChat(!showChat)}
            className="bg-white/20 backdrop-blur-lg text-white p-2 rounded-lg hover:bg-white/30 transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleEnterCinema}
            className="bg-white/20 backdrop-blur-lg text-white p-2 rounded-lg hover:bg-white/30 transition-colors"
          >
            <Text className="w-5 h-5">Cinema</Text>
          </button>
          
          <button
            onClick={handleFullscreen}
            className="bg-white/20 backdrop-blur-lg text-white p-2 rounded-lg hover:bg-white/30 transition-colors"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Chat Panel */}
      {showChat && (
        <div className="absolute top-20 right-4 w-80 h-96 bg-black/70 backdrop-blur-lg rounded-lg z-10 flex flex-col p-4">
          <h3 className="text-white font-bold mb-2">Chat Global</h3>
          
          <div className="flex-1 overflow-y-auto space-y-2 mb-3">
            {messages.map((msg, i) => (
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
      
      {showSettings && (
        <div className="absolute top-20 left-4 w-80 bg-black/70 backdrop-blur-lg rounded-lg z-10 flex flex-col p-4 max-h-[500px] overflow-y-auto">
          <h3 className="text-white font-bold mb-4">Personnalisation Avatar</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm mb-2 block">Couleur du Corps</label>
              <div className="grid grid-cols-5 gap-2">
                {['#3b82f6', '#ef4444', '#22c55e', '#a855f7', '#f59e0b'].map(color => (
                  <button
                    key={color}
                    onClick={() => saveAvatarStyle({ ...myAvatarStyle, bodyColor: color })}
                    className={`w-10 h-10 rounded-lg border-2 ${
                      myAvatarStyle.bodyColor === color ? 'border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-white text-sm mb-2 block">Couleur de la Tête</label>
              <div className="grid grid-cols-5 gap-2">
                {['#fbbf24', '#fca5a5', '#f0abfc', '#c4b5fd', '#93c5fd'].map(color => (
                  <button
                    key={color}
                    onClick={() => saveAvatarStyle({ ...myAvatarStyle, headColor: color })}
                    className={`w-10 h-10 rounded-lg border-2 ${
                      myAvatarStyle.headColor === color ? 'border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/20">
              <p className="text-white/60 text-xs">
                Plus d'options de personnalisation à venir!
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 z-10 bg-black/50 backdrop-blur-lg text-white p-3 rounded-lg text-sm hidden md:block">
        <div>Contrôles: WASD ou Flèches</div>
        <div>Souris: Rotation caméra</div>
      </div>
      
      <MobileJoystick onMove={handleJoystickMove} />
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
