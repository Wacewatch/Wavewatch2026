import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    console.log("[v0] Staff Messages: GET request started")
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] Staff Messages: User not authenticated")
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    console.log("[v0] Staff Messages: Fetching messages for user:", user.id)

    // ✅ CORRECTION: Utiliser 'id' au lieu de 'user_id'
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("[v0] Staff Messages: Error fetching profile:", profileError)
      return NextResponse.json({ error: `Erreur de profil: ${profileError.message}` }, { status: 500 })
    }

    if (profile?.is_admin) {
      console.log("[v0] Staff Messages: User is admin, fetching all messages")
      // Admin: get all messages
      const { data: messages, error } = await supabase
        .from("staff_messages")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Staff Messages: Error fetching admin messages:", error)
        throw error
      }
      console.log("[v0] Staff Messages: Fetched", messages?.length || 0, "messages for admin")
      return NextResponse.json({ messages: messages || [] })
    } else {
      console.log("[v0] Staff Messages: User is regular user, fetching their messages")
      // Regular user: get only their messages
      const { data: messages, error } = await supabase
        .from("staff_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Staff Messages: Error fetching user messages:", error)
        throw error
      }
      console.log("[v0] Staff Messages: Fetched", messages?.length || 0, "messages for user")
      return NextResponse.json({ messages: messages || [] })
    }
  } catch (error: any) {
    console.error("[v0] Staff Messages: Error in GET:", error)
    return NextResponse.json({ error: `Erreur: ${error.message || "Erreur inconnue"}` }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log("[v0] Staff Messages: POST request started")
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] Staff Messages: User not authenticated")
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    console.log("[v0] Staff Messages: User authenticated:", user.id)

    const { title, message } = await request.json()
    console.log("[v0] Staff Messages: Received title:", title, "message length:", message?.length)

    if (!title || !message) {
      console.log("[v0] Staff Messages: Missing title or message")
      return NextResponse.json({ error: "Titre et message requis" }, { status: 400 })
    }

    console.log("[v0] Staff Messages: Fetching user profile...")
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("username, email")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("[v0] Staff Messages: Error fetching profile:", profileError)
      return NextResponse.json({ error: `Erreur de profil: ${profileError.message}` }, { status: 500 })
    }

    const username = profile?.username || (profile?.email ? profile.email.split("@")[0] : "Utilisateur")

    console.log("[v0] Staff Messages: Creating message for user:", user.id, "username:", username)

    const { data, error } = await supabase
      .from("staff_messages")
      .insert({
        user_id: user.id,
        username: username,
        title,
        message,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Staff Messages: Error creating message:", error)
      return NextResponse.json({ error: `Erreur de création: ${error.message}` }, { status: 500 })
    }

    console.log("[v0] Staff Messages: Message created successfully with id:", data.id)
    return NextResponse.json({ message: data })
  } catch (error: any) {
    console.error("[v0] Staff Messages: Error in POST:", error)
    return NextResponse.json({ error: `Erreur: ${error.message || "Erreur inconnue"}` }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
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
