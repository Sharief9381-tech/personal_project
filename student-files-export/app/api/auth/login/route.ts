import { NextResponse } from "next/server"
import { isDatabaseAvailable } from "@/lib/database"
import { Analytics, getVisitorInfo } from "@/lib/analytics"
import type { UserRole } from "@/lib/types"

export async function POST(request: Request) {
  try {
    console.log("=== LOGIN API CALLED ===")
    
    const body = await request.json()
    const { email, password } = body

    console.log("1. Login attempt for:", email)

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    console.log("2. Checking database availability...")
    const dbAvailable = isDatabaseAvailable()
    
    if (!dbAvailable) {
      console.log("3. Database not available, redirecting to fallback...")
      // Forward the request to the fallback API
      const fallbackResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/login-fallback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      const fallbackData = await fallbackResponse.json()
      return NextResponse.json(fallbackData, { status: fallbackResponse.status })
    }

    console.log("3. Database available, using MongoDB...")
    
    // Import database functions only when database is available
    const { findUserByEmail, verifyPassword, createSession } = await import("@/lib/auth")
    const { cookies } = await import("next/headers")

    const user = await findUserByEmail(email)
    console.log("4. User found:", user ? "Yes" : "No")
    
    // Auto-create admin user if logging in with admin email and user doesn't exist
    if (!user && email === "sharief9381@gmail.com") {
      console.log("4a. Admin user not found, auto-creating...")
      try {
        const { createCollege } = await import("@/lib/auth")
        const adminUser = await createCollege({
          name: "System Administrator",
          email: "sharief9381@gmail.com",
          password: "12341234",
          role: "college",
          collegeName: "CodeTrack System",
          collegeCode: "ADMIN",
          location: "System",
          website: "https://codetrack.com",
          placementOfficerName: "System Admin",
          placementOfficerEmail: "sharief9381@gmail.com",
          totalStudents: 0,
          departments: ["System Administration"],
        })
        console.log("4b. Admin user created successfully")
        
        // Verify the password for the newly created user
        const isValidPassword = await verifyPassword(password, adminUser.password as string)
        if (!isValidPassword) {
          return NextResponse.json(
            { error: "Invalid email or password" },
            { status: 401 }
          )
        }
        
        // Create session for the new admin user
        const token = await createSession(adminUser._id as string, adminUser.role as UserRole)
        const redirectTo = "/admin"
        
        const cookieStore = await cookies()
        cookieStore.set("session_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60,
          path: "/",
        })
        
        const { password: _, ...userWithoutPassword } = adminUser
        
        // Track login event
        const visitorInfo = getVisitorInfo(request)
        await Analytics.track({
          type: 'user_login',
          userId: adminUser._id?.toString(),
          userRole: adminUser.role,
          metadata: { 
            email: adminUser.email,
            name: adminUser.name
          }
        }, visitorInfo)
        
        return NextResponse.json({
          success: true,
          user: userWithoutPassword,
          redirectTo: redirectTo,
          message: "Admin user created and logged in successfully"
        })
      } catch (createError) {
        console.error("4c. Failed to auto-create admin:", createError)
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        )
      }
    }
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const isValidPassword = await verifyPassword(password, user.password as string)
    console.log("5. Password valid:", isValidPassword)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const token = await createSession(user._id as string, user.role as UserRole)
    
    // Determine redirect URL - admin users go to admin portal
    const redirectTo = user.email === "sharief9381@gmail.com" ? "/admin" : `/${user.role}/dashboard`
    console.log("6. Session created, redirecting to:", redirectTo)

    const cookieStore = await cookies()
    cookieStore.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    // Track login event
    const visitorInfo = getVisitorInfo(request)
    await Analytics.track({
      type: 'user_login',
      userId: user._id?.toString(),
      userRole: user.role,
      metadata: { 
        email: user.email,
        name: user.name
      }
    }, visitorInfo)

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      redirectTo: redirectTo,
    })
  } catch (error) {
    console.error("=== LOGIN ERROR ===", error)
    return NextResponse.json(
      { error: "Failed to login" },
      { status: 500 }
    )
  }
}
