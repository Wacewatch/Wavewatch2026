"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  User,
  ArrowLeft,
  Bug,
  Camera,
  Calendar,
  MapPin,
  Edit,
  Crown,
  Shield,
  Mail,
  Save,
  X,
  Key,
  Check,
  Flag as Flask,
  Trash2,
  UserX,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { VIPSystem } from "@/lib/vip-system"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useUserPreferences } from "@/hooks/use-user-preferences"

interface UserProfile {
  birthDate?: string
  location?: string
  bio?: string
  profileImage?: string
  joinDate: string
}

interface BugReport {
  id: string
  title: string
  description: string
  status: string
  contentTitle?: string
  createdAt: string
}

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [bugReports, setBugReports] = useState<BugReport[]>([])
  const [mounted, setMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    joinDate: new Date().toISOString().split("T")[0],
  })

  const [activationCode, setActivationCode] = useState("")
  const [isActivating, setIsActivating] = useState(false)
  const { preferences, updatePreferences, loading: preferencesLoading } = useUserPreferences()
  const { toast } = useToast()
  const router = useRouter()

  // Ajouter un état pour le toggle du module
  const [showActivationCode, setShowActivationCode] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (user?.id) {
      loadProfile()
      loadBugReports()
    }
  }, [user?.id])

  const loadProfile = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile:", error)
        return
      }

      if (data) {
        setProfile({
          birthDate: data.birth_date,
          location: data.location,
          bio: data.bio,
          profileImage: data.profile_image,
          joinDate: data.join_date || new Date().toISOString().split("T")[0],
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const loadBugReports = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from("bug_reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading bug reports:", error)
        // Don't return early, just set empty array
        setBugReports([])
        return
      }

      setBugReports(
        data?.map((report) => ({
          id: report.id,
          title: report.title,
          description: report.description,
          status: report.status,
          contentTitle: report.content_title,
          createdAt: report.created_at,
        })) || [],
      )
    } catch (error) {
      console.error("Error loading bug reports:", error)
      setBugReports([])
    }
  }

  const handleSaveProfile = async () => {
    if (!user?.id) return

    try {
      const { error } = await supabase.from("user_profiles").upsert(
        {
          user_id: user.id,
          birth_date: profile.birthDate,
          location: profile.location,
          bio: profile.bio,
          profile_image: profile.profileImage,
          join_date: profile.joinDate,
        },
        {
          onConflict: "user_id",
        },
      )

      if (error) {
        console.error("Error saving profile:", error)
        return
      }

      setIsEditing(false)
    } catch (error) {
      console.error("Error saving profile:", error)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfile((prev) => ({
          ...prev,
          profileImage: e.target?.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleActivationCode = async () => {
    if (!activationCode.trim()) {
      toast({
        title: "Code requis",
        description: "Veuillez entrer un code d'activation",
        variant: "destructive",
      })
      return
    }

    setIsActivating(true)

    try {
      const code = activationCode.trim()

      if (code === "45684568") {
        try {
          const { data, error } = await supabase.rpc("activate_admin_privileges", {
            user_id_param: user.id,
          })

          if (error) {
            console.error("Error activating admin:", error)
            throw error
          }

          if (data && data.success) {
            toast({
              title: "Statut Admin activé !",
              description: data.message || "Vous avez maintenant les privilèges administrateur. Redirection...",
            })
          } else {
            throw new Error(data?.error || "Erreur lors de l'activation admin")
          }
        } catch (error) {
          console.error("Admin activation error:", error)
          toast({
            title: "Erreur d'activation",
            description: "Impossible d'activer les privilèges admin. Veuillez réessayer.",
            variant: "destructive",
          })
          setIsActivating(false)
          return
        }

        setActivationCode("")
        // Rediriger vers la page d'accueil pour forcer le rechargement du contexte
        setTimeout(() => {
          router.push("/")
          window.location.reload()
        }, 1500)
      } else if (code === "wavebetawatch2025") {
        // Code Bêta Testeur
        VIPSystem.upgradeUser(user.id, user.username, "beta")

        // Déclencher un événement pour mettre à jour les autres composants
        window.dispatchEvent(new Event("vip-updated"))

        toast({
          title: "Statut Bêta Testeur activé !",
          description: "Bienvenue dans l'équipe des bêta testeurs ! Redirection...",
        })
        setActivationCode("")

        // Rediriger vers la page d'accueil
        setTimeout(() => {
          router.push("/")
        }, 1500)
      } else if (code === "vip2025") {
        // Code VIP
        VIPSystem.upgradeUser(user.id, user.username, "vip")

        // Déclencher un événement pour mettre à jour les autres composants
        window.dispatchEvent(new Event("vip-updated"))

        toast({
          title: "Statut VIP activé !",
          description: "Vous êtes maintenant membre VIP ! Redirection...",
        })
        setActivationCode("")

        // Rediriger vers la page d'accueil
        setTimeout(() => {
          router.push("/")
        }, 1500)
      } else if (code === "vipplus2025") {
        // Code VIP+
        VIPSystem.upgradeUser(user.id, user.username, "vip_plus")

        // Déclencher un événement pour mettre à jour les autres composants
        window.dispatchEvent(new Event("vip-updated"))

        toast({
          title: "Statut VIP+ activé !",
          description: "Vous êtes maintenant membre VIP+ ! Redirection...",
        })
        setActivationCode("")

        // Rediriger vers la page d'accueil
        setTimeout(() => {
          router.push("/")
        }, 1500)
      } else {
        toast({
          title: "Code invalide",
          description: "Le code d'activation n'est pas reconnu",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'activation",
        variant: "destructive",
      })
    } finally {
      setIsActivating(false)
    }
  }

  const handleRemovePrivileges = async () => {
    try {
      // Supprimer les privilèges VIP du localStorage
      VIPSystem.removeUserPrivileges(user.id)

      // Supprimer aussi le statut admin
      try {
        await supabase.from("user_profiles").update({ is_admin: false }).eq("id", user.id)
      } catch (error) {
        console.log("Supabase admin removal failed, continuing with local removal")
      }

      // Supprimer le statut admin du localStorage aussi
      if (typeof window !== "undefined") {
        const localSession = JSON.parse(localStorage.getItem("wavewatch_session") || "{}")
        localSession.isAdmin = false
        localStorage.setItem("wavewatch_session", JSON.stringify(localSession))
      }

      // Déclencher un événement pour mettre à jour les autres composants
      window.dispatchEvent(new Event("vip-updated"))

      toast({
        title: "Privilèges supprimés",
        description: "Vous êtes redevenu un utilisateur standard (admin supprimé aussi)",
      })

      // Rediriger vers la page d'accueil
      setTimeout(() => {
        router.push("/")
        window.location.reload()
      }, 1000)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression des privilèges",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = async () => {
    try {
      // Supprimer les données locales
      if (typeof window !== "undefined") {
        localStorage.removeItem("wavewatch_session")
        localStorage.removeItem("wavewatch_users")
        VIPSystem.removeUserPrivileges(user.id)
      }

      // Essayer de supprimer de Supabase si possible
      try {
        await supabase.from("user_profiles").delete().eq("id", user.id)
        await supabase.from("user_profiles_extended").delete().eq("user_id", user.id)
        await supabase.from("bug_reports").delete().eq("user_id", user.id)
      } catch (error) {
        console.log("Supabase deletion failed, continuing with local deletion")
      }

      toast({
        title: "Compte supprimé",
        description: "Votre compte a été supprimé avec succès",
      })

      // Déconnecter et rediriger
      await signOut()
      router.push("/")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du compte",
        variant: "destructive",
      })
    }
  }

  const handleAdultContentToggle = (enabled: boolean) => {
    updatePreferences({
      showAdultContent: enabled,
      hideAdultContent: !enabled,
    })

    toast({
      title: enabled ? "Contenu adulte activé" : "Contenu adulte désactivé",
      description: enabled
        ? "Le contenu réservé aux adultes sera maintenant affiché dans les résultats"
        : "Le contenu réservé aux adultes sera filtré des résultats",
    })
  }

  const handleHideWatchedToggle = (enabled: boolean) => {
    updatePreferences({
      showWatchedContent: !enabled,
      autoMarkWatched: enabled,
    })

    toast({
      title: enabled ? "Marquage automatique activé" : "Marquage automatique désactivé",
      description: enabled
        ? "Les éléments visionnés seront automatiquement marqués comme vus"
        : "Le marquage automatique des éléments vus est désactivé",
    })
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">Chargement...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-white">Accès refusé</h1>
            <p className="text-gray-300">Vous devez être connecté pour accéder à cette page.</p>
          </div>
        </div>
      </div>
    )
  }

  const userVIPLevel = VIPSystem.getUserVIPStatus(user.id)
  const vipBadge = VIPSystem.getVIPBadge(userVIPLevel)
  const usernameColor = VIPSystem.getUsernameColor(userVIPLevel)

  const getVIPBadge = (level: string) => {
    if (level === "vip") {
      return (
        <Badge variant="secondary" className="text-yellow-600 border-yellow-400">
          <Crown className="w-3 h-3 mr-1" />
          VIP
        </Badge>
      )
    }
    if (level === "vip_plus") {
      return (
        <Badge variant="secondary" className="text-purple-600 border-purple-400">
          <Crown className="w-3 h-3 mr-1" />
          VIP+
        </Badge>
      )
    }
    if (level === "beta") {
      return (
        <Badge variant="secondary" className="text-cyan-400 border-cyan-400">
          <Flask className="w-3 h-3 mr-1" />
          BETA
        </Badge>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button variant="ghost" asChild className="text-gray-400 hover:text-white">
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour au dashboard
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-white">Mon Profil</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`font-medium ${usernameColor}`}>{user.username}</span>
              {getVIPBadge(userVIPLevel)}
              {user.isAdmin && (
                <Badge variant="secondary" className="bg-red-900 text-red-300 border-red-700">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </>
              )}
            </Button>
            {isEditing && (
              <Button onClick={handleSaveProfile} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profil principal */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
                <CardDescription className="text-gray-400">Gérez vos informations de profil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar et infos de base */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile.profileImage || "/placeholder.svg"} />
                      <AvatarFallback className="text-2xl bg-gray-700 text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                        <Camera className="w-4 h-4" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className={`text-2xl font-bold ${usernameColor}`}>{user.username}</h3>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Membre depuis {new Date(profile.joinDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Formulaire */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-300">
                      Nom d'utilisateur
                    </Label>
                    <Input
                      id="username"
                      value={user.username}
                      disabled
                      className="bg-gray-700 border-gray-600 text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="bg-gray-700 border-gray-600 text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="text-gray-300">
                      Date de naissance
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={profile.birthDate || ""}
                      onChange={(e) => setProfile((prev) => ({ ...prev, birthDate: e.target.value }))}
                      disabled={!isEditing}
                      className={`${isEditing ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-800 border-gray-700 text-gray-400"}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-gray-300">
                      Localisation
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        placeholder="Ville, Pays"
                        value={profile.location || ""}
                        onChange={(e) => setProfile((prev) => ({ ...prev, location: e.target.value }))}
                        disabled={!isEditing}
                        className={`pl-10 ${isEditing ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-800 border-gray-700 text-gray-400"}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-gray-300">
                    Biographie
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="Parlez-nous de vous..."
                    value={profile.bio || ""}
                    onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    rows={4}
                    className={`${isEditing ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-800 border-gray-700 text-gray-400"}`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statut VIP */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  Statut VIP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  {getVIPBadge(userVIPLevel) ? (
                    getVIPBadge(userVIPLevel)
                  ) : (
                    <Badge variant="outline" className="text-lg px-4 py-2 border-gray-600 text-gray-400">
                      Membre Standard
                    </Badge>
                  )}
                  <p className="text-sm text-gray-400">
                    {userVIPLevel === "free"
                      ? "Soutenez-nous pour obtenir un badge VIP !"
                      : "Merci de votre soutien ! 💙"}
                  </p>
                  {userVIPLevel === "free" && (
                    <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Link href="/subscription">Devenir VIP</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Adult content preferences */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Shield className="h-5 w-5 text-orange-400" />
                  Préférences de contenu
                </CardTitle>
                <CardDescription className="text-gray-400">Gérez l'affichage du contenu</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="adult-content" className="text-sm font-medium text-gray-300">
                      Contenu adulte
                    </Label>
                    <p className="text-xs text-gray-400">
                      Afficher le contenu réservé aux adultes dans les films, séries et animés
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="adult-content"
                      type="checkbox"
                      checked={preferences.showAdultContent}
                      onChange={(e) => handleAdultContentToggle(e.target.checked)}
                      disabled={preferencesLoading}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                </div>

                {/* Auto mark watched content option */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="auto-mark-watched" className="text-sm font-medium text-gray-300">
                      Marquage automatique
                    </Label>
                    <p className="text-xs text-gray-400">
                      Marquer automatiquement comme vu le contenu que vous regardez
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="auto-mark-watched"
                      type="checkbox"
                      checked={preferences.autoMarkWatched}
                      onChange={(e) => handleHideWatchedToggle(e.target.checked)}
                      disabled={preferencesLoading}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-500 bg-gray-700/50 p-3 rounded-lg">
                  <strong>Note :</strong> Ces options affectent l'affichage du contenu dans toutes les sections du site.
                  Les préférences sont sauvegardées dans votre profil et synchronisées sur tous vos appareils.
                </div>
              </CardContent>
            </Card>

            {/* Code d'activation */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Key className="h-5 w-5 text-blue-400" />
                    Code d'activation
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowActivationCode(!showActivationCode)}
                    className="text-gray-400 hover:text-white"
                  >
                    {showActivationCode ? <X className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              {showActivationCode && (
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      id="activationCode"
                      type="password"
                      placeholder="Entrez votre code..."
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleActivationCode()
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={handleActivationCode}
                    disabled={isActivating || !activationCode.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isActivating ? (
                      "Activation..."
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Activer
                      </>
                    )}
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* Actions rapides */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-gray-600 text-white hover:bg-gray-700 bg-transparent"
                >
                  <Link href="/dashboard">Tableau de bord</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-gray-600 text-white hover:bg-gray-700 bg-transparent"
                >
                  <Link href="/requests">Mes demandes</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-gray-600 text-white hover:bg-gray-700 bg-transparent"
                >
                  <Link href="/subscription">Abonnements</Link>
                </Button>
                {user.isAdmin && (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-red-600 text-red-300 hover:bg-red-900 bg-transparent"
                  >
                    <Link href="/admin">
                      <Shield className="w-4 h-4 mr-2" />
                      Administration
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Rapports de bugs */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Bug className="h-5 w-5" />
              Mes rapports de bugs
            </CardTitle>
            <CardDescription className="text-gray-400">Historique de vos signalements et leur statut</CardDescription>
          </CardHeader>
          <CardContent>
            {bugReports.length === 0 ? (
              <div className="text-center py-8">
                <Bug className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Aucun rapport de bug envoyé pour le moment.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Vous pouvez signaler des problèmes depuis les pages de contenu.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bugReports.map((report) => (
                  <div key={report.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-white line-clamp-1">{report.title}</h4>
                      <Badge
                        variant={
                          report.status === "resolved"
                            ? "default"
                            : report.status === "in_progress"
                              ? "secondary"
                              : "outline"
                        }
                        className={
                          report.status === "resolved"
                            ? "bg-green-600 text-white"
                            : report.status === "in_progress"
                              ? "bg-yellow-600 text-white"
                              : "border-gray-500 text-gray-400"
                        }
                      >
                        {report.status === "resolved"
                          ? "Résolu"
                          : report.status === "in_progress"
                            ? "En cours"
                            : "En attente"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">{report.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>{report.contentTitle && `Contenu: ${report.contentTitle}`}</span>
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Zone de danger */}
        <Card className="bg-red-950/20 border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <UserX className="h-5 w-5" />
              Zone de danger
            </CardTitle>
            <CardDescription className="text-red-300">Actions irréversibles concernant votre compte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Supprimer les privilèges */}
            {userVIPLevel !== "free" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full border-orange-600 text-orange-400 hover:bg-orange-900 bg-transparent"
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Supprimer les privilèges
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-800 border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Supprimer les privilèges</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                      Êtes-vous sûr de vouloir supprimer vos privilèges VIP/Beta/Admin ? Cette action est irréversible
                      et vous redeviendrez un utilisateur standard. Vous perdrez :
                      <br />
                      <br />• Votre badge {userVIPLevel === "beta" ? "BETA" : "VIP"} {user.isAdmin && "et ADMIN"}
                      <br />• Votre couleur de nom spéciale
                      <br />• Tous les avantages associés
                      {user.isAdmin && (
                        <>
                          <br />• Vos privilèges d'administration
                        </>
                      )}
                      <br />
                      <br />
                      Vous devrez utiliser un nouveau code d'activation pour retrouver vos privilèges.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRemovePrivileges}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      Supprimer les privilèges
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Supprimer le compte */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-red-600 text-red-400 hover:bg-red-900 bg-transparent"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer le compte
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-800 border-gray-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Supprimer définitivement le compte</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-300">
                    ⚠️ <strong>ATTENTION : Cette action est IRRÉVERSIBLE !</strong>
                    <br />
                    <br />
                    En supprimant votre compte, vous perdrez définitivement :
                    <br />
                    <br />• Toutes vos données personnelles
                    <br />• Votre historique de navigation
                    <br />• Vos rapports de bugs
                    <br />• Vos privilèges VIP/Beta
                    <br />• Votre profil complet
                    <br />
                    <br />
                    <strong>Cette action ne peut pas être annulée.</strong> Êtes-vous absolument certain de vouloir
                    continuer ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white">
                    Supprimer définitivement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
