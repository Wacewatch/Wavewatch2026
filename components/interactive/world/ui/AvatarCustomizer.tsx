"use client"

import { X, Crown } from "lucide-react"

interface AvatarStyle {
  skinTone: string
  bodyColor: string
  hairStyle: string
  hairColor: string
  faceSmiley: string
  accessory: string
}

interface CustomizationOption {
  category: string
  value: string
  label: string
  is_premium: boolean
}

interface UserProfile {
  is_vip?: boolean
  is_vip_plus?: boolean
  is_admin?: boolean
}

interface AvatarCustomizerProps {
  myAvatarStyle: AvatarStyle
  saveAvatarStyle: (style: AvatarStyle) => void
  customizationOptions: CustomizationOption[]
  userProfile: UserProfile | null
  onClose: () => void
}

export function AvatarCustomizer({
  myAvatarStyle,
  saveAvatarStyle,
  customizationOptions,
  userProfile,
  onClose,
}: AvatarCustomizerProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      <div className="bg-black/90 backdrop-blur-xl rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto border-2 border-white/30 shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-white/20">
          <h3 className="text-white font-bold text-2xl">Personnaliser Avatar</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Skin Tone */}
          <div>
            <label className="text-white font-semibold mb-3 block">Teinte de peau</label>
            <div className="grid grid-cols-6 gap-3">
              {["#fbbf24", "#f59e0b", "#d97706", "#92400e", "#7c2d12", "#451a03"].map((color) => (
                <button
                  key={color}
                  onClick={() => saveAvatarStyle({ ...myAvatarStyle, skinTone: color })}
                  className={`w-12 h-12 rounded-full border-4 transition-all ${
                    myAvatarStyle.skinTone === color ? "border-white scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Body Color */}
          <div>
            <label className="text-white font-semibold mb-3 block">Couleur du corps</label>
            <div className="grid grid-cols-6 gap-3">
              {["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"].map((color) => (
                <button
                  key={color}
                  onClick={() => saveAvatarStyle({ ...myAvatarStyle, bodyColor: color })}
                  className={`w-12 h-12 rounded-full border-4 transition-all ${
                    myAvatarStyle.bodyColor === color ? "border-white scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Hair Style */}
          <div>
            <label className="text-white font-semibold mb-3 block">Style de cheveux</label>
            <div className="grid grid-cols-3 gap-3">
              {["short", "long", "none"].map((style) => {
                const option = customizationOptions.find((o) => o.category === "hair_style" && o.value === style)
                const isLocked =
                  option?.is_premium && !userProfile?.is_vip && !userProfile?.is_vip_plus && !userProfile?.is_admin

                return (
                  <button
                    key={style}
                    onClick={() => !isLocked && saveAvatarStyle({ ...myAvatarStyle, hairStyle: style })}
                    disabled={isLocked}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      myAvatarStyle.hairStyle === style
                        ? "border-blue-500 bg-blue-500/20"
                        : "border-white/20 bg-white/5"
                    } ${isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"}`}
                  >
                    <div className="text-white font-medium flex items-center justify-center gap-2">
                      {isLocked && <Crown className="w-4 h-4 text-yellow-400" />}
                      {option?.label || style}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Hair Color */}
          <div>
            <label className="text-white font-semibold mb-3 block">Couleur des cheveux</label>
            <div className="grid grid-cols-6 gap-3">
              {["#1f2937", "#92400e", "#fbbf24", "#ef4444", "#8b5cf6", "#ec4899"].map((color) => (
                <button
                  key={color}
                  onClick={() => saveAvatarStyle({ ...myAvatarStyle, hairColor: color })}
                  className={`w-12 h-12 rounded-full border-4 transition-all ${
                    myAvatarStyle.hairColor === color ? "border-white scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Face Smiley */}
          <div>
            <label className="text-white font-semibold mb-3 block">Visage (Smiley)</label>
            <div className="grid grid-cols-5 gap-3">
              {[
                { emoji: "😊", label: "Souriant", premium: false },
                { emoji: "😎", label: "Cool", premium: false },
                { emoji: "🤓", label: "Intello", premium: false },
                { emoji: "😇", label: "Ange", premium: true, level: "vip" },
                { emoji: "🤩", label: "Star", premium: true, level: "vip" },
                { emoji: "😈", label: "Diable", premium: true, level: "vip_plus" },
                { emoji: "🤖", label: "Robot", premium: true, level: "vip_plus" },
                { emoji: "👽", label: "Alien", premium: true, level: "vip_plus" },
                { emoji: "🔥", label: "Feu", premium: true, level: "admin" },
                { emoji: "⭐", label: "Étoile", premium: true, level: "admin" },
              ].map((face) => {
                const isLocked =
                  face.premium &&
                  ((face.level === "vip" &&
                    !userProfile?.is_vip &&
                    !userProfile?.is_vip_plus &&
                    !userProfile?.is_admin) ||
                    (face.level === "vip_plus" && !userProfile?.is_vip_plus && !userProfile?.is_admin) ||
                    (face.level === "admin" && !userProfile?.is_admin))

                return (
                  <button
                    key={face.emoji}
                    onClick={() => !isLocked && saveAvatarStyle({ ...myAvatarStyle, faceSmiley: face.emoji })}
                    disabled={isLocked}
                    className={`p-3 rounded-lg border-2 transition-all relative ${
                      myAvatarStyle.faceSmiley === face.emoji
                        ? "border-blue-500 bg-blue-500/20 scale-110"
                        : "border-white/20 bg-white/5"
                    } ${isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"}`}
                    title={face.label}
                  >
                    <div className="text-3xl">{face.emoji}</div>
                    {isLocked && (
                      <div className="absolute top-1 right-1">
                        <Crown className="w-3 h-3 text-yellow-400" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Accessory */}
          <div>
            <label className="text-white font-semibold mb-3 block">Accessoire</label>
            <div className="grid grid-cols-3 gap-3">
              {["none", "glasses", "hat"].map((acc) => {
                const option = customizationOptions.find((o) => o.category === "accessory" && o.value === acc)
                const isLocked =
                  option?.is_premium && !userProfile?.is_vip && !userProfile?.is_vip_plus && !userProfile?.is_admin

                return (
                  <button
                    key={acc}
                    onClick={() => !isLocked && saveAvatarStyle({ ...myAvatarStyle, accessory: acc })}
                    disabled={isLocked}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      myAvatarStyle.accessory === acc
                        ? "border-blue-500 bg-blue-500/20"
                        : "border-white/20 bg-white/5"
                    } ${isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"}`}
                  >
                    <div className="text-white font-medium flex items-center justify-center gap-2">
                      {isLocked && <Crown className="w-4 h-4 text-yellow-400" />}
                      {option?.label || acc}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/20">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 font-bold text-lg"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  )
}
