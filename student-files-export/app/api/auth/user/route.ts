import { NextResponse } from "next/server"
import { isDatabaseAvailable } from "@/lib/database"

export async function GET() {
  try {
    console.log("=== GET USER API CALLED ===")
    
    console.log("1. Checking database availability...")
    const dbAvailable = isDatabaseAvailable()
    
    if (!dbAvailable) {
      console.log("2. Database not available, using fallback...")
      // Use fallback auth system
      const { getCurrentUser } = await import("@/lib/auth-fallback")
      const user = await getCurrentUser()

      if (!user) {
        return NextResponse.json(
          { error: "Not authenticated" },
          { status: 401 }
        )
      }

      return NextResponse.json({ user })
    }

    console.log("2. Database available, using MongoDB...")
    // Use database auth system
    const { getCurrentUser } = await import("@/lib/auth")
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("=== GET USER ERROR ===", error)
    return NextResponse.json(
      { error: "Failed to get user" },
      { status: 500 }
    )
  }
}
