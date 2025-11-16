"use client"

import { Avatar } from "./avatar"
import { CinemaBuilding } from "./cinema-building"
import { ChatBubble3D } from "./chat-bubble-3d"
import type { OtherUser } from "./interactive-world"
import { useFrame } from "@react-three/fiber"
import { useRef, useMemo } from "react"
import * as THREE from "three"

interface Scene3DProps {
  playerPosition: { x: number; y: number; z: number }
  playerRotation: number
  playerAvatarStyle?: any
  playerRole?: 'member' | 'vip' | 'vip_plus' | 'admin'
  otherUsers: OtherUser[]
  onEnterCinema?: () => void
  activeChatBubbles?: Map<string, { message: string; username: string; timestamp: number }>
  onChatBubbleExpire?: (userId: string) => void
}

export function Scene3D({
  playerPosition,
  playerRotation,
  playerAvatarStyle,
  playerRole = 'member',
  otherUsers,
  onEnterCinema,
  activeChatBubbles = new Map(),
  onChatBubbleExpire = () => {},
}: Scene3DProps) {
  const cloudsRef = useRef<THREE.Group>(null)
  const fogRef = useRef<THREE.Fog | null>(null)
  
  // Animate clouds
  useFrame((state) => {
    if (cloudsRef.current) {
      cloudsRef.current.children.forEach((cloud, i) => {
        cloud.position.x += 0.01 * (i % 2 === 0 ? 1 : -1)
        if (cloud.position.x > 150) cloud.position.x = -150
        if (cloud.position.x < -150) cloud.position.x = 150
      })
    }
  })

  // Create cloud meshes
  const clouds = useMemo(() => {
    const cloudPositions = []
    for (let i = 0; i < 20; i++) {
      cloudPositions.push({
        position: [
          Math.random() * 300 - 150,
          30 + Math.random() * 20,
          Math.random() * 300 - 150,
        ] as [number, number, number],
        scale: 3 + Math.random() * 5,
      })
    }
    return cloudPositions
  }, [])

  return (
    <>
      <color attach="background" args={["#0a0a1e"]} />
      <fog attach="fog" args={["#0a0a1e", 40, 120]} ref={fogRef} />
      
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[50, 50, 25]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      />
      <hemisphereLight args={["#6a7aa5", "#1a1a2e", 0.5]} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#2a2a3e" />
      </mesh>

      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[20, 32]} />
        <meshStandardMaterial color="#3d3d52" />
      </mesh>

      <CinemaBuilding position={[0, 0, -30]} onEnter={onEnterCinema} />

      <mesh position={[-30, 8, -20]} castShadow receiveShadow>
        <boxGeometry args={[10, 16, 10]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      <mesh position={[30, 8, -20]} castShadow receiveShadow>
        <boxGeometry args={[10, 16, 8]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      <mesh position={[-35, 12, -50]} castShadow receiveShadow>
        <boxGeometry args={[12, 24, 12]} />
        <meshStandardMaterial color="#2d2d44" />
      </mesh>

      <mesh position={[35, 10, -50]} castShadow receiveShadow>
        <boxGeometry args={[14, 20, 14]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 25
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <group key={`lamp-${i}`} position={[x, 0, z]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.12, 0.12, 6, 6]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0, 3.5, 0]}>
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshStandardMaterial color="#ffe4b5" emissive="#ffe4b5" emissiveIntensity={1.5} />
            </mesh>
            <pointLight 
              position={[0, 5, 0]} 
              intensity={8} 
              distance={15}
              color="#ffe4b5"
            />
          </group>
        )
      })}

      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2 + 0.1
        const radius = 28
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <group key={`tree-${i}`} position={[x, 0, z]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.3, 0.4, 4, 6]} />
              <meshStandardMaterial color="#3d2817" />
            </mesh>
            <mesh position={[0, 4, 0]} castShadow>
              <sphereGeometry args={[2, 6, 6]} />
              <meshStandardMaterial color="#2e7d32" />
            </mesh>
          </group>
        )
      })}

      <Avatar 
        position={playerPosition} 
        rotation={playerRotation} 
        color="#4dabf7" 
        isPlayer 
        style={playerAvatarStyle}
        userRole={playerRole}
      />

      {otherUsers.map((user) => (
        <group key={user.userId}>
          <Avatar 
            position={user.position} 
            rotation={user.rotation} 
            color="#51cf66" 
            isPlayer={false} 
            style={user.avatarStyle}
            userRole={user.userRole || 'member'}
          />
          
          {activeChatBubbles.has(user.userId) && (
            <ChatBubble3D
              position={[user.position.x, user.position.y + 3.5, user.position.z]}
              message={activeChatBubbles.get(user.userId)!.message}
              username={activeChatBubbles.get(user.userId)!.username}
              onExpire={() => onChatBubbleExpire(user.userId)}
            />
          )}
        </group>
      ))}
    </>
  )
}
