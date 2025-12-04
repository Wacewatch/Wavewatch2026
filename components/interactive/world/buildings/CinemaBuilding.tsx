"use client"

import { Billboard, Html } from "@react-three/drei"

interface CinemaBuildingProps {
  position: [number, number, number]
  playerPosition: { x: number; z: number }
  onEnter: () => void
}

export function CinemaBuilding({ position, playerPosition, onEnter }: CinemaBuildingProps) {
  const [buildingX, , buildingZ] = position
  const distanceToBuilding = Math.sqrt(
    Math.pow(playerPosition.x - buildingX, 2) + Math.pow(playerPosition.z - buildingZ, 2)
  )
  const isNearby = distanceToBuilding < 8

  return (
    <group position={position}>
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

      {/* Building name - always visible and clickable */}
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <Html position={[0, 7, 0]} center zIndexRange={[0, 0]}>
          <button
            onClick={onEnter}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-2xl font-bold text-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-105 pointer-events-auto whitespace-nowrap"
          >
            cinema
          </button>
        </Html>
      </Billboard>

      {/* Windows */}
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

      {/* Door */}
      <mesh position={[-3, 1.2, 4.1]} castShadow>
        <boxGeometry args={[1.5, 2.4, 0.1]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[-3, 1.2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Entrance steps */}
      <mesh position={[-3, 0.1, 5.5]}>
        <boxGeometry args={[2, 0.2, 2]} />
        <meshStandardMaterial color="#6b7280" roughness={0.9} metalness={0} />
      </mesh>

      {/* Entry button visible when nearby */}
      {isNearby && (
        <Html position={[0, 2, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
          <button
            onClick={onEnter}
            className="bg-blue-600/90 backdrop-blur-sm hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-2xl text-base font-bold transition-all hover:scale-110 border-2 border-white/30 flex items-center gap-2"
          >
            Entrer <kbd className="bg-white/20 px-2 py-0.5 rounded text-sm">F</kbd>
          </button>
        </Html>
      )}
    </group>
  )
}
