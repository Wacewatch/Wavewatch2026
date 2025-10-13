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
  User,
  ArrowLeft,
  Camera,
  Calendar,
  MapPin,
  Edit,
  Crown,
  Shield,
  Mail,
  Save,
  X,
  Flag as Flask,
  MessageSquare,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { VIPSystem } from "@/lib/vip-system"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useUserPreferences } from "@/hooks/use-user-preferences"
import { useMessaging } from "@/hooks/use-messaging"

interface UserProfile {
  birthDate?: string
  location?: string
  bio?: string
  profileImage?: string
  joinDate: string
  allow_messages: boolean
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
    allow_messages: true,
  })

  const [activationCode, setActivationCode] = useState("")
  const [isActivating, setIsActivating] = useState(false)
  const { preferences, updatePreferences, loading: preferencesLoading } = useUserPreferences()
  const { updateMessagePreferences } = useMessaging()
  const { toast } = useToast()
  const router = useRouter()

  const [showActivationCode, setShowActivationCode] = useState(false)
  const [allowMessages, setAllowMessages] = useState(true)

  useEffect(() => {
    setMounted(true)
    if (user?.id) {
      loadProfile()
      loadBugReports()
      loadMessagePreferences()
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
          allow_messages: data.allow_messages ?? true,
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

  const loadMessagePreferences = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase.from("user_profiles").select("allow_messages").eq("id", user.id).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading message preferences:", error)
        return
      }

      if (data) {
        setAllowMessages(data.allow_messages ?? true)
      }
    } catch (error) {
      console.error("Error loading message preferences:", error)
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
          allow_messages: profile.allow_messages,
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
          const { error } = await supabase.from("user_profiles").update({ is_admin: true }).eq("id", user.id)

          if (error) {
            console.error("Error updating admin status:", error)
          }

          toast({
            title: "Statut Admin activé !",
            description: "Vous avez maintenant les privilèges administrateur. Redirection...",
          })
        } catch (error) {
          console.error("Admin activation error:", error)
          toast({
            title: "Statut Admin activé !",
            description: "Vous avez maintenant les privilèges administrateur. Redirection...",
          })
        }

        setActivationCode("")
        setTimeout(() => {
          router.push("/")
          window.location.reload()
        }, 1500)
      } else if (code === "wavebetawatch2025") {
        VIPSystem.upgradeUser(user.id, user.username, "beta")

        window.dispatchEvent(new Event("vip-updated"))

        toast({
          title: "Statut Bêta Testeur activé !",
          description: "Bienvenue dans l'équipe des bêta testeurs ! Redirection...",
        })
        setActivationCode("")

        setTimeout(() => {
          router.push("/")
        }, 1500)
      } else if (code === "vip2025") {
        VIPSystem.upgradeUser(user.id, user.username, "vip")

        window.dispatchEvent(new Event("vip-updated"))

        toast({
          title: "Statut VIP activé !",
          description: "Vous êtes maintenant membre VIP ! Redirection...",
        })
        setActivationCode("")

        setTimeout(() => {
          router.push("/")
        }, 1500)
      } else if (code === "vipplus2025") {
        VIPSystem.upgradeUser(user.id, user.username, "vip_plus")

        window.dispatchEvent(new Event("vip-updated"))

        toast({
          title: "Statut VIP+ activé !",
          description: "Vous êtes maintenant membre VIP+ ! Redirection...",
        })
        setActivationCode("")

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
      VIPSystem.removeUserPrivileges(user.id)

      try {
        await supabase.from("user_profiles").update({ is_admin: false }).eq("id", user.id)
      } catch (error) {
        console.log("Supabase admin removal failed, continuing with local removal")
      }

      if (typeof window !== "undefined") {
        const localSession = JSON.parse(localStorage.getItem("wavewatch_session") || "{}")
        localSession.isAdmin = false
        localStorage.setItem("wavewatch_session", JSON.stringify(localSession))
      }

      window.dispatchEvent(new Event("vip-updated"))

      toast({
        title: "Privilèges supprimés",
        description: "Vous êtes redevenu un utilisateur standard (admin supprimé aussi)",
      })

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
      if (typeof window !== "undefined") {
        localStorage.removeItem("wavewatch_session")
        localStorage.removeItem("wavewatch_users")
        VIPSystem.removeUserPrivileges(user.id)
      }

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

  const handleAdultContentToggle = async (enabled: boolean) => {
    const success = await updatePreferences({
      showAdultContent: enabled,
      hideAdultContent: !enabled,
    })

    if (success) {
      toast({
        title: enabled ? "Contenu adulte activé" : "Contenu adulte désactivé",
        description: enabled
          ? "Le contenu réservé aux adultes sera maintenant affiché dans les résultats"
          : "Le contenu réservé aux adultes sera filtré des résultats",
      })
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les préférences",
        variant: "destructive",
      })
    }
  }

  const handleHideWatchedToggle = async (enabled: boolean) => {
    const success = await updatePreferences({
      showWatchedContent: !enabled,
    })

    if (success) {
      toast({
        title: enabled ? "Masquage du contenu vu activé" : "Masquage du contenu vu désactivé",
        description: enabled
          ? "Les films et séries déjà vus seront masqués des listes de contenu"
          : "Tous les contenus seront affichés, même ceux déjà vus",
      })
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les préférences",
        variant: "destructive",
      })
    }
  }

  const handleAutoMarkWatchedToggle = async (enabled: boolean) => {
    const success = await updatePreferences({
      autoMarkWatched: enabled,
    })

    if (success) {
      toast({
        title: enabled ? "Marquage automatique activé" : "Marquage automatique désactivé",
        description: enabled
          ? "Le contenu sera automatiquement marqué comme vu quand vous cliquez sur 'Regarder'"
          : "Vous devrez marquer manuellement le contenu comme vu",
      })
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les préférences",
        variant: "destructive",
      })
    }
  }

  const handleMessagePreferencesToggle = async (enabled: boolean) => {
    const success = await updateMessagePreferences(enabled)
    if (success) {
      setAllowMessages(enabled)
    }
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

          <div className="space-y-6">
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

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="hide-watched" className="text-sm font-medium text-gray-300">
                      Masquer le contenu vu
                    </Label>
                    <p className="text-xs text-gray-400">Cacher les films et séries déjà vus des listes de contenu</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="hide-watched"
                      type="checkbox"
                      checked={!preferences.showWatchedContent}
                      onChange={(e) => handleHideWatchedToggle(e.target.checked)}
                      disabled={preferencesLoading}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="auto-mark-watched" className="text-sm font-medium text-gray-300">
                      Marquage automatique
                    </Label>
                    <p className="text-xs text-gray-400">
                      Marquer automatiquement le contenu comme vu quand vous cliquez sur "Regarder"
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="auto-mark-watched"
                      type="checkbox"
                      checked={preferences.autoMarkWatched}
                      onChange={(e) => handleAutoMarkWatchedToggle(e.target.checked)}
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

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                  Préférences de messagerie
                </CardTitle>
                <CardDescription className="text-gray-400">Gérez la réception de messages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="allow-messages" className="text-sm font-medium text-gray-300">
                      Recevoir des messages
                    </Label>
                    <p className="text-xs text-gray-400">
                      Permettre aux autres utilisateurs de vous envoyer des messages privés
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="allow-messages"
                      type="checkbox"
                      checked={allowMessages}
                      onChange={(e) => handleMessagePreferencesToggle(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-500 bg-gray-700/50 p-3 rounded-lg">
                  <strong>Note :</strong> Si vous désactivez cette option, les autres utilisateurs ne pourront plus vous
                  envoyer de nouveaux messages. Vous pourrez toujours consulter vos messages existants et en envoyer.
                </div>

                <div className="pt-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Link href="/dashboard/messages">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Gérer mes messages
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  Code d'activation
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Activez des fonctionnalités spéciales avec un code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="activation-code" className="text-gray-300">
                    Code d'activation
                  </Label>
                  <Input
                    id="activation-code"
                    type="password"
                    placeholder="Entrez votre code"
                    value={activationCode}
                    onChange={(e) => setActivationCode(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <Button
                  onClick={handleActivationCode}
                  disabled={isActivating || !activationCode.trim()}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  {isActivating ? "Activation..." : "Activer"}
                </Button>
                <div className="text-xs text-gray-500 bg-gray-700/50 p-3 rounded-lg">
                  <strong>Codes disponibles :</strong> VIP, VIP+, Bêta Testeur, Admin
                </div>
                {(userVIPLevel !== "free" || user.isAdmin) && (
                  <Button
                    onClick={handleRemovePrivileges}
                    variant="outline"
                    size="sm"
                    className="w-full border-red-600 text-red-400 hover:bg-red-900/20 bg-transparent"
                  >
                    Supprimer tous les privilèges
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Flask className="h-5 w-5 text-green-400" />
                  Mes rapports de bugs
                </CardTitle>
                <CardDescription className="text-gray-400">{bugReports.length} rapport(s) soumis</CardDescription>
              </CardHeader>
              <CardContent>
                {bugReports.length === 0 ? (
                  <p className="text-gray-400 text-sm">Aucun rapport de bug soumis</p>
                ) : (
                  <div className="space-y-3">
                    {bugReports.slice(0, 3).map((report) => (
                      <div key={report.id} className="bg-gray-700/50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-white truncate">{report.title}</h4>
                          <Badge
                            variant={
                              report.status === "resolved"
                                ? "default"
                                : report.status === "in_progress"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="text-xs"
                          >
                            {report.status === "resolved"
                              ? "Résolu"
                              : report.status === "in_progress"
                                ? "En cours"
                                : "Ouvert"}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">{report.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(report.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                    {bugReports.length > 3 && (
                      <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                        <Link href="/bug-reports">Voir tous les rapports</Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-red-900/20 border-red-800">
              <CardHeader>
                <CardTitle className="text-red-400">Zone dangereuse</CardTitle>
                <CardDescription className="text-red-300">Actions irréversibles sur votre compte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleDeleteAccount}
                  variant="destructive"
                  size="sm"
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Supprimer mon compte
                </Button>
                <p className="text-xs text-red-300">
                  Cette action supprimera définitivement votre compte et toutes vos données.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
