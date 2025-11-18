'use client'

import { useEffect, useRef } from 'react'

interface MobileJoystickProps {
  onMove: (x: number, z: number) => void
}

export function MobileJoystick({ onMove }: MobileJoystickProps) {
  const joystickRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  useEffect(() => {
    const joystick = joystickRef.current
    const knob = knobRef.current
    if (!joystick || !knob) return

    const handleStart = (clientX: number, clientY: number) => {
      isDragging.current = true
      handleMove(clientX, clientY)
    }

    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging.current) return

      const rect = joystick.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const maxDistance = rect.width / 2

      let deltaX = clientX - centerX
      let deltaY = clientY - centerY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      if (distance > maxDistance) {
        deltaX = (deltaX / distance) * maxDistance
        deltaY = (deltaY / distance) * maxDistance
      }

      const knobX = deltaX
      const knobY = deltaY

      knob.style.transform = `translate(${knobX}px, ${knobY}px)`

      const normalizedX = -deltaX / maxDistance // Inversé pour gauche/droite
      const normalizedZ = -deltaY / maxDistance // Inversé pour haut/bas

      onMove(normalizedX, normalizedZ)
    }

    const handleEnd = () => {
      isDragging.current = false
      knob.style.transform = 'translate(0px, 0px)'
      onMove(0, 0)
    }

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      handleStart(touch.clientX, touch.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      handleMove(touch.clientX, touch.clientY)
    }

    const handleMouseDown = (e: MouseEvent) => {
      handleStart(e.clientX, e.clientY)
    }

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY)
    }

    joystick.addEventListener('touchstart', handleTouchStart)
    joystick.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleEnd)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleEnd)

    return () => {
      joystick.removeEventListener('touchstart', handleTouchStart)
      joystick.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleEnd)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleEnd)
    }
  }, [onMove])

  return (
    <div className="fixed bottom-6 left-6 z-20">
      <div
        ref={joystickRef}
        className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full shadow-2xl flex items-center justify-center border-4 border-white/30"
      >
        <div
          ref={knobRef}
          className="w-10 h-10 bg-blue-500 rounded-full shadow-xl transition-transform"
        />
      </div>
      <div className="text-center text-white text-xs mt-2 font-medium">Déplacer</div>
    </div>
  )
}
