"use client"

import { useCallback, useRef } from "react"

interface QuestUpdateResult {
  success: boolean
  updated: Array<{
    quest_id: string
    quest_code: string
    title: string
    completed: boolean
    xp_earned?: number
    progress?: number
    requirement?: number
  }>
  totalXpEarned: number
}

interface UseQuestTrackerProps {
  userId: string
  username?: string
  onQuestCompleted?: (questTitle: string, xpEarned: number) => void
  onQuestProgress?: (questTitle: string, progress: number, requirement: number) => void
}

export function useQuestTracker({ userId, username, onQuestCompleted, onQuestProgress }: UseQuestTrackerProps) {
  // Track quests that have already been triggered to avoid duplicates
  const triggeredQuests = useRef<Set<string>>(new Set())
  // Track rooms visited in this session
  const visitedRooms = useRef<Set<string>>(new Set())
  // Track if first login quest was triggered
  const firstLoginTriggered = useRef(false)

  const trackAction = useCallback(
    async (
      actionType: string,
      actionData?: { roomName?: string; duration?: number; count?: number }
    ): Promise<QuestUpdateResult | null> => {
      if (!userId) return null

      try {
        const response = await fetch("/api/interactive/update-quest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId: userId,
            visitorname: username,
            actionType,
            actionData,
          }),
        })

        if (!response.ok) {
          console.error("[useQuestTracker] API error:", response.status)
          return null
        }

        const result: QuestUpdateResult = await response.json()

        // Notify about quest updates
        if (result.updated) {
          for (const quest of result.updated) {
            if (quest.completed && quest.xp_earned && onQuestCompleted) {
              // Quest completed - show completion notification
              onQuestCompleted(quest.title, quest.xp_earned)
            } else if (!quest.completed && quest.progress !== undefined && quest.requirement && onQuestProgress) {
              // Quest in progress - show progress notification
              onQuestProgress(quest.title, quest.progress, quest.requirement)
            }
          }
        }

        return result
      } catch (error) {
        console.error("[useQuestTracker] Error tracking action:", error)
        return null
      }
    },
    [userId, username, onQuestCompleted, onQuestProgress]
  )

  // Track first login (call once when entering the world)
  const trackFirstLogin = useCallback(async () => {
    if (firstLoginTriggered.current) return
    firstLoginTriggered.current = true
    return trackAction("first_login")
  }, [trackAction])

  // Track dance action
  const trackDance = useCallback(async () => {
    return trackAction("dance")
  }, [trackAction])

  // Track room visit
  const trackRoomVisit = useCallback(
    async (roomName: string) => {
      // Only track each room once per session for visit quests
      const roomKey = `visit_${roomName}`
      if (triggeredQuests.current.has(roomKey)) return null
      triggeredQuests.current.add(roomKey)
      visitedRooms.current.add(roomName)

      return trackAction("visit_room", { roomName })
    },
    [trackAction]
  )

  // Track disco visit specifically
  const trackDiscoVisit = useCallback(async () => {
    const roomKey = "disco_visit"
    if (triggeredQuests.current.has(roomKey)) return null
    triggeredQuests.current.add(roomKey)
    return trackAction("disco_visit")
  }, [trackAction])

  // Track cinema session
  const trackCinemaSession = useCallback(async () => {
    return trackAction("cinema_session")
  }, [trackAction])

  // Track stadium visit
  const trackStadiumVisit = useCallback(async () => {
    return trackAction("stadium_visit")
  }, [trackAction])

  // Track arcade play
  const trackArcadePlay = useCallback(async () => {
    return trackAction("arcade_play")
  }, [trackAction])

  // Track chat message
  const trackChatMessage = useCallback(async () => {
    return trackAction("chat_message")
  }, [trackAction])

  // Track voice chat
  const trackVoiceChat = useCallback(async () => {
    return trackAction("voice_chat")
  }, [trackAction])

  // Track avatar customization
  const trackAvatarCustomization = useCallback(async () => {
    return trackAction("avatar_custom")
  }, [trackAction])

  // Track time spent (call periodically with duration in seconds)
  const trackTimeSpent = useCallback(
    async (durationSeconds: number) => {
      return trackAction("time_spent", { duration: durationSeconds })
    },
    [trackAction]
  )

  // Track daily login
  const trackDailyLogin = useCallback(async () => {
    return trackAction("daily_login")
  }, [trackAction])

  return {
    trackAction,
    trackFirstLogin,
    trackDance,
    trackRoomVisit,
    trackDiscoVisit,
    trackCinemaSession,
    trackStadiumVisit,
    trackArcadePlay,
    trackChatMessage,
    trackVoiceChat,
    trackAvatarCustomization,
    trackTimeSpent,
    trackDailyLogin,
    visitedRooms: visitedRooms.current,
  }
}
