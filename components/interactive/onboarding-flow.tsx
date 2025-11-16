"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Sparkles, User, Palette, Crown } from 'lucide-react'

interface AvatarStyle {
  hairStyle: string
  hairColor: string
  skinTone: string
  topColor: string
  bottomColor: string
  shoeColor: string
  accessory: string
}

interface OnboardingFlowProps {
  userId: string
  userRole?: 'member' | 'vip' | 'vip_plus' | 'admin'
  onComplete: () => void
}

export function OnboardingFlow({ userId, userRole = 'member', onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState("")
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>({
    hairStyle: "short",
    hairColor: "#2c1810",
    skinTone: "#f5d7b1",
    topColor: "#3b82f6",
    bottomColor: "#1e293b",
    shoeColor: "#000000",
    accessory: "none",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const hairStyles = [
    { id: "short", label: "Court" },
    { id: "long", label: "Long" },
    { id: "curly", label: "Bouclé" },
    { id: "bald", label: "Chauve" },
    { id: "ponytail", label: "Queue de cheval" },
    { id: "afro", label: "Afro" },
  ]

  const hairColors = [
    { id: "#2c1810", label: "Brun foncé" },
    { id: "#8b4513", label: "Châtain" },
    { id: "#ffd700", label: "Blond" },
    { id: "#ff6347", label: "Roux" },
    { id: "#ffffff", label: "Blanc" },
    { id: "#9b59b6", label: "Violet" },
  ]

  const skinTones = [
    { id: "#f5d7b1", label: "Clair" },
    { id: "#e8b896", label: "Moyen clair" },
    { id: "#d4a574", label: "Moyen" },
    { id: "#b8865a", label: "Olive" },
    { id: "#8d5524", label: "Foncé" },
    { id: "#5c3317", label: "Très foncé" },
  ]

  const clothingColors = [
    { id: "#3b82f6", label: "Bleu" },
    { id: "#ef4444", label: "Rouge" },
    { id: "#10b981", label: "Vert" },
    { id: "#f59e0b", label: "Orange" },
    { id: "#8b5cf6", label: "Violet" },
    { id: "#1e293b", label: "Noir" },
    { id: "#ffffff", label: "Blanc" },
  ]

  const accessories = [
    { id: "none", label: "Aucun", requiredRole: null },
    { id: "glasses", label: "Lunettes", requiredRole: null },
    { id: "hat", label: "Chapeau", requiredRole: null },
    { id: "scarf", label: "Écharpe", requiredRole: null },
    { id: "vip_badge", label: "Badge VIP ⭐", requiredRole: 'vip' },
    { id: "vip_plus_crown", label: "Couronne VIP+ 👑", requiredRole: 'vip_plus' },
    { id: "admin_crown", label: "Couronne Admin 🔥", requiredRole: 'admin' },
    { id: "admin_aura", label: "Aura Admin ✨", requiredRole: 'admin' },
  ]

  const availableAccessories = accessories.filter(acc => {
    if (!acc.requiredRole) return true
    if (userRole === 'admin') return true
    if (userRole === 'vip_plus' && (acc.requiredRole === 'vip' || acc.requiredRole === 'vip_plus')) return true
    if (userRole === 'vip' && acc.requiredRole === 'vip') return true
    return false
  })

  const handleCreateProfile = async () => {
    if (!username.trim()) {
      toast({
        title: "Nom d'utilisateur requis",
        description: "Veuillez entrer un nom d'utilisateur",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const { data: existingProfile } = await supabase
      .from("interactive_profiles")
      .select("id")
      .eq("username", username.trim())
      .single()

    if (existingProfile) {
      toast({
        title: "Nom d'utilisateur déjà pris",
        description: "Veuillez choisir un autre nom d'utilisateur",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    setStep(2)
    setIsLoading(false)
  }

  const handleCompleteOnboarding = async () => {
    setIsLoading(true)

    const { error } = await supabase.from("interactive_profiles").upsert({
      user_id: userId,
      username: username.trim(),
      avatar_style: avatarStyle,
      is_online: true,
      current_room: "city",
      position_x: 0,
      position_y: 0.5,
      position_z: 0,
      rotation: 0,
    })

    if (error) {
      console.error("Error creating profile:", error)
      toast({
        title: "Erreur",
        description: "Impossible de créer votre profil",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    toast({
      title: "Bienvenue dans WaveWatch World!",
      description: "Votre profil a été créé avec succès",
    })

    onComplete()
  }

  const getRoleBadge = () => {
    switch (userRole) {
      case 'admin': return { icon: <Crown className="w-5 h-5 text-red-500" />, label: "ADMIN" }
      case 'vip_plus': return { icon: <Crown className="w-5 h-5 text-purple-500" />, label: "VIP+" }
      case 'vip': return { icon: <Crown className="w-5 h-5 text-yellow-500" />, label: "VIP" }
      default: return null
    }
  }

  const roleBadge = getRoleBadge()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl p-8 bg-white/95 backdrop-blur">
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Bienvenue dans WaveWatch World
              </h1>
              <p className="text-lg text-muted-foreground">
                Créez votre profil pour commencer votre aventure
              </p>
              {roleBadge && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full border-2 border-yellow-400">
                  {roleBadge.icon}
                  <span className="font-bold text-gray-800">{roleBadge.label}</span>
                </div>
              )}
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Nom d'utilisateur
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Entrez votre nom d'utilisateur"
                  maxLength={20}
                  className="text-lg p-6"
                />
                <p className="text-sm text-muted-foreground">
                  Ce nom sera visible par les autres joueurs
                </p>
              </div>

              <Button
                onClick={handleCreateProfile}
                disabled={isLoading || !username.trim()}
                className="w-full text-lg py-6"
                size="lg"
              >
                Continuer
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold">Personnalisez votre Avatar</h2>
              <p className="text-muted-foreground">
                Créez un avatar unique qui vous représente
              </p>
              {roleBadge && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full border-2 border-yellow-400">
                  {roleBadge.icon}
                  <span className="font-bold text-gray-800">Accessoires exclusifs {roleBadge.label} disponibles!</span>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-b from-sky-400 to-sky-200 rounded-xl p-8 flex flex-col items-center justify-center min-h-[500px] border-4 border-white/30">
                <div className="text-sm font-semibold text-gray-700 mb-4 bg-white/50 px-4 py-1 rounded-full">Aperçu de votre avatar</div>
                <div className="space-y-4 scale-110">
                  {/* Tête avec teint de peau */}
                  <div
                    className="w-24 h-24 rounded-full mx-auto border-4 relative shadow-lg"
                    style={{
                      backgroundColor: avatarStyle.skinTone,
                      borderColor: avatarStyle.hairColor,
                      borderWidth: '6px'
                    }}
                  >
                    {/* Yeux */}
                    <div className="absolute top-8 left-5 w-3 h-3 bg-gray-800 rounded-full" />
                    <div className="absolute top-8 right-5 w-3 h-3 bg-gray-800 rounded-full" />
                    {/* Sourire */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-10 h-2 bg-gray-800 rounded-full" />
                  </div>
                  
                  {/* Corps - Haut */}
                  <div
                    className="w-28 h-32 mx-auto rounded-lg shadow-md border-2 border-white/30"
                    style={{ backgroundColor: avatarStyle.topColor }}
                  />
                  
                  {/* Corps - Bas */}
                  <div
                    className="w-24 h-28 mx-auto rounded-lg shadow-md border-2 border-white/30"
                    style={{ backgroundColor: avatarStyle.bottomColor }}
                  />
                  
                  {/* Chaussures */}
                  <div className="flex justify-center gap-4">
                    <div
                      className="w-10 h-12 rounded shadow-md border-2 border-white/30"
                      style={{ backgroundColor: avatarStyle.shoeColor }}
                    />
                    <div
                      className="w-10 h-12 rounded shadow-md border-2 border-white/30"
                      style={{ backgroundColor: avatarStyle.shoeColor }}
                    />
                  </div>
                  
                  {/* Accessoire badge */}
                  {avatarStyle.accessory !== "none" && (
                    <div className="text-center mt-3 bg-white/70 px-3 py-1 rounded-full mx-auto inline-block">
                      <div className="text-sm text-gray-800 font-semibold">
                        {availableAccessories.find((a) => a.id === avatarStyle.accessory)?.label}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                <div className="space-y-3">
                  <Label className="text-lg font-semibold">Coiffure</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {hairStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() =>
                          setAvatarStyle({ ...avatarStyle, hairStyle: style.id })
                        }
                        className={`p-3 rounded-lg border-2 text-sm transition-all font-medium ${
                          avatarStyle.hairStyle === style.id
                            ? "border-blue-500 bg-blue-100 text-blue-900 shadow-md scale-105"
                            : "border-gray-300 bg-white hover:border-gray-400 hover:shadow"
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-semibold">Couleur de cheveux</Label>
                  <div className="grid grid-cols-6 gap-3">
                    {hairColors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() =>
                          setAvatarStyle({ ...avatarStyle, hairColor: color.id })
                        }
                        className={`w-14 h-14 rounded-full border-4 transition-all shadow-md hover:scale-110 ${
                          avatarStyle.hairColor === color.id
                            ? "border-blue-500 scale-110 ring-4 ring-blue-200"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{ backgroundColor: color.id }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-semibold">Teint de peau</Label>
                  <div className="grid grid-cols-6 gap-3">
                    {skinTones.map((tone) => (
                      <button
                        key={tone.id}
                        onClick={() =>
                          setAvatarStyle({ ...avatarStyle, skinTone: tone.id })
                        }
                        className={`w-14 h-14 rounded-full border-4 transition-all shadow-md hover:scale-110 ${
                          avatarStyle.skinTone === tone.id
                            ? "border-blue-500 scale-110 ring-4 ring-blue-200"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{ backgroundColor: tone.id }}
                        title={tone.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-semibold">Couleur du haut</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {clothingColors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() =>
                          setAvatarStyle({ ...avatarStyle, topColor: color.id })
                        }
                        className={`w-12 h-12 rounded-lg border-4 transition-all shadow-md hover:scale-110 ${
                          avatarStyle.topColor === color.id
                            ? "border-blue-500 scale-110 ring-4 ring-blue-200"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{ 
                          backgroundColor: color.id,
                          border: color.id === "#ffffff" ? "4px solid #e5e7eb" : undefined
                        }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-semibold">Couleur du bas</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {clothingColors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() =>
                          setAvatarStyle({ ...avatarStyle, bottomColor: color.id })
                        }
                        className={`w-12 h-12 rounded-lg border-4 transition-all shadow-md hover:scale-110 ${
                          avatarStyle.bottomColor === color.id
                            ? "border-blue-500 scale-110 ring-4 ring-blue-200"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{ 
                          backgroundColor: color.id,
                          border: color.id === "#ffffff" ? "4px solid #e5e7eb" : undefined
                        }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-semibold">Couleur des chaussures</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {clothingColors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() =>
                          setAvatarStyle({ ...avatarStyle, shoeColor: color.id })
                        }
                        className={`w-12 h-12 rounded-lg border-4 transition-all shadow-md hover:scale-110 ${
                          avatarStyle.shoeColor === color.id
                            ? "border-blue-500 scale-110 ring-4 ring-blue-200"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{ 
                          backgroundColor: color.id,
                          border: color.id === "#ffffff" ? "4px solid #e5e7eb" : undefined
                        }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-semibold">Accessoire</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableAccessories.map((accessory) => (
                      <button
                        key={accessory.id}
                        onClick={() =>
                          setAvatarStyle({ ...avatarStyle, accessory: accessory.id })
                        }
                        className={`p-3 rounded-lg border-2 text-sm transition-all font-medium ${
                          avatarStyle.accessory === accessory.id
                            ? "border-blue-500 bg-blue-100 text-blue-900 shadow-md scale-105"
                            : accessory.requiredRole
                            ? "border-yellow-400 bg-yellow-50 hover:border-yellow-500 hover:shadow"
                            : "border-gray-300 bg-white hover:border-gray-400 hover:shadow"
                        }`}
                      >
                        {accessory.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={isLoading}
                className="flex-1"
              >
                Retour
              </Button>
              <Button
                onClick={handleCompleteOnboarding}
                disabled={isLoading}
                className="flex-1 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                {isLoading ? "Création..." : "Entrer dans le monde"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
