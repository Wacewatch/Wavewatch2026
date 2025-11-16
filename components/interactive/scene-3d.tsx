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
  otherUsers: OtherUser[]
  onEnterCinema?: () => void
  activeChatBubbles?: Map<string, { message: string; username: string; timestamp: number }>
  onChatBubbleExpire?: (userId: string) => void
}

export function Scene3D({
  playerPosition,
  playerRotation,
  playerAvatarStyle,
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
      <color attach="background" args={["#1a1a2e"]} />
      <fog attach="fog" args={["#1a1a2e", 50, 200]} ref={fogRef} />
      
      <ambientLight intensity={0.4} color="#c9d1ff" />
      <directionalLight 
        position={[100, 100, 50]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        color="#fff8dc"
      />
      <hemisphereLight args={["#4a5785", "#1a1a2e", 0.6]} />
      
      {/* Moon light */}
      <pointLight position={[-50, 80, -50]} intensity={2} color="#c9d1ff" distance={200} />
      
      {/* Ambient particles effect */}
      <pointLight position={[30, 15, 30]} intensity={0.5} color="#ffeb3b" distance={40} />
      <pointLight position={[-30, 15, -30]} intensity={0.5} color="#ff6b9d" distance={40} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial 
          color="#2a2a3e" 
          roughness={0.9} 
          metalness={0.1}
        />
      </mesh>

      {/* City plaza pattern - detailed */}
      {Array.from({ length: 30 }).map((_, i) => (
        <group key={`grid-${i}`}>
          <mesh position={[-150 + i * 10, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.15, 300]} />
            <meshBasicMaterial color="#3a3a4e" transparent opacity={0.4} />
          </mesh>
          <mesh position={[0, 0.02, -150 + i * 10]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[300, 0.15]} />
            <meshBasicMaterial color="#3a3a4e" transparent opacity={0.4} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[25, 64]} />
        <meshStandardMaterial 
          color="#3d3d52" 
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>
      
      {/* Decorative rings in plaza */}
      {[15, 20].map((radius, i) => (
        <mesh key={`ring-${i}`} position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius, radius + 0.3, 64]} />
          <meshStandardMaterial 
            color="#ff6b9d" 
            emissive="#ff6b9d"
            emissiveIntensity={0.3}
            roughness={0.3}
          />
        </mesh>
      ))}

      <CinemaBuilding position={[0, 0, -30]} onEnter={onEnterCinema} />

      {/* Modern glass tower - left front */}
      <group position={[-35, 0, -20]}>
        <mesh position={[0, 12, 0]} castShadow receiveShadow>
          <boxGeometry args={[12, 24, 12]} />
          <meshStandardMaterial 
            color="#1a1a2e" 
            roughness={0.2} 
            metalness={0.8}
          />
        </mesh>
        {/* Glass windows grid */}
        {Array.from({ length: 6 }).map((_, floor) => 
          Array.from({ length: 3 }).map((_, col) => (
            <mesh 
              key={`window-l-${floor}-${col}`}
              position={[-4 + col * 4, floor * 4 - 10, 6.1]}
            >
              <planeGeometry args={[2.5, 3]} />
              <meshStandardMaterial 
                color="#4dd0e1" 
                transparent 
                opacity={0.7}
                emissive="#4dd0e1"
                emissiveIntensity={0.3}
              />
            </mesh>
          ))
        )}
      </group>

      {/* Art deco building - right front */}
      <group position={[35, 0, -20]}>
        <mesh position={[0, 10, 0]} castShadow receiveShadow>
          <boxGeometry args={[14, 20, 10]} />
          <meshStandardMaterial 
            color="#8b7355" 
            roughness={0.8}
          />
        </mesh>
        <mesh position={[0, 20, 0]} castShadow>
          <coneGeometry args={[8, 5, 4]} />
          <meshStandardMaterial 
            color="#d4af37" 
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
        {/* Art deco details */}
        {[-5, 0, 5].map((x, i) => (
          <mesh key={`deco-${i}`} position={[x, 18, 5.1]}>
            <boxGeometry args={[2, 0.5, 0.2]} />
            <meshStandardMaterial 
              color="#d4af37"
              metalness={0.9}
              emissive="#d4af37"
              emissiveIntensity={0.2}
            />
          </mesh>
        ))}
      </group>

      {/* Futuristic tower - left back */}
      <group position={[-45, 0, -60]}>
        <mesh position={[0, 18, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[6, 8, 36, 8]} />
          <meshStandardMaterial 
            color="#2d2d44" 
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
        {/* Holographic ring */}
        <mesh position={[0, 30, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[8, 0.3, 16, 100]} />
          <meshStandardMaterial 
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={1}
            transparent
            opacity={0.7}
          />
        </mesh>
        <pointLight position={[0, 30, 0]} intensity={5} color="#00ffff" distance={50} />
      </group>

      {/* Corporate headquarters - right back */}
      <group position={[45, 0, -60]}>
        <mesh position={[0, 15, 0]} castShadow receiveShadow>
          <boxGeometry args={[16, 30, 16]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>
        {/* Neon company logo */}
        <mesh position={[0, 28, 8.1]}>
          <circleGeometry args={[3, 32]} />
          <meshStandardMaterial 
            color="#ff006e"
            emissive="#ff006e"
            emissiveIntensity={1.5}
          />
        </mesh>
        <pointLight position={[0, 28, 10]} intensity={8} color="#ff006e" distance={30} />
      </group>

      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const radius = 28
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <group key={`lamp-${i}`} position={[x, 0, z]}>
            {/* Lamp post */}
            <mesh castShadow>
              <cylinderGeometry args={[0.15, 0.15, 8, 8]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Lamp housing */}
            <mesh position={[0, 4, 0]} castShadow>
              <cylinderGeometry args={[0.6, 0.4, 1, 8]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Light source */}
            <mesh position={[0, 3.5, 0]}>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial 
                color="#ffe4b5" 
                emissive="#ffe4b5" 
                emissiveIntensity={2}
              />
            </mesh>
            {/* Light cone effect */}
            <mesh position={[0, 3, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[2, 6, 8, 1, true]} />
              <meshStandardMaterial 
                color="#ffe4b5"
                transparent
                opacity={0.1}
                side={THREE.DoubleSide}
              />
            </mesh>
            <spotLight 
              position={[0, 7, 0]} 
              intensity={15} 
              distance={25}
              angle={Math.PI / 3}
              penumbra={0.5}
              color="#ffe4b5"
              castShadow
            />
          </group>
        )
      })}

      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2 + 0.1
        const radius = 32
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <group key={`tree-${i}`} position={[x, 0, z]}>
            {/* Tree trunk */}
            <mesh castShadow>
              <cylinderGeometry args={[0.4, 0.5, 5, 8]} />
              <meshStandardMaterial color="#3d2817" roughness={1} />
            </mesh>
            {/* Foliage layers */}
            <mesh position={[0, 5, 0]} castShadow>
              <sphereGeometry args={[2.5, 8, 8]} />
              <meshStandardMaterial color="#1a4d2e" roughness={0.9} />
            </mesh>
            <mesh position={[0, 6.5, 0]} castShadow>
              <sphereGeometry args={[2, 8, 8]} />
              <meshStandardMaterial color="#27632a" roughness={0.9} />
            </mesh>
            <mesh position={[0, 7.5, 0]} castShadow>
              <sphereGeometry args={[1.5, 8, 8]} />
              <meshStandardMaterial color="#2e7d32" roughness={0.9} />
            </mesh>
          </group>
        )
      })}

      {[
        [-18, 0, 18], [18, 0, 18],
        [-18, 0, -5], [18, 0, -5],
      ].map((pos, i) => (
        <group key={`bench-${i}`} position={pos as [number, number, number]}>
          {/* Bench seat */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[3, 0.15, 0.8]} />
            <meshStandardMaterial color="#5d4e37" roughness={0.7} />
          </mesh>
          {/* Backrest */}
          <mesh position={[0, 1, -0.35]} castShadow>
            <boxGeometry args={[3, 0.8, 0.1]} />
            <meshStandardMaterial color="#5d4e37" roughness={0.7} />
          </mesh>
          {/* Metal legs */}
          {[-1.2, 1.2].map((x, j) => (
            <mesh key={`leg-${j}`} position={[x, 0.25, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
              <meshStandardMaterial color="#2a2a2a" metalness={0.9} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}

      <group position={[0, 0, 10]}>
        {/* Fountain base */}
        <mesh position={[0, 0.3, 0]} receiveShadow>
          <cylinderGeometry args={[4, 4.5, 0.6, 32]} />
          <meshStandardMaterial color="#8b9dc3" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Water basin */}
        <mesh position={[0, 0.61, 0]}>
          <cylinderGeometry args={[3.8, 3.8, 0.1, 32]} />
          <meshStandardMaterial 
            color="#4dd0e1" 
            transparent 
            opacity={0.7}
            roughness={0.1}
            metalness={0.3}
          />
        </mesh>
        {/* Center column */}
        <mesh position={[0, 2, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.4, 3, 16]} />
          <meshStandardMaterial color="#b0c4de" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Water particles effect (simplified) */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={`water-${i}`} position={[0, 3.5, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial 
              color="#4dd0e1"
              transparent
              opacity={0.6}
              emissive="#4dd0e1"
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
        <pointLight position={[0, 1, 0]} intensity={5} color="#4dd0e1" distance={15} />
      </group>

      <group ref={cloudsRef}>
        {clouds.map((cloud, i) => (
          <mesh key={`cloud-${i}`} position={cloud.position}>
            <sphereGeometry args={[cloud.scale, 8, 8]} />
            <meshStandardMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.3}
              roughness={1}
            />
          </mesh>
        ))}
      </group>

      <group position={[0, 4, 25]}>
        <mesh castShadow>
          <boxGeometry args={[12, 3, 0.3]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.2]}>
          <planeGeometry args={[11, 2]} />
          <meshStandardMaterial 
            color="#ff006e"
            emissive="#ff006e"
            emissiveIntensity={1}
          />
        </mesh>
        <pointLight position={[0, 0, 2]} intensity={10} color="#ff006e" distance={20} />
      </group>

      <Avatar 
        position={playerPosition} 
        rotation={playerRotation} 
        color="#4dabf7" 
        isPlayer 
        style={playerAvatarStyle} 
      />

      {otherUsers.map((user) => (
        <group key={user.userId}>
          <Avatar 
            position={user.position} 
            rotation={user.rotation} 
            color="#51cf66" 
            isPlayer={false} 
            style={user.avatarStyle} 
          />
          
          {/* Username label with backdrop */}
          <mesh position={[user.position.x, user.position.y + 2.8, user.position.z]}>
            <boxGeometry args={[2.5, 0.5, 0.1]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.7} />
          </mesh>
          
          {activeChatBubbles.has(user.userId) && (
            <ChatBubble3D
              position={[user.position.x, user.position.y + 3.8, user.position.z]}
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
