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
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null)

  const localStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Request microphone access
  const requestMicAccess = useCallback(async () => {
    console.log("[v0] [VoiceChat] requestMicAccess called")
    console.log("[v0] [VoiceChat] voiceChatEnabled:", voiceChatEnabled)
    console.log("[v0] [VoiceChat] userId:", userId)
    console.log("[v0] [VoiceChat] currentRoom:", currentRoom)

    if (!voiceChatEnabled) {
      console.log("[v0] [VoiceChat] Voice chat is disabled in world settings")
      setMicErrorMessage("Le chat vocal est désactivé dans les paramètres du monde")
      return false
    }

    try {
      console.log("[v0] [VoiceChat] Requesting microphone access...")
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      })

      console.log("[v0] [VoiceChat] Microphone access granted")
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
      setMicErrorMessage(null)
      console.log("[v0] [VoiceChat] Voice chat connected successfully")
      return true
    } catch (error) {
      console.error("[v0] [VoiceChat] Error accessing microphone:", error)
      setMicPermissionDenied(true)

      if (error instanceof Error) {
        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          setMicErrorMessage(
            "Accès au microphone refusé. Cliquez sur l'icône de verrouillage dans la barre d'adresse et autorisez le microphone.",
          )
        } else if (error.name === "NotFoundError") {
          setMicErrorMessage("Aucun microphone détecté. Vérifiez que votre microphone est branché.")
        } else if (error.name === "NotReadableError") {
          setMicErrorMessage("Impossible d'accéder au microphone. Il est peut-être utilisé par une autre application.")
        } else if (error.name === "OverconstrainedError") {
          setMicErrorMessage("Configuration du microphone non supportée.")
        } else if (error.name === "NotSupportedError") {
          setMicErrorMessage(
            "Votre navigateur ne supporte pas l'accès au microphone. Utilisez HTTPS ou un navigateur récent.",
          )
        } else {
          setMicErrorMessage(`Erreur microphone: ${error.message}`)
        }
      } else {
        setMicErrorMessage("Erreur inconnue lors de l'accès au microphone.")
      }

      return false
    }
  }, [voiceChatEnabled, userId, currentRoom])

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
    micErrorMessage,
    requestMicAccess,
    toggleMic,
    disconnect,
  }
}
