import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { PlatformAggregator } from "@/lib/services/platform-aggregator"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== "student") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const linkedPlatforms = (user.linkedPlatforms || {}) as Record<string, any>
    
    // Extract usernames from platform connections
    const platformUsernames: Record<string, string> = {}
    for (const [platform, data] of Object.entries(linkedPlatforms)) {
      if (data) {
        // Handle both string usernames and PlatformConnection objects
        platformUsernames[platform] = typeof data === 'string' ? data : data.username
      }
    }
    
    if (Object.keys(platformUsernames).length === 0) {
      return NextResponse.json(
        { error: "No platforms linked" },
        { status: 400 }
      )
    }

    console.log(`Syncing stats for user ${user._id} with platforms:`, Object.keys(platformUsernames))

    // Aggregate stats from all platforms
    const aggregatedStats = await PlatformAggregator.updateUserAggregatedStats(
      user._id as string, 
      platformUsernames
    )

    return NextResponse.json({ 
      success: true,
      stats: aggregatedStats,
      message: "Stats synchronized successfully"
    })
  } catch (error) {
    console.error("Sync stats error:", error)
    return NextResponse.json(
      { error: "Failed to sync stats" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== "student") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Return current aggregated stats
    const aggregatedStats = (user as any).aggregatedStats || null
    const lastUpdate = (user as any).lastStatsUpdate || null

    return NextResponse.json({ 
      stats: aggregatedStats,
      lastUpdate,
      hasStats: !!aggregatedStats
    })
  } catch (error) {
    console.error("Get stats error:", error)
    return NextResponse.json(
      { error: "Failed to get stats" },
      { status: 500 }
    )
  }
}