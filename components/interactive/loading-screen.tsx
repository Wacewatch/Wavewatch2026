"use client"

import { Loader2 } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Chargement du monde interactif</h2>
          <p className="text-muted-foreground">Préparation de votre avatar...</p>
        </div>
      </div>
    </div>
  )
}
