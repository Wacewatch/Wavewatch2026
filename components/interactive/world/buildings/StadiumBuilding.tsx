"use client"

import { Billboard, Html } from "@react-three/drei"

interface StadiumBuildingProps {
  position: [number, number, number]
  playerPosition: { x: number; z: number }
  onEnter: () => void
}

export function StadiumBuilding({ position, playerPosition, onEnter }: StadiumBuildingProps) {
  const [buildingX, , buildingZ] = position
  const distanceToBuilding = Math.sqrt(
    Math.pow(playerPosition.x - buildingX, 2) + Math.pow(playerPosition.z - buildingZ, 2)
  )
  const isNearby = distanceToBuilding < 8

  return (
    <group position={position}>
      <mesh position={[0, 3.5, 0]} castShadow>
        <boxGeometry args={[12, 7, 10]} />
        <meshStandardMaterial color="#16a34a" roughness={0.7} metalness={0.1} />
      </mesh>

      <mesh position={[0, 7.5, 0]} castShadow>
        <boxGeometry args={[12.5, 0.5, 10.5]} />
        <meshStandardMaterial color="#15803d" roughness={0.6} metalness={0.2} />
      </mesh>

      <mesh position={[0, 8, 0]}>
        <boxGeometry args={[10, 0.6, 0.3]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={1.5}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
      <pointLight position={[0, 8, 0]} intensity={2} distance={12} color="#fbbf24" />

      {/* Building name - always visible and clickable */}
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <Html position={[0, 9, 0]} center zIndexRange={[0, 0]}>
          <button
            onClick={onEnter}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-2xl font-bold text-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-105 pointer-events-auto whitespace-nowrap"
          >
            stade
          </button>
        </Html>
      </Billboard>

      {/* Entry button visible when nearby */}
      {isNearby && (
        <Html position={[0, 2, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
          <button
            onClick={onEnter}
            className="bg-green-600/90 backdrop-blur-sm hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-2xl text-base font-bold transition-all hover:scale-110 border-2 border-white/30 flex items-center gap-2"
          >
            Entrer <kbd className="bg-white/20 px-2 py-0.5 rounded text-sm">F</kbd>
          </button>
        </Html>
      )}
    </group>
  )
}
