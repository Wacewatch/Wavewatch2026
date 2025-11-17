"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"
import InteractiveWorld from "@/components/interactive/world-3d"

export default function InteractivePage() {
  const [hasProfile, setHasProfile] = useState(false)
  const [username, setUsername] = useState("")
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showWorld, setShowWorld] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [checkingProfile, setCheckingProfile] = useState(true)
  const [avatarStyle, setAvatarStyle] = useState({
    bodyColor: '#3b82f6',
    headColor: '#fde68a',
    skinTone: '#fbbf24'
  })

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

    console.log('[v0] Checking interactive profile...')
    setCheckingProfile(true)

    const { data: interactiveProfile, error: profileError } = await supabase
      .from("interactive_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    console.log('[v0] Interactive profile:', interactiveProfile)
    console.log('[v0] Profile error:', profileError)

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("username, is_admin, is_vip, is_vip_plus")
      .eq("user_id", user.id)
      .maybeSingle()

    console.log('[v0] User profile:', profile)

    if (interactiveProfile && interactiveProfile.username && interactiveProfile.username.trim() !== '') {
      console.log('[v0] Found existing profile with username:', interactiveProfile.username)
      setHasProfile(true)
      setUserProfile(profile)
      setShowWorld(true)
    } else {
      console.log('[v0] No profile or no username, showing onboarding')
      setHasProfile(false)
    }

    setCheckingProfile(false)
  }

  const handleCreateProfile = async () => {
    if (!user || !username.trim()) return

    console.log('[v0] Creating profile with username:', username.trim())

    const { error } = await supabase
      .from("interactive_profiles")
      .upsert({
        user_id: user.id,
        username: username.trim(),
        position_x: 0,
        position_y: 0.5,
        position_z: 0,
        is_online: true,
        last_seen: new Date().toISOString(),
        avatar_style: avatarStyle
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('[v0] Error creating profile:', error)
      return
    }

    console.log('[v0] Profile created successfully')
    
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("username, is_admin, is_vip, is_vip_plus")
      .eq("user_id", user.id)
      .maybeSingle()

    setUserProfile(profile)
    setHasProfile(true)
    setShowWorld(true)
  }

  if (loading || checkingProfile) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Chargement...</div>
      </div>
    )
  }

  if (showOnboarding) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl max-w-md w-full mx-4">
          <h1 className="text-3xl font-bold text-white mb-6">Personnalisez votre Avatar</h1>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-white text-sm mb-2 block">Couleur du Corps</label>
              <div className="grid grid-cols-5 gap-2">
                {['#3b82f6', '#ef4444', '#22c55e', '#a855f7', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6', '#10b981', '#f43f5e'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setAvatarStyle({ ...avatarStyle, bodyColor: color })}
                    className={`w-10 h-10 rounded-lg border-2 ${
                      avatarStyle.bodyColor === color ? 'border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">Teint de Peau</label>
              <div className="grid grid-cols-5 gap-2">
                {['#fde68a', '#fca5a5', '#d4a373', '#c68642', '#8b6f47', '#fdba74', '#f0abfc', '#c4b5fd', '#a7f3d0', '#cbd5e1'].map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      setAvatarStyle({
                        ...avatarStyle,
                        headColor: color,
                        skinTone: color
                      })
                    }
                    className={`w-10 h-10 rounded-lg border-2 ${
                      avatarStyle.headColor === color ? 'border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleCreateProfile}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Entrer dans le monde
          </button>
        </div>
      </div>
    )
  }

  if (!hasProfile) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl max-w-md w-full mx-4">
          <h1 className="text-3xl font-bold text-white mb-6">Bienvenue dans WaveWatch World</h1>
          <p className="text-white/80 mb-4">Choisissez votre nom d'utilisateur pour commencer</p>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nom d'utilisateur"
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border-2 border-white/30 mb-4"
            maxLength={20}
            onKeyDown={(e) => e.key === 'Enter' && username.trim() && setShowOnboarding(true)}
          />
          <button
            onClick={() => setShowOnboarding(true)}
            disabled={!username.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Continuer
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
