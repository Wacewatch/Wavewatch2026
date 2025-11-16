"use client"

import { Text } from "@react-three/drei"
import { useEffect, useState } from "react"

interface ChatBubble3DProps {
  position: [number, number, number]
  message: string
  username: string
  onExpire?: () => void
}

export function ChatBubble3D({ position, message, username, onExpire }: ChatBubble3DProps) {
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    // Fade out after 8 seconds
    const fadeTimer = setTimeout(() => {
      const interval = setInterval(() => {
        setOpacity((prev) => {
          const newOpacity = prev - 0.05
          if (newOpacity <= 0) {
            clearInterval(interval)
            onExpire?.()
            return 0
          }
          return newOpacity
        })
      }, 50)
    }, 8000)

    return () => clearTimeout(fadeTimer)
  }, [onExpire])

  // Calculate bubble size based on message length
  const messageLength = message.length
  const bubbleWidth = Math.min(Math.max(messageLength * 0.15, 2), 6)
  const bubbleHeight = Math.max(Math.ceil(messageLength / 30) * 0.6, 0.8)

  return (
    <group position={position}>
      {/* Speech bubble background */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[bubbleWidth, bubbleHeight, 0.1]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={opacity * 0.95} />
      </mesh>

      {/* Border */}
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[bubbleWidth + 0.1, bubbleHeight + 0.1, 0.05]} />
        <meshBasicMaterial color="#333333" transparent opacity={opacity * 0.8} />
      </mesh>

      {/* Speech bubble pointer (triangle) */}
      <mesh position={[0, -bubbleHeight / 2 - 0.15, -0.05]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.2, 0.3, 3]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={opacity * 0.95} />
      </mesh>

      {/* Username */}
      <Text
        position={[0, bubbleHeight / 2 - 0.15, 0]}
        fontSize={0.15}
        color="#666666"
        anchorX="center"
        anchorY="middle"
        maxWidth={bubbleWidth - 0.2}
        font="/fonts/Inter-Bold.woff"
        fillOpacity={opacity}
      >
        {username}
      </Text>

      {/* Message text */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.2}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        maxWidth={bubbleWidth - 0.3}
        font="/fonts/Inter-Regular.woff"
        fillOpacity={opacity}
        textAlign="center"
      >
        {message}
      </Text>
    </group>
  )
}
