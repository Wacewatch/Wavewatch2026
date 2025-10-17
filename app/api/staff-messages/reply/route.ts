import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_admin, username")
      .eq("id", user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { messageId, replyContent, recipientId } = await request.json()

    if (!messageId || !replyContent || !recipientId) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 })
    }

    // Send reply as a user message
    const { error: messageError } = await supabase.from("user_messages").insert({
      sender_id: user.id,
      recipient_id: recipientId,
      subject: "Réponse du staff",
      content: replyContent,
    })

    if (messageError) throw messageError

    // Update staff message status
    const { error: updateError } = await supabase
      .from("staff_messages")
      .update({ status: "replied", updated_at: new Date().toISOString() })
      .eq("id", messageId)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending reply:", error)
    return NextResponse.json({ error: "Erreur lors de l'envoi de la réponse" }, { status: 500 })
  }
}
