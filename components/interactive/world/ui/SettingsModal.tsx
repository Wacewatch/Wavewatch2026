"use client"

import { Settings, X } from "lucide-react"

interface SettingsModalProps {
  controlMode: "auto" | "pc" | "mobile"
  setControlMode: (mode: "auto" | "pc" | "mobile") => void
  graphicsQuality: string
  setGraphicsQuality: (quality: string) => void
  povMode: boolean
  togglePovMode: () => void
  showBadgesPreference: boolean
  setShowBadgesPreference: (value: boolean) => void
  showCollisionDebug: boolean
  setShowCollisionDebug: (value: boolean) => void
  onClose: () => void
}

export function SettingsModal({
  controlMode,
  setControlMode,
  graphicsQuality,
  setGraphicsQuality,
  povMode,
  togglePovMode,
  showBadgesPreference,
  setShowBadgesPreference,
  showCollisionDebug,
  setShowCollisionDebug,
  onClose,
}: SettingsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full border-2 border-blue-500/30">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Paramètres
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-white font-medium block mb-2">Mode de Contrôle</label>
            <select
              value={controlMode}
              onChange={(e) => setControlMode(e.target.value as "auto" | "pc" | "mobile")}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
            >
              <option value="auto">Automatique</option>
              <option value="pc">PC (Clavier)</option>
              <option value="mobile">Mobile (Joystick)</option>
            </select>
          </div>

          <div>
            <label className="text-white font-medium block mb-2">Qualité Graphique</label>
            <select
              value={graphicsQuality}
              onChange={(e) => setGraphicsQuality(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-white font-medium">Mode POV</label>
            <button
              onClick={togglePovMode}
              className={`w-12 h-6 rounded-full transition-colors ${povMode ? "bg-blue-500" : "bg-gray-600"}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  povMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-white font-medium">Afficher les badges des statuts</label>
            <button
              onClick={() => {
                const newValue = !showBadgesPreference
                setShowBadgesPreference(newValue)
                localStorage.setItem('interactive_show_badges', String(newValue))
              }}
              className={`w-12 h-6 rounded-full transition-colors ${showBadgesPreference ? "bg-blue-500" : "bg-gray-600"}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  showBadgesPreference ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Debug Collisions - uniquement en développement local */}
          {process.env.NODE_ENV === "development" && (
            <div className="flex items-center justify-between">
              <label className="text-white font-medium">Debug Collisions</label>
              <button
                onClick={() => setShowCollisionDebug(!showCollisionDebug)}
                className={`w-12 h-6 rounded-full transition-colors ${showCollisionDebug ? "bg-red-500" : "bg-gray-600"}`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    showCollisionDebug ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium mt-6"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
