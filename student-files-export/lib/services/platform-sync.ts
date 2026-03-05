import { UserModel } from '@/lib/models/user'
import { fetchLeetCodeStats } from '@/lib/platforms/leetcode'
import { fetchGitHubStats } from '@/lib/platforms/github'
import { fetchCodeChefStats } from '@/lib/platforms/codechef'
import { fetchCodeforcesStats } from '@/lib/platforms/codeforces'
import { fetchHackerRankStats } from '@/lib/platforms/hackerrank'
import { fetchHackerEarthStats } from '@/lib/platforms/hackerearth'
import { fetchGeeksforGeeksStats } from '@/lib/platforms/geeksforgeeks'
import { fetchAtCoderStats } from '@/lib/platforms/atcoder'
import { fetchSPOJStats } from '@/lib/platforms/spoj'
import { fetchKattisStats } from '@/lib/platforms/kattis'
import { fetchTopCoderStats } from '@/lib/platforms/topcoder'
import { fetchInterviewBitStats } from '@/lib/platforms/interviewbit'
import { fetchCSESStats } from '@/lib/platforms/cses'
import { fetchCodeStudioStats } from '@/lib/platforms/codestudio'
import { fetchExercismStats } from '@/lib/platforms/exercism'
import { fetchKaggleStats } from '@/lib/platforms/kaggle'
import { fetchUVaStats } from '@/lib/platforms/uva'
import { fetchGenericPlatformStats } from '@/lib/platforms/generic'
import type { StudentProfile } from '@/lib/types'

export interface PlatformSyncResult {
  platform: string
  success: boolean
  data?: any
  error?: string
}

export class PlatformSyncService {
  static async syncUserPlatforms(userId: string): Promise<PlatformSyncResult[]> {
    const user = await UserModel.findById(userId)
    if (!user || user.role !== 'student') {
      throw new Error('User not found or not a student')
    }

    const student = user as any // Use any to avoid type issues
    const results: PlatformSyncResult[] = []

    // Initialize linkedPlatforms if it doesn't exist
    if (!student.linkedPlatforms) {
      await UserModel.update(userId, { linkedPlatforms: {} })
      student.linkedPlatforms = {}
    }

    // Initialize stats if it doesn't exist
    if (!student.stats) {
      await UserModel.update(userId, { 
        stats: {
          totalProblems: 0,
          easyProblems: 0,
          mediumProblems: 0,
          hardProblems: 0,
          githubContributions: 0,
          contestsParticipated: 0,
          rating: 0
        }
      })
    }

    // Define predefined platforms with their fetch functions
    const predefinedPlatforms = {
      leetcode: fetchLeetCodeStats,
      codeforces: fetchCodeforcesStats,
      github: fetchGitHubStats,
      codechef: fetchCodeChefStats,
      hackerrank: fetchHackerRankStats,
      hackerearth: fetchHackerEarthStats,
      geeksforgeeks: fetchGeeksforGeeksStats,
      atcoder: fetchAtCoderStats,
      spoj: fetchSPOJStats,
      kattis: fetchKattisStats,
      topcoder: fetchTopCoderStats,
      interviewbit: fetchInterviewBitStats,
      cses: fetchCSESStats,
      codestudio: fetchCodeStudioStats,
      exercism: fetchExercismStats,
      kaggle: fetchKaggleStats,
      uva: fetchUVaStats
    }

    // Sync all linked platforms (both predefined and custom)
    for (const [platformId, platformData] of Object.entries(student.linkedPlatforms || {})) {
      if (!platformData?.username) continue

      try {
        let stats = null
        
        console.log(`\n=== SYNCING PLATFORM: ${platformId} ===`)
        console.log('Platform data:', platformData)
        console.log('Username:', platformData.username)
        
        // Check if it's a predefined platform (including GeeksforGeeks)
        // Handle special case where GeeksforGeeks might have been added as custom platform
        const platformKey = platformId.toLowerCase()
        const isGeeksforGeeks = platformKey === 'geeksforgeeks' || platformKey.includes('geek')
        
        if (predefinedPlatforms[platformKey as keyof typeof predefinedPlatforms] || isGeeksforGeeks) {
          console.log(`Using predefined fetcher for: ${platformId}`)
          let fetchFunction
          
          if (isGeeksforGeeks) {
            // Force GeeksforGeeks to use specific fetcher
            fetchFunction = predefinedPlatforms['geeksforgeeks']
            console.log('Forcing GeeksforGeeks to use specific fetcher')
          } else {
            fetchFunction = predefinedPlatforms[platformKey as keyof typeof predefinedPlatforms]
          }
          
          stats = await fetchFunction(platformData.username)
          console.log(`Predefined platform ${platformId} stats:`, stats)
        } else {
          // Handle custom platform with generic fetcher
          console.log(`Syncing custom platform: ${platformId}`)
          stats = await fetchGenericPlatformStats(platformId, platformData.username, platformData.platformUrl)
          console.log(`Custom platform ${platformId} stats:`, stats)
        }

        if (stats) {
          // Successfully fetched real stats - update in database
          await UserModel.update(userId, {
            [`linkedPlatforms.${platformId}.lastSync`]: new Date(),
            [`linkedPlatforms.${platformId}.stats`]: stats
          })
          results.push({ platform: platformId, success: true, data: stats })
          console.log(`✅ Successfully synced ${platformId} with real stats`)
        } else {
          // Platform fetcher returned null (profile not found or error)
          // Clear any cached fake data and mark as failed
          console.log(`❌ Failed to fetch real stats for ${platformId} - clearing cached data`)
          
          await UserModel.update(userId, {
            [`linkedPlatforms.${platformId}.lastSync`]: new Date(),
            [`linkedPlatforms.${platformId}.stats`]: null // Clear cached fake data
          })
          
          results.push({ 
            platform: platformId, 
            success: false, 
            error: 'Profile not found or unable to fetch real stats' 
          })
        }
      } catch (error: any) {
        console.error(`Error syncing ${platformId}:`, error)
        results.push({ platform: platformId, success: false, error: error.message })
      }
    }

    return results
  }

  static async linkPlatform(userId: string, platform: string, username: string, platformUrl?: string): Promise<boolean> {
    try {
      const updateData: Record<string, any> = {}
      updateData[`linkedPlatforms.${platform}`] = {
        username,
        linkedAt: new Date(),
        isActive: true,
        platformUrl: platformUrl // Store platform URL for custom platforms
      }

      await UserModel.update(userId, updateData)
      
      // Immediately sync the new platform
      await this.syncUserPlatforms(userId)
      
      return true
    } catch (error) {
      console.error('Error linking platform:', error)
      return false
    }
  }

  static async unlinkPlatform(userId: string, platform: string): Promise<boolean> {
    try {
      const updateData: Record<string, any> = {}
      updateData[`linkedPlatforms.${platform}`] = null

      await UserModel.update(userId, updateData)
      return true
    } catch (error) {
      console.error('Error unlinking platform:', error)
      return false
    }
  }

  static async scheduleSync(userId: string): Promise<void> {
    // This would integrate with a job queue system like Bull or Agenda
    // For now, we'll just sync immediately
    await this.syncUserPlatforms(userId)
  }
}