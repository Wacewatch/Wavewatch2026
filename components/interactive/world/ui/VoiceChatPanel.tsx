"use client"

import type React from "react"

import { Mic, MicOff, Volume2, Phone, PhoneOff, GripVertical } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface VoiceChatPanelProps {
  isVoiceConnected: boolean
  isMicMuted: boolean
  isSpeaking: boolean
  micPermissionDenied: boolean
  currentRoom?: string | null
  currentCinemaRoom?: { id: string; name?: string; room_number?: number } | null
  voicePeers: Array<{
    odIUser: string
    username: string
    isMuted: boolean
    isSpeaking: boolean
  }>
  onRequestMicAccess: () => void
  onToggleMic: () => void
  onDisconnect: () => void
}

export function VoiceChatPanel({
  isVoiceConnected,
  isMicMuted,
  isSpeaking,
  micPermissionDenied,
  currentRoom,
  currentCinemaRoom,
  voicePeers,
  onRequestMicAccess,
  onToggleMic,
  onDisconnect,
}: VoiceChatPanelProps) {
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 200 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
    }
  }

  const getRoomDisplayName = () => {
    if (!currentRoom) return "Monde"

    // If in a cinema room, show the specific cinema room name
    if (currentRoom.startsWith("cinema_") && currentCinemaRoom) {
      return currentCinemaRoom.name || `Salle ${currentCinemaRoom.room_number || "Cinéma"}`
    }

    if (currentRoom.startsWith("arcade_")) return `Salle Arcade`
    return currentRoom
  }

  const handleJoinVoice = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("[v0] [VoiceChatPanel] Join button clicked")
    onRequestMicAccess()
  }

  const handleToggleMic = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleMic()
  }

  const handleDisconnect = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDisconnect()
  }

  return (
    <div
      ref={panelRef}
      className="fixed bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 border border-gray-700 select-none z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        minWidth: "200px",
      }}
    >
      <div className="flex items-center gap-2 mb-2 cursor-grab active:cursor-grabbing" onMouseDown={handleMouseDown}>
        <GripVertical className="w-4 h-4 text-gray-500" />
        <Volume2 className="w-4 h-4 text-green-400" />
        <span className="text-sm font-medium text-white">Chat Vocal</span>
      </div>

      <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
        {getRoomDisplayName()}
      </div>

      {micPermissionDenied ? (
        <div className="text-xs text-red-400 mb-2">
          Accès au microphone refusé. Vérifiez les paramètres de votre navigateur.
        </div>
      ) : !isVoiceConnected ? (
        <button
          onClick={handleJoinVoice}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded-lg transition-colors cursor-pointer"
        >
          <Phone className="w-4 h-4" />
          Rejoindre le vocal
        </button>
      ) : (
        <div className="space-y-2">
          {/* My status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isSpeaking ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
              <span className="text-xs text-gray-300">Vous</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleMic}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isMicMuted
                    ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                    : "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                }`}
                title={isMicMuted ? "Activer le micro" : "Couper le micro"}
              >
                {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                onClick={handleDisconnect}
                className="p-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors cursor-pointer"
                title="Quitter le vocal"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Other participants */}
          {voicePeers.length > 0 && (
            <div className="border-t border-gray-700 pt-2 space-y-1">
              {voicePeers.map((peer) => (
                <div key={peer.odIUser} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${peer.isSpeaking ? "bg-green-400 animate-pulse" : "bg-gray-500"}`}
                    />
                    <span className="text-xs text-gray-300">{peer.username}</span>
                  </div>
                  {peer.isMuted && <MicOff className="w-3 h-3 text-red-400" />}
                </div>
              ))}
            </div>
          )}

          {voicePeers.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-1">Personne d'autre dans le vocal</p>
          )}
        </div>
      )}
    </div>
  )
}
