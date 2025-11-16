"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, MessageSquare } from 'lucide-react'
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface ChatPanelProps {
  userId: string
  username: string
}

interface ChatMessage {
  id: string
  username: string
  message: string
  created_at: string
}

export function ChatPanel({ userId, username }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Load recent messages
    const loadMessages = async () => {
      const { data } = await supabase
        .from("interactive_chat_messages")
        .select("*")
        .eq("room", "entrance")
        .order("created_at", { ascending: false })
        .limit(50)

      if (data) {
        setMessages(data.reverse())
      }
    }

    loadMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel("chat-entrance")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "interactive_chat_messages",
          filter: "room=eq.entrance",
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage])
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const supabase = createClient()
    await supabase.from("interactive_chat_messages").insert({
      user_id: userId,
      username,
      message: newMessage.trim(),
      room: "entrance",
    })

    setNewMessage("")
  }

  return (
    <div className="absolute bottom-4 left-4 w-80">
      {!isOpen ? (
        <Button onClick={() => setIsOpen(true)} className="gap-2">
          <MessageSquare className="w-4 h-4" />
          Chat
        </Button>
      ) : (
        <div className="bg-background/95 backdrop-blur-sm rounded-lg border shadow-lg">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat - Entrée
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              ✕
            </Button>
          </div>

          <ScrollArea className="h-64 p-3" ref={scrollRef}>
            <div className="space-y-2">
              {messages.map((msg) => (
                <div key={msg.id} className="text-sm">
                  <span className="font-semibold text-primary">{msg.username}:</span>{" "}
                  <span className="text-foreground">{msg.message}</span>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-3 border-t flex gap-2">
            <Input
              placeholder="Message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              maxLength={200}
            />
            <Button size="icon" onClick={handleSendMessage}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
