// lib/serialize.ts - Utility functions for serializing MongoDB objects for client components

import type { StudentProfile, CollegeProfile, RecruiterProfile } from "./types"

/**
 * Serialize a user object to remove MongoDB-specific properties
 * This is needed when passing user data to client components
 */
export function serializeUser(user: any): StudentProfile | CollegeProfile | RecruiterProfile {
  const baseUser = {
    _id: user._id?.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
  }

  if (user.role === "student") {
    return {
      ...baseUser,
      role: "student",
      collegeName: user.collegeName,
      graduationYear: user.graduationYear,
      branch: user.branch,
      linkedPlatforms: user.linkedPlatforms || {},
      stats: user.stats || {
        totalProblems: 0,
        easyProblems: 0,
        mediumProblems: 0,
        hardProblems: 0,
        githubContributions: 0,
        contestsParticipated: 0,
        rating: 0,
      },
      skills: user.skills || [],
      isOpenToWork: user.isOpenToWork ?? true,
    } as StudentProfile
  }

  if (user.role === "college") {
    return {
      ...baseUser,
      role: "college",
      collegeName: user.collegeName,
      collegeCode: user.collegeCode,
      location: user.location,
      website: user.website,
      placementOfficerName: user.placementOfficerName,
      placementOfficerEmail: user.placementOfficerEmail,
      totalStudents: user.totalStudents || 0,
      departments: user.departments || [],
    } as CollegeProfile
  }

  if (user.role === "recruiter") {
    return {
      ...baseUser,
      role: "recruiter",
      companyName: user.companyName,
      companyWebsite: user.companyWebsite,
      companySize: user.companySize,
      industry: user.industry,
      designation: user.designation,
      hiringFor: user.hiringFor || [],
      preferredSkills: user.preferredSkills || [],
    } as RecruiterProfile
  }

  throw new Error(`Unknown user role: ${user.role}`)
}

/**
 * Serialize any object to remove MongoDB-specific properties
 * Useful for general MongoDB document serialization
 */
export function serializeDocument(doc: any): any {
  if (!doc) return doc
  
  if (Array.isArray(doc)) {
    return doc.map(serializeDocument)
  }
  
  if (typeof doc === 'object' && doc !== null) {
    const serialized: any = {}
    
    for (const [key, value] of Object.entries(doc)) {
      if (key === '_id' && value && typeof value === 'object' && 'toString' in value) {
        serialized[key] = value.toString()
      } else if (value instanceof Date) {
        serialized[key] = value.toISOString()
      } else if (typeof value === 'object' && value !== null) {
        serialized[key] = serializeDocument(value)
      } else {
        serialized[key] = value
      }
    }
    
    return serialized
  }
  
  return doc
}