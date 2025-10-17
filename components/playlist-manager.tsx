"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Plus, Edit, Trash2, Lock, Globe, Calendar, Film, Crown } from "lucide-react"
import { usePlaylists } from "@/hooks/use-playlists"
import { useAuth } from "@/components/auth-provider"
import { VIPSystem } from "@/lib/vip-system"
import Link from "next/link"

const STANDARD_COLORS = [
  { name: "Bleu", value: "#3B82F6", premium: false },
  { name: "Rouge", value: "#EF4444", premium: false },
  { name: "Vert", value: "#10B981", premium: false },
  { name: "Violet", value: "#8B5CF6", premium: false },
  { name: "Rose", value: "#EC4899", premium: false },
]

const PREMIUM_COLORS = [
  { name: "Or", value: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)", premium: true, animated: true },
  { name: "Émeraude", value: "linear-gradient(135deg, #10B981 0%, #059669 100%)", premium: true, animated: true },
  { name: "Saphir", value: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)", premium: true, animated: true },
  { name: "Rubis", value: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)", premium: true, animated: true },
  { name: "Améthyste", value: "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)", premium: true, animated: true },
  {
    name: "Arc-en-ciel",
    value: "linear-gradient(135deg, #FF0080 0%, #FF8C00 25%, #40E0D0 50%, #FF0080 100%)",
    premium: true,
    animated: true,
  },
  {
    name: "Galaxie",
    value: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    premium: true,
    animated: true,
  },
]

interface PlaylistFormData {
  title: string
  description: string
  isPublic: boolean
  themeColor: string
}

