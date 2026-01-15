"use client"

import { Trophy, Star, X, Target } from "lucide-react"
import { useState, useEffect, useRef } from "react"

// Notification pour quête complétée
interface QuestCompletedNotificationProps {
  questTitle: string
  xpEarned: number
  onClose: () => void
}

export function QuestCompletedNotification({ questTitle, xpEarned, onClose }: QuestCompletedNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [progressWidth, setProgressWidth] = useState(100)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    // Animation d'entrée
    const showTimer = setTimeout(() => setIsVisible(true), 50)
    // Démarrer la barre de progression
    const progressTimer = setTimeout(() => setProgressWidth(0), 100)
    // Fermeture automatique après 5 secondes
    const closeTimer = setTimeout(() => {
      setIsLeaving(true)
      setTimeout(() => onCloseRef.current(), 300)
    }, 5000)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(progressTimer)
      clearTimeout(closeTimer)
    }
  }, [])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => onCloseRef.current(), 300)
  }

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      <div className="bg-gradient-to-r from-yellow-600 via-orange-500 to-pink-500 p-[2px] rounded-xl shadow-2xl">
        <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl p-4 min-w-[280px] max-w-[350px]">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-bold text-sm uppercase tracking-wide">
                  Quête complétée !
                </span>
              </div>
              <h4 className="text-white font-semibold text-base truncate">{questTitle}</h4>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-green-400 font-bold text-lg">+{xpEarned}</span>
                <span className="text-green-400/80 text-sm">XP</span>
              </div>
            </div>
            <button onClick={handleClose} className="flex-shrink-0 text-white/40 hover:text-white transition-colors p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-[5000ms] ease-linear"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Notification pour progression de quête (plus compacte)
interface QuestProgressNotificationProps {
  questTitle: string
  progress: number
  requirement: number
  onClose: () => void
}

export function QuestProgressNotification({ questTitle, progress, requirement, onClose }: QuestProgressNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const percentage = Math.round((progress / requirement) * 100)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 50)
    const closeTimer = setTimeout(() => {
      setIsLeaving(true)
      setTimeout(() => onCloseRef.current(), 300)
    }, 3000) // Plus court pour la progression

    return () => {
      clearTimeout(showTimer)
      clearTimeout(closeTimer)
    }
  }, [])

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-[1px] rounded-lg shadow-lg">
        <div className="bg-gray-900/95 backdrop-blur-sm rounded-lg p-3 min-w-[240px] max-w-[300px]">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-sm truncate">{questTitle}</h4>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-blue-400 font-bold text-xs whitespace-nowrap">
                  {progress}/{requirement}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Types pour le container
interface CompletedNotification {
  id: string
  type: "completed"
  questTitle: string
  xpEarned: number
}

interface ProgressNotification {
  id: string
  type: "progress"
  questTitle: string
  progress: number
  requirement: number
}

type Notification = CompletedNotification | ProgressNotification

interface QuestNotificationContainerProps {
  notifications: Notification[]
  onRemove: (id: string) => void
}

export function QuestNotificationContainer({ notifications, onRemove }: QuestNotificationContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {notifications.map((notif) => (
        <div key={notif.id} className="pointer-events-auto">
          {notif.type === "completed" ? (
            <QuestCompletedNotification
              questTitle={notif.questTitle}
              xpEarned={notif.xpEarned}
              onClose={() => onRemove(notif.id)}
            />
          ) : (
            <QuestProgressNotification
              questTitle={notif.questTitle}
              progress={notif.progress}
              requirement={notif.requirement}
              onClose={() => onRemove(notif.id)}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// Export legacy pour compatibilité
export const QuestNotification = QuestCompletedNotification
