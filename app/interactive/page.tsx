"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"
import InteractiveWorld from "@/components/interactive/world-3d" // Import the InteractiveWorld component

export default function InteractivePage() {
  const [hasProfile, setHasProfile] = useState(false)
  const [username, setUsername] = useState("")
  const [showWorld, setShowWorld] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  
  const router = useRouter()
  const { user, loading } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push("/login")
      return
    }
    checkProfile()
  }, [user, loading])

  const checkProfile = async () => {
    if (!user) return

    const { data: interactiveProfile } = await supabase
      .from("interactive_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("username, is_admin, is_vip, is_vip_plus")
      .eq("user_id", user.id)
      .single()

    if (interactiveProfile?.username) {
      setHasProfile(true)
      setUserProfile(profile)
      setShowWorld(true)
    }
  }

  const handleCreateProfile = async () => {
    if (!user || !username.trim()) return

    const { error } = await supabase
      .from("interactive_profiles")
      .insert({
        user_id: user.id,
        username: username.trim(),
        position_x: 0,
        position_y: 0,
        position_z: 0
      })

    if (!error) {
      setHasProfile(true)
      setShowWorld(true)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Chargement...</div>
      </div>
    )
  }

  if (!hasProfile) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl max-w-md w-full mx-4">
          <h1 className="text-3xl font-bold text-white mb-6">Bienvenue dans WaveWatch World</h1>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choisissez votre nom d'utilisateur"
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border-2 border-white/30 mb-4"
            maxLength={20}
          />
          <button
            onClick={handleCreateProfile}
            disabled={!username.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            Entrer dans le monde
          </button>
        </div>
      </div>
    )
  }

  if (showWorld) {
    return <InteractiveWorld userId={user!.id} userProfile={userProfile} />
  }

  return null
}
