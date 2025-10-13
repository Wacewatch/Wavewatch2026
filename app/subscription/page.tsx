"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Star, Zap, Check, X } from "lucide-react"
import { VIPLeaderboard } from "@/components/vip-leaderboard"

export default function SubscriptionPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleFreeClick = () => {
    router.push("/register")
  }

  const handlePaidClick = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Les abonnements VIP ne sont pas encore disponibles. Revenez bientôt !")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Abonnements VIP</h1>
        <p className="text-xl text-muted-foreground">Débloquez des fonctionnalités exclusives et soutenez WaveWatch</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Plan Gratuit */}
        <Card className="relative">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Star className="w-5 h-5" />
              Gratuit
            </CardTitle>
            <CardDescription>Pour découvrir WaveWatch</CardDescription>
            <div className="text-3xl font-bold">0€</div>
            <div className="text-sm text-muted-foreground">Toujours gratuit</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Accès à tout le contenu</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Historique de visionnage</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Wishlist personnelle</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Favoris</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-500" />
                <span className="text-sm">Badge VIP</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-500" />
                <span className="text-sm">Couleur de nom personnalisée</span>
              </div>
            </div>
            <Button className="w-full" onClick={handleFreeClick}>
              Commencer gratuitement
            </Button>
          </CardContent>
        </Card>

        {/* Plan VIP */}
        <Card className="relative">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              VIP
            </CardTitle>
            <CardDescription>Pour les vrais fans</CardDescription>
            <div className="text-3xl font-bold">0,99€</div>
            <div className="text-sm text-muted-foreground">par mois</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Tout du plan Gratuit</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Badge VIP doré</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Nom en couleur dorée</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Accès prioritaire</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Support prioritaire</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-500" />
                <span className="text-sm">Fonctionnalités exclusives VIP+</span>
              </div>
            </div>
            <Button className="w-full" onClick={handlePaidClick} disabled={isLoading}>
              {isLoading ? "Traitement..." : "Bientôt disponible"}
            </Button>
          </CardContent>
        </Card>

        {/* Plan VIP+ */}
        <Card className="relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Le plus populaire</Badge>
          </div>
          <CardHeader className="text-center pt-6">
            <CardTitle className="flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              VIP+
            </CardTitle>
            <CardDescription>L'expérience ultime</CardDescription>
            <div className="text-3xl font-bold">1,99€</div>
            <div className="text-sm text-muted-foreground">par mois</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Tout du plan VIP</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Badge VIP+ premium</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Nom en dégradé violet</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Fonctionnalités exclusives</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Accès anticipé aux nouveautés</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Support VIP dédié</span>
              </div>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onClick={handlePaidClick}
              disabled={isLoading}
            >
              {isLoading ? "Traitement..." : "Bientôt disponible"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold">Pourquoi devenir VIP ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="space-y-2">
            <h3 className="font-semibold">🎯 Soutenez le projet</h3>
            <p className="text-sm text-muted-foreground">
              Votre abonnement nous aide à maintenir et améliorer WaveWatch
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">⭐ Statut exclusif</h3>
            <p className="text-sm text-muted-foreground">Montrez votre soutien avec des badges et couleurs uniques</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">🚀 Accès prioritaire</h3>
            <p className="text-sm text-muted-foreground">Profitez des nouvelles fonctionnalités en avant-première</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">💬 Support dédié</h3>
            <p className="text-sm text-muted-foreground">Bénéficiez d'un support client prioritaire et personnalisé</p>
          </div>
        </div>
      </div>

      {/* Module de classement VIP */}
      <VIPLeaderboard showTopSupporters={true} showNewest={true} />
    </div>
  )
}
