import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("user_profiles").select("is_admin").eq("id", user.id).single()

    if (profile?.is_admin) {
      // Admin: get all requests
      const { data: requests, error } = await supabase
        .from("content_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      return NextResponse.json({ requests: requests || [] })
    } else {
      // Regular user: get only their requests
      const { data: requests, error } = await supabase
        .from("content_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      return NextResponse.json({ requests: requests || [] })
    }
  } catch (error: any) {
    console.error("Error fetching content requests:", error)
    return NextResponse.json({ error: error.message || "Erreur inconnue" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { title, description, content_type, tmdb_id } = await request.json()

    if (!title || !content_type) {
      return NextResponse.json({ error: "Titre et type de contenu requis" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("content_requests")
      .insert({
        user_id: user.id,
        title,
        description: description || null,
        content_type,
        status: "pending",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ request: data })
  } catch (error: any) {
    console.error("Error creating content request:", error)
    return NextResponse.json({ error: error.message || "Erreur inconnue" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("user_profiles").select("is_admin").eq("id", user.id).single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { requestId, status, admin_notes } = await request.json()

    if (!requestId || !status) {
      return NextResponse.json({ error: "ID de demande et statut requis" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("content_requests")
      .update({
        status,
        admin_notes: admin_notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ request: data })
  } catch (error: any) {
    console.error("Error updating content request:", error)
    return NextResponse.json({ error: error.message || "Erreur inconnue" }, { status: 500 })
  }
}
