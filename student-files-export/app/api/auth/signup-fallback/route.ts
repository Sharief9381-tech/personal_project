import { NextResponse } from "next/server"
import { createStudent, createCollege, createRecruiter, createSession, findUserByEmail } from "@/lib/auth-fallback"
import type { UserRole } from "@/lib/types"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  console.log("=== FALLBACK SIGNUP API CALLED ===")
  
  try {
    console.log("1. Parsing request body...")
    const body = await request.json()
    const { email, password, name, role, ...additionalData } = body

    console.log("2. Signup attempt:", { email, name, role })

    if (!email || !password || !name || !role) {
      console.log("3. Missing required fields")
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const validRoles: UserRole[] = ["student", "college", "recruiter"]
    if (!validRoles.includes(role)) {
      console.log("4. Invalid role:", role)
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      )
    }

    console.log("5. Checking if user exists (in-memory)...")
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      console.log("6. User already exists")
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }
    console.log("6. User doesn't exist, proceeding...")

    let user: any

    console.log("7. Creating user based on role:", role)

    if (role === "student") {
      const userData = {
        email,
        password,
        name,
        role: "student" as const,
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
      console.log("7a. Creating student with data")
      user = await createStudent(userData)
    } else if (role === "college") {
      const userData = {
        email,
        password,
        name,
        role: "college" as const,
        collegeName: additionalData.collegeName || name,
        collegeCode: additionalData.collegeCode || "",
        location: additionalData.location || "",
        website: additionalData.website || "",
        placementOfficerName: additionalData.placementOfficerName || "",
        placementOfficerEmail: additionalData.placementOfficerEmail || "",
        totalStudents: 0,
        departments: additionalData.departments || [],
      }
      console.log("7b. Creating college with data")
      user = await createCollege(userData)
    } else if (role === "recruiter") {
      const userData = {
        email,
        password,
        name,
        role: "recruiter" as const,
        companyName: additionalData.companyName || "",
        companyWebsite: additionalData.companyWebsite || "",
        companySize: additionalData.companySize || "",
        industry: additionalData.industry || "",
        designation: additionalData.designation || "",
        hiringFor: additionalData.hiringFor || [],
        preferredSkills: additionalData.preferredSkills || [],
      }
      console.log("7c. Creating recruiter with data")
      user = await createRecruiter(userData)
    }
    
    console.log("8. User created successfully:", { id: user._id, email: user.email, role: user.role })

    console.log("9. Creating session...")
    const token = await createSession(user._id as string, role)
    console.log("10. Session created, setting cookie...")

    const cookieStore = await cookies()
    cookieStore.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    console.log("11. Cookie set, preparing response...")

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    const redirectTo = `/${role}/dashboard`
    console.log("12. Redirecting to:", redirectTo)

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      redirectTo,
      message: "Account created successfully (using fallback storage)"
    })
  } catch (error) {
    console.error("=== FALLBACK SIGNUP ERROR ===", error)
    const message = error instanceof Error ? error.message : "Failed to create account"
    return NextResponse.json({ 
      error: `Signup failed: ${message}`,
      details: error instanceof Error ? error.stack : 'Unknown error'
    }, { status: 500 })
  }
}