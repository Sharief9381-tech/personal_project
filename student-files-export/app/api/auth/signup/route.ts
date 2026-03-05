import { NextResponse } from "next/server"
import { isDatabaseAvailable } from "@/lib/database"
import { Analytics, getVisitorInfo } from "@/lib/analytics"
import type { UserRole } from "@/lib/types"

export async function POST(request: Request) {
  console.log("=== SIGNUP API CALLED ===")
  
  try {
    console.log("1. Checking database availability...")
    const dbAvailable = isDatabaseAvailable()
    
    if (!dbAvailable) {
      console.log("2. Database not available, redirecting to fallback...")
      // Forward the request to the fallback API
      const fallbackResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/signup-fallback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(await request.json()),
      })
      
      const fallbackData = await fallbackResponse.json()
      return NextResponse.json(fallbackData, { status: fallbackResponse.status })
    }

    console.log("2. Database available, using MongoDB...")
    
    // Import database functions only when database is available
    const { createStudent, createCollege, createRecruiter, createSession, findUserByEmail } = await import("@/lib/auth")
    const { cookies } = await import("next/headers")
    
    console.log("3. Parsing request body...")
    const body = await request.json()
    const { email, password, name, role, ...additionalData } = body

    console.log("4. Signup attempt:", { email, name, role, additionalData })

    if (!email || !password || !name || !role) {
      console.log("5. Missing required fields")
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const validRoles: UserRole[] = ["student", "college", "recruiter"]
    if (!validRoles.includes(role)) {
      console.log("6. Invalid role:", role)
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      )
    }

    console.log("7. Checking if user exists...")
    // Check if user already exists
    try {
      const existingUser = await findUserByEmail(email)
      if (existingUser) {
        console.log("8. User already exists")
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        )
      }
      console.log("8. User doesn't exist, proceeding...")
    } catch (dbError) {
      console.error("8. Database error checking user:", dbError)
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      )
    }

    // Build user data based on role
    let userData: Record<string, unknown> = {
      email,
      password,
      name,
    }

    let user: any

    console.log("9. Creating user based on role:", role)

    try {
      if (role === "student") {
        userData = {
          ...userData,
          role: "student",
          collegeCode: additionalData.collegeCode || "",
          rollNumber: additionalData.rollNumber || "",
          graduationYear: parseInt(additionalData.graduationYear) || new Date().getFullYear() + 4,
          branch: additionalData.branch || "",
          linkedPlatforms: {},
          stats: {
            totalProblems: 0,
            easyProblems: 0,
            mediumProblems: 0,
            hardProblems: 0,
            githubContributions: 0,
            contestsParticipated: 0,
            rating: 0,
          },
          skills: [],
          isOpenToWork: true,
        }
        console.log("9a. Creating student with data:", userData)
        user = await createStudent(userData as any)
      } else if (role === "college") {
        userData = {
          ...userData,
          role: "college",
          collegeName: additionalData.collegeName || name,
          collegeCode: additionalData.collegeCode || "",
          location: additionalData.location || "",
          website: additionalData.website || "",
          placementOfficerName: additionalData.placementOfficerName || "",
          placementOfficerEmail: additionalData.placementOfficerEmail || "",
          totalStudents: 0,
          departments: additionalData.departments || [],
        }
        console.log("9b. Creating college with data:", userData)
        user = await createCollege(userData as any)
      } else if (role === "recruiter") {
        userData = {
          ...userData,
          role: "recruiter",
          companyName: additionalData.companyName || "",
          companyWebsite: additionalData.companyWebsite || "",
          companySize: additionalData.companySize || "",
          industry: additionalData.industry || "",
          designation: additionalData.designation || "",
          hiringFor: additionalData.hiringFor || [],
          preferredSkills: additionalData.preferredSkills || [],
        }
        console.log("9c. Creating recruiter with data:", userData)
        user = await createRecruiter(userData as any)
      }
      
      console.log("10. User created successfully:", { id: user._id, email: user.email, role: user.role })
    } catch (createError) {
      console.error("10. Error creating user:", createError)
      return NextResponse.json(
        { error: `Failed to create user: ${createError instanceof Error ? createError.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

    console.log("11. Creating session...")
    try {
      const token = await createSession(user._id as string, role)
      console.log("12. Session created, setting cookie...")

      const cookieStore = await cookies()
      cookieStore.set("session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      })

      console.log("13. Cookie set, preparing response...")
    } catch (sessionError) {
      console.error("12. Error creating session:", sessionError)
      return NextResponse.json(
        { error: `Failed to create session: ${sessionError instanceof Error ? sessionError.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    const redirectTo = `/${role}/dashboard`
    console.log("14. Redirecting to:", redirectTo)

    // Track signup event
    const visitorInfo = getVisitorInfo(request)
    await Analytics.track({
      type: 'user_signup',
      userId: user._id?.toString(),
      userRole: role,
      metadata: { 
        email: user.email,
        name: user.name,
        collegeCode: role === 'student' ? additionalData.collegeCode : undefined,
        companyName: role === 'recruiter' ? additionalData.companyName : undefined
      }
    }, visitorInfo)

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      redirectTo,
    })
  } catch (error) {
    console.error("=== SIGNUP ERROR ===", error)
    const message = error instanceof Error ? error.message : "Failed to create account"
    return NextResponse.json({ 
      error: `Signup failed: ${message}`,
      details: error instanceof Error ? error.stack : 'Unknown error'
    }, { status: 500 })
  }
}
