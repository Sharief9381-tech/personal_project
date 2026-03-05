import { getDatabase } from '@/lib/database'
import { ObjectId } from 'mongodb'
import type { UserRole } from '@/lib/types'

export interface SessionDocument {
  _id?: ObjectId
  token: string
  userId: string
  role: UserRole
  expiresAt: Date
  createdAt: Date
}

export class SessionModel {
  private static collection = 'sessions'

  static async create(token: string, userId: string, role: UserRole): Promise<SessionDocument> {
    const db = await getDatabase()
    const session = {
      _id: new ObjectId(),
      token,
      userId,
      role,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
    } as SessionDocument

    await db.collection(this.collection).insertOne(session)
    return session
  }

  static async findByToken(token: string): Promise<SessionDocument | null> {
    const db = await getDatabase()
    const session = await db.collection(this.collection).findOne({ token }) as SessionDocument | null
    
    if (session && session.expiresAt < new Date()) {
      await this.delete(token)
      return null
    }
    
    return session
  }

  static async delete(token: string): Promise<void> {
    const db = await getDatabase()
    await db.collection(this.collection).deleteOne({ token })
  }

  static async deleteExpired(): Promise<void> {
    const db = await getDatabase()
    await db.collection(this.collection).deleteMany({ 
      expiresAt: { $lt: new Date() } 
    })
  }

  static async deleteByUserId(userId: string): Promise<void> {
    const db = await getDatabase()
    await db.collection(this.collection).deleteMany({ userId })
  }
}