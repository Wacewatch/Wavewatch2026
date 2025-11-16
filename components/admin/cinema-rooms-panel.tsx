"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Plus, Edit, Trash2, Film } from 'lucide-react'

export function CinemaRoomsPanel({ rooms }: { rooms: any[] }) {
  const [roomList, setRoomList] = useState(rooms)
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const [newRoom, setNewRoom] = useState({
    name: "",
    room_number: roomList.length + 1,
    capacity: 30,
    theme: "modern",
    access_level: "all",
    is_open: true,
  })

  const handleCreateRoom = async () => {
    setIsCreating(true)

    const { data, error } = await supabase
      .from("interactive_cinema_rooms")
      .insert([newRoom])
      .select()
      .single()

    if (error) {
      console.error("Error creating room:", error)
      toast({
        title: "Erreur",
        description: "Impossible de créer la salle",
        variant: "destructive",
      })
      setIsCreating(false)
      return
    }

    setRoomList([...roomList, data])
    setNewRoom({
      name: "",
      room_number: roomList.length + 2,
      capacity: 30,
      theme: "modern",
      access_level: "all",
      is_open: true,
    })

    toast({
      title: "Salle créée",
      description: `La salle ${data.name} a été créée avec succès`,
    })

    setIsCreating(false)
  }

  const handleDeleteRoom = async (id: string) => {
    const { error } = await supabase
      .from("interactive_cinema_rooms")
      .delete()
      .eq("id", id)

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la salle",
        variant: "destructive",
      })
      return
    }

    setRoomList(roomList.filter(r => r.id !== id))
    toast({ title: "Salle supprimée" })
  }

  return (
    <div className="space-y-6">
      {/* Create new room form */}
      <div className="p-4 border rounded-lg space-y-4 bg-muted/30">
        <h3 className="font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Créer une Nouvelle Salle
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nom de la Salle</Label>
            <Input
              value={newRoom.name}
              onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
              placeholder="Ex: Salle Premium 1"
            />
          </div>

          <div className="space-y-2">
            <Label>Numéro de Salle</Label>
            <Input
              type="number"
              value={newRoom.room_number}
              onChange={(e) => setNewRoom({ ...newRoom, room_number: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="space-y-2">
            <Label>Capacité</Label>
            <Input
              type="number"
              value={newRoom.capacity}
              onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) || 0 })}
              min={1}
              max={200}
            />
          </div>

          <div className="space-y-2">
            <Label>Thème</Label>
            <Select value={newRoom.theme} onValueChange={(v) => setNewRoom({ ...newRoom, theme: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">Moderne</SelectItem>
                <SelectItem value="classic">Classique</SelectItem>
                <SelectItem value="luxury">Luxe</SelectItem>
                <SelectItem value="imax">IMAX</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Niveau d'Accès</Label>
            <Select value={newRoom.access_level} onValueChange={(v) => setNewRoom({ ...newRoom, access_level: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="vip_plus">VIP+</SelectItem>
                <SelectItem value="admin">Admin Seulement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>État</Label>
            <Select value={newRoom.is_open ? "open" : "closed"} onValueChange={(v) => setNewRoom({ ...newRoom, is_open: v === "open" })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Ouverte</SelectItem>
                <SelectItem value="closed">Fermée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleCreateRoom} disabled={isCreating || !newRoom.name} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          {isCreating ? "Création..." : "Créer la Salle"}
        </Button>
      </div>

      {/* Existing rooms list */}
      <div className="space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Film className="w-4 h-4" />
          Salles Existantes ({roomList.length})
        </h3>
        
        <div className="grid gap-3">
          {roomList.map((room) => (
            <div key={room.id} className="p-4 border rounded-lg flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{room.name}</span>
                  <Badge variant={room.is_open ? "default" : "secondary"}>
                    {room.is_open ? "Ouverte" : "Fermée"}
                  </Badge>
                  <Badge variant="outline">{room.access_level}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Salle #{room.room_number} • Capacité: {room.capacity} • Thème: {room.theme}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Edit className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteRoom(room.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
