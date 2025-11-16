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
  const leftArmRef = useRef<any>(null)
  const rightArmRef = useRef<any>(null)
  const leftLegRef = useRef<any>(null)
  const rightLegRef = useRef<any>(null)
  
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
    const time = state.clock.elapsedTime
    
    if (isPlayer) {
      // Breathing effect on head
      if (headRef.current) {
        headRef.current.position.y = 1.5 + Math.sin(time * 2) * 0.02
      }
      
      // Slight arm sway
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = Math.sin(time * 1.5) * 0.1
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = -Math.sin(time * 1.5) * 0.1
      }
    }
  })

  return (
    <group 
      ref={groupRef}
      position={[position.x, position.y, position.z]} 
      rotation={[0, rotation, 0]}
    >
      {/* Torso */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.8, 0.35]} />
        <meshStandardMaterial 
          color={topColor}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.15, 16]} />
        <meshStandardMaterial 
          color={skinColor}
          roughness={0.5}
        />
      </mesh>

      <mesh ref={headRef} position={[0, 1.5, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial 
          color={skinColor}
          roughness={0.4}
          metalness={0.05}
        />
      </mesh>

      {style?.hairStyle !== "bald" && (
        <>
          {style?.hairStyle === "short" && (
            <mesh position={[0, 1.75, 0]} castShadow>
              <sphereGeometry args={[0.37, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
              <meshStandardMaterial 
                color={hairColor}
                roughness={0.95}
              />
            </mesh>
          )}
          
          {style?.hairStyle === "long" && (
            <>
              <mesh position={[0, 1.75, 0]} castShadow>
                <sphereGeometry args={[0.37, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
                <meshStandardMaterial color={hairColor} roughness={0.95} />
              </mesh>
              <mesh position={[0, 1.2, -0.25]} castShadow>
                <boxGeometry args={[0.7, 0.8, 0.2]} />
                <meshStandardMaterial color={hairColor} roughness={0.95} />
              </mesh>
            </>
          )}
          
          {style?.hairStyle === "curly" && (
            <>
              <mesh position={[0, 1.75, 0]} castShadow>
                <sphereGeometry args={[0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
                <meshStandardMaterial color={hairColor} roughness={1} />
              </mesh>
            </>
          )}
        </>
      )}

      {[-0.12, 0.12].map((x, i) => (
        <group key={`eye-${i}`} position={[x, 1.55, 0.3]}>
          <mesh>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial 
              color="#ffffff"
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </group>
      ))}

      {/* Nose */}
      <mesh position={[0, 1.48, 0.32]} castShadow>
        <coneGeometry args={[0.06, 0.15, 8]} />
        <meshStandardMaterial 
          color={skinColor}
          roughness={0.5}
        />
      </mesh>

      {/* Mouth */}
      <mesh position={[0, 1.38, 0.32]}>
        <boxGeometry args={[0.15, 0.02, 0.01]} />
        <meshStandardMaterial color="#8b4545" />
      </mesh>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.35, 1.1, 0]}>
        {/* Shoulder */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={topColor} roughness={0.7} />
        </mesh>
        {/* Upper arm */}
        <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.08, 0.4, 8, 16]} />
          <meshStandardMaterial color={topColor} roughness={0.7} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.65, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.07, 0.35, 8, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.9, 0]} castShadow>
          <boxGeometry args={[0.12, 0.15, 0.08]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.35, 1.1, 0]}>
        <mesh position={[0, 0.05, 0]} castShadow>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={topColor} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.08, 0.4, 8, 16]} />
          <meshStandardMaterial color={topColor} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.65, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.07, 0.35, 8, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.9, 0]} castShadow>
          <boxGeometry args={[0.12, 0.15, 0.08]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>
      </group>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.15, 0.5, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.11, 0.5, 8, 16]} />
          <meshStandardMaterial color={bottomColor} roughness={0.7} />
        </mesh>
        {/* Calf */}
        <mesh position={[0, -0.75, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.09, 0.45, 8, 16]} />
          <meshStandardMaterial color={bottomColor} roughness={0.7} />
        </mesh>
        {/* Foot */}
        <mesh position={[0, -1.05, 0.08]} castShadow>
          <boxGeometry args={[0.15, 0.1, 0.28]} />
          <meshStandardMaterial color={shoeColor} roughness={0.8} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.15, 0.5, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.11, 0.5, 8, 16]} />
          <meshStandardMaterial color={bottomColor} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.75, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.09, 0.45, 8, 16]} />
          <meshStandardMaterial color={bottomColor} roughness={0.7} />
        </mesh>
        <mesh position={[0, -1.05, 0.08]} castShadow>
          <boxGeometry args={[0.15, 0.1, 0.28]} />
          <meshStandardMaterial color={shoeColor} roughness={0.8} />
        </mesh>
      </group>

      {accessory === "sunglasses" && (
        <group position={[0, 1.55, 0.28]}>
          <mesh>
            <boxGeometry args={[0.35, 0.08, 0.02]} />
            <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[-0.125, 0, 0.025]} rotation={[0, -0.1, 0]}>
            <boxGeometry args={[0.12, 0.08, 0.05]} />
            <meshStandardMaterial 
              color="#1a1a1a" 
              transparent 
              opacity={0.3} 
              metalness={0.5} 
            />
          </mesh>
          <mesh position={[0.125, 0, 0.025]} rotation={[0, 0.1, 0]}>
            <boxGeometry args={[0.12, 0.08, 0.05]} />
            <meshStandardMaterial 
              color="#1a1a1a" 
              transparent 
              opacity={0.3} 
              metalness={0.5} 
            />
          </mesh>
        </group>
      )}

      {accessory === "cap" && (
        <group position={[0, 1.8, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.38, 0.35, 0.15, 24]} />
            <meshStandardMaterial color="#ff0080" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.35]} rotation={[-0.3, 0, 0]} castShadow>
            <boxGeometry args={[0.5, 0.02, 0.25]} />
            <meshStandardMaterial color="#ff0080" roughness={0.8} />
          </mesh>
        </group>
      )}

      {accessory === "headphones" && (
        <group position={[0, 1.6, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <torusGeometry args={[0.38, 0.05, 12, 24, Math.PI]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
          </mesh>
          {[-0.35, 0.35].map((x, i) => (
            <mesh key={`earpad-${i}`} position={[x, 0, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
        </group>
      )}

      {roleConfig && (
        <>
          <mesh position={[0, 2.2, 0]}>
            <boxGeometry args={[0.8, 0.25, 0.03]} />
            <meshStandardMaterial 
              color={roleConfig.color}
              emissive={roleConfig.glowColor}
              emissiveIntensity={roleConfig.glowIntensity}
            />
          </mesh>

          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 2, 24, 1, true]} />
            <meshStandardMaterial 
              color={roleConfig.glowColor}
              transparent
              opacity={0.1}
              side={THREE.DoubleSide}
              emissive={roleConfig.glowColor}
              emissiveIntensity={0.3}
            />
          </mesh>

          <pointLight 
            position={[0, 2.2, 0]} 
            intensity={roleConfig.glowIntensity * 2} 
            color={roleConfig.glowColor} 
            distance={6} 
          />
        </>
      )}

      {userRole === "admin" && (accessory === "admin_crown" || accessory === "admin_aura") && (
        <mesh position={[0, 2.0, 0]} castShadow rotation={[0, 0, 0]}>
          <coneGeometry args={[0.3, 0.35, 6]} />
          <meshStandardMaterial 
            color="#ffd700"
            metalness={1}
            roughness={0.05}
            emissive="#ffd700"
            emissiveIntensity={1.5}
          />
        </mesh>
      )}

      {userRole === "vip_plus" && accessory === "vip_plus_crown" && (
        <mesh position={[0, 2.0, 0]} castShadow>
          <coneGeometry args={[0.28, 0.32, 6]} />
          <meshStandardMaterial 
            color="#a855f7"
            metalness={0.95}
            roughness={0.1}
            emissive="#a855f7"
            emissiveIntensity={1.2}
          />
        </mesh>
      )}

      {userRole === "vip" && accessory === "vip_badge" && (
        <mesh position={[0.3, 0.9, 0.2]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.03, 16]} />
          <meshStandardMaterial 
            color="#fbbf24"
            metalness={0.95}
            roughness={0.15}
            emissive="#fbbf24"
            emissiveIntensity={0.8}
          />
        </mesh>
      )}

      {isPlayer && (
        <pointLight 
          position={[0, 1.5, 0]} 
          intensity={1.5} 
          distance={4}
          color="#4dabf7"
        />
      )}
    </group>
  )
}
