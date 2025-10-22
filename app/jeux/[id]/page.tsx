import { supabase } from "@/lib/supabase-client"
import { GameDetails } from "@/components/game-details"
import { notFound } from "next/navigation"

interface GamePageProps {
  params: {
    id: string
  }
}

export default async function GamePage({ params }: GamePageProps) {
  try {
    const { data: game, error } = await supabase
      .from("games")
      .select("*")
      .eq("id", Number.parseInt(params.id))
      .eq("is_active", true)
      .single()

    if (error || !game) {
      notFound()
    }

    return <GameDetails game={game} />
  } catch (error) {
    console.error("Error fetching game details:", error)
    notFound()
  }
}
