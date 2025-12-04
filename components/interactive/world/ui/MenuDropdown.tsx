"use client"

import {
  Settings,
  User,
  Users,
  Palette,
  MessageSquare,
  Map,
  LogOut,
} from "lucide-react"

interface MenuDropdownProps {
  isMobileMode: boolean
  myProfile: { username?: string } | null
  onlineCount: number
  enableChat: boolean
  onOpenSettings: () => void
  onOpenAvatar: () => void
  onOpenChat: () => void
  onOpenMap: () => void
  onQuit: () => void
}

export function MenuDropdown({
  isMobileMode,
  myProfile,
  onlineCount,
  enableChat,
  onOpenSettings,
  onOpenAvatar,
  onOpenChat,
  onOpenMap,
  onQuit,
}: MenuDropdownProps) {
  return (
    <div className={`absolute top-0 mt-0 bg-black/95 backdrop-blur-xl rounded-xl shadow-2xl border-2 border-white/30 ${isMobileMode ? 'left-12 p-2 w-48 space-y-1' : 'left-20 p-4 w-80 space-y-3'}`}>
      <div className={`text-white border-b border-white/20 ${isMobileMode ? 'mb-2 pb-2' : 'mb-3 pb-3'}`}>
        <div className={`font-bold flex items-center gap-2 ${isMobileMode ? 'text-sm' : 'text-lg'}`}>
          <User className={isMobileMode ? 'w-4 h-4' : 'w-5 h-5'} />
          {myProfile?.username || "Vous"}
        </div>
        <div className={`flex items-center gap-2 text-white/60 mt-1 ${isMobileMode ? 'text-xs' : 'text-sm'}`}>
          <Users className={isMobileMode ? 'w-3 h-3' : 'w-4 h-4'} />
          <span>{onlineCount} en ligne</span>
        </div>
      </div>

      <button
        onClick={onOpenSettings}
        className={`w-full bg-blue-500/90 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 font-medium transition-colors ${isMobileMode ? 'py-2 text-xs' : 'py-3 text-base'}`}
      >
        <Settings className={isMobileMode ? 'w-4 h-4' : 'w-5 h-5'} />
        Paramètres
      </button>

      <button
        onClick={onOpenAvatar}
        className={`w-full bg-purple-500/90 text-white rounded-lg hover:bg-purple-600 flex items-center justify-center gap-2 font-medium transition-colors ${isMobileMode ? 'py-2 text-xs' : 'py-3 text-base'}`}
      >
        <Palette className={isMobileMode ? 'w-4 h-4' : 'w-5 h-5'} />
        Avatar
      </button>

      {enableChat && (
        <button
          onClick={onOpenChat}
          className={`w-full bg-green-500/90 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 font-medium transition-colors ${isMobileMode ? 'py-2 text-xs' : 'py-3 text-base'}`}
        >
          <MessageSquare className={isMobileMode ? 'w-4 h-4' : 'w-5 h-5'} />
          Chat
        </button>
      )}

      <button
        onClick={onOpenMap}
        className={`w-full bg-cyan-500/90 text-white rounded-lg hover:bg-cyan-600 flex items-center justify-center gap-2 font-medium transition-colors ${isMobileMode ? 'py-2 text-xs' : 'py-3 text-base'}`}
      >
        <Map className={isMobileMode ? 'w-4 h-4' : 'w-5 h-5'} />
        Carte
      </button>

      <button
        onClick={onQuit}
        className={`w-full bg-gray-600/90 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center font-medium transition-colors border-t border-white/20 mt-2 pt-2 ${isMobileMode ? 'py-2' : 'py-3'}`}
        title="Quitter"
      >
        <LogOut className={isMobileMode ? 'w-4 h-4' : 'w-5 h-5'} />
      </button>
    </div>
  )
}
