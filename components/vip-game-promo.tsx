"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Crown, Info, Sparkles } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

export function VIPGamePromo() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [canPlay, setCanPlay] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [winners, setWinners] = useState<any[]>([])
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    checkPlayStatus()
    fetchWinners()
  }, [user])

  const checkPlayStatus = async () => {
    try {
      const response = await fetch("/api/vip-game/status")
      const data = await response.json()
      setCanPlay(data.canPlay)
    } catch (error) {
      console.error("Error checking play status:", error)
    }
  }

  const fetchWinners = async () => {
    try {
      const response = await fetch("/api/vip-game/winners")
      const data = await response.json()
      setWinners(data.winners || [])
    } catch (error) {
      console.error("Error fetching winners:", error)
    }
  }

  const handlePlay = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour jouer",
        variant: "destructive",
      })
      return
    }

    setIsPlaying(true)
    setIsSpinning(true)
    setResult(null)

    // Animate wheel spinning
    const spins = 5 + Math.random() * 3 // 5-8 full rotations
    const finalRotation = rotation + spins * 360
    setRotation(finalRotation)

    try {
      const response = await fetch("/api/vip-game/play", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du jeu")
      }

      // Wait for animation to complete
      setTimeout(() => {
        setIsSpinning(false)
        setResult(data.prize)
        setCanPlay(false)

        if (data.prize !== "none") {
          const prizeText =
            data.prize === "vip_1_month" ? "VIP 1 mois" : data.prize === "vip_1_week" ? "VIP 1 semaine" : "VIP 1 jour"

          toast({
            title: "🎉 Félicitations !",
            description: `Vous avez gagné ${prizeText} !`,
          })

          // Trigger VIP update event
          window.dispatchEvent(new Event("vip-updated"))
        } else {
          toast({
            title: "Dommage !",
            description: "Réessayez demain pour tenter votre chance !",
          })
        }

        fetchWinners()
      }, 3000)
    } catch (error: any) {
      setIsSpinning(false)
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsPlaying(false)
    }
  }

  const getPrizeLabel = (prize: string) => {
    switch (prize) {
      case "vip_1_month":
        return "VIP 1 mois"
      case "vip_1_week":
        return "VIP 1 semaine"
      case "vip_1_day":
        return "VIP 1 jour"
      default:
        return "Aucun gain"
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
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-purple-400">Probabilités de gains</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                      <span>VIP 1 mois</span>
                      <Badge variant="secondary" className="bg-purple-600">
                        2,5%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                      <span>VIP 1 semaine</span>
                      <Badge variant="secondary" className="bg-blue-600">
                        7%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                      <span>VIP 1 jour</span>
                      <Badge variant="secondary" className="bg-green-600">
                        20%
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-purple-400">Règles</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    <li>Vous pouvez jouer une fois par jour</li>
                    <li>Les gains sont activés automatiquement</li>
                    <li>Les gains se désactivent automatiquement à expiration</li>
                  </ul>
                </div>

                {winners.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-purple-400">20 derniers gagnants</h3>
                    <div className="max-h-64 overflow-y-auto space-y-1">
                      {winners.map((winner, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-800 rounded text-sm">
                          <span className="text-gray-300">{winner.username}</span>
                          <Badge variant="secondary" className="bg-yellow-600">
                            {getPrizeLabel(winner.prize)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-white text-center text-lg">
          Pour aucune raison, juste pour faire plaisir, tentez de gagner un VIP pour 1 mois, 1 semaine ou 1 jour !
        </p>

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

        <Button
          onClick={handlePlay}
          disabled={!canPlay || isPlaying || !user}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg py-6"
        >
          {!user ? "Connexion requise" : !canPlay ? "Revenez demain !" : isPlaying ? "En cours..." : "Jouer"}
        </Button>
      </CardContent>
    </Card>
  )
}
