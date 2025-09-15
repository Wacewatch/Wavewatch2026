"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Star, Zap, ArrowRight, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { useMobile } from "@/hooks/use-mobile"

export function SubscriptionOffer() {
  const [isExpanded, setIsExpanded] = useState(false)
  const isMobile = useMobile()

  // Ajouter un useEffect pour gérer l'état initial selon le device
  useEffect(() => {
    if (isMobile !== undefined) {
      setIsExpanded(!isMobile) // Ouvert sur desktop, fermé sur mobile
    }
  }, [isMobile])

  return (
    <Card className="w-full">
      {/* Header avec bouton toggle */}
      <CardHeader className="pb-4">
        <div
          className={`flex items-center justify-center relative ${isMobile ? "cursor-pointer" : ""}`}
          onClick={isMobile ? () => setIsExpanded(!isExpanded) : undefined}
        >
          <div className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Abonnements VIP
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Débloquez des fonctionnalités exclusives</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={isMobile ? undefined : () => setIsExpanded(!isExpanded)}
            className={`absolute right-0 text-muted-foreground hover:text-foreground ${isMobile ? "hidden" : ""}`}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {/* Plan Gratuit */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium text-sm">Gratuit</div>
                  <div className="text-xs text-muted-foreground">Accès de base</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm">0€</div>
                <div className="text-xs text-muted-foreground">Toujours</div>
              </div>
            </div>

            {/* Plan VIP */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50 relative">
              <Badge className="absolute -top-2 -right-2 text-xs bg-yellow-500 text-black">Populaire</Badge>
              <div className="flex items-center gap-3">
                <Crown className="w-4 h-4 text-yellow-500" />
                <div>
                  <div className="font-medium text-sm">VIP</div>
                  <div className="text-xs text-muted-foreground">Badge doré</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm">0,99€</div>
                <div className="text-xs text-muted-foreground">par mois</div>
              </div>
            </div>

            {/* Plan VIP+ */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-purple-500" />
                <div>
                  <div className="font-medium text-sm">VIP+</div>
                  <div className="text-xs text-muted-foreground">Expérience ultime</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm">1,99€</div>
                <div className="text-xs text-muted-foreground">par mois</div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button asChild className="w-full" size="sm">
              <Link href="/subscription" className="flex items-center gap-2">
                Voir tous les plans
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            ✨ Badge VIP • 🎨 Couleurs personnalisées • 🚀 Support prioritaire
          </div>
        </CardContent>
      )}
    </Card>
  )
}
