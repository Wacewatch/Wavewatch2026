"use client"

import { Billboard, Html } from "@react-three/drei"

interface DiscoBuildingProps {
  position: [number, number, number]
  playerPosition: { x: number; z: number }
  onEnter: () => void
}

export function DiscoBuilding({ position, playerPosition, onEnter }: DiscoBuildingProps) {
  const [buildingX, , buildingZ] = position
  const distanceToBuilding = Math.sqrt(
    Math.pow(playerPosition.x - buildingX, 2) + Math.pow(playerPosition.z - buildingZ, 2)
  )
  const isNearby = distanceToBuilding < 8

  return (
    <group position={position}>
      {/* Main building */}
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[10, 6, 8]} />
        <meshStandardMaterial color="#ec4899" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 6.5, 0]} castShadow>
        <boxGeometry args={[10.5, 0.5, 8.5]} />
        <meshStandardMaterial color="#9d174d" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Neon sign */}
      <mesh position={[0, 7, 0]}>
        <boxGeometry args={[8, 0.6, 0.3]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={2}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>
      <pointLight position={[0, 7, 0]} intensity={3} distance={12} color="#ff00ff" />

      {/* Disco ball on top */}
      <mesh position={[0, 7.5, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial
          color="#c0c0c0"
          emissive="#ffffff"
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <pointLight position={[0, 7.5, 0]} intensity={2} distance={8} color="#ffffff" />

      {/* Decorative windows with neon glow */}
      {[-3, -1, 1, 3].map((x) => (
        <mesh key={`disco-window-${x}`} position={[x, 3, 4.1]}>
          <planeGeometry args={[1.2, 2]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={0.8}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Door */}
      <mesh position={[0, 1.2, 4.1]} castShadow>
        <boxGeometry args={[2, 2.4, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Building name - always visible and clickable */}
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <Html position={[0, 8.5, 0]} center zIndexRange={[0, 0]}>
          <button
            onClick={onEnter}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-2xl font-bold text-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-105 pointer-events-auto whitespace-nowrap"
          >
            disco
          </button>
        </Html>
      </Billboard>

      {/* Entry button visible when nearby */}
      {isNearby && (
        <Html position={[0, 2, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
          <button
            onClick={onEnter}
            className="bg-pink-600/90 backdrop-blur-sm hover:bg-pink-700 text-white px-6 py-3 rounded-lg shadow-2xl text-base font-bold transition-all hover:scale-110 border-2 border-white/30 flex items-center gap-2"
          >
            Entrer <kbd className="bg-white/20 px-2 py-0.5 rounded text-sm">F</kbd>
          </button>
        </Html>
      )}
    </group>
  )
}
