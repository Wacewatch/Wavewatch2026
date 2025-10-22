import { supabase } from "@/lib/supabase-client"
import { MusicDetails } from "@/components/music-details"
import { notFound } from "next/navigation"

interface MusicPageProps {
  params: {
    id: string
  }
}

export default async function MusicPage({ params }: MusicPageProps) {
  try {
    const { data: music, error } = await supabase
      .from("music_content")
      .select("*")
      .eq("id", Number.parseInt(params.id))
      .eq("is_active", true)
      .single()

    if (error || !music) {
      notFound()
    }

    return <MusicDetails music={music} />
  } catch (error) {
    console.error("Error fetching music details:", error)
    notFound()
  }
}
