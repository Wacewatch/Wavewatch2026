"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Save } from 'lucide-react'

export function WorldSettingsPanel({ settings }: { settings: any[] }) {
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const worldTheme = settings.find(s => s.setting_key === "world_theme")?.setting_value || {}
  const worldCapacity = settings.find(s => s.setting_key === "world_capacity")?.setting_value || {}

  const [skyColor, setSkyColor] = useState(worldTheme.skyColor || "#1a1a2e")
  const [fogDensity, setFogDensity] = useState(worldTheme.fogDensity || 0.005)
  const [lightingIntensity, setLightingIntensity] = useState(worldTheme.lightingIntensity || 1.5)
  const [maxUsers, setMaxUsers] = useState(worldCapacity.maxUsers || 100)
  const [maxPerRoom, setMaxPerRoom] = useState(worldCapacity.maxPerRoom || 50)

  const handleSave = async () => {
    setIsSaving(true)

    const updates = [
      {
        setting_key: "world_theme",
        setting_value: { skyColor, fogDensity, lightingIntensity }
      },
      {
        setting_key: "world_capacity",
        setting_value: { maxUsers, maxPerRoom }
      }
    ]

    for (const update of updates) {
      const { error } = await supabase
        .from("interactive_world_settings")
        .upsert(update, { onConflict: "setting_key" })

      if (error) {
        console.error("Error saving settings:", error)
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder les paramètres",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }
    }

    toast({
      title: "Paramètres sauvegardés",
      description: "Les paramètres du monde ont été mis à jour avec succès",
    })

    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Apparence du Monde</h3>
        
        <div className="space-y-2">
          <Label htmlFor="skyColor">Couleur du Ciel</Label>
          <div className="flex gap-2">
            <Input
              id="skyColor"
              type="color"
              value={skyColor}
              onChange={(e) => setSkyColor(e.target.value)}
              className="w-20 h-10"
            />
            <Input
              type="text"
              value={skyColor}
              onChange={(e) => setSkyColor(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Densité du Brouillard: {fogDensity.toFixed(3)}</Label>
          <Slider
            value={[fogDensity * 1000]}
            onValueChange={([v]) => setFogDensity(v / 1000)}
            min={0}
            max={20}
            step={0.1}
          />
        </div>

        <div className="space-y-2">
          <Label>Intensité de l'Éclairage: {lightingIntensity.toFixed(1)}</Label>
          <Slider
            value={[lightingIntensity * 10]}
            onValueChange={([v]) => setLightingIntensity(v / 10)}
            min={5}
            max={30}
            step={1}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Capacités</h3>
        
        <div className="space-y-2">
          <Label htmlFor="maxUsers">Nombre Maximum d'Utilisateurs dans le Monde</Label>
          <Input
            id="maxUsers"
            type="number"
            value={maxUsers}
            onChange={(e) => setMaxUsers(parseInt(e.target.value) || 0)}
            min={1}
            max={500}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxPerRoom">Nombre Maximum par Salle de Cinéma</Label>
          <Input
            id="maxPerRoom"
            type="number"
            value={maxPerRoom}
            onChange={(e) => setMaxPerRoom(parseInt(e.target.value) || 0)}
            min={1}
            max={200}
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? "Sauvegarde..." : "Sauvegarder les Paramètres"}
      </Button>
    </div>
  )
}
