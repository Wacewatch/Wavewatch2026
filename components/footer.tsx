"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Star, MessageSquare } from "lucide-react"

interface FeedbackStats {
  content: number
  functionality: number
  design: number
  totalFeedback: number
}

interface GuestbookMessage {
  message: string
  created_at: string
}

export function Footer() {
  const [stats, setStats] = useState<FeedbackStats>({
    content: 0,
    functionality: 0,
    design: 0,
    totalFeedback: 0,
  })
  const [messages, setMessages] = useState<GuestbookMessage[]>([])
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  useEffect(() => {
    fetchFeedbackStats()
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length)
      }, 5000) // Change message every 5 seconds

      return () => clearInterval(interval)
    }
  }, [messages])

  const fetchFeedbackStats = async () => {
    try {
      const response = await fetch("/api/feedback/stats")
      const data = await response.json()
      if (data.stats) {
        setStats(data.stats)
      }
      if (data.guestbookMessages) {
        setMessages(data.guestbookMessages)
      }
    } catch (error) {
      console.error("Error fetching feedback stats:", error)
    }
  }

  return (
    <footer
      className="border-t mt-20"
      style={{ backgroundColor: "hsl(var(--nav-bg))", borderColor: "hsl(var(--nav-border))" }}
    >
      <div className="container mx-auto px-4 py-8">
        {stats.totalFeedback > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-center" style={{ color: "hsl(var(--nav-text))" }}>
              Avis de la communauté
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-400">Contenu</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.content.toFixed(1)}/10</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-blue-400 fill-current" />
                  <span className="text-sm font-medium text-gray-400">Fonctionnalités</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.functionality.toFixed(1)}/10</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-purple-400 fill-current" />
                  <span className="text-sm font-medium text-gray-400">Design</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.design.toFixed(1)}/10</div>
              </div>
            </div>

            {messages.length > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium text-gray-400">Livre d'or</span>
                </div>
                <div className="relative h-20 overflow-hidden">
                  <div
                    className="transition-all duration-500 ease-in-out"
                    style={{
                      transform: `translateY(-${currentMessageIndex * 100}%)`,
                    }}
                  >
                    {messages.map((msg, index) => (
                      <div key={index} className="h-20 flex items-center">
                        <p className="text-gray-300 italic line-clamp-3">"{msg.message}"</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center gap-1 mt-3">
                  {messages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentMessageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentMessageIndex ? "bg-blue-500 w-4" : "bg-gray-600"
                      }`}
                      aria-label={`Message ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo/Brand */}
          <div>
            <h3 className="font-bold text-lg" style={{ color: "hsl(var(--nav-text))" }}>
              WaveWatch
            </h3>
            <p className="text-sm" style={{ color: "hsl(var(--nav-text-secondary))" }}>
              Votre plateforme de streaming premium
            </p>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/changelogs"
              className="transition-colors text-sm"
              style={{ color: "hsl(var(--nav-text-secondary))" }}
            >
              Mise à jour
            </Link>
          </div>
        </div>

        <div className="border-t mt-6 pt-6 text-center" style={{ borderColor: "hsl(var(--nav-border))" }}>
          <p className="text-sm" style={{ color: "hsl(var(--nav-text-secondary))" }}>
            © {new Date().getFullYear()} WaveWatch. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
