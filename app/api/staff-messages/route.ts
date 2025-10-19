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
    const { data: profile } = await supabase.from("user_profiles").select("is_admin").eq("user_id", user.id).single()

    if (profile?.is_admin) {
      // Admin: get all messages
      const { data: messages, error } = await supabase
        .from("staff_messages")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      return NextResponse.json({ messages: messages || [] })
    } else {
      // Regular user: get only their messages
      const { data: messages, error } = await supabase
        .from("staff_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      return NextResponse.json({ messages: messages || [] })
    }
  } catch (error) {
    console.error("[v0] Error fetching staff messages:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des messages" }, { status: 500 })
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

    const { title, message } = await request.json()

    if (!title || !message) {
      return NextResponse.json({ error: "Titre et message requis" }, { status: 400 })
    }

    // Get username
    const { data: profile } = await supabase.from("user_profiles").select("username").eq("user_id", user.id).single()

    const { data, error } = await supabase
      .from("staff_messages")
      .insert({
        user_id: user.id,
        username: profile?.username || "Utilisateur",
        title,
        message,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating staff message:", error)
      throw error
    }

    console.log("[v0] Staff message created successfully")
    return NextResponse.json({ message: data })
  } catch (error) {
    console.error("[v0] Error in staff message POST:", error)
    return NextResponse.json({ error: "Erreur lors de l'envoi du message" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createClient()

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

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get("id")

    if (!messageId) {
      return NextResponse.json({ error: "ID du message requis" }, { status: 400 })
    }

    const { error } = await supabase.from("staff_messages").delete().eq("id", messageId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting staff message:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}
