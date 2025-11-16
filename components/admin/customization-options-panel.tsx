"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Crown, Star, Shield } from 'lucide-react'

export function CustomizationOptionsPanel({ options }: { options: any[] }) {
  const groupedOptions = options.reduce((acc: any, option: any) => {
    if (!acc[option.category]) {
      acc[option.category] = []
    }
    acc[option.category].push(option)
    return acc
  }, {})

  const categoryLabels: Record<string, string> = {
    hairStyle: "Coiffures",
    hairColor: "Couleurs de Cheveux",
    skinTone: "Teints de Peau",
    topColor: "Couleurs de Haut",
    bottomColor: "Couleurs de Bas",
    shoeColor: "Couleurs de Chaussures",
    accessory: "Accessoires",
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedOptions).map(([category, items]: [string, any]) => (
        <div key={category} className="space-y-3">
          <h3 className="font-semibold text-lg">{categoryLabels[category] || category}</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {items.map((option: any) => (
              <div
                key={option.id}
                className="p-3 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{option.label}</span>
                  {option.is_premium && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                
                {category.includes("Color") || category === "skinTone" ? (
                  <div
                    className="h-8 rounded border"
                    style={{ background: option.value }}
                  />
                ) : (
                  <div className="text-xs text-muted-foreground">
                    {option.value}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
