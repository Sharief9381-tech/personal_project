// lib/types.ts

import { ObjectId } from 'mongodb'

export type UserRole = "student" | "college" | "recruiter" | "admin"

export interface BaseProfile {
  _id?: string | ObjectId
  email: string
  name: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
  password?: string
}

export interface PlatformConnection {
  username: string
  linkedAt: Date
  lastSync?: Date
  isActive: boolean
  stats?: any
}

export interface CustomPlatform {
  id: string
  name: string
  url: string
  description?: string
  category?: string
  addedAt: Date
}

export interface StudentStats {
  totalProblems: number
  easyProblems: number
  mediumProblems: number
  hardProblems: number
  githubContributions: number
  contestsParticipated: number
  rating: number
}

export interface StudentProfile extends BaseProfile {
  role: "student"
  collegeCode: string
  rollNumber: string
  graduationYear: number
  branch: string
  skills: string[]
  linkedPlatforms?: {
    leetcode?: PlatformConnection
    codeforces?: PlatformConnection
    github?: PlatformConnection
    codechef?: PlatformConnection
    hackerrank?: PlatformConnection
    hackerearth?: PlatformConnection
    [key: string]: PlatformConnection | undefined // Allow custom platforms
  }
  stats?: StudentStats
  isOpenToWork: boolean
  linkedinUrl?: string
}

export interface CollegeProfile extends BaseProfile {
  role: "college"
  collegeName: string
  collegeCode: string
  location?: string
  website?: string
  placementOfficerName?: string
  placementOfficerEmail?: string
  totalStudents?: number
  departments?: string[]
}

export interface RecruiterProfile extends BaseProfile {
  role: "recruiter"
  companyName: string
  companyWebsite?: string
  companySize?: string
  industry?: string
  designation: string
  hiringFor: string[]
  preferredSkills: string[]
}

export interface AdminProfile extends BaseProfile {
  role: "admin"
  permissions?: string[]
  isSuperAdmin?: boolean
}
