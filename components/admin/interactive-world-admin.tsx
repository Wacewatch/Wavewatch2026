"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WorldSettingsPanel } from "./world-settings-panel"
import { CinemaRoomsPanel } from "./cinema-rooms-panel"
import { CustomizationOptionsPanel } from "./customization-options-panel"
import { OnlineUsersPanel } from "./online-users-panel"
import { Globe, Film, Palette, Users } from 'lucide-react'

interface InteractiveWorldAdminProps {
  initialSettings: any[]
  initialRooms: any[]
  initialOptions: any[]
  initialOnlineUsers: any[]
}

export function InteractiveWorldAdmin({
  initialSettings,
  initialRooms,
  initialOptions,
  initialOnlineUsers,
}: InteractiveWorldAdminProps) {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gestion du Monde Interactif</h1>
        <p className="text-muted-foreground">
          Gérez tous les aspects de WaveWatch World: paramètres, salles de cinéma, personnalisation et utilisateurs en ligne
        </p>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Paramètres du Monde</span>
            <span className="sm:hidden">Monde</span>
          </TabsTrigger>
          <TabsTrigger value="cinema" className="flex items-center gap-2">
            <Film className="w-4 h-4" />
            <span className="hidden sm:inline">Salles de Cinéma</span>
            <span className="sm:hidden">Cinéma</span>
          </TabsTrigger>
          <TabsTrigger value="customization" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Personnalisation</span>
            <span className="sm:hidden">Avatars</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Utilisateurs En Ligne</span>
            <span className="sm:hidden">En Ligne</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres du Monde</CardTitle>
              <CardDescription>
                Configurez l'apparence, la capacité et les fonctionnalités du monde interactif
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorldSettingsPanel settings={initialSettings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cinema">
          <Card>
            <CardHeader>
              <CardTitle>Salles de Cinéma</CardTitle>
              <CardDescription>
                Créez et gérez les salles de cinéma avec horaires, films et capacités
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CinemaRoomsPanel rooms={initialRooms} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customization">
          <Card>
            <CardHeader>
              <CardTitle>Options de Personnalisation</CardTitle>
              <CardDescription>
                Gérez les coiffures, couleurs, vêtements et accessoires (VIP, VIP+, Admin)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomizationOptionsPanel options={initialOptions} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs En Ligne</CardTitle>
              <CardDescription>
                Surveillez les utilisateurs connectés au monde interactif en temps réel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OnlineUsersPanel users={initialOnlineUsers} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
