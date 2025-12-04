"use client"

import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import { useRef } from "react"
import type { AvatarStyle } from "../types"

interface RealisticAvatarProps {
  position: [number, number, number]
  avatarStyle: AvatarStyle
  isMoving: boolean
  isJumping?: boolean
}

// RealisticAvatar is only used inside Canvas
export function RealisticAvatar({
  position,
  avatarStyle,
  isMoving,
  isJumping = false,
}: RealisticAvatarProps) {
  const groupRef = useRef<THREE.Group>(null)
  const leftLegRef = useRef<THREE.Mesh>(null)
  const rightLegRef = useRef<THREE.Mesh>(null)
  const leftArmRef = useRef<THREE.Mesh>(null)
  const rightArmRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)

  const style = {
    bodyColor: avatarStyle?.bodyColor || "#3b82f6",
    headColor: avatarStyle?.headColor || "#fbbf24",
    skinTone: avatarStyle?.skinTone || avatarStyle?.headColor || "#fbbf24",
    hairStyle: avatarStyle?.hairStyle || "short",
    hairColor: avatarStyle?.hairColor || "#1f2937",
    accessory: avatarStyle?.accessory || "none",
    faceSmiley: avatarStyle?.faceSmiley || "😊",
  }

  useFrame((state, delta) => {
    if (isMoving) {
      timeRef.current += delta * 4 // Vitesse d'animation réduite (était 8)

      // Animate legs walking - amplitude réduite
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(timeRef.current) * 0.4
      if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(timeRef.current + Math.PI) * 0.4

      // Animate arms swinging (opposé aux jambes) - amplitude réduite
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(timeRef.current + Math.PI) * 0.25
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(timeRef.current) * 0.25
    } else {
      // Reset position when not moving
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Torso - height divided by 2 */}
      <mesh castShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[0.5, 0.6, 0.3]} />
        <meshStandardMaterial color={style.bodyColor} />
      </mesh>

      {/* Head */}
      <mesh castShadow position={[0, 1.8, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color={style.skinTone} />
      </mesh>

      {/* Hair */}
      {style.hairStyle === "short" && (
        <mesh castShadow position={[0, 2.05, 0]}>
          <boxGeometry args={[0.42, 0.15, 0.42]} />
          <meshStandardMaterial color={style.hairColor} />
        </mesh>
      )}
      {style.hairStyle === "long" && (
        <>
          <mesh castShadow position={[0, 2.05, 0]}>
            <boxGeometry args={[0.42, 0.15, 0.42]} />
            <meshStandardMaterial color={style.hairColor} />
          </mesh>
          <mesh castShadow position={[0, 1.7, 0.2]}>
            <boxGeometry args={[0.42, 0.4, 0.1]} />
            <meshStandardMaterial color={style.hairColor} />
          </mesh>
        </>
      )}

      {/* Left Arm */}
      <mesh ref={leftArmRef} castShadow position={[-0.35, 1.2, 0]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color={style.skinTone} />
      </mesh>

      {/* Right Arm */}
      <mesh ref={rightArmRef} castShadow position={[0.35, 1.2, 0]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color={style.skinTone} />
      </mesh>

      {/* Left Leg */}
      <mesh ref={leftLegRef} castShadow position={[-0.15, 0.65, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color={style.bodyColor} />
      </mesh>

      {/* Right Leg */}
      <mesh ref={rightLegRef} castShadow position={[0.15, 0.65, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color={style.bodyColor} />
      </mesh>

      {/* Face Smiley - positioned on the front of the head, hidden during jump */}
      {!isJumping && (
        <Html
          position={[0, 1.8, 0.35]}
          center
          distanceFactor={4}
          occlude
          zIndexRange={[0, 0]}
          style={{
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <div className="text-5xl">{style.faceSmiley}</div>
        </Html>
      )}

      {/* Accessory */}
      {style.accessory === "hat" && (
        <mesh castShadow position={[0, 2.25, 0]}>
          <cylinderGeometry args={[0.25, 0.3, 0.15, 16]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      )}
      {style.accessory === "glasses" && (
        <mesh position={[0, 1.85, 0.22]}>
          <boxGeometry args={[0.35, 0.08, 0.02]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      )}
    </group>
  )
}
