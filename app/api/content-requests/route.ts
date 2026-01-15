import { NextResponse, type NextRequest } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const { data: requests, error } = await supabase
      .from("content_requests")
      .select(`
        *,
        username:user_profiles!content_requests_user_id_fkey(username),
        vote_count:content_request_votes(count)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    const transformedRequests = requests?.map((request: any) => ({
      ...request,
      username: request.username?.username || "Utilisateur inconnu",
      vote_count: request.vote_count?.[0]?.count || 0,
    }))

    return NextResponse.json({ requests: transformedRequests || [] })
  } catch (error: any) {
    console.error("Error fetching requests:", error)
    return NextResponse.json({ error: error.message || "Erreur lors de la récupération des demandes" }, { status: 500 })
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

    const { data: existingRequests } = await supabase
      .from("content_requests")
      .select("id")
      .eq("title", title)
      .eq("content_type", content_type)
      .eq("status", "pending")

    if (existingRequests && existingRequests.length > 0) {
      const existingRequestId = existingRequests[0].id

      const { data: existingVote } = await supabase
        .from("content_request_votes")
        .select("id")
        .eq("request_id", existingRequestId)
        .eq("user_id", user.id)
        .single()

      if (!existingVote) {
        const { error: voteError } = await supabase.from("content_request_votes").insert({
          request_id: existingRequestId,
          user_id: user.id,
        })

        if (voteError) throw voteError

        return NextResponse.json({
          message: "Cette demande existe déjà. Votre vote a été ajouté !",
          request_id: existingRequestId,
          voted: true,
        })
      } else {
        return NextResponse.json({
          message: "Vous avez déjà voté pour cette demande.",
          request_id: existingRequestId,
          voted: false,
        })
      }
    }

    const { data, error } = await supabase
      .from("content_requests")
      .insert({
        user_id: user.id,
        title,
        description: description || null,
        content_type,
        tmdb_id: tmdb_id || null,
        status: "pending",
      })
      .select()
      .single()

    if (error) throw error

    await supabase.from("content_request_votes").insert({
      request_id: data.id,
      user_id: user.id,
    })

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
