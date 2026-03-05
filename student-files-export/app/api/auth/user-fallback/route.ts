import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-fallback"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    return NextResponse.json({ 
      user,
      message: "User data retrieved (using fallback storage)"
    })
  } catch (error) {
    console.error("Get fallback user error:", error)
    return NextResponse.json(
      { error: "Failed to get user" },
      { status: 500 }
    )
  }
}