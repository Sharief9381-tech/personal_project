import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { AnalyticsService } from "@/lib/services/analytics"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== "student") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const analytics = await AnalyticsService.getPersonalAnalytics(user._id as string)

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Get analytics error:", error)
    return NextResponse.json(
      { error: "Failed to get analytics" },
      { status: 500 }
    )
  }
}