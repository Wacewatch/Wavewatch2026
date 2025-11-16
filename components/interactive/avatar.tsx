"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"
import * as THREE from "three"

interface AvatarProps {
  position: { x: number; y: number; z: number }
  rotation: number
  color: string
  isPlayer: boolean
  style?: any
  userRole?: "admin" | "vip_plus" | "vip" | "member"
}

export function Avatar({ position, rotation, color, isPlayer, style, userRole = "member" }: AvatarProps) {
  const groupRef = useRef<Group>(null)
  const headRef = useRef<any>(null)
  
  const skinColor = style?.skinTone || "#fdbcb4"
  const hairColor = style?.hairColor || "#3d2817"
  const topColor = style?.topColor || color
  const bottomColor = style?.bottomColor || "#2c3e50"
  const shoeColor = style?.shoeColor || "#1a1a1a"
  const accessory = style?.accessory || "none"
  
  const roleConfig = useMemo(() => {
    switch (userRole) {
      case "admin":
        return { color: "#ff0000", glowIntensity: 2, glowColor: "#ff0000", label: "ADMIN" }
      case "vip_plus":
        return { color: "#a855f7", glowIntensity: 1.5, glowColor: "#a855f7", label: "VIP+" }
      case "vip":
        return { color: "#fbbf24", glowIntensity: 1, glowColor: "#fbbf24", label: "VIP" }
      default:
        return null
    }
  }, [userRole])
  
  useFrame((state) => {
    if (headRef.current && isPlayer) {
      headRef.current.position.y = 0.9 + Math.sin(state.clock.elapsedTime * 2) * 0.03
    }
  })

  return (
    <group 
      ref={groupRef}
      position={[position.x, position.y + 1, position.z]} 
      rotation={[0, rotation, 0]}
    >
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 1.3, 0.45]} />
        <meshStandardMaterial 
          color={topColor}
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      <mesh ref={headRef} position={[0, 0.9, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial 
          color={skinColor}
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      {style?.hairStyle !== "bald" && (
        <mesh position={[0, 1.25, 0]} castShadow>
          <sphereGeometry args={[0.47, 16, 16]} />
          <meshStandardMaterial 
            color={hairColor}
            roughness={0.9}
          />
        </mesh>
      )}

      {/* Eyes */}
      {[-0.15, 0.15].map((x, i) => (
        <mesh key={`eye-${i}`} position={[x, 0.95, 0.4]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial 
            color="#ffffff"
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      ))}
      
      {/* Pupils */}
      {[-0.15, 0.15].map((x, i) => (
        <mesh key={`pupil-${i}`} position={[x, 0.95, 0.45]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      ))}

      {/* Nose */}
      <mesh position={[0, 0.9, 0.42]} castShadow>
        <coneGeometry args={[0.12, 0.25, 16]} />
        <meshStandardMaterial 
          color={skinColor}
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      {/* Arms */}
      {[-0.5, 0.5].map((x, i) => (
        <mesh key={`arm-${i}`} position={[x, 0, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.12, 1, 8, 16]} />
          <meshStandardMaterial 
            color={topColor}
            roughness={0.6}
            metalness={0.2}
          />
        </mesh>
      ))}

      {[-0.22, 0.22].map((x, i) => (
        <mesh key={`leg-${i}`} position={[x, -0.9, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.13, 0.9, 8, 16]} />
          <meshStandardMaterial 
            color={bottomColor}
            roughness={0.6}
            metalness={0.2}
          />
        </mesh>
      ))}

      {[-0.22, 0.22].map((x, i) => (
        <mesh key={`shoe-${i}`} position={[x, -1.45, 0.1]} castShadow>
          <boxGeometry args={[0.15, 0.1, 0.35]} />
          <meshStandardMaterial 
            color={shoeColor}
            roughness={0.6}
          />
        </mesh>
      ))}

      {accessory === "sunglasses" && (
        <mesh position={[0, 1.0, 0.4]} castShadow>
          <boxGeometry args={[0.5, 0.1, 0.05]} />
          <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.1} />
        </mesh>
      )}

      {accessory === "cap" && (
        <mesh position={[0, 1.4, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.4, 0.2, 16]} />
          <meshStandardMaterial color="#ff0080" roughness={0.7} />
        </mesh>
      )}

      {accessory === "headphones" && (
        <>
          <mesh position={[0, 1.1, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <torusGeometry args={[0.5, 0.08, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
          </mesh>
          {[-0.4, 0.4].map((x, i) => (
            <mesh key={`earpad-${i}`} position={[x, 1.0, 0]} castShadow>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
        </>
      )}

      {roleConfig && (
        <>
          {/* Badge above head */}
          <mesh position={[0, 1.8, 0]}>
            <boxGeometry args={[1.0, 0.3, 0.05]} />
            <meshStandardMaterial 
              color={roleConfig.color}
              emissive={roleConfig.glowColor}
              emissiveIntensity={roleConfig.glowIntensity}
            />
          </mesh>

          {/* Glow effect around avatar */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 2.5, 16, 1, true]} />
            <meshStandardMaterial 
              color={roleConfig.glowColor}
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
              emissive={roleConfig.glowColor}
              emissiveIntensity={0.4}
            />
          </mesh>

          {/* Spotlight effect */}
          <pointLight 
            position={[0, 2.0, 0]} 
            intensity={roleConfig.glowIntensity * 3} 
            color={roleConfig.glowColor} 
            distance={8} 
          />
        </>
      )}

      {userRole === "admin" && (accessory === "admin_crown" || accessory === "admin_aura") && (
        <mesh position={[0, 1.6, 0]} castShadow rotation={[0, 0, 0]}>
          <coneGeometry args={[0.35, 0.4, 6]} />
          <meshStandardMaterial 
            color="#ffd700"
            metalness={1}
            roughness={0.1}
            emissive="#ffd700"
            emissiveIntensity={1.5}
          />
        </mesh>
      )}

      {userRole === "vip_plus" && accessory === "vip_plus_crown" && (
        <mesh position={[0, 1.6, 0]} castShadow>
          <coneGeometry args={[0.3, 0.35, 6]} />
          <meshStandardMaterial 
            color="#a855f7"
            metalness={0.9}
            roughness={0.2}
            emissive="#a855f7"
            emissiveIntensity={1}
          />
        </mesh>
      )}

      {userRole === "vip" && accessory === "vip_badge" && (
        <mesh position={[0.35, 0.5, 0.25]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
          <meshStandardMaterial 
            color="#fbbf24"
            metalness={0.9}
            roughness={0.2}
            emissive="#fbbf24"
            emissiveIntensity={0.8}
          />
        </mesh>
      )}

      {isPlayer && (
        <pointLight 
          position={[0, 1, 0]} 
          intensity={2} 
          distance={5}
          color="#4dabf7"
        />
      )}
    </group>
  )
}
