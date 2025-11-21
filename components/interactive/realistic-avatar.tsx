"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import type * as THREE from "three"

interface RealisticAvatarProps {
  position: [number, number, number]
  avatarStyle: {
    bodyColor?: string
    headColor?: string
    skinTone?: string
    hairStyle?: string
    hairColor?: string
    accessory?: string
    faceSmiley?: string
  }
  isMoving: boolean
}

export default function RealisticAvatar({ position, avatarStyle, isMoving }: RealisticAvatarProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [time, setTime] = useState(0)

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
    if (isMoving && groupRef.current) {
      setTime((t) => t + delta * 5)
      // Animate legs walking
      const leftLeg = groupRef.current.children[3]
      const rightLeg = groupRef.current.children[4]
      if (leftLeg) leftLeg.rotation.x = Math.sin(time) * 0.5
      if (rightLeg) rightLeg.rotation.x = Math.sin(time + Math.PI) * 0.5

      // Animate arms swinging
      const leftArm = groupRef.current.children[1]
      const rightArm = groupRef.current.children[2]
      if (leftArm) leftArm.rotation.x = Math.sin(time + Math.PI) * 0.3
      if (rightArm) rightArm.rotation.x = Math.sin(time) * 0.3
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
      <mesh castShadow position={[-0.35, 1.2, 0]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color={style.skinTone} />
      </mesh>

      {/* Right Arm */}
      <mesh castShadow position={[0.35, 1.2, 0]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color={style.skinTone} />
      </mesh>

      {/* Left Leg */}
      <mesh castShadow position={[-0.15, 0.65, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color={style.bodyColor} />
      </mesh>

      {/* Right Leg */}
      <mesh castShadow position={[0.15, 0.65, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color={style.bodyColor} />
      </mesh>

      {/* Face Smiley */}
      <Html
        position={[0, 1.8, 0.21]}
        center
        distanceFactor={1}
        style={{
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <div className="text-2xl">{style.faceSmiley}</div>
      </Html>

      {/* Accessory */}
      {style.accessory === "hat" && (
        <mesh castShadow position={[0, 2.25, 0]}>
          <cylinderGeometry args={[0.25, 0.3, 0.15, 16]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      )}
      {style.accessory === "glasses" && (
        <>
          <mesh position={[-0.15, 1.8, 0.21]}>
            <torusGeometry args={[0.08, 0.02, 8, 16]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
          <mesh position={[0.15, 1.8, 0.21]}>
            <torusGeometry args={[0.08, 0.02, 8, 16]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        </>
      )}
    </group>
  )
}
