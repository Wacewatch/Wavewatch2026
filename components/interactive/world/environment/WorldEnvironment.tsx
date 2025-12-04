"use client"

import { Sky } from "@react-three/drei"
import type { GraphicsQuality } from "../types"

interface WorldEnvironmentProps {
  worldMode: "day" | "night" | "sunset" | "christmas"
  graphicsQuality: GraphicsQuality
  isIndoors?: boolean
}

/**
 * WorldEnvironment - Handles sky, lighting, and fog based on world mode
 * Extracted from world-3d-v2.tsx for better organization
 */
export function WorldEnvironment({ worldMode, graphicsQuality, isIndoors = false }: WorldEnvironmentProps) {
  const shadowMapSize = graphicsQuality === "high" ? 2048 : 1024

  return (
    <>
      {worldMode === "day" && (
        <>
          <Sky sunPosition={[100, 20, 100]} inclination={0.6} azimuth={0.25} />
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[20, 40, 20]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[shadowMapSize, shadowMapSize]}
            shadow-camera-left={-50}
            shadow-camera-right={50}
            shadow-camera-top={50}
            shadow-camera-bottom={-50}
            shadow-camera-near={1}
            shadow-camera-far={100}
          />
        </>
      )}

      {worldMode === "night" && (
        <>
          <Sky sunPosition={[100, -20, 100]} inclination={0.1} azimuth={0.25} />
          <ambientLight intensity={0.15} />
          <directionalLight
            position={[20, 40, 20]}
            intensity={0.3}
            color="#4466ff"
            castShadow
            shadow-mapSize={[shadowMapSize, shadowMapSize]}
            shadow-camera-left={-50}
            shadow-camera-right={50}
            shadow-camera-top={50}
            shadow-camera-bottom={-50}
            shadow-camera-near={1}
            shadow-camera-far={100}
          />
        </>
      )}

      {worldMode === "sunset" && (
        <>
          <Sky sunPosition={[100, 2, 100]} inclination={0.3} azimuth={0.1} />
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[20, 30, 20]}
            intensity={1.0}
            color="#ff8844"
            castShadow
            shadow-mapSize={[shadowMapSize, shadowMapSize]}
            shadow-camera-left={-50}
            shadow-camera-right={50}
            shadow-camera-top={50}
            shadow-camera-bottom={-50}
            shadow-camera-near={1}
            shadow-camera-far={100}
          />
        </>
      )}

      {worldMode === "christmas" && (
        <>
          {/* Winter sky - cold blue tint, low sun position */}
          <Sky sunPosition={[100, 8, 100]} inclination={0.4} azimuth={0.25} />
          {/* Cool ambient light for winter atmosphere */}
          <ambientLight intensity={0.35} color="#e8f4ff" />
          {/* Main sun - softer and cooler */}
          <directionalLight
            position={[20, 35, 20]}
            intensity={0.9}
            color="#fff5e6"
            castShadow
            shadow-mapSize={[shadowMapSize, shadowMapSize]}
            shadow-camera-left={-50}
            shadow-camera-right={50}
            shadow-camera-top={50}
            shadow-camera-bottom={-50}
            shadow-camera-near={1}
            shadow-camera-far={100}
          />
          {/* Subtle fog for winter atmosphere - disabled indoors */}
          {!isIndoors && <fog attach="fog" args={["#d0e8ff", 30, 80]} />}
        </>
      )}

      <hemisphereLight
        intensity={worldMode === "christmas" ? 0.4 : 0.3}
        groundColor={worldMode === "christmas" ? "#a0c4e8" : "#6b7280"}
      />
    </>
  )
}
