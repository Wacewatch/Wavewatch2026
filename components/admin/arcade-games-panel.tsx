"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, ExternalLink, GripVertical, Eye, EyeOff } from 'lucide-react'
import { createClient } from "@/lib/supabase/client"

interface ArcadeGame {
  id: number
  name: string
  url: string
  image_url: string | null
  media_type: 'image' | 'video'
  open_in_new_tab: boolean
  use_proxy: boolean
  is_active: boolean
  display_order: number
}

interface ArcadeGamesPanelProps {
  games: ArcadeGame[]
}

export function ArcadeGamesPanel({ games: initialGames }: ArcadeGamesPanelProps) {
  const [games, setGames] = useState<ArcadeGame[]>(initialGames)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingGame, setEditingGame] = useState<ArcadeGame | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    image_url: '',
    media_type: 'image' as 'image' | 'video',
    open_in_new_tab: false,
    use_proxy: false,
  })

  const supabase = createClient()

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      image_url: '',
      media_type: 'image',
      open_in_new_tab: false,
      use_proxy: false,
    })
  }

  const handleAdd = async () => {
    if (!formData.name || !formData.url) return

    setIsLoading(true)
    try {
      const maxOrder = Math.max(...games.map(g => g.display_order), 0)
      const { data, error } = await supabase
        .from('arcade_games')
        .insert({
          name: formData.name,
          url: formData.url,
          image_url: formData.image_url || null,
          media_type: formData.media_type,
          open_in_new_tab: formData.open_in_new_tab,
          use_proxy: formData.use_proxy,
          display_order: maxOrder + 1,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      setGames([...games, data])
      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error adding game:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!editingGame || !formData.name || !formData.url) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('arcade_games')
        .update({
          name: formData.name,
          url: formData.url,
          image_url: formData.image_url || null,
          media_type: formData.media_type,
          open_in_new_tab: formData.open_in_new_tab,
          use_proxy: formData.use_proxy,
        })
        .eq('id', editingGame.id)
        .select()
        .single()

      if (error) throw error

      setGames(games.map(g => g.id === editingGame.id ? data : g))
      setIsEditDialogOpen(false)
      setEditingGame(null)
      resetForm()
    } catch (error) {
      console.error('Error updating game:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce jeu ?')) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('arcade_games')
        .delete()
        .eq('id', id)

      if (error) throw error

      setGames(games.filter(g => g.id !== id))
    } catch (error) {
      console.error('Error deleting game:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (game: ArcadeGame) => {
    try {
      const { error } = await supabase
        .from('arcade_games')
        .update({ is_active: !game.is_active })
        .eq('id', game.id)

      if (error) throw error

      setGames(games.map(g => g.id === game.id ? { ...g, is_active: !g.is_active } : g))
    } catch (error) {
      console.error('Error toggling game:', error)
    }
  }

  const openEditDialog = (game: ArcadeGame) => {
    setEditingGame(game)
    setFormData({
      name: game.name,
      url: game.url,
      image_url: game.image_url || '',
      media_type: game.media_type,
      open_in_new_tab: game.open_in_new_tab,
      use_proxy: game.use_proxy,
    })
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {games.length} jeu(x) configuré(s) - {games.filter(g => g.is_active).length} actif(s)
        </p>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un jeu
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un jeu d'arcade</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau jeu à la salle d'arcade du monde virtuel
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du jeu *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Pac-Man"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL du jeu *</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">URL de l'image/video</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="/arcade/game.png ou https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Type de média</Label>
                <Select
                  value={formData.media_type}
                  onValueChange={(value: 'image' | 'video') => setFormData({ ...formData, media_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="new_tab">Ouvrir dans un nouvel onglet</Label>
                <Switch
                  id="new_tab"
                  checked={formData.open_in_new_tab}
                  onCheckedChange={(checked) => setFormData({ ...formData, open_in_new_tab: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="proxy">Utiliser le proxy</Label>
                <Switch
                  id="proxy"
                  checked={formData.use_proxy}
                  onCheckedChange={(checked) => setFormData({ ...formData, use_proxy: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAdd} disabled={isLoading || !formData.name || !formData.url}>
                {isLoading ? 'Ajout...' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="w-20">Statut</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.sort((a, b) => a.display_order - b.display_order).map((game) => (
              <TableRow key={game.id} className={!game.is_active ? 'opacity-50' : ''}>
                <TableCell className="font-mono text-xs">{game.display_order}</TableCell>
                <TableCell className="font-medium">{game.name}</TableCell>
                <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                  {game.url}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(game)}
                    title={game.is_active ? 'Désactiver' : 'Activer'}
                  >
                    {game.is_active ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-red-500" />
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(game.url, '_blank')}
                      title="Tester"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(game)}
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(game.id)}
                      title="Supprimer"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {games.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Aucun jeu configuré. Cliquez sur "Ajouter un jeu" pour commencer.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le jeu</DialogTitle>
            <DialogDescription>
              Modifiez les paramètres du jeu "{editingGame?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit_name">Nom du jeu *</Label>
              <Input
                id="edit_name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_url">URL du jeu *</Label>
              <Input
                id="edit_url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_image_url">URL de l'image/video</Label>
              <Input
                id="edit_image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Type de média</Label>
              <Select
                value={formData.media_type}
                onValueChange={(value: 'image' | 'video') => setFormData({ ...formData, media_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit_new_tab">Ouvrir dans un nouvel onglet</Label>
              <Switch
                id="edit_new_tab"
                checked={formData.open_in_new_tab}
                onCheckedChange={(checked) => setFormData({ ...formData, open_in_new_tab: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit_proxy">Utiliser le proxy</Label>
              <Switch
                id="edit_proxy"
                checked={formData.use_proxy}
                onCheckedChange={(checked) => setFormData({ ...formData, use_proxy: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEdit} disabled={isLoading || !formData.name || !formData.url}>
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
