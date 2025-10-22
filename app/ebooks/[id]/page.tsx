import { supabase } from "@/lib/supabase-client"
import { EbookDetails } from "@/components/ebook-details"
import { notFound } from "next/navigation"

interface EbookPageProps {
  params: {
    id: string
  }
}

export default async function EbookPage({ params }: EbookPageProps) {
  try {
    const { data: ebook, error } = await supabase
      .from("ebooks")
      .select("*")
      .eq("id", Number.parseInt(params.id))
      .eq("is_active", true)
      .single()

    if (error || !ebook) {
      notFound()
    }

    return <EbookDetails ebook={ebook} />
  } catch (error) {
    console.error("Error fetching ebook details:", error)
    notFound()
  }
}
