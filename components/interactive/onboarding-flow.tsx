"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Sparkles, User, Palette } from 'lucide-react'

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
  onComplete: () => void
}

export function OnboardingFlow({ userId, onComplete }: OnboardingFlowProps) {
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
    { id: "none", label: "Aucun" },
    { id: "glasses", label: "Lunettes" },
    { id: "hat", label: "Chapeau" },
    { id: "scarf", label: "Écharpe" },
  ]

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

    // Check if username is taken
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

    // Create or update interactive profile
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
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Avatar Preview */}
              <div className="bg-gradient-to-b from-sky-400 to-sky-200 rounded-xl p-8 flex flex-col items-center justify-center min-h-[500px]">
                <div className="text-sm font-semibold text-gray-700 mb-4">Aperçu</div>
                <div className="space-y-3">
                  {/* Head */}
                  <div
                    className="w-24 h-24 rounded-full mx-auto border-4 relative"
                    style={{
                      backgroundColor: avatarStyle.skinTone,
                      borderColor: avatarStyle.hairColor,
                    }}
                  >
                    {/* Eyes */}
                    <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-black rounded-full" />
                    <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-black rounded-full" />
                    {/* Mouth */}
                    <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-8 h-1 bg-black rounded-full" />
                  </div>
                  {/* Body - Top */}
                  <div
                    className="w-28 h-32 mx-auto rounded-lg"
                    style={{ backgroundColor: avatarStyle.topColor }}
                  />
                  {/* Body - Bottom */}
                  <div
                    className="w-24 h-28 mx-auto rounded-lg"
                    style={{ backgroundColor: avatarStyle.bottomColor }}
                  />
                  {/* Shoes */}
                  <div className="flex justify-center gap-3">
                    <div
                      className="w-8 h-10 rounded"
                      style={{ backgroundColor: avatarStyle.shoeColor }}
                    />
                    <div
                      className="w-8 h-10 rounded"
                      style={{ backgroundColor: avatarStyle.shoeColor }}
                    />
                  </div>
                  {avatarStyle.accessory !== "none" && (
                    <div className="text-sm text-gray-700 mt-2 font-medium">
                      {accessories.find((a) => a.id === avatarStyle.accessory)?.label}
                    </div>
                  )}
                </div>
              </div>

              {/* Customization Options */}
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                {/* Hair Style */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold">Coiffure</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {hairStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() =>
                          setAvatarStyle({ ...avatarStyle, hairStyle: style.id })
                        }
                        className={`p-3 rounded-lg border-2 text-sm transition-all ${
                          avatarStyle.hairStyle === style.id
                            ? "border-blue-500 bg-blue-50 font-semibold"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hair Color */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold">Couleur de cheveux</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {hairColors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() =>
                          setAvatarStyle({ ...avatarStyle, hairColor: color.id })
                        }
                        className={`w-12 h-12 rounded-full border-4 transition-all ${
                          avatarStyle.hairColor === color.id
                            ? "border-blue-500 scale-110"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{ backgroundColor: color.id }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Skin Tone */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold">Teint de peau</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {skinTones.map((tone) => (
                      <button
                        key={tone.id}
                        onClick={() =>
                          setAvatarStyle({ ...avatarStyle, skinTone: tone.id })
                        }
                        className={`w-12 h-12 rounded-full border-4 transition-all ${
                          avatarStyle.skinTone === tone.id
                            ? "border-blue-500 scale-110"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{ backgroundColor: tone.id }}
                        title={tone.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Top Color */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold">Couleur du haut</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {clothingColors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() =>
                          setAvatarStyle({ ...avatarStyle, topColor: color.id })
                        }
                        className={`w-12 h-12 rounded-lg border-4 transition-all ${
                          avatarStyle.topColor === color.id
                            ? "border-blue-500 scale-110"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{ backgroundColor: color.id }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Bottom Color */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold">Couleur du bas</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {clothingColors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() =>
                          setAvatarStyle({ ...avatarStyle, bottomColor: color.id })
                        }
                        className={`w-12 h-12 rounded-lg border-4 transition-all ${
                          avatarStyle.bottomColor === color.id
                            ? "border-blue-500 scale-110"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{ backgroundColor: color.id }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Shoe Color */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold">Couleur des chaussures</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {clothingColors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() =>
                          setAvatarStyle({ ...avatarStyle, shoeColor: color.id })
                        }
                        className={`w-12 h-12 rounded-lg border-4 transition-all ${
                          avatarStyle.shoeColor === color.id
                            ? "border-blue-500 scale-110"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{ backgroundColor: color.id }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Accessories */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold">Accessoire</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {accessories.map((accessory) => (
                      <button
                        key={accessory.id}
                        onClick={() =>
                          setAvatarStyle({ ...avatarStyle, accessory: accessory.id })
                        }
                        className={`p-3 rounded-lg border-2 text-sm transition-all ${
                          avatarStyle.accessory === accessory.id
                            ? "border-blue-500 bg-blue-50 font-semibold"
                            : "border-gray-300 hover:border-gray-400"
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
                className="flex-1 text-lg"
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
