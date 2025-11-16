"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Gamepad2, Keyboard } from 'lucide-react'

interface ControlsProps {
  onMove: (direction: "forward" | "backward" | "left" | "right") => void
}

export function Controls({ onMove }: ControlsProps) {
  const [controlMode, setControlMode] = useState<'keyboard' | 'joystick'>('keyboard')
  const [joystickActive, setJoystickActive] = useState(false)
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case "z":
        case "w":
        case "arrowup":
          onMove("forward")
          break
        case "s":
        case "arrowdown":
          onMove("backward")
          break
        case "q":
        case "a":
        case "arrowleft":
          onMove("left")
          break
        case "d":
        case "arrowright":
          onMove("right")
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onMove])

  const handleJoystickStart = (e: React.TouchEvent | React.MouseEvent) => {
    setJoystickActive(true)
  }

  const handleJoystickMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!joystickActive) return

    const touch = 'touches' in e ? e.touches[0] : e
    const joystickBase = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const centerX = joystickBase.left + joystickBase.width / 2
    const centerY = joystickBase.top + joystickBase.height / 2
    
    const deltaX = touch.clientX - centerX
    const deltaY = touch.clientY - centerY
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const maxDistance = joystickBase.width / 2
    
    const normalizedX = Math.max(-1, Math.min(1, deltaX / maxDistance))
    const normalizedY = Math.max(-1, Math.min(1, deltaY / maxDistance))
    
    setJoystickPosition({ x: normalizedX, y: normalizedY })
    
    // Trigger movement based on joystick position
    if (Math.abs(normalizedY) > Math.abs(normalizedX)) {
      if (normalizedY < -0.3) onMove("forward")
      else if (normalizedY > 0.3) onMove("backward")
    } else {
      if (normalizedX < -0.3) onMove("left")
      else if (normalizedX > 0.3) onMove("right")
    }
  }

  const handleJoystickEnd = () => {
    setJoystickActive(false)
    setJoystickPosition({ x: 0, y: 0 })
  }

  return (
    <div className="absolute bottom-6 right-6 space-y-2">
      <div className="flex justify-end mb-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setControlMode(controlMode === 'keyboard' ? 'joystick' : 'keyboard')}
          className="bg-background/90 backdrop-blur-sm"
        >
          {controlMode === 'keyboard' ? (
            <>
              <Gamepad2 className="w-4 h-4 mr-2" />
              Mode Joystick
            </>
          ) : (
            <>
              <Keyboard className="w-4 h-4 mr-2" />
              Mode Clavier
            </>
          )}
        </Button>
      </div>

      {controlMode === 'keyboard' ? (
        <div className="bg-background/90 backdrop-blur-sm rounded-xl p-4 border-2 shadow-xl">
          <div className="text-center mb-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Contrôles Clavier</p>
            <div className="grid grid-cols-3 gap-1.5">
              <div />
              <Button 
                size="icon" 
                variant="outline" 
                onClick={() => onMove("forward")}
                className="bg-primary/10 hover:bg-primary/20"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
              <div />
              <Button 
                size="icon" 
                variant="outline" 
                onClick={() => onMove("left")}
                className="bg-primary/10 hover:bg-primary/20"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button 
                size="icon" 
                variant="outline" 
                onClick={() => onMove("backward")}
                className="bg-primary/10 hover:bg-primary/20"
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
              <Button 
                size="icon" 
                variant="outline" 
                onClick={() => onMove("right")}
                className="bg-primary/10 hover:bg-primary/20"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            ZQSD / WASD / Flèches
          </p>
        </div>
      ) : (
        <div className="bg-background/90 backdrop-blur-sm rounded-xl p-6 border-2 shadow-xl">
          <p className="text-xs font-semibold text-muted-foreground mb-3 text-center">Joystick Mobile</p>
          <div 
            className="relative w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full border-4 border-primary/30 shadow-inner cursor-pointer"
            onTouchStart={handleJoystickStart}
            onTouchMove={handleJoystickMove}
            onTouchEnd={handleJoystickEnd}
            onMouseDown={handleJoystickStart}
            onMouseMove={handleJoystickMove}
            onMouseUp={handleJoystickEnd}
            onMouseLeave={handleJoystickEnd}
          >
            <div 
              className="absolute w-12 h-12 bg-primary rounded-full shadow-lg transition-all duration-75"
              style={{
                left: `calc(50% - 24px + ${joystickPosition.x * 32}px)`,
                top: `calc(50% - 24px + ${joystickPosition.y * 32}px)`,
                opacity: joystickActive ? 1 : 0.7
              }}
            />
            {/* Directional indicators */}
            <ArrowUp className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 text-primary/50" />
            <ArrowDown className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 text-primary/50" />
            <ArrowLeft className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
            <ArrowRight className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Glissez pour vous déplacer
          </p>
        </div>
      )}
    </div>
  )
}
