"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'

interface ControlsProps {
  onMove: (direction: "forward" | "backward" | "left" | "right") => void
}

export function Controls({ onMove }: ControlsProps) {
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

  return (
    <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-4 border">
      <div className="text-center mb-2">
        <p className="text-xs text-muted-foreground mb-2">Contrôles</p>
        <div className="grid grid-cols-3 gap-1">
          <div />
          <Button size="icon" variant="outline" onClick={() => onMove("forward")}>
            <ArrowUp className="w-4 h-4" />
          </Button>
          <div />
          <Button size="icon" variant="outline" onClick={() => onMove("left")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={() => onMove("backward")}>
            <ArrowDown className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={() => onMove("right")}>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-2">ou ZQSD / WASD</p>
    </div>
  )
}
