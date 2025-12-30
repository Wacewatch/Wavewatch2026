"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"

// Configuration STUN (serveurs gratuits Google)
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
}

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
  volume: number
}

interface PeerConnection {
  pc: RTCPeerConnection
  stream: MediaStream | null
  audioElement: HTMLAudioElement | null
}

export function useVoiceChat({ userId = null, currentRoom = null, voiceChatEnabled = false }: UseVoiceChatProps = {}) {
  const [isVoiceConnected, setIsVoiceConnected] = useState(false)
  const [isMicMuted, setIsMicMuted] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voicePeers, setVoicePeers] = useState<VoicePeer[]>([])
  const [micPermissionDenied, setMicPermissionDenied] = useState(false)
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null)

  const localStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof createBrowserClient>["channel"]> | null>(null)
  const usernameRef = useRef<string>("")
  const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map())
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map())
  const usernamesCacheRef = useRef<Map<string, string>>(new Map())

  // Load username
  useEffect(() => {
    if (!userId) return

    const loadUsername = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const { data, error } = await supabase.from("user_profiles").select("username").eq("user_id", userId).single()

      if (data && !error) {
        usernameRef.current = data.username || `User ${userId.slice(0, 8)}`
      } else {
        usernameRef.current = `User ${userId.slice(0, 8)}`
      }
    }

    loadUsername()
  }, [userId])

  // Create peer connection for a remote user
  const createPeerConnection = useCallback(
    (remoteUserId: string, remoteUsername: string): RTCPeerConnection => {
      console.log(`[WebRTC] Creating peer connection for ${remoteUsername} (${remoteUserId})`)

      const pc = new RTCPeerConnection(ICE_SERVERS)

      // Add local tracks to the connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!)
        })
      }

      // Handle incoming remote stream
      pc.ontrack = (event) => {
        console.log(`[WebRTC] Received remote track from ${remoteUsername}`)
        const remoteStream = event.streams[0]

        // Create audio element to play remote audio
        const audioElement = new Audio()
        audioElement.srcObject = remoteStream
        audioElement.autoplay = true
        audioElement.volume = 1

        // Store the audio element
        const peerConn = peerConnectionsRef.current.get(remoteUserId)
        if (peerConn) {
          peerConn.stream = remoteStream
          peerConn.audioElement = audioElement
        }

        // Update voicePeers state with the stream
        setVoicePeers((prev) =>
          prev.map((p) => (p.userId === remoteUserId ? { ...p, stream: remoteStream } : p))
        )

        // Set up speaking detection for remote peer
        setupRemoteSpeakingDetection(remoteUserId, remoteStream)
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && channelRef.current) {
          console.log(`[WebRTC] Sending ICE candidate to ${remoteUsername}`)
          channelRef.current.send({
            type: "broadcast",
            event: "voice-ice",
            payload: {
              from: userId,
              to: remoteUserId,
              candidate: event.candidate.toJSON(),
            },
          })
        }
      }

      pc.oniceconnectionstatechange = () => {
        console.log(`[WebRTC] ICE connection state with ${remoteUsername}: ${pc.iceConnectionState}`)
        if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected") {
          console.log(`[WebRTC] Connection with ${remoteUsername} failed/disconnected`)
        }
      }

      // Store the peer connection
      peerConnectionsRef.current.set(remoteUserId, { pc, stream: null, audioElement: null })

      return pc
    },
    [userId]
  )

  // Set up speaking detection for remote peer
  const setupRemoteSpeakingDetection = (peerId: string, stream: MediaStream) => {
    try {
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const checkSpeaking = () => {
        if (!peerConnectionsRef.current.has(peerId)) {
          audioContext.close()
          return
        }

        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        const speaking = average > 30

        setVoicePeers((prev) =>
          prev.map((p) => (p.userId === peerId ? { ...p, isSpeaking: speaking } : p))
        )

        requestAnimationFrame(checkSpeaking)
      }

      checkSpeaking()
    } catch (error) {
      console.error(`[WebRTC] Error setting up speaking detection for ${peerId}:`, error)
    }
  }

  // Fetch username from database with caching
  const fetchUsername = useCallback(async (oderId: string): Promise<string> => {
    // Check cache first
    const cached = usernamesCacheRef.current.get(oderId)
    if (cached) {
      return cached
    }

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )
      const { data } = await supabase
        .from("user_profiles")
        .select("username")
        .or(`id.eq.${oderId},user_id.eq.${oderId}`)
        .limit(1)

      const username = data?.[0]?.username || `User ${oderId.slice(0, 8)}`

      // Cache the result
      usernamesCacheRef.current.set(oderId, username)

      return username
    } catch {
      const fallback = `User ${oderId.slice(0, 8)}`
      usernamesCacheRef.current.set(oderId, fallback)
      return fallback
    }
  }, [])

  // Handle incoming signaling messages
  const handleSignalingMessage = useCallback(
    async (event: string, payload: any) => {
      if (!userId || !localStreamRef.current) return

      const { from, to, username } = payload

      // Ignore messages not meant for us
      if (to && to !== userId) return
      // Ignore our own messages
      if (from === userId) return

      console.log(`[WebRTC] Received ${event} from ${username || from}`)

      // Only fetch username for join/offer events (not for ice/answer/leave/mute to avoid spam)
      let peerUsername = username
      if ((event === "voice-join" || event === "voice-offer") && (!peerUsername || peerUsername.startsWith("User "))) {
        peerUsername = await fetchUsername(from)
      }

      switch (event) {
        case "voice-join": {
          // Someone joined - if we're already here, send them an offer
          console.log(`[WebRTC] ${peerUsername} joined the voice chat`)

          // Add to peers list if not already there
          setVoicePeers((prev) => {
            if (prev.find((p) => p.userId === from)) return prev
            return [...prev, { userId: from, username: peerUsername, stream: null, isMuted: false, isSpeaking: false, volume: 1 }]
          })

          // Create offer for the new peer
          const pc = createPeerConnection(from, peerUsername)
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)

          channelRef.current?.send({
            type: "broadcast",
            event: "voice-offer",
            payload: {
              from: userId,
              to: from,
              username: usernameRef.current,
              sdp: pc.localDescription?.toJSON(),
            },
          })
          break
        }

        case "voice-offer": {
          // Received an offer - create answer
          console.log(`[WebRTC] Received offer from ${peerUsername}`)

          // Add to peers list if not already there
          setVoicePeers((prev) => {
            if (prev.find((p) => p.userId === from)) return prev
            return [...prev, { userId: from, username: peerUsername, stream: null, isMuted: false, isSpeaking: false, volume: 1 }]
          })

          let pc = peerConnectionsRef.current.get(from)?.pc
          if (!pc) {
            pc = createPeerConnection(from, peerUsername)
          }

          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))

          // Process any pending ICE candidates
          const pending = pendingCandidatesRef.current.get(from) || []
          for (const candidate of pending) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate))
          }
          pendingCandidatesRef.current.delete(from)

          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)

          channelRef.current?.send({
            type: "broadcast",
            event: "voice-answer",
            payload: {
              from: userId,
              to: from,
              username: usernameRef.current,
              sdp: pc.localDescription?.toJSON(),
            },
          })
          break
        }

        case "voice-answer": {
          // Received an answer
          console.log(`[WebRTC] Received answer from ${username}`)
          const pc = peerConnectionsRef.current.get(from)?.pc
          if (pc && pc.signalingState !== "stable") {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))

            // Process any pending ICE candidates
            const pending = pendingCandidatesRef.current.get(from) || []
            for (const candidate of pending) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate))
            }
            pendingCandidatesRef.current.delete(from)
          }
          break
        }

        case "voice-ice": {
          // Received ICE candidate
          const pc = peerConnectionsRef.current.get(from)?.pc
          if (pc && pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(payload.candidate))
          } else {
            // Store candidate for later
            const pending = pendingCandidatesRef.current.get(from) || []
            pending.push(payload.candidate)
            pendingCandidatesRef.current.set(from, pending)
          }
          break
        }

        case "voice-leave": {
          // Someone left
          console.log(`[WebRTC] ${username} left the voice chat`)
          const peerConn = peerConnectionsRef.current.get(from)
          if (peerConn) {
            peerConn.audioElement?.pause()
            peerConn.pc.close()
            peerConnectionsRef.current.delete(from)
          }
          setVoicePeers((prev) => prev.filter((p) => p.userId !== from))
          break
        }

        case "voice-mute": {
          // Someone muted/unmuted
          setVoicePeers((prev) =>
            prev.map((p) => (p.userId === from ? { ...p, isMuted: payload.isMuted } : p))
          )
          break
        }
      }
    },
    [userId, createPeerConnection, fetchUsername]
  )

  const requestMicAccess = useCallback(async () => {
    console.log("[WebRTC] Requesting microphone access...")

    if (!voiceChatEnabled) {
      setMicErrorMessage("Le chat vocal est désactivé dans les paramètres du monde")
      return false
    }

    if (!userId) {
      setMicErrorMessage("Erreur: ID utilisateur manquant")
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

      console.log("[WebRTC] ✓ Microphone access granted")
      localStreamRef.current = stream

      // Set up audio analysis for local speaking detection
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
      return true
    } catch (error) {
      console.error("[WebRTC] ✗ Error accessing microphone:", error)
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
        } else {
          setMicErrorMessage(`Erreur microphone: ${error.message}`)
        }
      } else {
        setMicErrorMessage("Erreur inconnue lors de l'accès au microphone.")
      }

      return false
    }
  }, [voiceChatEnabled, userId])

  const toggleMic = useCallback(() => {
    if (!localStreamRef.current) return

    const newMutedState = !isMicMuted
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !newMutedState
    })
    setIsMicMuted(newMutedState)

    // Broadcast mute state to others
    channelRef.current?.send({
      type: "broadcast",
      event: "voice-mute",
      payload: {
        from: userId,
        username: usernameRef.current,
        isMuted: newMutedState,
      },
    })

    console.log("[WebRTC] Mic toggled. Muted:", newMutedState)
  }, [isMicMuted, userId])

  const disconnect = useCallback(() => {
    console.log("[WebRTC] Disconnecting voice chat...")

    // Notify others we're leaving
    channelRef.current?.send({
      type: "broadcast",
      event: "voice-leave",
      payload: {
        from: userId,
        username: usernameRef.current,
      },
    })

    // Close all peer connections
    peerConnectionsRef.current.forEach((peerConn) => {
      peerConn.audioElement?.pause()
      peerConn.pc.close()
    })
    peerConnectionsRef.current.clear()
    pendingCandidatesRef.current.clear()

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Unsubscribe from channel
    if (channelRef.current) {
      channelRef.current.unsubscribe()
      channelRef.current = null
    }

    setIsVoiceConnected(false)
    setIsMicMuted(true)
    setIsSpeaking(false)
    setVoicePeers([])
    console.log("[WebRTC] ✓ Disconnected")
  }, [userId])

  // Detect local speaking
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

  // Set up signaling channel
  useEffect(() => {
    if (!isVoiceConnected || !userId) {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
      return
    }

    const roomForChannel = currentRoom || "main_world"
    console.log(`[WebRTC] Setting up signaling channel for room: ${roomForChannel}`)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const voiceChannelName = `voice_webrtc:${roomForChannel}`
    const channel = supabase.channel(voiceChannelName)

    // Listen for all voice events
    channel
      .on("broadcast", { event: "voice-join" }, ({ payload }) => handleSignalingMessage("voice-join", payload))
      .on("broadcast", { event: "voice-offer" }, ({ payload }) => handleSignalingMessage("voice-offer", payload))
      .on("broadcast", { event: "voice-answer" }, ({ payload }) => handleSignalingMessage("voice-answer", payload))
      .on("broadcast", { event: "voice-ice" }, ({ payload }) => handleSignalingMessage("voice-ice", payload))
      .on("broadcast", { event: "voice-leave" }, ({ payload }) => handleSignalingMessage("voice-leave", payload))
      .on("broadcast", { event: "voice-mute" }, ({ payload }) => handleSignalingMessage("voice-mute", payload))
      .subscribe((status) => {
        console.log(`[WebRTC] Channel subscription status: ${status}`)
        if (status === "SUBSCRIBED") {
          // Announce our presence
          channel.send({
            type: "broadcast",
            event: "voice-join",
            payload: {
              from: userId,
              username: usernameRef.current,
            },
          })
        }
      })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [isVoiceConnected, currentRoom, userId, handleSignalingMessage])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  const resetMicPermission = useCallback(() => {
    setMicPermissionDenied(false)
    setMicErrorMessage(null)
  }, [])

  const setPeerVolume = useCallback((peerId: string, volume: number) => {
    const peerConn = peerConnectionsRef.current.get(peerId)
    if (peerConn?.audioElement) {
      peerConn.audioElement.volume = Math.max(0, Math.min(1, volume))
    }
    setVoicePeers((peers) =>
      peers.map((peer) => (peer.userId === peerId ? { ...peer, volume: Math.max(0, Math.min(1, volume)) } : peer)),
    )
  }, [])

  const togglePeerMute = useCallback((peerId: string) => {
    const peerConn = peerConnectionsRef.current.get(peerId)
    setVoicePeers((peers) =>
      peers.map((peer) => {
        if (peer.userId === peerId) {
          const newMuted = !peer.isMuted
          if (peerConn?.audioElement) {
            peerConn.audioElement.muted = newMuted
          }
          return { ...peer, isMuted: newMuted }
        }
        return peer
      }),
    )
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
    setPeerVolume,
    togglePeerMute,
  }
}
