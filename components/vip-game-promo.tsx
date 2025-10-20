"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Crown, Info, Sparkles, Clock } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

export function VIPGamePromo() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [canPlay, setCanPlay] = useState(false)
  const [playedAt, setPlayedAt] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [winners, setWinners] = useState<any[]>([])
  const [rotation, setRotation] = useState(0)
  const [timeUntilNextPlay, setTimeUntilNextPlay] = useState<string>("")

  useEffect(() => {
    checkPlayStatus()
    fetchWinners()
  }, [user])

  useEffect(() => {
    if (!canPlay && user && playedAt) {
      const interval = setInterval(() => updateCountdown(playedAt), 1000)
      return () => clearInterval(interval)
    }
  }, [canPlay, user, playedAt])

  const checkPlayStatus = async () => {
    try {
      const response = await fetch("/api/vip-game/status")
      if (!response.ok) {
        setCanPlay(false)
        return
      }
      const data = await response.json()

      // Si jamais joué, activer immédiatement
      if (!data.playedAt) {
        setCanPlay(true)
        setPlayedAt(null)
        setTimeUntilNextPlay("")
      } else {
        setPlayedAt(data.playedAt)
        setCanPlay(data.canPlay)
        if (!data.canPlay) updateCountdown(data.playedAt)
      }
    } catch (error) {
      console.error("Error checking play status:", error)
      setCanPlay(false)
    }
  }

  const updateCountdown = (lastPlayedAt: string) => {
    const now = new Date()
    const lastPlayDate = new Date(lastPlayedAt)
    const nextPlay = new Date(lastPlayDate.getTime() + 24 * 60 * 60 * 1000)
    const diff = nextPlay.getTime() - now.getTime()

    if (diff <= 0) {
      setCanPlay(true)
      setTimeUntilNextPlay("")
      return
    }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    setTimeUntilNextPlay(`${hours}h ${minutes}m ${seconds}s`)
  }

  const fetchWinners = async () => {
    try {
      const response = await fetch("/api/vip-game/winners")
      if (!response.ok) return
      const data = await response.json()
      setWinners(data.winners || [])
    } catch (error) {
      console.error("Error fetching winners:", error)
    }
  }

  const handlePlay = async () => {
    if (!user) {
      toast({ title: "Connexion requise", description: "Vous devez être connecté pour jouer", variant: "destructive" })
      return
    }

    setIsPlaying(true)
    setIsSpinning(true)
    setResult(null)

    const spins = 5 + Math.random() * 3
    const finalRotation = rotation + spins * 360
    setRotation(finalRotation)

    try {
      const response = await fetch("/api/vip-game/play", { method: "POST" })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Erreur lors du jeu")

      setTimeout(() => {
        setIsSpinning(false)
        setResult(data.prize)
        setCanPlay(false)
        setPlayedAt(data.playedAt) // met à jour playedAt pour le timer

        if (data.prize && data.prize !== "none") {
          const prizeText =
            data.prize === "vip_1_month" ? "VIP 1 mois" :
            data.prize === "vip_1_week" ? "VIP 1 semaine" : "VIP 1 jour"

          toast({ title: "🎉 Félicitations !", description: `Vous avez gagné ${prizeText} !` })
          window.dispatchEvent(new Event("vip-updated"))
        } else {
          toast({ title: "Dommage !", description: "Réessayez demain pour tenter votre chance !" })
        }

        fetchWinners()
      }, 3000)
    } catch (error: any) {
      setIsSpinning(false)
      toast({ title: "Erreur", description: error.message, variant: "destructive" })
    } finally {
      setIsPlaying(false)
    }
  }

  const getPrizeLabel = (prize: string) => {
    switch (prize) {
      case "vip_1_month": return "VIP 1 mois"
      case "vip_1_week": return "VIP 1 semaine"
      case "vip_1_day": return "VIP 1 jour"
      default: return "Aucun gain"
    }
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900/50 via-pink-900/50 to-orange-900/50 border-purple-700 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <span className="text-xl font-bold">Tentez votre chance !</span>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Info className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Informations sur le jeu</DialogTitle>
              </DialogHeader>
              {/* Contenu du dialogue identique */}
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <p className="text-white text-center text-lg">Tentez de gagner un VIP pour 1 mois, 1 semaine ou 1 jour !</p>

        {/* Spinning Wheel */}
        <div className="relative w-64 h-64 mx-auto">
          <div
            className={`w-full h-full rounded-full border-8 border-yellow-400 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 flex items-center justify-center transition-transform duration-3000 ease-out ${
              isSpinning ? "animate-spin-slow" : ""
            }`}
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <Crown className="w-24 h-24 text-yellow-300" />
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-yellow-400" />
          </div>
        </div>

        {result && (
          <div className="text-center">
            <Badge
              variant="secondary"
              className={`text-lg px-4 py-2 ${
                result === "none"
                  ? "bg-gray-600"
                  : result === "vip_1_month"
                  ? "bg-purple-600"
                  : result === "vip_1_week"
                  ? "bg-blue-600"
                  : "bg-green-600"
              }`}
            >
              {getPrizeLabel(result)}
            </Badge>
          </div>
        )}

        {!canPlay && user && timeUntilNextPlay && (
          <div className="flex items-center justify-center gap-2 text-yellow-400">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Prochaine tentative dans : {timeUntilNextPlay}</span>
          </div>
        )}

        <Button
          onClick={handlePlay}
          disabled={!canPlay || isPlaying || !user}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg py-6"
        >
          {!user
            ? "Connexion requise"
            : !canPlay
              ? timeUntilNextPlay
                ? `Revenez dans ${timeUntilNextPlay}`
                : "Revenez demain !"
              : isPlaying
                ? "En cours..."
                : "Jouer"}
        </Button>
      </CardContent>
    </Card>
  )
}
