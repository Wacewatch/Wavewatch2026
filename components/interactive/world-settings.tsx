"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Smartphone, Monitor } from 'lucide-react'

interface WorldSettingsProps {
  isOpen: boolean
  onClose: () => void
  controlMode: 'keyboard' | 'joystick'
  onControlModeChange: (mode: 'keyboard' | 'joystick') => void
  quality: 'low' | 'medium' | 'high'
  onQualityChange: (quality: 'low' | 'medium' | 'high') => void
}

export function WorldSettings({
  isOpen,
  onClose,
  controlMode,
  onControlModeChange,
  quality,
  onQualityChange
}: WorldSettingsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Paramètres du Monde</DialogTitle>
          <DialogDescription>
            Configurez votre expérience WaveWatch World
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="control-mode">Mode de contrôle</Label>
            <div className="flex gap-2">
              <Button
                variant={controlMode === 'keyboard' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => onControlModeChange('keyboard')}
              >
                <Monitor className="w-4 h-4 mr-2" />
                Clavier (PC)
              </Button>
              <Button
                variant={controlMode === 'joystick' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => onControlModeChange('joystick')}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Joystick (Mobile)
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {controlMode === 'keyboard' 
                ? 'Utilisez ZQSD/WASD et les flèches pour vous déplacer' 
                : 'Utilisez le joystick tactile pour vous déplacer'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quality">Qualité graphique</Label>
            <Select value={quality} onValueChange={(value: any) => onQualityChange(value)}>
              <SelectTrigger id="quality">
                <SelectValue placeholder="Sélectionner la qualité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Basse (Performances maximales)</SelectItem>
                <SelectItem value="medium">Moyenne (Recommandé)</SelectItem>
                <SelectItem value="high">Haute (Meilleure qualité)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Ajustez selon les performances de votre appareil
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
