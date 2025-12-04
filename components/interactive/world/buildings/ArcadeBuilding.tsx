"use client"

import { Billboard, Html } from "@react-three/drei"

interface ArcadeBuildingProps {
  position: [number, number, number]
  playerPosition: { x: number; z: number }
  onEnter: () => void
}

export function ArcadeBuilding({ position, playerPosition, onEnter }: ArcadeBuildingProps) {
  const [buildingX, , buildingZ] = position
  const distanceToBuilding = Math.sqrt(
    Math.pow(playerPosition.x - buildingX, 2) + Math.pow(playerPosition.z - buildingZ, 2)
  )
  const isNearby = distanceToBuilding < 8

  return (
    <group position={position}>
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[10, 6, 10]} />
        <meshStandardMaterial color="#8b5cf6" roughness={0.7} metalness={0.2} />
      </mesh>

      <mesh position={[0, 6.5, 0]} castShadow>
        <boxGeometry args={[10.5, 0.5, 10.5]} />
        <meshStandardMaterial color="#6b21a8" roughness={0.6} metalness={0.3} />
      </mesh>

      <mesh position={[0, 7, 0]}>
        <boxGeometry args={[8, 0.6, 0.3]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={1.5}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
      <pointLight position={[0, 7, 0]} intensity={2} distance={10} color="#f59e0b" />

      {/* Building name - always visible and clickable */}
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <Html position={[0, 8, 0]} center zIndexRange={[0, 0]}>
          <button
            onClick={onEnter}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl shadow-2xl font-bold text-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-105 pointer-events-auto whitespace-nowrap"
          >
            arcade
          </button>
        </Html>
      </Billboard>

      {/* Entry button visible when nearby */}
      {isNearby && (
        <Html position={[0, 2, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
          <button
            onClick={onEnter}
            className="bg-purple-600/90 backdrop-blur-sm hover:bg-purple-700 text-white px-6 py-3 rounded-lg shadow-2xl text-base font-bold transition-all hover:scale-110 border-2 border-white/30 flex items-center gap-2"
          >
            Entrer <kbd className="bg-white/20 px-2 py-0.5 rounded text-sm">F</kbd>
          </button>
        </Html>
      )}
    </group>
  )
}
