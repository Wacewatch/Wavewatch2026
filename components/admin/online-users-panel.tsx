"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { Crown, Star, Shield, MapPin } from 'lucide-react'

export function OnlineUsersPanel({ users }: { users: any[] }) {
  const [onlineUsers, setOnlineUsers] = useState(users)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to presence changes
    const channel = supabase.channel("online-users-admin")
    
    channel
      .on("presence", { event: "sync" }, () => {
        // Refresh user list
        refreshUsers()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const refreshUsers = async () => {
    const { data } = await supabase
      .from("interactive_profiles")
      .select("*, user_profiles(username, is_vip, is_vip_plus, is_admin)")
      .eq("is_online", true)

    if (data) {
      setOnlineUsers(data)
    }
  }

  const getRoleIcon = (profile: any) => {
    if (profile.user_profiles?.is_admin) return <Shield className="w-4 h-4 text-red-500" />
    if (profile.user_profiles?.is_vip_plus) return <Crown className="w-4 h-4 text-purple-500" />
    if (profile.user_profiles?.is_vip) return <Star className="w-4 h-4 text-yellow-500" />
    return null
  }

  const getRoleBadge = (profile: any) => {
    if (profile.user_profiles?.is_admin) return <Badge variant="destructive">Admin</Badge>
    if (profile.user_profiles?.is_vip_plus) return <Badge className="bg-purple-500">VIP+</Badge>
    if (profile.user_profiles?.is_vip) return <Badge className="bg-yellow-500">VIP</Badge>
    return <Badge variant="secondary">Membre</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Utilisateurs En Ligne: {onlineUsers.length}</h3>
      </div>

      <div className="grid gap-3">
        {onlineUsers.map((user) => (
          <div key={user.id} className="p-4 border rounded-lg flex items-center gap-4">
            <Avatar>
              <AvatarFallback>
                {user.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                {getRoleIcon(user)}
                <span className="font-medium">{user.username || "Anonyme"}</span>
                {getRoleBadge(user)}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{user.current_room || "Ville"}</span>
                <span>•</span>
                <span>
                  Position: ({user.position_x?.toFixed(1)}, {user.position_z?.toFixed(1)})
                </span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              {new Date(user.last_seen).toLocaleTimeString()}
            </div>
          </div>
        ))}

        {onlineUsers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucun utilisateur en ligne actuellement
          </div>
        )}
      </div>
    </div>
  )
}
