import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { PlatformSyncService } from "@/lib/services/platform-sync"

export async function POST(request: Request) {
  try {
    console.log("Platform link POST request received")
    
    const user = await getCurrentUser()
    console.log("Current user:", user ? { id: user._id, role: user.role } : "null")
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    if (user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can link platforms" },
        { status: 403 }
      )
    }

    const body = await request.json()
    console.log("Request body:", body)
    
    const { platform, username, platformUrl } = body

    if (!platform || !username) {
      return NextResponse.json(
        { error: "Platform and username are required" },
        { status: 400 }
      )
    }

    // Allow any platform - remove the hardcoded validation
    // Custom platforms will be handled with generic stats fetching
    const predefinedPlatforms = ['leetcode', 'codeforces', 'github', 'codechef', 'hackerrank', 'hackerearth', 'geeksforgeeks', 'atcoder', 'spoj', 'kattis']
    const isCustomPlatform = !predefinedPlatforms.includes(platform)
    
    console.log("Platform type:", isCustomPlatform ? "custom" : "predefined")
    console.log("Platform:", platform, "Is predefined:", predefinedPlatforms.includes(platform))

    console.log("Attempting to link platform:", platform, "for user:", user._id)
    const success = await PlatformSyncService.linkPlatform(user._id as string, platform, username, platformUrl)
    console.log("Link platform result:", success)

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Successfully linked ${platform} account`,
        platform,
        username
      })
    } else {
      return NextResponse.json(
        { error: "Failed to link platform" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Link platform error:", error)
    return NextResponse.json(
      { error: `Failed to link platform: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    console.log("Platform unlink DELETE request received")
    
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    if (user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can unlink platforms" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { platform } = body

    if (!platform) {
      return NextResponse.json(
        { error: "Platform is required" },
        { status: 400 }
      )
    }

    const success = await PlatformSyncService.unlinkPlatform(user._id as string, platform)

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Successfully unlinked ${platform} account`
      })
    } else {
      return NextResponse.json(
        { error: "Failed to unlink platform" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Unlink platform error:", error)
    return NextResponse.json(
      { error: `Failed to unlink platform: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}