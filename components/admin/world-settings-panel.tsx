"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Save, Mic } from "lucide-react"

interface WorldSettings {
  maxCapacity: number
  worldMode: string
  showStatusBadges: boolean
  enableChat: boolean
  enableEmojis: boolean
  enableJumping: boolean
  voiceChatEnabled: boolean
}

export function WorldSettingsPanel({ settings }: { settings: any[] }) {
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  // Get existing settings (use world_config to match what world-3d.tsx loads)
  const existingSettings = settings.find((s) => s.setting_key === "world_config")?.setting_value || {}

  const [worldSettings, setWorldSettings] = useState<WorldSettings>({
    maxCapacity: existingSettings.maxCapacity || 100,
    worldMode: existingSettings.worldMode || "day",
    showStatusBadges: existingSettings.showStatusBadges ?? true,
    enableChat: existingSettings.enableChat ?? true,
    enableEmojis: existingSettings.enableEmojis ?? true,
    enableJumping: existingSettings.enableJumping ?? true,
    voiceChatEnabled: existingSettings.voiceChatEnabled ?? false,
  })

  const handleSave = async () => {
    setIsSaving(true)

    const { error } = await supabase.from("interactive_world_settings").upsert(
      {
        setting_key: "world_config",
        setting_value: worldSettings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "setting_key" },
    )

    if (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Paramètres sauvegardés",
        description: "Les paramètres du monde ont été mis à jour avec succès",
      })
    }

    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Paramètres Généraux du Monde</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Capacité Maximale</Label>
            <Input
              type="number"
              value={worldSettings.maxCapacity}
              onChange={(e) =>
                setWorldSettings({ ...worldSettings, maxCapacity: Number.parseInt(e.target.value, 10) || 0 })
              }
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Nombre max d'utilisateurs"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Mode du Monde</Label>
            <select
              value={worldSettings.worldMode}
              onChange={(e) => setWorldSettings({ ...worldSettings, worldMode: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            >
              <option value="day">Jour</option>
              <option value="night">Nuit</option>
              <option value="sunset">Coucher de soleil</option>
              <option value="christmas">Noel</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              className="rounded"
              checked={worldSettings.showStatusBadges}
              onChange={(e) => setWorldSettings({ ...worldSettings, showStatusBadges: e.target.checked })}
            />
            Afficher les badges de statut
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              className="rounded"
              checked={worldSettings.enableChat}
              onChange={(e) => setWorldSettings({ ...worldSettings, enableChat: e.target.checked })}
            />
            Activer le chat texte
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              className="rounded"
              checked={worldSettings.enableEmojis}
              onChange={(e) => setWorldSettings({ ...worldSettings, enableEmojis: e.target.checked })}
            />
            Activer les émojis
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              className="rounded"
              checked={worldSettings.enableJumping}
              onChange={(e) => setWorldSettings({ ...worldSettings, enableJumping: e.target.checked })}
            />
            Activer le saut
          </label>
        </div>

        <div className="border-t border-gray-700 pt-4 mt-4">
          <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Paramètres Audio / Vocal
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                className="rounded"
                checked={worldSettings.voiceChatEnabled}
                onChange={(e) => setWorldSettings({ ...worldSettings, voiceChatEnabled: e.target.checked })}
              />
              Activer le chat vocal
            </label>
          </div>
          {worldSettings.voiceChatEnabled && (
            <p className="text-xs text-gray-500 mt-2">
              Les utilisateurs pourront parler en vocal dans le monde interactif. Nécessite un microphone et les
              autorisations du navigateur.
            </p>
          )}
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700">
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? "Sauvegarde en cours..." : "Sauvegarder les Paramètres"}
      </Button>
    </div>
  )
}
