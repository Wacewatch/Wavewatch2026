"use client"

import { useEffect, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Maximize2 } from 'lucide-react'

interface SimpleWorldProps {
  profile: any
}

function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 5, 10]} />
      <OrbitControls />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#2a4858" />
      </mesh>
      
      {/* Avatar simple - cube */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="#4a9eff" />
      </mesh>
      
      {/* Quelques cubes décoratifs */}
      <mesh position={[-5, 0.5, -5]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      
      <mesh position={[5, 0.5, -5]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#888" />
      </mesh>
    </>
  )
}

export function SimpleWorld({ profile }: SimpleWorldProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">WaveWatch World</h1>
            <p className="text-gray-400 text-sm">Bienvenue, {profile.username}</p>
          </div>
          
          <Button
            onClick={toggleFullscreen}
            variant="outline"
            size="icon"
            className="bg-black/50 border-gray-700 hover:bg-black/70"
          >
            <Maximize2 className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>

      {/* Canvas 3D */}
      <Canvas
        shadows
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: true }}
      >
        <Scene />
      </Canvas>

      {/* Contrôles info */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white p-4 rounded-lg border border-gray-700">
        <p className="text-sm">Utilisez la souris pour naviguer:</p>
        <p className="text-xs text-gray-400">Clic gauche + glisser = Rotation</p>
        <p className="text-xs text-gray-400">Molette = Zoom</p>
      </div>
    </div>
  )
}
