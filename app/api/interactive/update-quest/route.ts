import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

interface QuestUpdateRequest {
  visitorId: string
  visitorname?: string
  actionType: string // 'dance', 'visit_room', 'chat_message', 'cinema_session', 'avatar_custom', 'voice_chat', 'arcade_play', 'stadium_visit', 'first_login', 'time_spent'
  actionData?: {
    roomName?: string
    duration?: number
    count?: number
  }
}

// Mapping des types d'actions vers les requirement_type des quêtes
const ACTION_TO_QUEST_TYPES: Record<string, string[]> = {
  dance: ["dance", "disco_visits"],
  visit_room: ["visit_room", "visit_all_rooms"],
  chat_message: ["chat_messages"],
  cinema_session: ["cinema_sessions"],
  avatar_custom: ["avatar_custom", "avatar_try_all_hair", "avatar_try_all_colors"],
  voice_chat: ["voice_chat", "voice_group"],
  arcade_play: ["arcade_play", "arcade_play_all"],
  stadium_visit: ["stadium_visits"],
  first_login: ["first_login"],
  time_spent: ["time_spent", "daily_time", "time_in_disco"],
  daily_login: ["daily_login"],
  disco_visit: ["disco_visits"],
}

export async function POST(request: NextRequest) {
  try {
    const body: QuestUpdateRequest = await request.json()
    const { visitorId, actionType, actionData } = body

    if (!visitorId || !actionType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Récupérer les types de quêtes correspondant à l'action
    const questTypes = ACTION_TO_QUEST_TYPES[actionType] || []
    if (questTypes.length === 0) {
      return NextResponse.json({ error: "Unknown action type" }, { status: 400 })
    }

    // Récupérer toutes les quêtes qui correspondent à ces types
    const { data: quests, error: questsError } = await supabase
      .from("interactive_quests")
      .select("*")
      .in("requirement_type", questTypes)

    if (questsError) {
      console.error("[update-quest] Error fetching quests:", questsError)
      return NextResponse.json({ error: questsError.message }, { status: 500 })
    }

    if (!quests || quests.length === 0) {
      return NextResponse.json({ message: "No matching quests found", updated: [] })
    }

    const updatedQuests: any[] = []
    let totalXpEarned = 0

    for (const quest of quests) {
      // Vérifier si l'utilisateur a déjà cette quête
      const { data: existingQuest, error: existingError } = await supabase
        .from("interactive_user_quests")
        .select("*")
        .eq("user_id", visitorId)
        .eq("quest_id", quest.id)
        .single()

      if (existingError && existingError.code !== "PGRST116") {
        console.error("[update-quest] Error checking existing quest:", existingError)
        continue
      }

      // Si la quête est déjà complétée et non répétable, passer
      if (existingQuest?.is_completed && !quest.is_repeatable) {
        continue
      }

      // Calculer la nouvelle progression
      const currentProgress = existingQuest?.progress || 0
      const incrementValue = actionData?.count || 1
      const newProgress = Math.min(currentProgress + incrementValue, quest.requirement_value)
      const isNowCompleted = newProgress >= quest.requirement_value

      if (existingQuest) {
        // Mettre à jour la quête existante
        const updateData: any = {
          progress: newProgress,
          updated_at: new Date().toISOString(),
        }

        if (isNowCompleted && !existingQuest.is_completed) {
          updateData.is_completed = true
          updateData.completed_at = new Date().toISOString()
        }

        const { error: updateError } = await supabase
          .from("interactive_user_quests")
          .update(updateData)
          .eq("id", existingQuest.id)

        if (updateError) {
          console.error("[update-quest] Error updating quest:", updateError)
          continue
        }

        // Si la quête vient d'être complétée, ajouter les XP
        if (isNowCompleted && !existingQuest.is_completed) {
          totalXpEarned += quest.xp_reward
          updatedQuests.push({
            quest_id: quest.id,
            quest_code: quest.quest_code,
            title: quest.title,
            completed: true,
            xp_earned: quest.xp_reward,
          })
        } else {
          updatedQuests.push({
            quest_id: quest.id,
            quest_code: quest.quest_code,
            title: quest.title,
            progress: newProgress,
            requirement: quest.requirement_value,
            completed: false,
          })
        }
      } else {
        // Créer une nouvelle entrée de quête
        const insertData: any = {
          user_id: visitorId,
          quest_id: quest.id,
          progress: newProgress,
          is_completed: isNowCompleted,
          completed_at: isNowCompleted ? new Date().toISOString() : null,
        }

        const { error: insertError } = await supabase.from("interactive_user_quests").insert(insertData)

        if (insertError) {
          console.error("[update-quest] Error inserting quest:", insertError)
          continue
        }

        if (isNowCompleted) {
          totalXpEarned += quest.xp_reward
          updatedQuests.push({
            quest_id: quest.id,
            quest_code: quest.quest_code,
            title: quest.title,
            completed: true,
            xp_earned: quest.xp_reward,
          })
        } else {
          updatedQuests.push({
            quest_id: quest.id,
            quest_code: quest.quest_code,
            title: quest.title,
            progress: newProgress,
            requirement: quest.requirement_value,
            completed: false,
          })
        }
      }
    }

    // Si des XP ont été gagnés, mettre à jour le total de l'utilisateur
    if (totalXpEarned > 0) {
      // Récupérer l'XP actuel
      const { data: currentXpData } = await supabase
        .from("interactive_user_xp")
        .select("xp, level")
        .eq("user_id", visitorId)
        .single()

      const currentXp = currentXpData?.xp || 0
      const newXp = currentXp + totalXpEarned

      // Calculer le nouveau niveau basé sur l'XP total
      // Formule: XP requis pour niveau N = floor(100 * N^1.5)
      const calculateLevel = (xp: number): number => {
        let level = 1
        let totalXpRequired = 0
        while (true) {
          const xpForNextLevel = Math.floor(100 * Math.pow(level + 1, 1.5))
          if (totalXpRequired + xpForNextLevel > xp) break
          totalXpRequired += xpForNextLevel
          level++
        }
        return level
      }

      const newLevel = calculateLevel(newXp)

      // Mettre à jour ou créer l'enregistrement XP avec le niveau
      const { error: xpError } = await supabase
        .from("interactive_user_xp")
        .upsert({ user_id: visitorId, xp: newXp, level: newLevel }, { onConflict: "user_id" })

      if (xpError) {
        console.error("[update-quest] Error updating XP:", xpError)
      }
    }

    return NextResponse.json({
      success: true,
      updated: updatedQuests,
      totalXpEarned,
    })
  } catch (error: any) {
    console.error("[update-quest] Exception:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
