"use client"

import { useRef, useMemo } from "react"
import { Html, Text } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { DEFAULT_SPAWN_POSITION } from "../constants"

interface DiscoBuildingProps {
  position: [number, number, number]
  playerPosition: { x: number; z: number }
  onEnter: () => void
}

export function DiscoBuilding({ position, playerPosition, onEnter }: DiscoBuildingProps) {
  const [buildingX, , buildingZ] = position

  // Calculate rotation to face spawn point
  const signRotation = useMemo(() => {
    const dx = DEFAULT_SPAWN_POSITION.x - buildingX
    const dz = DEFAULT_SPAWN_POSITION.z - buildingZ
    return Math.atan2(dx, dz)
  }, [buildingX, buildingZ])
  const distanceToBuilding = Math.sqrt(
    Math.pow(playerPosition.x - buildingX, 2) + Math.pow(playerPosition.z - buildingZ, 2)
  )
  const isNearby = distanceToBuilding < 8

  // Refs for animated elements
  const discoBallRef = useRef<THREE.Mesh>(null)
  const spotLight1Ref = useRef<THREE.SpotLight>(null)
  const spotLight2Ref = useRef<THREE.SpotLight>(null)
  const spotLight3Ref = useRef<THREE.SpotLight>(null)
  const floorLightRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // Rotating disco ball
    if (discoBallRef.current) {
      discoBallRef.current.rotation.y = time * 0.5
      discoBallRef.current.rotation.x = Math.sin(time * 0.3) * 0.1
    }

    // Moving spotlights (lights spilling outside)
    if (spotLight1Ref.current) {
      spotLight1Ref.current.target.position.x = Math.sin(time * 2) * 8
      spotLight1Ref.current.target.position.z = Math.cos(time * 2) * 8
      spotLight1Ref.current.target.updateMatrixWorld()
    }
    if (spotLight2Ref.current) {
      spotLight2Ref.current.target.position.x = Math.sin(time * 2 + Math.PI * 0.66) * 8
      spotLight2Ref.current.target.position.z = Math.cos(time * 2 + Math.PI * 0.66) * 8
      spotLight2Ref.current.target.updateMatrixWorld()
    }
    if (spotLight3Ref.current) {
      spotLight3Ref.current.target.position.x = Math.sin(time * 2 + Math.PI * 1.33) * 8
      spotLight3Ref.current.target.position.z = Math.cos(time * 2 + Math.PI * 1.33) * 8
      spotLight3Ref.current.target.updateMatrixWorld()
    }

    // Floor lights color cycling
    if (floorLightRef.current) {
      floorLightRef.current.children.forEach((child, idx) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial
          const hue = ((time * 0.3 + idx * 0.15) % 1)
          mat.color.setHSL(hue, 1, 0.5)
          mat.emissive.setHSL(hue, 1, 0.4)
          mat.emissiveIntensity = 1 + Math.sin(time * 6 + idx) * 0.3
        }
      })
    }
  })

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

      {/* ============= DISCO SIGN (FACING SPAWN) ============= */}
      <group position={[0, 7.5, 0]} rotation={[0, signRotation, 0]}>
        <group position={[0, 0, 5]}>
          {/* Sign backing */}
          <mesh>
            <boxGeometry args={[5, 1.5, 0.2]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
          </mesh>

          {/* DISCO text */}
          <Text
            position={[0, 0, 0.15]}
            fontSize={0.8}
            color="#ff00ff"
            anchorX="center"
            anchorY="middle"
          >
            DISCO
          </Text>
        </group>
      </group>

      {/* ============= DISCO BALL (ROTATING) ============= */}
      <mesh ref={discoBallRef} position={[0, 7.8, 0]}>
        <sphereGeometry args={[0.8, 24, 24]} />
        <meshStandardMaterial
          color="#e0e0e0"
          emissive="#ffffff"
          emissiveIntensity={0.8}
          metalness={1}
          roughness={0}
        />
      </mesh>
      <pointLight position={[0, 7.8, 0]} intensity={3} distance={15} color="#ffffff" />

      {/* ============= SPOTLIGHTS SPILLING OUTSIDE ============= */}
      <spotLight
        ref={spotLight1Ref}
        position={[0, 7, 0]}
        angle={0.5}
        penumbra={0.8}
        intensity={4}
        distance={20}
        color="#ff00ff"
      />
      <spotLight
        ref={spotLight2Ref}
        position={[0, 7, 0]}
        angle={0.5}
        penumbra={0.8}
        intensity={4}
        distance={20}
        color="#00ffff"
      />
      <spotLight
        ref={spotLight3Ref}
        position={[0, 7, 0]}
        angle={0.5}
        penumbra={0.8}
        intensity={4}
        distance={20}
        color="#ffff00"
      />

      {/* ============= FLOOR LIGHTS (SPILLING OUTSIDE) ============= */}
      <group ref={floorLightRef}>
        {Array.from({ length: 8 }).map((_, idx) => {
          const angle = (idx / 8) * Math.PI * 2
          const radius = 6
          const x = Math.cos(angle) * radius
          const z = Math.sin(angle) * radius
          return (
            <mesh key={`floor-light-${idx}`} position={[x, 0.05, z]}>
              <cylinderGeometry args={[0.3, 0.3, 0.1, 12]} />
              <meshStandardMaterial
                color="#ff00ff"
                emissive="#ff00ff"
                emissiveIntensity={1}
              />
            </mesh>
          )
        })}
      </group>

      {/* ============= VELVET ROPE QUEUE ============= */}
      {/* Queue posts */}
      {[[6.5, 4], [6.5, 0], [8, 4], [8, 0], [9.5, 4], [9.5, 0]].map(([x, z], idx) => (
        <group key={`queue-post-${idx}`} position={[x, 0, z]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 1, 12]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 1.05, 0]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Velvet ropes */}
      {[[6.5, 4, 0], [8, 4, 0], [6.5, 0, 0], [8, 0, 0]].map(([x, z], idx) => (
        <mesh key={`rope-${idx}`} position={[x + 0.75, 0.7, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
          <meshStandardMaterial color="#800020" roughness={0.8} metalness={0.1} />
        </mesh>
      ))}

      {/* Queue path markings */}
      <mesh position={[7.5, 0.01, 2]}>
        <boxGeometry args={[3, 0.02, 4.5]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} metalness={0} />
      </mesh>

      {/* ============= DECORATIVE WINDOWS WITH NEON GLOW ============= */}
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

      {/* Side windows with light spill */}
      {[-3, 0, 3].map((z) => (
        <group key={`side-window-${z}`}>
          <mesh position={[5.1, 3, z]}>
            <planeGeometry args={[1.5, 2]} />
            <meshStandardMaterial
              color="#ff00ff"
              emissive="#ff00ff"
              emissiveIntensity={0.6}
              metalness={0.7}
              roughness={0.2}
            />
          </mesh>
          <pointLight position={[6, 3, z]} intensity={1} distance={5} color="#ff00ff" />
        </group>
      ))}

      {/* ============= ENTRANCE ============= */}
      {/* Door with neon frame */}
      <mesh position={[5.1, 1.5, 2]} castShadow rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[2, 3, 0.1]} />
        <meshStandardMaterial color="#2d1b2e" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Neon door frame */}
      <mesh position={[5.18, 1.5, 2]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[2.3, 3.3, 0.05]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={1.5}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
      {/* Door handle */}
      <mesh position={[5.2, 1.2, 2.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Entrance steps with LED */}
      <mesh position={[6, 0.1, 2]}>
        <boxGeometry args={[1.5, 0.2, 2.5]} />
        <meshStandardMaterial color="#4a4a5a" roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[5.5, 0.22, 2]}>
        <boxGeometry args={[0.5, 0.05, 2.3]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* ============= EXTERIOR DECORATION ============= */}
      {/* Neon strips on building edges */}
      <mesh position={[-5.1, 3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[5.5, 0.1, 0.1]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={1.2}
        />
      </mesh>
      <mesh position={[5.1, 3, -4]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[5.5, 0.1, 0.1]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* Original neon sign */}
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

      {/* Entry button visible when nearby */}
      {isNearby && (
        <Html position={[0, 2, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
          <button
            onClick={onEnter}
            className="bg-pink-600/90 backdrop-blur-sm hover:bg-pink-700 text-white px-4 py-2 rounded-lg shadow-2xl text-sm font-bold transition-all hover:scale-110 border-2 border-white/30 flex items-center gap-2"
          >
            Entrer <kbd className="bg-white/20 px-1.5 py-0.5 rounded text-xs">F</kbd>
          </button>
        </Html>
      )}
    </group>
  )
}