export function PlaylistManager() {
  const { user } = useAuth()
  const { playlists, loading, createPlaylist, updatePlaylist, deletePlaylist } = usePlaylists()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState<string | null>(null)
  const [formData, setFormData] = useState<PlaylistFormData>({
    title: "",
    description: "",
    isPublic: true,
    themeColor: "#3B82F6",
  })

  const userVIPLevel = user ? VIPSystem.getUserVIPStatus(user.id) : "free"
  const hasPremiumAccess = user?.isAdmin || userVIPLevel === "vip" || userVIPLevel === "vip_plus"

  const handleCreatePlaylist = async () => {
    if (!formData.title.trim()) return

    console.log("[v0] Submitting playlist creation form:", formData)

    const success = await createPlaylist(formData.title, formData.description, formData.isPublic, formData.themeColor)

    console.log("[v0] Playlist creation result:", success ? "success" : "failed")

    if (success) {
      setShowCreateDialog(false)
      setFormData({
        title: "",
        description: "",
        isPublic: true,
        themeColor: "#3B82F6",
      })
    }
  }

  const handleEditPlaylist = async (playlistId: string) => {
    if (!formData.title.trim()) return

    const success = await updatePlaylist(playlistId, {
      title: formData.title,
      description: formData.description,
      is_public: formData.isPublic,
      theme_color: formData.themeColor,
    })

    if (success) {
      setEditingPlaylist(null)
      setFormData({
        title: "",
        description: "",
        isPublic: true,
        themeColor: "#3B82F6",
      })
    }
  }

  const startEdit = (playlist: any) => {
    setFormData({
      title: playlist.title,
      description: playlist.description || "",
      isPublic: playlist.is_public,
      themeColor: playlist.theme_color,
    })
    setEditingPlaylist(playlist.id)
  }

  const handleDeletePlaylist = async (playlistId: string) => {
    await deletePlaylist(playlistId)
  }

  const ColorSelector = ({ value, onChange }: { value: string; onChange: (color: string) => void }) => {
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-gray-300 mb-2 block">Couleurs standard</Label>
          <div className="flex flex-wrap gap-2">
            {STANDARD_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => onChange(color.value)}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  value === color.value ? "border-white scale-110" : "border-gray-600 hover:border-gray-400"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <div>
          <Label className="text-gray-300 mb-2 flex items-center gap-2">
            Couleurs premium
            <Crown className="w-4 h-4 text-yellow-400" />
          </Label>
          <div className="flex flex-wrap gap-2">
            {PREMIUM_COLORS.map((color) => (
              <div key={color.value} className="relative">
                <button
                  onClick={() => {
                    if (hasPremiumAccess) {
                      onChange(color.value)
                    }
                  }}
                  disabled={!hasPremiumAccess}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    value === color.value ? "border-white scale-110" : "border-gray-600"
                  } ${!hasPremiumAccess ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400"} ${
                    color.animated ? "animate-gradient" : ""
                  }`}
                  style={{ background: color.value }}
                  title={color.name}
                />
                {!hasPremiumAccess && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-white drop-shadow-lg" />
                  </div>
                )}
              </div>
            ))}
          </div>
          {!hasPremiumAccess && (
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Ces couleurs sont réservées aux membres VIP et VIP+
            </p>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Chargement des playlists...</div>
      </div>
    )
  }

  console.log("[v0] Rendering PlaylistManager with playlists:", playlists.length)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Mes Playlists</h2>
          <p className="text-gray-400">Créez et gérez vos collections personnalisées</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Playlist
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle playlist</DialogTitle>
              <DialogDescription className="text-gray-400">
                Créez une collection personnalisée de films et séries
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de la playlist</Label>
                <Input
                  id="title"
                  placeholder="Ma playlist géniale"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="bg-gray-700 border-gray-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnelle)</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez votre playlist..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="bg-gray-700 border-gray-600"
                  rows={3}
                />
              </div>

              <ColorSelector
                value={formData.themeColor}
                onChange={(color) => setFormData((prev) => ({ ...prev, themeColor: color }))}
              />

              <div className="flex items-center space-x-2">
                <input
                  id="isPublic"
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <Label htmlFor="isPublic" className="flex items-center gap-2">
                  {formData.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  Playlist publique
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="border-gray-600 text-gray-300"
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreatePlaylist}
                disabled={!formData.title.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Créer la playlist
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Film className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Aucune playlist</h3>
            <p className="text-gray-400 text-center mb-6">
              Créez votre première playlist pour organiser vos films et séries préférés
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Créer ma première playlist
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <Link key={playlist.id} href={`/playlists/${playlist.id}`}>
              <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle
                        className="text-white text-lg line-clamp-1 group-hover:text-blue-400 transition-colors"
                        title={playlist.title}
                      >
                        {playlist.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            background: playlist.theme_color,
                          }}
                        />
                        {playlist.is_public ? (
                          <Badge variant="secondary" className="text-xs">
                            <Globe className="w-3 h-3 mr-1" />
                            Public
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs border-gray-600">
                            <Lock className="w-3 h-3 mr-1" />
                            Privé
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                      <Dialog
                        open={editingPlaylist === playlist.id}
                        onOpenChange={(open) => {
                          if (!open) setEditingPlaylist(null)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(playlist)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Modifier la playlist</DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Modifiez les paramètres de votre playlist
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-title">Titre de la playlist</Label>
                              <Input
                                id="edit-title"
                                value={formData.title}
                                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                                className="bg-gray-700 border-gray-600"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-description">Description</Label>
                              <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                className="bg-gray-700 border-gray-600"
                                rows={3}
                              />
                            </div>

                            <ColorSelector
                              value={formData.themeColor}
                              onChange={(color) => setFormData((prev) => ({ ...prev, themeColor: color }))}
                            />

                            <div className="flex items-center space-x-2">
                              <input
                                id="edit-isPublic"
                                type="checkbox"
                                checked={formData.isPublic}
                                onChange={(e) => setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))}
                                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                              />
                              <Label htmlFor="edit-isPublic" className="flex items-center gap-2">
                                {formData.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                Playlist publique
                              </Label>
                            </div>
                          </div>

                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setEditingPlaylist(null)}
                              className="border-gray-600 text-gray-300"
                            >
                              Annuler
                            </Button>
                            <Button
                              onClick={() => handleEditPlaylist(playlist.id)}
                              disabled={!formData.title.trim()}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Sauvegarder
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-800 border-gray-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Supprimer la playlist</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-300">
                              Êtes-vous sûr de vouloir supprimer la playlist "{playlist.title}" ? Cette action est
                              irréversible et supprimera tous les éléments de la playlist.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                              Annuler
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePlaylist(playlist.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {playlist.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{playlist.description}</p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-4">
                      <span>{playlist.items_count || 0} éléments</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(playlist.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
