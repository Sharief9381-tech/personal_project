// Fallback authentication system that works without MongoDB
// This allows testing the platform while database is being set up

"use server"

import { cookies } from "next/headers"
import type {
  UserRole,
  StudentProfile,
  CollegeProfile,
  RecruiterProfile
} from "./types"

// In-memory storage for fallback (will reset on server restart)
const users = new Map<string, any>()
const sessions = new Map<string, { userId: string; role: UserRole; expiresAt: Date }>()

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
  sessions.set(token, {
    userId,
    role,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  })
  return token
}

export async function getSession(token: string) {
  const s = sessions.get(token)
  if (!s) return null
  if (s.expiresAt < new Date()) {
    sessions.delete(token)
    return null
  }
  return s
}

export async function deleteSession(token: string) {
  sessions.delete(token)
}

// ------------------------------------------------------------------
// User creation functions
// ------------------------------------------------------------------

export async function createStudent(
  data: Omit<StudentProfile, "_id" | "createdAt" | "updatedAt"> & { password: string }
) {
  const hashedPassword = await hashPassword(data.password)
  const id = await generateId()
  
  const user = {
    ...data,
    _id: id,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  
  users.set(id, user)
  return user
}

export async function createCollege(
  data: Omit<CollegeProfile, "_id" | "createdAt" | "updatedAt"> & { password: string }
) {
  const hashedPassword = await hashPassword(data.password)
  const id = await generateId()
  
  const user = {
    ...data,
    _id: id,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  
  users.set(id, user)
  return user
}

export async function createRecruiter(
  data: Omit<RecruiterProfile, "_id" | "createdAt" | "updatedAt"> & { password: string }
) {
  const hashedPassword = await hashPassword(data.password)
  const id = await generateId()
  
  const user = {
    ...data,
    _id: id,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  
  users.set(id, user)
  return user
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

export async function findUserByEmail(email: string) {
  for (const u of users.values()) {
    if (u.email === email) return u
  }
  return null
}

export async function updateUser(userId: string, updates: Record<string, any>) {
  const u = users.get(userId)
  if (u) {
    users.set(userId, { ...u, ...updates, updatedAt: new Date() })
  }
}

export async function getUsers() {
  return Array.from(users.values())
}

// ------------------------------------------------------------------
// Current user (based on session cookie)
// ------------------------------------------------------------------

export async function getCurrentUser(): Promise<any> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  if (!token) return null

  const session = await getSession(token)
  if (!session) return null

  const user = users.get(session.userId)
  if (!user) return null

  const { password, ...rest } = user
  return rest
}

// ------------------------------------------------------------------
// Database cleanup function
// ------------------------------------------------------------------

export async function clearAllData() {
  const usersCleared = users.size
  const sessionsCleared = sessions.size
  
  users.clear()
  sessions.clear()
  
  return {
    usersCleared,
    sessionsCleared,
    message: `Cleared ${usersCleared} users and ${sessionsCleared} sessions from fallback storage`
  }
}