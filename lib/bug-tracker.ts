import { supabase } from "@/lib/supabase"

export interface BugReport {
  id: string
  userId: string
  title: string
  description: string
  contentType: "movie" | "tv" | "anime" | "other"
  contentId?: number
  contentTitle?: string
  status: "pending" | "in_progress" | "resolved"
  createdAt: Date
  updatedAt: Date
}

export class BugTracker {
  private static STORAGE_KEY = "wavewatch_bug_reports"

  static getAllBugReports(): BugReport[] {
    if (typeof window === "undefined") return []
    try {
      const reports = localStorage.getItem(this.STORAGE_KEY)
      return reports
        ? JSON.parse(reports).map((report: any) => ({
            ...report,
            createdAt: new Date(report.createdAt),
            updatedAt: new Date(report.updatedAt),
          }))
        : []
    } catch {
      return []
    }
  }

  static getUserBugReports(userId: string): BugReport[] {
    const allReports = this.getAllBugReports()
    return allReports.filter((report) => report.userId === userId)
  }

  static async submitBugReport(
    userId: string,
    title: string,
    description: string,
    contentType: "movie" | "tv" | "anime" | "other",
    contentId?: number,
    contentTitle?: string,
  ): Promise<string> {
    if (typeof window === "undefined") return ""

    const newReport: BugReport = {
      id: `bug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      title,
      description,
      contentType,
      contentId,
      contentTitle,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    try {
      const { data, error } = await supabase
        .from("bug_reports")
        .insert({
          user_id: userId,
          title,
          description,
          content_type: contentType,
          content_id: contentId,
          content_title: contentTitle,
          status: "pending",
        })
        .select()
        .single()

      if (error) {
        console.error("[v0] Error saving bug report to Supabase:", error)
      } else {
        console.log("[v0] Bug report saved to Supabase:", data)
      }
    } catch (error) {
      console.error("[v0] Error submitting bug report:", error)
    }

    // Also save to localStorage for backward compatibility
    const reports = this.getAllBugReports()
    reports.push(newReport)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reports))

    // Trigger event to notify other components
    window.dispatchEvent(new Event("bug-report-submitted"))

    return newReport.id
  }

  static updateBugReportStatus(reportId: string, status: "pending" | "in_progress" | "resolved"): boolean {
    if (typeof window === "undefined") return false

    const reports = this.getAllBugReports()
    const reportIndex = reports.findIndex((report) => report.id === reportId)

    if (reportIndex === -1) return false

    reports[reportIndex].status = status
    reports[reportIndex].updatedAt = new Date()

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reports))
    window.dispatchEvent(new Event("bug-report-updated"))

    return true
  }

  static getBugReportStats(): {
    total: number
    pending: number
    inProgress: number
    resolved: number
  } {
    const reports = this.getAllBugReports()
    return {
      total: reports.length,
      pending: reports.filter((r) => r.status === "pending").length,
      inProgress: reports.filter((r) => r.status === "in_progress").length,
      resolved: reports.filter((r) => r.status === "resolved").length,
    }
  }
}
