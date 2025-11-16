"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { X } from 'lucide-react'

interface AvatarStyle {
  hairStyle: string
  hairColor: string
  skinTone: string
  topColor: string
  bottomColor: string
  shoeColor: string
  accessory: string
}

interface CustomizationOption {
  id: string
  category: string
  value: string
  label: string
  is_premium: boolean
}

interface AvatarCustomizerProps {
  userId: string
  currentStyle: AvatarStyle
  onSave: (style: AvatarStyle) => void
  onClose: () => void
}

export function AvatarCustomizer({ userId, currentStyle, onSave, onClose }: AvatarCustomizerProps) {
  const [style, setStyle] = useState<AvatarStyle>(currentStyle)
  const [options, setOptions] = useState<Record<string, CustomizationOption[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadOptions()
  }, [])

  const loadOptions = async () => {
    const { data, error } = await supabase
      .from("avatar_customization_options")
      .select("*")
      .order("category", { ascending: true })
      .order("is_premium", { ascending: true })

    if (error) {
      console.error("Error loading customization options:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les options de personnalisation",
        variant: "destructive",
      })
      return
    }

    // Group options by category
    const grouped: Record<string, CustomizationOption[]> = {}
    data.forEach((option) => {
      if (!grouped[option.category]) {
        grouped[option.category] = []
      }
      grouped[option.category].push(option)
    })

    setOptions(grouped)
    setIsLoading(false)
  }

  const handleSave = async () => {
    setIsSaving(true)

    const { error } = await supabase
      .from("interactive_profiles")
      .update({ avatar_style: style })
      .eq("user_id", userId)

    if (error) {
      console.error("Error saving avatar style:", error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder votre avatar",
        variant: "destructive",
      })
      setIsSaving(false)
      return
    }

    toast({
      title: "Avatar sauvegardé",
      description: "Votre personnalisation a été enregistrée avec succès",
    })

    onSave(style)
    setIsSaving(false)
    onClose()
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      hairStyle: "Coiffure",
      hairColor: "Couleur de cheveux",
      skinTone: "Teint de peau",
      topColor: "Couleur du haut",
      bottomColor: "Couleur du bas",
      shoeColor: "Couleur des chaussures",
      accessory: "Accessoire",
    }
    return labels[category] || category
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
        <Card className="p-6">
          <div className="text-center">Chargement...</div>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Personnaliser votre Avatar</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="bg-gradient-to-b from-sky-400 to-sky-200 rounded-lg p-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-sm text-gray-700 mb-4">Aperçu de votre avatar</div>
              <div className="space-y-2">
                <div
                  className="w-16 h-16 rounded-full mx-auto border-4"
                  style={{ backgroundColor: style.skinTone, borderColor: style.hairColor }}
                />
                <div
                  className="w-20 h-24 mx-auto rounded-lg"
                  style={{ backgroundColor: style.topColor }}
                />
                <div
                  className="w-16 h-20 mx-auto rounded-lg"
                  style={{ backgroundColor: style.bottomColor }}
                />
                <div className="flex justify-center gap-2">
                  <div
                    className="w-6 h-8 rounded"
                    style={{ backgroundColor: style.shoeColor }}
                  />
                  <div
                    className="w-6 h-8 rounded"
                    style={{ backgroundColor: style.shoeColor }}
                  />
                </div>
                {style.accessory !== "none" && (
                  <div className="text-xs text-gray-700 mt-2">
                    Accessoire: {options.accessory?.find(o => o.value === style.accessory)?.label || style.accessory}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customization Options */}
          <div className="space-y-6">
            {Object.entries(options).map(([category, categoryOptions]) => (
              <div key={category} className="space-y-2">
                <Label className="text-lg font-semibold">{getCategoryLabel(category)}</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {categoryOptions.map((option) => {
                    const isSelected = style[category as keyof AvatarStyle] === option.value
                    const isColor = category.includes("Color") || category === "skinTone"

                    return (
                      <button
                        key={option.id}
                        onClick={() => setStyle({ ...style, [category]: option.value })}
                        className={`
                          relative p-3 rounded-lg border-2 transition-all
                          ${isSelected ? "border-primary ring-2 ring-primary/50" : "border-gray-300 hover:border-gray-400"}
                          ${option.is_premium ? "ring-1 ring-yellow-500" : ""}
                        `}
                        title={option.label}
                      >
                        {isColor ? (
                          <div
                            className="w-full h-8 rounded"
                            style={{ backgroundColor: option.value }}
                          />
                        ) : (
                          <div className="text-xs text-center">{option.label}</div>
                        )}
                        {option.is_premium && (
                          <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs px-1 rounded-bl">
                            VIP
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
        </div>
      </Card>
    </div>
  )
}
