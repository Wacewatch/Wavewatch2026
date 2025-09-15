"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Crown, Trophy, Medal, Award, Star, Zap, Clock, Users, Percent, Sparkles } from "lucide-react"
import { VIPSystem, type VIPUser } from "@/lib/vip-system"
import { supabase } from "@/lib/supabase"

export function VIPLeaderboard() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalVIP: 0,
    totalVIPPlus: 0,
    totalBeta: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    vipPercentage: 0,
    totalUsers: 0,
  })
  const [topSupporters, setTopSupporters] = useState<VIPUser[]>([])
  const [newestVIPs, setNewestVIPs] = useState<VIPUser[]>([])
  const [oldestVIPs, setOldestVIPs] = useState<VIPUser[]>([])
  const [betaUsers, setBetaUsers] = useState<VIPUser[]>([])

  useEffect(() => {
    setMounted(true)
    loadData()

    const handleVIPUpdate = () => {
      loadData()
    }

    window.addEventListener("vip-updated", handleVIPUpdate)
    return () => window.removeEventListener("vip-updated", handleVIPUpdate)
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Récupérer les vraies données depuis Supabase
      const { data: usersData, error: usersError } = await supabase
        .from("user_profiles")
        .select("id, username, is_vip, created_at")

      if (usersError) {
        console.error("Error fetching users:", usersError)
        return
      }

      const totalUsers = usersData?.length || 0
      const vipUsers = usersData?.filter((user) => user.is_vip) || []
      const totalVIPCount = vipUsers.length

      // Récupérer les stats VIP du système local (pour les badges et contributions)
      const localVipStats = VIPSystem.getVIPStats()
      const allLocalVIPs = VIPSystem.getVIPUsers().filter((user) => user.level !== "free")

      // Calculer le pourcentage réel - CORRECTION : Beta ne compte pas comme VIP
      const totalVIPAndPremium = totalVIPCount + localVipStats.totalVIPPlus // Retirer totalBeta
      const vipPercentage = totalUsers > 0 ? (totalVIPAndPremium / totalUsers) * 100 : 0

      console.log("Debug VIP calculation:", {
        totalUsers,
        totalVIPCount,
        totalVIPPlus: localVipStats.totalVIPPlus,
        totalBeta: localVipStats.totalBeta,
        totalVIPAndPremium, // Maintenant sans Beta
        vipPercentage,
      })

      setStats({
        totalVIP: totalVIPCount, // Utiliser les vrais chiffres de la DB
        totalVIPPlus: localVipStats.totalVIPPlus, // Garder les VIP+ du système local
        totalBeta: localVipStats.totalBeta, // Garder les Beta du système local
        monthlyRevenue: localVipStats.monthlyRevenue,
        totalRevenue: localVipStats.totalRevenue,
        totalUsers: totalUsers, // Vrais utilisateurs de la DB
        vipPercentage: Math.round(vipPercentage * 10) / 10, // Vrai pourcentage CORRIGÉ
      })

      // Top contributeurs (système local pour les contributions)
      setTopSupporters([...allLocalVIPs].sort((a, b) => b.totalContribution - a.totalContribution).slice(0, 5))

      // Nouveaux VIP - mélanger les données DB et locales
      const dbVIPs = vipUsers.map((user) => ({
        id: user.id,
        username: user.username,
        level: "vip" as const,
        subscriptionDate: new Date(user.created_at),
        totalContribution: 0.99, // Contribution par défaut pour les VIP DB
        monthlyContribution: 0.99,
      }))

      const allVIPs = [...allLocalVIPs, ...dbVIPs]

      // Supprimer les doublons basés sur l'username
      const uniqueVIPs = allVIPs.filter(
        (vip, index, self) => index === self.findIndex((v) => v.username === vip.username),
      )

      // Nouveaux VIP (les plus récents)
      setNewestVIPs(
        [...uniqueVIPs]
          .sort((a, b) => new Date(b.subscriptionDate).getTime() - new Date(a.subscriptionDate).getTime())
          .slice(0, 5),
      )

      // VIP les plus anciens (fidélité)
      setOldestVIPs(
        [...uniqueVIPs]
          .sort((a, b) => new Date(a.subscriptionDate).getTime() - new Date(b.subscriptionDate).getTime())
          .slice(0, 5),
      )

      // Utilisateurs Beta
      const betaUsersList = allLocalVIPs.filter((user) => user.level === "beta")
      setBetaUsers(betaUsersList.slice(0, 10)) // Top 10 Beta users
    } catch (error) {
      console.error("Error loading VIP data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  const getPositionIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-4 h-4 text-yellow-500" />
      case 1:
        return <Medal className="w-4 h-4 text-gray-400" />
      case 2:
        return <Award className="w-4 h-4 text-amber-600" />
      default:
        return (
          <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-gray-500">#{index + 1}</span>
        )
    }
  }

  const getUsernameColor = (level: string) => {
    return level === "vip"
      ? "text-yellow-600"
      : level === "vip_plus"
        ? "text-purple-600"
        : level === "beta"
          ? "text-cyan-400"
          : "text-foreground"
  }

  const getVIPBadge = (level: string) => {
    if (level === "vip") {
      return (
        <Badge variant="secondary" className="text-yellow-600 border-yellow-400 text-xs">
          <Crown className="w-3 h-3 mr-1" />
          VIP
        </Badge>
      )
    }
    if (level === "vip_plus") {
      return (
        <Badge variant="secondary" className="text-purple-600 border-purple-400 text-xs">
          <Crown className="w-3 h-3 mr-1" />
          VIP+
        </Badge>
      )
    }
    if (level === "beta") {
      return (
        <Badge variant="secondary" className="text-cyan-400 border-cyan-400 text-xs">
          <Zap className="w-3 h-3 mr-1" />
          BETA
        </Badge>
      )
    }
    return null
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getDaysSince = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="space-y-6 px-2 sm:px-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded mx-auto mb-2"></div>
                <div className="h-6 sm:h-8 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 sm:h-4 bg-gray-300 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-2 sm:px-0">
      {/* Statistiques générales - Responsive amélioré */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
          <CardContent className="p-3 sm:p-4 text-center">
            <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.totalVIP}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">VIP</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <CardContent className="p-3 sm:p-4 text-center">
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.totalVIPPlus}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">VIP+</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
          <CardContent className="p-3 sm:p-4 text-center">
            <Percent className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{stats.vipPercentage}%</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Taux VIP</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardContent className="p-3 sm:p-4 text-center">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Utilisateurs</div>
          </CardContent>
        </Card>
      </div>

      {/* Classements */}
      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700">
        <CardHeader className="text-center px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            🏆 Hall of Fame VIP
          </CardTitle>
          <CardDescription className="text-gray-400 text-sm sm:text-base">
            Rejoignez nos supporters et apparaissez dans ce classement prestigieux !
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Tabs defaultValue="top-supporters" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 text-xs sm:text-sm">
              <TabsTrigger value="top-supporters" className="data-[state=active]:bg-yellow-600/20 px-1 sm:px-3">
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Top Supporters</span>
                <span className="sm:hidden">Top</span>
              </TabsTrigger>
              <TabsTrigger value="newest" className="data-[state=active]:bg-green-600/20 px-1 sm:px-3">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Nouveaux VIP</span>
                <span className="sm:hidden">Nouveaux</span>
              </TabsTrigger>
              <TabsTrigger value="veterans" className="data-[state=active]:bg-blue-600/20 px-1 sm:px-3">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Vétérans</span>
                <span className="sm:hidden">Vétérans</span>
              </TabsTrigger>
              <TabsTrigger value="beta" className="data-[state=active]:bg-cyan-600/20 px-1 sm:px-3">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Beta</span>
                <span className="sm:hidden">Beta</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="top-supporters" className="mt-6">
              <div className="space-y-3">
                {topSupporters.length > 0 ? (
                  topSupporters.map((supporter, index) => (
                    <div
                      key={supporter.id}
                      className={`flex items-center justify-between p-3 sm:p-4 rounded-lg transition-all duration-300 hover:scale-105 ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30"
                          : index === 1
                            ? "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30"
                            : index === 2
                              ? "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border border-amber-600/30"
                              : "bg-gray-700/30 border border-gray-600/30"
                      }`}
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className="flex-shrink-0">{getPositionIcon(index)}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                            <p
                              className={`font-bold text-sm sm:text-base truncate ${getUsernameColor(supporter.level)}`}
                            >
                              {supporter.username}
                            </p>
                            {getVIPBadge(supporter.level)}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-400 truncate">
                            Membre depuis {formatDate(supporter.subscriptionDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-green-400 text-sm sm:text-base">
                          {supporter.totalContribution.toFixed(2)}€
                        </p>
                        <p className="text-xs text-gray-400">Total</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">Soyez le premier à apparaître dans ce classement !</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="newest" className="mt-6">
              <div className="space-y-3">
                {newestVIPs.length > 0 ? (
                  newestVIPs.map((vip, index) => (
                    <div
                      key={vip.id}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-green-500/10 border border-green-500/20 transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                            <p className={`font-bold text-sm sm:text-base truncate ${getUsernameColor(vip.level)}`}>
                              {vip.username}
                            </p>
                            {getVIPBadge(vip.level)}
                            {getDaysSince(vip.subscriptionDate) <= 7 && (
                              <Badge
                                variant="secondary"
                                className="text-green-400 border-green-400 text-xs animate-pulse"
                              >
                                NOUVEAU
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-400 truncate">
                            Rejoint le {formatDate(vip.subscriptionDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs sm:text-sm text-green-400">
                          Il y a {getDaysSince(vip.subscriptionDate)} jours
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">Soyez le prochain nouveau VIP !</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="veterans" className="mt-6">
              <div className="space-y-3">
                {oldestVIPs.length > 0 ? (
                  oldestVIPs.map((veteran, index) => (
                    <div
                      key={veteran.id}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                            <p className={`font-bold text-sm sm:text-base truncate ${getUsernameColor(veteran.level)}`}>
                              {veteran.username}
                            </p>
                            {getVIPBadge(veteran.level)}
                            <Badge variant="secondary" className="text-blue-400 border-blue-400 text-xs">
                              VÉTÉRAN
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-400 truncate">
                            Fidèle depuis {formatDate(veteran.subscriptionDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs sm:text-sm text-blue-400">
                          {getDaysSince(veteran.subscriptionDate)} jours
                        </p>
                        <p className="text-xs text-gray-400">{veteran.totalContribution.toFixed(2)}€</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">Devenez un vétéran VIP !</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="beta" className="mt-6">
              <div className="space-y-3">
                {betaUsers.length > 0 ? (
                  betaUsers.map((beta, index) => (
                    <div
                      key={beta.id}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20 transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                            <p className={`font-bold text-sm sm:text-base truncate ${getUsernameColor(beta.level)}`}>
                              {beta.username}
                            </p>
                            {getVIPBadge(beta.level)}
                            <Badge variant="secondary" className="text-cyan-400 border-cyan-400 text-xs">
                              TESTEUR
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-400 truncate">
                            Beta depuis {formatDate(beta.subscriptionDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs sm:text-sm text-cyan-400">{getDaysSince(beta.subscriptionDate)} jours</p>
                        <p className="text-xs text-gray-400">{beta.totalContribution.toFixed(2)}€</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">Aucun testeur Beta pour le moment !</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Call to action */}
          <div className="mt-8 text-center p-4 sm:p-6 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 rounded-lg border border-purple-500/20">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">🌟 Votre nom pourrait être ici !</h3>
            <p className="text-gray-400 mb-4 text-sm sm:text-base">
              Rejoignez nos supporters et apparaissez dans ces classements prestigieux
            </p>
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-300">
              <span>✨ Badge exclusif</span>
              <span>•</span>
              <span>🎨 Pseudo coloré</span>
              <span>•</span>
              <span>🏆 Classement public</span>
              <span>•</span>
              <span>💝 Soutenir WaveWatch</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
