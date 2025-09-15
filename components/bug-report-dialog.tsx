"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { BugTracker } from "@/lib/bug-tracker"
import { AlertTriangle } from "lucide-react"

interface BugReportDialogProps {
  isOpen: boolean
  onClose: () => void
  contentType: "movie" | "tv" | "anime" | "other"
  contentId?: number
  contentTitle?: string
}

export function BugReportDialog({ isOpen, onClose, contentType, contentId, contentTitle }: BugReportDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour signaler un problème.",
        variant: "destructive",
      })
      return
    }

    if (!title.trim() || !description.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Soumettre le rapport de bug
      const reportId = BugTracker.submitBugReport(
        user.id,
        title.trim(),
        description.trim(),
        contentType,
        contentId,
        contentTitle,
      )

      toast({
        title: "Rapport envoyé",
        description: "Votre rapport de bug a été envoyé avec succès. Merci pour votre contribution !",
      })

      // Reset form
      setTitle("")
      setDescription("")
      onClose()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du rapport.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Signaler un problème
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {contentTitle && (
              <span className="block mb-2">
                Contenu: <span className="text-white">{contentTitle}</span>
              </span>
            )}
            Décrivez le problème rencontré pour nous aider à l'améliorer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bug-title" className="text-gray-300">
              Titre du problème
            </Label>
            <Input
              id="bug-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Problème de lecture, lien cassé..."
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bug-description" className="text-gray-300">
              Description détaillée
            </Label>
            <Textarea
              id="bug-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le problème en détail..."
              rows={4}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-gray-600 text-gray-300">
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700">
              {loading ? "Envoi..." : "Envoyer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
