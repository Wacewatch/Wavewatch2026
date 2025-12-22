"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"

interface UseVoiceChatProps {
  userId?: string | null
  currentRoom?: string | null
  voiceChatEnabled?: boolean
}

interface VoicePeer {
  userId: string
  username: string
  stream: MediaStream | null
  isMuted: boolean
  isSpeaking: boolean
  volume: number // Add volume control for each peer
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
  const channelRef = useRef<ReturnType<ReturnType<typeof createBrowserClient>["channel"]> | null>(null)

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
    if (channelRef.current) {
      console.log("[v0] [VoiceChat] Leaving voice channel:", currentRoom)
      channelRef.current.unsubscribe()
      channelRef.current = null
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

  useEffect(() => {
    if (!isVoiceConnected || !currentRoom || !userId) {
      // Cleanup channel if disconnected
      if (channelRef.current) {
        console.log("[v0] [VoiceChat] Leaving voice channel:", currentRoom)
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
      setVoicePeers([])
      return
    }

    console.log("[v0] [VoiceChat] Setting up voice sync for room:", currentRoom)
    console.log("[v0] [VoiceChat] Current userId:", userId)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    // Create a channel for this voice room
    const voiceChannelName = `voice:${currentRoom}`
    const channel = supabase.channel(voiceChannelName, {
      config: {
        presence: {
          key: userId,
        },
      },
    })

    // Track presence of users in voice chat
    channel
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState()
        console.log("[v0] [VoiceChat] Presence sync:", presenceState)

        const peers: VoicePeer[] = []
        Object.entries(presenceState).forEach(([key, value]) => {
          const presence = (value as any[])[0]
          if (presence.user_id !== userId) {
            peers.push({
              userId: presence.user_id,
              username: presence.username || "Utilisateur",
              stream: null, // Audio streaming will be added later with WebRTC
              isMuted: presence.is_muted || false,
              isSpeaking: presence.is_speaking || false,
              volume: 1,
            })
          }
        })

        console.log("[v0] [VoiceChat] Updated peers list:", peers)
        setVoicePeers(peers)
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("[v0] [VoiceChat] User joined voice:", newPresences)
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("[v0] [VoiceChat] User left voice:", leftPresences)
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          console.log("[v0] [VoiceChat] Subscribed to voice channel:", voiceChannelName)
          // Track our presence
          await channel.track({
            user_id: userId,
            username: userId, // Will be updated with actual username
            is_muted: isMicMuted,
            is_speaking: isSpeaking,
            online_at: new Date().toISOString(),
          })
          console.log("[v0] [VoiceChat] Presence tracked for user:", userId)
        }
      })

    channelRef.current = channel

    return () => {
      console.log("[v0] [VoiceChat] Cleaning up voice channel")
      channel.unsubscribe()
    }
  }, [isVoiceConnected, currentRoom, userId])

  useEffect(() => {
    if (channelRef.current && userId) {
      channelRef.current.track({
        user_id: userId,
        username: userId,
        is_muted: isMicMuted,
        is_speaking: isSpeaking,
        online_at: new Date().toISOString(),
      })
    }
  }, [isMicMuted, isSpeaking, userId])

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

  const resetMicPermission = useCallback(() => {
    console.log("[v0] [VoiceChat] Resetting microphone permission state")
    setMicPermissionDenied(false)
    setMicErrorMessage(null)
  }, [])

  const setPeerVolume = useCallback((peerId: string, volume: number) => {
    setVoicePeers((peers) =>
      peers.map((peer) => (peer.userId === peerId ? { ...peer, volume: Math.max(0, Math.min(1, volume)) } : peer)),
    )
  }, [])

  const togglePeerMute = useCallback((peerId: string) => {
    setVoicePeers((peers) => peers.map((peer) => (peer.userId === peerId ? { ...peer, isMuted: !peer.isMuted } : peer)))
  }, [])

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
    resetMicPermission,
    setPeerVolume, // Export new functions
    togglePeerMute,
  }
}
