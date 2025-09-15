"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface TrailerModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  trailerUrl: string
}

export function TrailerModal({ isOpen, onClose, title, trailerUrl }: TrailerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[85vh] p-0 bg-black border-gray-800">
        <DialogHeader className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-lg font-semibold">Bande-annonce - {title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 p-0 relative">
          <iframe
            src={trailerUrl}
            className="w-full h-full border-0 absolute inset-0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={`Bande-annonce - ${title}`}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
