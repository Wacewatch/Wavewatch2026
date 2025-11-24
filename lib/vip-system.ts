import { createClient } from "@/lib/supabase/client"

export type VIPLevel = "free" | "vip" | "vip_plus" | "beta"

export interface VIPUser {
  id: string
  username: string
  level: VIPLevel
  subscriptionDate: Date
  totalContribution: number
  monthlyContribution: number
}

export class VIPSystem {
  private static async getSupabase() {
    return createClient()
  }

  static async getVIPUsers(): Promise<VIPUser[]> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from("user_profiles")
      .select("id, username, is_vip, is_vip_plus, is_beta, created_at")
      .or("is_vip.eq.true,is_vip_plus.eq.true,is_beta.eq.true")

    if (error) {
      console.error("[v0] Error fetching VIP users:", error)
      return []
    }

    return (data || []).map((user) => ({
      id: user.id,
      username: user.username || "Unknown",
      level: user.is_vip_plus ? "vip_plus" : user.is_vip ? "vip" : user.is_beta ? "beta" : "free",
      subscriptionDate: new Date(user.created_at),
      totalContribution: user.is_vip_plus ? 1.99 : user.is_vip ? 0.99 : 0,
      monthlyContribution: user.is_vip_plus ? 1.99 : user.is_vip ? 0.99 : 0,
    }))
  }

  static async getUserVIPStatus(userId: string): Promise<VIPLevel> {
    if (!userId) return "free"

    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from("user_profiles")
      .select("is_vip, is_vip_plus, is_beta")
      .eq("id", userId)
      .maybeSingle()

    if (error || !data) {
      return "free"
    }

    if (data.is_vip_plus) return "vip_plus"
    if (data.is_vip) return "vip"
    if (data.is_beta) return "beta"
    return "free"
  }

  static async upgradeUser(userId: string, username: string, level: VIPLevel): Promise<void> {
    if (!userId || !username) return

    const supabase = await this.getSupabase()

    const updates: any = {
      is_vip: level === "vip" || level === "vip_plus",
      is_vip_plus: level === "vip_plus",
      is_beta: level === "beta",
      updated_at: new Date().toISOString(),
    }

    if (level === "vip" || level === "vip_plus") {
      updates.vip_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    const { error } = await supabase.from("user_profiles").update(updates).eq("id", userId)

    if (error) {
      console.error("[v0] Error upgrading user:", error)
      return
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("vip-updated"))
    }
  }

  static async removeUserPrivileges(userId: string): Promise<void> {
    if (!userId) return

    const supabase = await this.getSupabase()

    const { error } = await supabase
      .from("user_profiles")
      .update({
        is_vip: false,
        is_vip_plus: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("[v0] Error removing privileges:", error)
      return
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("vip-updated"))
    }
  }

  static getVIPBadge(level: VIPLevel): { text: string; color: string } {
    switch (level) {
      case "vip":
        return { text: "VIP", color: "text-yellow-600 border-yellow-600" }
      case "vip_plus":
        return { text: "VIP+", color: "text-purple-600 border-purple-600" }
      case "beta":
        return { text: "BETA", color: "text-cyan-400 border-cyan-400" }
      default:
        return { text: "", color: "" }
    }
  }

  static getUsernameColor(level: VIPLevel): string {
    switch (level) {
      case "vip":
        return "text-yellow-600"
      case "vip_plus":
        return "text-purple-600"
      case "beta":
        return "text-cyan-400"
      default:
        return "text-foreground"
    }
  }

  static async getTopSupporters(limit = 10): Promise<VIPUser[]> {
    const vipUsers = await this.getVIPUsers()
    return vipUsers
      .filter((user) => user.level !== "free" && user.level !== "beta")
      .sort((a, b) => b.totalContribution - a.totalContribution)
      .slice(0, limit)
  }

  static async getTotalRevenue(): Promise<number> {
    const vipUsers = await this.getVIPUsers()
    return vipUsers.reduce((total, user) => total + user.totalContribution, 0)
  }

  static async getVIPStats(): Promise<{
    totalVIP: number
    totalVIPPlus: number
    totalBeta: number
    monthlyRevenue: number
    totalRevenue: number
  }> {
    const vipUsers = await this.getVIPUsers()
    return {
      totalVIP: vipUsers.filter((u) => u.level === "vip").length,
      totalVIPPlus: vipUsers.filter((u) => u.level === "vip_plus").length,
      totalBeta: vipUsers.filter((u) => u.level === "beta").length,
      monthlyRevenue: vipUsers.reduce((total, user) => total + user.monthlyContribution, 0),
      totalRevenue: vipUsers.reduce((total, user) => total + user.totalContribution, 0),
    }
  }

  static getVIPPricing() {
    return {
      free: {
        name: "Gratuit",
        price: 0,
        description: "Accès complet à tout le contenu",
        features: ["Streaming illimité", "Tous les films et séries", "Toutes les chaînes TV", "Support communautaire"],
      },
      vip: {
        name: "VIP",
        price: "0,99€",
        description: "Soutenez WaveWatch + Badge VIP",
        features: [
          "Tout du plan Gratuit",
          "Badge VIP exclusif",
          "Pseudo en couleur dorée",
          "Classement des top supporters",
          "Soutien au développement",
        ],
      },
      vip_plus: {
        name: "VIP+",
        price: "1,99€",
        description: "Soutien premium + Badge VIP+",
        features: [
          "Tout du plan Gratuit",
          "Badge VIP+ exclusif",
          "Pseudo en couleur violette",
          "Priorité dans le classement",
          "Soutien premium au développement",
        ],
      },
    }
  }
}
