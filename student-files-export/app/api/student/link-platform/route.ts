import { NextResponse } from "next/server"
import { getCurrentUser, updateUser } from "@/lib/auth"
import { isDatabaseAvailable } from "@/lib/database"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== "student") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { platform, username, isCustom } = await request.json()

    if (!platform || !username) {
      return NextResponse.json(
        { error: "Platform and username are required" },
        { status: 400 }
      )
    }

    // Validate platform for predefined platforms only
    if (!isCustom) {
      const validPlatforms = ["leetcode", "github", "codechef", "codeforces", "hackerrank", "hackerearth"]
      if (!validPlatforms.includes(platform.toLowerCase())) {
        // Allow dynamic platforms - they will be validated by the dynamic platform service
        console.log(`Allowing dynamic platform: ${platform}`)
      }
    }

    // Handle both database and fallback systems
    if (isDatabaseAvailable()) {
      // Use database system
      const linkedPlatforms = (user.linkedPlatforms as Record<string, string>) || {}
      linkedPlatforms[platform.toLowerCase()] = username
      
      await updateUser(user._id as string, { linkedPlatforms })
    } else {
      // Use fallback system
      const { updateUser: updateUserFallback } = await import("@/lib/auth-fallback")
      const linkedPlatforms = (user.linkedPlatforms as Record<string, string>) || {}
      linkedPlatforms[platform.toLowerCase()] = username
      
      await updateUserFallback(user._id as string, { linkedPlatforms })
    }

    return NextResponse.json({ 
      success: true,
      message: `Successfully linked ${platform} account`,
      isCustom: isCustom || false
    })
  } catch (error) {
    console.error("Link platform error:", error)
    return NextResponse.json(
      { error: "Failed to link platform" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== "student") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { platform } = await request.json()

    if (!platform) {
      return NextResponse.json(
        { error: "Platform is required" },
        { status: 400 }
      )
    }

    // Handle both database and fallback systems
    if (isDatabaseAvailable()) {
      // Use database system
      const linkedPlatforms = (user.linkedPlatforms as Record<string, string>) || {}
      delete linkedPlatforms[platform.toLowerCase()]
      
      await updateUser(user._id as string, { linkedPlatforms })
    } else {
      // Use fallback system
      const { updateUser: updateUserFallback } = await import("@/lib/auth-fallback")
      const linkedPlatforms = (user.linkedPlatforms as Record<string, string>) || {}
      delete linkedPlatforms[platform.toLowerCase()]
      
      await updateUserFallback(user._id as string, { linkedPlatforms })
    }

    return NextResponse.json({ 
      success: true,
      message: `Successfully unlinked ${platform} account`
    })
  } catch (error) {
    console.error("Unlink platform error:", error)
    return NextResponse.json(
      { error: "Failed to unlink platform" },
      { status: 500 }
    )
  }
}
