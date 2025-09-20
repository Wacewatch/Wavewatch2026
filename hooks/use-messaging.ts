"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  subject?: string
  content: string
  is_read: boolean
  created_at: string
  updated_at: string
  sender_username?: string
  recipient_username?: string
}

interface UserProfile {
  id: string
  username: string
  email: string
  allow_messages: boolean
}

export function useMessaging() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [sentMessages, setSentMessages] = useState<Message[]>([])
  const [blockedUsers, setBlockedUsers] = useState<string[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user?.id) {
      loadMessages()
      loadSentMessages()
      loadBlockedUsers()
      loadUnreadCount()
    }
  }, [user?.id])

  const loadMessages = async () => {
    if (!user?.id) return

    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from("user_messages")
        .select("*")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false })

      if (messagesError) throw messagesError

      // Get sender usernames separately
      const senderIds = [...new Set(messagesData?.map((msg) => msg.sender_id) || [])]
      const { data: sendersData, error: sendersError } = await supabase
        .from("user_profiles")
        .select("id, username")
        .in("id", senderIds)

      if (sendersError) throw sendersError

      const sendersMap = new Map(sendersData?.map((sender) => [sender.id, sender.username]) || [])

      const messagesWithUsernames =
        messagesData?.map((msg) => ({
          ...msg,
          sender_username: sendersMap.get(msg.sender_id) || "Utilisateur inconnu",
        })) || []

      setMessages(messagesWithUsernames)
    } catch (error) {
      console.error("Error loading messages:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive",
      })
    }
  }

  const loadSentMessages = async () => {
    if (!user?.id) return

    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from("user_messages")
        .select("*")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false })

      if (messagesError) throw messagesError

      // Get recipient usernames separately
      const recipientIds = [...new Set(messagesData?.map((msg) => msg.recipient_id) || [])]
      const { data: recipientsData, error: recipientsError } = await supabase
        .from("user_profiles")
        .select("id, username")
        .in("id", recipientIds)

      if (recipientsError) throw recipientsError

      const recipientsMap = new Map(recipientsData?.map((recipient) => [recipient.id, recipient.username]) || [])

      const messagesWithUsernames =
        messagesData?.map((msg) => ({
          ...msg,
          recipient_username: recipientsMap.get(msg.recipient_id) || "Utilisateur inconnu",
        })) || []

      setSentMessages(messagesWithUsernames)
    } catch (error) {
      console.error("Error loading sent messages:", error)
    }
  }

  const loadBlockedUsers = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase.from("blocked_users").select("blocked_id").eq("blocker_id", user.id)

      if (error) throw error

      setBlockedUsers(data?.map((b) => b.blocked_id) || [])
    } catch (error) {
      console.error("Error loading blocked users:", error)
    }
  }

  const loadUnreadCount = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase.rpc("get_unread_message_count", { user_uuid: user.id })

      if (error) throw error

      setUnreadCount(data || 0)
    } catch (error) {
      console.error("Error loading unread count:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (recipientId: string, subject: string, content: string) => {
    if (!user?.id) return false

    try {
      const { error } = await supabase.from("user_messages").insert({
        sender_id: user.id,
        recipient_id: recipientId,
        subject: subject.trim() || null,
        content: content.trim(),
      })

      if (error) throw error

      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès",
      })

      await loadSentMessages()
      return true
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      })
      return false
    }
  }

  const markAsRead = async (messageId: string) => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from("user_messages")
        .update({ is_read: true })
        .eq("id", messageId)
        .eq("recipient_id", user.id)

      if (error) throw error

      setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, is_read: true } : msg)))

      await loadUnreadCount()
    } catch (error) {
      console.error("Error marking message as read:", error)
    }
  }

  const blockUser = async (userId: string) => {
    if (!user?.id) return false

    try {
      const { error } = await supabase.from("blocked_users").insert({
        blocker_id: user.id,
        blocked_id: userId,
      })

      if (error) throw error

      setBlockedUsers((prev) => [...prev, userId])
      toast({
        title: "Utilisateur bloqué",
        description: "Cet utilisateur ne pourra plus vous envoyer de messages",
      })

      return true
    } catch (error) {
      console.error("Error blocking user:", error)
      toast({
        title: "Erreur",
        description: "Impossible de bloquer cet utilisateur",
        variant: "destructive",
      })
      return false
    }
  }

  const unblockUser = async (userId: string) => {
    if (!user?.id) return false

    try {
      const { error } = await supabase.from("blocked_users").delete().eq("blocker_id", user.id).eq("blocked_id", userId)

      if (error) throw error

      setBlockedUsers((prev) => prev.filter((id) => id !== userId))
      toast({
        title: "Utilisateur débloqué",
        description: "Cet utilisateur peut maintenant vous envoyer des messages",
      })

      return true
    } catch (error) {
      console.error("Error unblocking user:", error)
      toast({
        title: "Erreur",
        description: "Impossible de débloquer cet utilisateur",
        variant: "destructive",
      })
      return false
    }
  }

  const searchUsers = async (query: string): Promise<UserProfile[]> => {
    if (!query.trim() || query.length < 2) return []

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, username, email, allow_messages")
        .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
        .neq("id", user?.id || "")
        .eq("allow_messages", true)
        .limit(10)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error("Error searching users:", error)
      return []
    }
  }

  const updateMessagePreferences = async (allowMessages: boolean) => {
    if (!user?.id) return false

    try {
      const { error } = await supabase.from("user_profiles").update({ allow_messages: allowMessages }).eq("id", user.id)

      if (error) throw error

      toast({
        title: "Préférences mises à jour",
        description: allowMessages
          ? "Vous pouvez maintenant recevoir des messages"
          : "Vous ne recevrez plus de nouveaux messages",
      })

      return true
    } catch (error) {
      console.error("Error updating preferences:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour vos préférences",
        variant: "destructive",
      })
      return false
    }
  }

  return {
    messages,
    sentMessages,
    blockedUsers,
    unreadCount,
    loading,
    sendMessage,
    markAsRead,
    blockUser,
    unblockUser,
    searchUsers,
    updateMessagePreferences,
    refreshMessages: loadMessages,
    refreshUnreadCount: loadUnreadCount,
  }
}
