'use client'

import { useState, useRef, useEffect } from 'react'

interface MobileJoystickProps {
  onMove: (dx: number, dz: number) => void
  onStop: () => void
  className?: string
}

export default function MobileJoystick({ onMove, onStop, className = '' }: MobileJoystickProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const animate = () => {
      const maxDistance = 50
      if (isDragging) {
        onMove(joystickPosition.x / maxDistance, joystickPosition.y / maxDistance)
        animationRef.current = requestAnimationFrame(animate)
      } else {
        onMove(0, 0)
      }
    }

    if (isDragging) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      onStop()
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isDragging, joystickPosition.x, joystickPosition.y, onMove, onStop])

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true)
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    let dx = clientX - centerX
    let dy = clientY - centerY

    const distance = Math.sqrt(dx * dx + dy * dy)
    const maxDistance = 50

    if (distance > maxDistance) {
      dx = (dx / distance) * maxDistance
      dy = (dy / distance) * maxDistance
    }

    setJoystickPosition({ x: dx, y: dy })
  }

  const handleEnd = () => {
    setIsDragging(false)
    setJoystickPosition({ x: 0, y: 0 })
  }

  return (
    <div
      ref={containerRef}
      className={`${className} w-32 h-32 bg-white/20 backdrop-blur-lg rounded-full border-4 border-white/30 touch-none select-none`}
      onTouchStart={(e) => {
        e.preventDefault()
        handleStart(e.touches[0].clientX, e.touches[0].clientY)
      }}
      onTouchMove={(e) => {
        e.preventDefault()
        if (isDragging) handleMove(e.touches[0].clientX, e.touches[0].clientY)
      }}
      onTouchEnd={handleEnd}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => isDragging && handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      <div
        className="absolute w-12 h-12 bg-white/70 rounded-full top-1/2 left-1/2 shadow-lg transition-transform pointer-events-none"
        style={{
          transform: `translate(calc(-50% + ${joystickPosition.x}px), calc(-50% + ${joystickPosition.y}px))`
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-white/60 text-xs font-medium pointer-events-none">
        Déplacer
      </div>
    </div>
  )
}
