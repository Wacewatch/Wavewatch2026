'use client'

import { Html } from '@react-three/drei'
import { useState } from 'react'
import { Trophy } from 'lucide-react'

interface StadiumBuildingProps {
  position: [number, number, number]
  onEnter: () => void
}

export function StadiumBuilding({ position, onEnter }: StadiumBuildingProps) {
  const [hovered, setHovered] = useState(false)
  
  return (
    <group position={position}>
      {/* Base du stade - structure ovale */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[8, 8, 6, 32]} />
        <meshStandardMaterial 
          color={hovered ? "#16a34a" : "#15803d"} 
          emissive={hovered ? "#16a34a" : "#000000"}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Toit du stade */}
      <mesh position={[0, 6.5, 0]}>
        <cylinderGeometry args={[9, 8.5, 1, 32]} />
        <meshStandardMaterial color="#0f766e" />
      </mesh>
      
      {/* Enseigne STADE */}
      <mesh position={[0, 7.5, 0]}>
        <boxGeometry args={[6, 1, 0.2]} />
        <meshStandardMaterial 
          color="#fbbf24" 
          emissive="#fbbf24"
          emissiveIntensity={1}
        />
      </mesh>
      
      {/* Entrée du stade */}
      <mesh 
        position={[0, 1.5, 8.01]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={onEnter}
      >
        <boxGeometry args={[3, 3, 0.1]} />
        <meshStandardMaterial color="#0f766e" />
      </mesh>
      
      {/* Écrans LED autour du stade */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <mesh 
          key={i} 
          position={[
            Math.sin(angle) * 8.1,
            4,
            Math.cos(angle) * 8.1
          ]}
          rotation={[0, -angle, 0]}
        >
          <boxGeometry args={[4, 2, 0.1]} />
          <meshStandardMaterial 
            color="#60a5fa" 
            emissive="#60a5fa"
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
      
      {/* Panneau interactif */}
      {hovered && (
        <Html position={[0, 2, 9]} center>
          <div className="bg-black/80 backdrop-blur-lg text-white px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap pointer-events-none">
            <Trophy className="w-4 h-4" />
            <span>Cliquez pour entrer au Stade</span>
          </div>
        </Html>
      )}
      
      {/* Lumières extérieures */}
      <pointLight position={[0, 2, 9]} intensity={2} distance={5} color="#fbbf24" />
      <pointLight position={[-8, 5, 0]} intensity={2} distance={10} color="#16a34a" />
      <pointLight position={[8, 5, 0]} intensity={2} distance={10} color="#16a34a" />
      <pointLight position={[0, 5, -8]} intensity={2} distance={10} color="#16a34a" />
    </group>
  )
}
