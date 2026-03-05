// lib/auth.ts

"use server"

import { cookies } from "next/headers"
import { UserModel, type UserDocument } from "./models/user"
import { SessionModel } from "./models/session"
import type {
  UserRole,
  BaseProfile,
  StudentProfile,
  CollegeProfile,
  RecruiterProfile
} from "./types"

// ------------------------------------------------------------------
// Utils (password hashing + token generation)
// ------------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + "codetrack_salt_2024")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return (await hashPassword(password)) === hash
}

export async function generateToken(): Promise<string> {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("")
}

export async function generateId(): Promise<string> {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ------------------------------------------------------------------
// Session management
// ------------------------------------------------------------------

export async function createSession(userId: string, role: UserRole): Promise<string> {
  const token = await generateToken()
  await SessionModel.create(token, userId, role)
  return token
}

export async function getSession(token: string) {
  return await SessionModel.findByToken(token)
}

export async function deleteSession(token: string) {
  await SessionModel.delete(token)
}

// ------------------------------------------------------------------
// Public account creation functions
// ------------------------------------------------------------------

export async function createStudent(
  data: Omit<StudentProfile, "_id" | "createdAt" | "updatedAt"> & { password: string }
) {
  const hashedPassword = await hashPassword(data.password)
  const userData = {
    ...data,
    password: hashedPassword,
    role: "student" as UserRole,
  }
  return await UserModel.create(userData)
}

export async function createCollege(
  data: Omit<CollegeProfile, "_id" | "createdAt" | "updatedAt"> & { password: string }
) {
  const hashedPassword = await hashPassword(data.password)
  const userData = {
    ...data,
    password: hashedPassword,
    role: "college" as UserRole,
  }
  return await UserModel.create(userData)
}

export async function createRecruiter(
  data: Omit<RecruiterProfile, "_id" | "createdAt" | "updatedAt"> & { password: string }
) {
  const hashedPassword = await hashPassword(data.password)
  const userData = {
    ...data,
    password: hashedPassword,
    role: "recruiter" as UserRole,
  }
  return await UserModel.create(userData)
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

export async function findUserByEmail(email: string) {
  return await UserModel.findByEmail(email)
}

export async function updateUser(
  userId: string,
  updates: Record<string, any>
) {
  await UserModel.update(userId, updates)
}

export async function getUsers() {
  return await UserModel.findAll()
}

// ------------------------------------------------------------------
// Current user (based on session cookie)
// ------------------------------------------------------------------

export async function getCurrentUser(): Promise<
  | Omit<StudentProfile, "password">
  | Omit<CollegeProfile, "password">
  | Omit<RecruiterProfile, "password">
  | null
> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value
    console.log("getCurrentUser - Token from cookies:", token ? "exists" : "missing")
    
    if (!token) return null

    const session = await getSession(token)
    console.log("getCurrentUser - Session:", session ? "found" : "not found")
    
    if (!session) return null

    const user = await UserModel.findById(session.userId)
    console.log("getCurrentUser - User:", user ? { id: user._id, role: user.role } : "not found")
    
    if (!user) return null

    const { password, ...rest } = user

    return rest as any
  } catch (error) {
    console.error("getCurrentUser error:", error)
    return null
  }
}
