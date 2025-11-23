"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from 'next/navigation'
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"
import dynamic from 'next/dynamic'
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { User, AlertTriangle } from 'lucide-react'
import { Button } from "@/components/ui/button"

const InteractiveWorld = dynamic(() => import("@/components/interactive/world-3d"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black flex items-center justify-center"><div className="text-white text-2xl">Chargement du monde 3D...</div></div>
})

// Validation function for username
const validateUsername = (username: string): boolean => {
  return username.trim().length >= 3 && username.trim().length <= 20
}

// Sanitize username
const sanitizeUsername = (username: string): string => {
  return username.trim().replace(/[^a-zA-Z0-9_-]/g, '')
}

export default function InteractivePage() {
  const [hasProfile, setHasProfile] = useState(false)
  const [username, setUsername] = useState("")
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showWorld, setShowWorld] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [checkingProfile, setCheckingProfile] = useState(true)
  const [showConstructionWarning, setShowConstructionWarning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarStyle, setAvatarStyle] = useState({
    bodyColor: '#3b82f6',
    headColor: '#fde68a',
    skinTone: '#fbbf24',
    hairStyle: 'short',
    hairColor: '#1f2937',
    accessory: 'none',
    faceSmiley: '😊'
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

  const checkProfile = useCallback(async () => {
    if (!user) return

    console.log('[v0] Checking profiles for user:', user.id)
    setCheckingProfile(true)
    setError(null)

    try {
      const [interactiveResult, userProfileResult] = await Promise.all([
        supabase
          .from("interactive_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("user_profiles")
          .select("id, username, is_admin, is_vip, is_vip_plus")
          .eq("id", user.id)
          .maybeSingle()
      ])

      console.log('[v0] Interactive profile:', interactiveResult.data)
      console.log('[v0] User profile from DB:', userProfileResult.data)

      const fallbackUserProfile = {
        id: user.id,
        username: user.email?.split('@')[0] || `user_${user.id.substring(0, 8)}`,
        is_admin: false,
        is_vip: false,
        is_vip_plus: false
      }

      const effectiveUserProfile = userProfileResult.data || fallbackUserProfile
      setUserProfile(effectiveUserProfile)

      console.log('[v0] Effective user profile:', effectiveUserProfile)

      const interactiveProfile = interactiveResult.data

      if (interactiveProfile && interactiveProfile.username && interactiveProfile.username.trim() !== '') {
        console.log('[v0] Found existing interactive profile')
        setHasProfile(true)
        setShowConstructionWarning(true)
      } else {
        console.log('[v0] No interactive profile found, showing username input')
        setHasProfile(false)
        setUsername(effectiveUserProfile.username || '')
      }
    } catch (err) {
      console.error('[v0] Error checking profiles:', err)
      setError(`Erreur lors de la vérification des profils: ${err}`)
      setHasProfile(false)
    } finally {
      setCheckingProfile(false)
    }
  }, [user, supabase])

  const handleCreateProfile = async () => {
    if (!user || !username.trim()) {
      setError('Nom d\'utilisateur manquant')
      return
    }

    const sanitizedUsername = sanitizeUsername(username)
    
    if (!validateUsername(sanitizedUsername)) {
      setError('Le nom d\'utilisateur doit contenir entre 3 et 20 caractères')
      return
    }

    console.log('[v0] Creating interactive profile with username:', sanitizedUsername)
    console.log('[v0] Avatar style:', avatarStyle)

    setError(null)

    try {
      const { data, error } = await supabase
        .from("interactive_profiles")
        .upsert({
          user_id: user.id,
          username: sanitizedUsername,
          position_x: 0,
          position_y: 0.5,
          position_z: 0,
          is_online: true,
          last_seen: new Date().toISOString(),
          avatar_style: avatarStyle,
          current_room: null
        }, {
          onConflict: 'user_id'
        })
        .select()

      if (error) {
        console.error('[v0] Error creating interactive profile:', error)
        setError(`Erreur lors de la création du profil: ${error.message}`)
        return
      }

      console.log('[v0] Interactive profile created successfully:', data)
      
      setHasProfile(true)
      setShowOnboarding(false)
      setShowConstructionWarning(true)
    } catch (err) {
      console.error('[v0] Unexpected error during profile creation:', err)
      setError(`Erreur inattendue: ${err}`)
    }
  }

  const handleEnterWorld = () => {
    setShowConstructionWarning(false)
    setShowWorld(true)
  }

  // Prevent unload when in world
  useEffect(() => {
    const preventUnload = (e: BeforeUnloadEvent) => {
      if (showWorld) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && showWorld) {
        console.log('[v0] Tab became visible, maintaining state')
      }
    }

    window.addEventListener('beforeunload', preventUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', preventUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [showWorld])

  if (loading || checkingProfile) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-white text-2xl">Chargement...</div>
      </div>
    )
  }

  if (showConstructionWarning) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-500/50 rounded-2xl max-w-2xl w-full p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-yellow-500/20 p-4 rounded-full">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold text-white">🚧 Page en construction</h2>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-yellow-400 mb-4">Ouverte pour tests</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Cette page est actuellement en développement, mais elle est ouverte pour effectuer des tests.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              Merci d'être <span className="text-yellow-400 font-semibold">respectueux</span> et de faire preuve de <span className="text-yellow-400 font-semibold">compréhension</span> durant cette phase.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Vos <span className="text-blue-400 font-semibold">retours</span> et votre <span className="text-blue-400 font-semibold">comportement</span> aideront à améliorer l'expérience finale.
            </p>
          </div>

          <p className="text-center text-lg text-white mb-6 font-medium">
            Bonne exploration ! 🎮
          </p>

          <div className="flex gap-4">
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="flex-1 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Retour
            </Button>
            <Button
              onClick={handleEnterWorld}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
            >
              J'ai compris, entrer
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (showOnboarding) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-blue-900 via-purple-900 to-black flex items-center justify-center p-2 sm:p-4 overflow-y-auto z-50">
        <div className="bg-black/40 backdrop-blur-2xl p-3 sm:p-4 md:p-8 rounded-3xl max-w-6xl w-full my-2 sm:my-4 border-2 border-white/20 shadow-2xl max-h-[98vh] overflow-y-auto">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-1 sm:mb-2 text-center">Créez Votre Avatar</h1>
          <p className="text-white/60 text-center mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm md:text-base">Personnalisez votre apparence</p>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4 text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div className="bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-2xl p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center min-h-[250px] sm:min-h-[300px] md:min-h-[400px] border-2 border-white/10">
              <div className="w-full h-48 sm:h-64 md:h-80 bg-black/30 rounded-xl mb-2 sm:mb-4 overflow-hidden">
                <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}>
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[5, 5, 5]} intensity={1} />
                  <pointLight position={[-5, 5, -5]} intensity={0.5} color="#60a5fa" />
                  
                  <group position={[0, 0, 0]} rotation={[0, Math.PI * 0.15, 0]}>
                    <mesh position={[0, 0.575, 0]}>
                      <boxGeometry args={[0.6, 0.45, 0.35]} />
                      <meshStandardMaterial color={avatarStyle.bodyColor} />
                    </mesh>
                    <mesh position={[0, 1.05, 0]}>
                      <sphereGeometry args={[0.32, 32, 32]} />
                      <meshStandardMaterial color={avatarStyle.skinTone} />
                    </mesh>
                    
                    {avatarStyle.hairStyle === 'short' && (
                      <mesh position={[0, 1.25, 0]}>
                        <sphereGeometry args={[0.34, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <meshStandardMaterial color={avatarStyle.hairColor} />
                      </mesh>
                    )}
                    {avatarStyle.hairStyle === 'long' && (
                      <>
                        <mesh position={[0, 1.25, 0]}>
                          <sphereGeometry args={[0.36, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.5]} />
                          <meshStandardMaterial color={avatarStyle.hairColor} />
                        </mesh>
                        <mesh position={[0, 0.8, -0.3]}>
                          <boxGeometry args={[0.5, 0.6, 0.2]} />
                          <meshStandardMaterial color={avatarStyle.hairColor} />
                        </mesh>
                      </>
                    )}
                    
                    {avatarStyle.accessory === 'glasses' && (
                      <>
                        <mesh position={[-0.15, 1.05, 0.28]}>
                          <torusGeometry args={[0.08, 0.02, 8, 16]} />
                          <meshStandardMaterial color="#1f2937" metalness={0.8} />
                        </mesh>
                        <mesh position={[0.15, 1.05, 0.28]}>
                          <torusGeometry args={[0.08, 0.02, 8, 16]} />
                          <meshStandardMaterial color="#1f2937" metalness={0.8} />
                        </mesh>
                        <mesh position={[0, 1.05, 0.28]}>
                          <boxGeometry args={[0.12, 0.02, 0.02]} />
                          <meshStandardMaterial color="#1f2937" metalness={0.8} />
                        </mesh>
                      </>
                    )}
                    {avatarStyle.accessory === 'hat' && (
                      <>
                        <mesh position={[0, 1.35, 0]}>
                          <cylinderGeometry args={[0.35, 0.35, 0.15, 16]} />
                          <meshStandardMaterial color="#ef4444" />
                        </mesh>
                        <mesh position={[0, 1.45, 0]}>
                          <cylinderGeometry args={[0.25, 0.35, 0.2, 16]} />
                          <meshStandardMaterial color="#ef4444" />
                        </mesh>
                      </>
                    )}
                    
                    <group position={[-0.45, 0.5, 0]}>
                      <mesh position={[0, -0.25, 0]}>
                        <boxGeometry args={[0.2, 0.7, 0.2]} />
                        <meshStandardMaterial color={avatarStyle.bodyColor} />
                      </mesh>
                    </group>
                    <group position={[0.45, 0.5, 0]}>
                      <mesh position={[0, -0.25, 0]}>
                        <boxGeometry args={[0.2, 0.7, 0.2]} />
                        <meshStandardMaterial color={avatarStyle.bodyColor} />
                      </mesh>
                    </group>
                    <group position={[-0.2, 0.15, 0]}>
                      <mesh position={[0, -0.35, 0]}>
                        <boxGeometry args={[0.22, 0.7, 0.22]} />
                        <meshStandardMaterial color="#2563eb" />
                      </mesh>
                    </group>
                    <group position={[0.2, 0.15, 0]}>
                      <mesh position={[0, -0.35, 0]}>
                        <boxGeometry args={[0.22, 0.7, 0.22]} />
                        <meshStandardMaterial color="#2563eb" />
                      </mesh>
                    </group>
                  </group>
                  
                  <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
                </Canvas>
              </div>
              <p className="text-white/80 text-xs md:text-sm text-center">Votre avatar tourne automatiquement</p>
            </div>

            {/* Avatar customization options - shortened for brevity */}
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {/* Body Color */}
              <div>
                <label className="text-white font-semibold mb-2 block">Couleur du Corps</label>
                <div className="grid grid-cols-4 gap-2">
                  {['#3b82f6', '#ef4444', '#22c55e', '#a855f7', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setAvatarStyle({ ...avatarStyle, bodyColor: color })}
                      className={`w-12 h-12 rounded-xl border-4 transition-all ${
                        avatarStyle.bodyColor === color ? 'border-white scale-110' : 'border-white/20'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Skin Tone */}
              <div>
                <label className="text-white font-semibold mb-2 block">Teint de Peau</label>
                <div className="grid grid-cols-4 gap-2">
                  {['#fde68a', '#fca5a5', '#d4a373', '#c68642', '#8b6f47', '#fdba74'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setAvatarStyle({ ...avatarStyle, headColor: color, skinTone: color })}
                      className={`w-12 h-12 rounded-xl border-4 transition-all ${
                        avatarStyle.skinTone === color ? 'border-white scale-110' : 'border-white/20'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleCreateProfile}
            disabled={!username.trim() || username.trim().length < 3}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all mt-6 shadow-2xl disabled:opacity-50"
          >
            <User className="w-5 h-5 mr-2 inline" />
            Entrer dans le Monde
          </Button>
        </div>
      </div>
    )
  }

  if (!hasProfile) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-blue-900 to-purple-900 flex items-center justify-center z-50">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl max-w-md w-full mx-4">
          <h1 className="text-3xl font-bold text-white mb-6">Bienvenue dans WaveWatch World</h1>
          <p className="text-white/80 mb-4">Choisissez votre nom d'utilisateur pour commencer</p>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4 text-red-200 text-sm">
              {error}
            </div>
          )}

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nom d'utilisateur (3-20 caractères)"
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border-2 border-white/30 mb-4"
            maxLength={20}
            onKeyDown={(e) => e.key === 'Enter' && username.trim().length >= 3 && setShowOnboarding(true)}
          />
          <Button
            onClick={() => setShowOnboarding(true)}
            disabled={!username.trim() || username.trim().length < 3}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Continuer
          </Button>
        </div>
      </div>
    )
  }

  if (showWorld) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <InteractiveWorld userId={user!.id} userProfile={userProfile} />
      </div>
    )
  }

  return null
}
