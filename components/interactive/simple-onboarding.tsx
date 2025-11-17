"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SimpleOnboardingProps {
  userId: string
  onComplete: () => void
}

export function SimpleOnboarding({ userId, onComplete }: SimpleOnboardingProps) {
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError("Veuillez entrer un nom d'utilisateur")
      return
    }

    setLoading(true)
    setError("")

    try {
      const { error: insertError } = await supabase
        .from("interactive_profiles")
        .insert({
          user_id: userId,
          username: username.trim(),
          position_x: 0,
          position_y: 0,
          position_z: 0,
          rotation: 0,
          current_room: "entrance",
          is_online: true,
          avatar_style: {}
        })

      if (insertError) {
        setError("Ce nom d'utilisateur existe déjà")
        setLoading(false)
        return
      }

      onComplete()
    } catch (err) {
      setError("Erreur lors de la création du profil")
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-2">WaveWatch World</h1>
        <p className="text-gray-400 mb-6">Créez votre profil interactif</p>
        
        <div className="space-y-4">
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Nom d'utilisateur
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Entrez votre nom"
              className="bg-gray-900 border-gray-700 text-white"
              maxLength={20}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Création..." : "Entrer dans le monde"}
          </Button>
        </div>
      </div>
    </div>
  )
}
