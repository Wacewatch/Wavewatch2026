"use client"

import { Text } from "@react-three/drei"
import { useEffect, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import type { Mesh, Group } from "three"

interface CinemaBuildingProps {
  position: [number, number, number]
  onEnter?: () => void
}

export function CinemaBuilding({ position, onEnter }: CinemaBuildingProps) {
  const [hovered, setHovered] = useState(false)
  const buildingRef = useRef<Mesh>(null)
  const lightsRef = useRef<Group>(null)
  const signRef = useRef<Mesh>(null)

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto"
  }, [hovered])

  useFrame((state) => {
    if (lightsRef.current) {
      lightsRef.current.children.forEach((light, i) => {
        const mesh = light as any
        if (mesh.material) {
          mesh.material.emissiveIntensity = 0.8 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.3
        }
      })
    }
    
    if (signRef.current && signRef.current.material) {
      const material = signRef.current.material as any
      material.emissiveIntensity = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.3
    }
  })

  return (
    <group position={position}>
      <mesh
        ref={buildingRef}
        position={[0, 12, 0]}
        castShadow
        receiveShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onEnter}
      >
        <boxGeometry args={[28, 24, 18]} />
        <meshStandardMaterial
          color={hovered ? "#c41e3a" : "#8b0000"}
          roughness={0.3}
          metalness={0.6}
          emissive={hovered ? "#ff4757" : "#c41e3a"}
          emissiveIntensity={hovered ? 0.5 : 0.2}
        />
      </mesh>

      {/* Glass entrance atrium */}
      <mesh position={[0, 6, 9.5]} castShadow>
        <boxGeometry args={[12, 12, 0.5]} />
        <meshStandardMaterial 
          color="#4dd0e1" 
          transparent 
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      <mesh ref={signRef} position={[0, 22, 9.2]} castShadow>
        <boxGeometry args={[20, 5, 1]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Neon border for sign */}
      <mesh position={[0, 22, 9.8]}>
        <boxGeometry args={[20.5, 5.5, 0.2]} />
        <meshStandardMaterial 
          color="#ffeb3b"
          emissive="#ffeb3b"
          emissiveIntensity={2}
          transparent
          opacity={0.8}
        />
      </mesh>

      <mesh position={[0, 6, 10]} castShadow>
        <boxGeometry args={[14, 0.4, 4]} />
        <meshStandardMaterial 
          color="#8b0000"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Canopy support pillars */}
      {[-6, 6].map((x, i) => (
        <mesh key={`pillar-${i}`} position={[x, 3, 10]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 6, 16]} />
          <meshStandardMaterial 
            color="#d4af37"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      ))}

      {[-3.5, 3.5].map((x, i) => (
        <mesh key={`door-${i}`} position={[x, 3, 9.2]}>
          <boxGeometry args={[2.5, 6, 0.3]} />
          <meshStandardMaterial 
            color="#2a2a2a" 
            metalness={0.9} 
            roughness={0.1}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* Door handles */}
      {[-2.5, 4.5].map((x, i) => (
        <mesh key={`handle-${i}`} position={[x, 3, 9.4]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
          <meshStandardMaterial 
            color="#d4af37"
            metalness={1}
            roughness={0.1}
          />
        </mesh>
      ))}

      {Array.from({ length: 8 }).map((_, i) => {
        const row = Math.floor(i / 4)
        const col = i % 4
        return (
          <mesh 
            key={`window-${i}`} 
            position={[-9 + col * 6, 14 + row * 4, 9.1]}
          >
            <boxGeometry args={[3, 2.5, 0.2]} />
            <meshStandardMaterial 
              color={i % 2 === 0 ? "#4dd0e1" : "#ff6b9d"}
              transparent 
              opacity={0.8}
              emissive={i % 2 === 0 ? "#4dd0e1" : "#ff6b9d"}
              emissiveIntensity={0.6}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        )
      })}

      <group ref={lightsRef}>
        {Array.from({ length: 20 }).map((_, i) => {
          const x = -9.5 + i * 1
          return (
            <group key={`marq uee-${i}`} position={[x, 20, 9.9]}>
              <mesh castShadow>
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshStandardMaterial 
                  color="#ffeb3b" 
                  emissive="#ffeb3b" 
                  emissiveIntensity={1.5}
                />
              </mesh>
              <pointLight intensity={3} distance={8} color="#ffeb3b" />
            </group>
          )
        })}
      </group>

      <Text
        position={[0, 22, 10.2]}
        fontSize={2.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.15}
        outlineColor="#ffeb3b"
        font="/fonts/Inter-Bold.woff"
        letterSpacing={0.1}
      >
        WAVEWATCH
      </Text>
      
      <Text
        position={[0, 19.5, 10.2]}
        fontSize={1.5}
        color="#ffeb3b"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.08}
        outlineColor="#ffffff"
        font="/fonts/Inter-Bold.woff"
      >
        CINEMA
      </Text>

      <mesh position={[0, 1.8, 9.8]} castShadow>
        <boxGeometry args={[3, 0.8, 0.15]} />
        <meshStandardMaterial 
          color="#00ff00" 
          emissive="#00ff00" 
          emissiveIntensity={1.2}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      <Text
        position={[0, 1.8, 9.9]}
        fontSize={0.4}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
        fontWeight={900}
      >
        OUVERT
      </Text>
      <pointLight position={[0, 1.8, 10.5]} intensity={5} distance={10} color="#00ff00" />

      <mesh position={[0, 0.03, 14]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 12]} />
        <meshStandardMaterial 
          color="#8b0000"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Carpet edge borders */}
      {[-4, 4].map((x, i) => (
        <mesh 
          key={`border-${i}`}
          position={[x, 0.04, 14]} 
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.3, 12]} />
          <meshStandardMaterial 
            color="#d4af37"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      ))}

      {[-5, 5].map((x, i) => (
        <group key={`stanchion-${i}`} position={[x, 0, 12]}>
          {/* Base */}
          <mesh castShadow>
            <cylinderGeometry args={[0.4, 0.5, 0.2, 16]} />
            <meshStandardMaterial 
              color="#1a1a1a"
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
          {/* Pole */}
          <mesh position={[0, 1, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 2, 16]} />
            <meshStandardMaterial 
              color="#d4af37"
              metalness={1}
              roughness={0.1}
            />
          </mesh>
          {/* Top ornament */}
          <mesh position={[0, 2.2, 0]} castShadow>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial 
              color="#d4af37"
              metalness={1}
              roughness={0.1}
            />
          </mesh>
        </group>
      ))}

      {/* Velvet rope between stanchions */}
      <mesh position={[0, 2, 12]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 10, 16]} />
        <meshStandardMaterial 
          color="#8b0000"
          roughness={0.8}
        />
      </mesh>

      {[-8, 8].map((x, i) => (
        <group key={`spotlight-${i}`} position={[x, 12, 12]}>
          <mesh rotation={[Math.PI / 4, 0, i === 0 ? Math.PI / 4 : -Math.PI / 4]} castShadow>
            <cylinderGeometry args={[0.5, 0.3, 1.5, 16]} />
            <meshStandardMaterial 
              color="#1a1a1a"
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
          <spotLight
            position={[0, 0, 0]}
            angle={Math.PI / 6}
            penumbra={0.5}
            intensity={30}
            distance={30}
            color="#ffffff"
            target-position={[0, 0, 10]}
            castShadow
          />
        </group>
      ))}
    </group>
  )
}
