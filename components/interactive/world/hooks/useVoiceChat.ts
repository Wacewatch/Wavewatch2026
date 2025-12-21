"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface UseVoiceChatProps {
  userId?: string | null
  currentRoom?: string | null
  voiceChatEnabled?: boolean
}

interface VoicePeer {
  odIUser: string
  username: string
  stream: MediaStream | null
  isMuted: boolean
  isSpeaking: boolean
}

export function useVoiceChat({ userId = null, currentRoom = null, voiceChatEnabled = false }: UseVoiceChatProps = {}) {
  const [isVoiceConnected, setIsVoiceConnected] = useState(false)
  const [isMicMuted, setIsMicMuted] = useState(true) // Muted by default
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voicePeers, setVoicePeers] = useState<VoicePeer[]>([])
  const [micPermissionDenied, setMicPermissionDenied] = useState(false)

  const localStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Request microphone access
  const requestMicAccess = useCallback(async () => {
    if (!voiceChatEnabled) {
      console.log("[VoiceChat] Voice chat is disabled")
      return false
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      })

      localStreamRef.current = stream

      // Set up audio analysis for speaking detection
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)

      // Start muted by default
      stream.getAudioTracks().forEach((track) => {
        track.enabled = false
      })

      setIsVoiceConnected(true)
      setMicPermissionDenied(false)
      return true
    } catch (error) {
      console.error("[VoiceChat] Error accessing microphone:", error)
      setMicPermissionDenied(true)
      return false
    }
  }, [voiceChatEnabled])

  // Toggle microphone mute
  const toggleMic = useCallback(() => {
    if (!localStreamRef.current) return

    const newMutedState = !isMicMuted
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !newMutedState
    })
    setIsMicMuted(newMutedState)
  }, [isMicMuted])

  const disconnect = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    setIsVoiceConnected(false)
    setIsMicMuted(true)
    setIsSpeaking(false)
    setVoicePeers([])
  }, [])

  // Detect speaking
  useEffect(() => {
    if (!analyserRef.current || isMicMuted) {
      setIsSpeaking(false)
      return
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)

    const checkSpeaking = () => {
      if (!analyserRef.current) return

      analyserRef.current.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length

      // Threshold for speaking detection
      setIsSpeaking(average > 30)

      animationFrameRef.current = requestAnimationFrame(checkSpeaking)
    }

    checkSpeaking()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isMicMuted])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  // Disconnect voice when leaving room
  useEffect(() => {
    if (!currentRoom && isVoiceConnected) {
      disconnect()
    }
  }, [currentRoom, isVoiceConnected, disconnect])

  return {
    isVoiceConnected,
    isMicMuted,
    isSpeaking,
    voicePeers,
    micPermissionDenied,
    requestMicAccess,
    toggleMic,
    disconnect,
  }
}
