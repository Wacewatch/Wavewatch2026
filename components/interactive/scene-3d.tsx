"use client"

import { Avatar } from "./avatar"
import { CinemaBuilding } from "./cinema-building"
import { ChatBubble3D } from "./chat-bubble-3d"
import type { OtherUser } from "./interactive-world"
import { useFrame, useThree } from "@react-three/fiber"
import { useRef, useMemo, useEffect } from "react"
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
  quality?: 'low' | 'medium' | 'high'
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
  quality = 'medium',
}: Scene3DProps) {
  const { gl, camera } = useThree()
  
  useEffect(() => {
    if (camera) {
      camera.position.set(playerPosition.x, playerPosition.y + 8, playerPosition.z + 15)
      camera.lookAt(playerPosition.x, playerPosition.y, playerPosition.z)
    }
  }, [playerPosition, camera])

  const cloudCount = quality === 'low' ? 5 : quality === 'medium' ? 10 : 15

  return (
    <>
      <color attach="background" args={["#0a0a1e"]} />
      <fog attach="fog" args={["#0a0a1e", 60, 120]} />
      
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[50, 50, 25]} 
        intensity={1.2} 
        castShadow={quality === 'high'} 
      />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow={false}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#2a2a3e" roughness={0.8} />
      </mesh>

      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[20, 16]} />
        <meshStandardMaterial color="#3d3d52" />
      </mesh>

      {/* Cinema building */}
      <CinemaBuilding position={[0, 0, -30]} onEnter={onEnterCinema} />

      <mesh position={[-30, 8, -20]} castShadow={false}>
        <boxGeometry args={[10, 16, 10]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.7} />
      </mesh>

      <mesh position={[30, 8, -20]} castShadow={false}>
        <boxGeometry args={[10, 16, 8]} />
        <meshStandardMaterial color="#8b7355" roughness={0.7} />
      </mesh>

      {Array.from({ length: 4 }).map((_, i) => {
        const angle = (i / 4) * Math.PI * 2
        const radius = 25
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <group key={`lamp-${i}`} position={[x, 0, z]}>
            <mesh castShadow={false}>
              <cylinderGeometry args={[0.12, 0.12, 6, 6]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0, 3.5, 0]}>
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshStandardMaterial color="#ffe4b5" emissive="#ffe4b5" emissiveIntensity={1.5} />
            </mesh>
            <pointLight 
              position={[0, 5, 0]} 
              intensity={6} 
              distance={12}
              color="#ffe4b5"
            />
          </group>
        )
      })}

      {quality !== 'low' && Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2 + 0.1
        const radius = 28
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <group key={`tree-${i}`} position={[x, 0, z]}>
            <mesh castShadow={false}>
              <cylinderGeometry args={[0.3, 0.4, 4, 6]} />
              <meshStandardMaterial color="#3d2817" />
            </mesh>
            <mesh position={[0, 4, 0]} castShadow={false}>
              <sphereGeometry args={[2, 6, 6]} />
              <meshStandardMaterial color="#2e7d32" />
            </mesh>
          </group>
        )
      })}

      {/* Player avatar */}
      <Avatar 
        position={playerPosition} 
        rotation={playerRotation} 
        color="#4dabf7" 
        isPlayer 
        style={playerAvatarStyle}
        userRole={playerRole}
      />

      {/* Other users - limit to 20 for performance */}
      {otherUsers.slice(0, 20).map((user) => (
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
