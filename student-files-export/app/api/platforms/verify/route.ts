import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
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

export async function POST(request: Request) {
  try {
    console.log("=== PLATFORM VERIFICATION API CALLED ===")
    
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    if (user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can verify platforms" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { platform, username } = body

    if (!platform || !username) {
      return NextResponse.json(
        { error: "Platform and username are required" },
        { status: 400 }
      )
    }

    console.log(`Verifying ${platform} profile for username: ${username}`)

    // Define platform fetchers
    const platformFetchers: Record<string, Function> = {
      leetcode: fetchLeetCodeStats,
      github: fetchGitHubStats,
      codechef: fetchCodeChefStats,
      codeforces: fetchCodeforcesStats,
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
      uva: fetchUVaStats,
    }

    const fetchFunction = platformFetchers[platform.toLowerCase()]
    
    if (!fetchFunction) {
      return NextResponse.json(
        { error: `Platform "${platform}" is not supported` },
        { status: 400 }
      )
    }

    try {
      const stats = await fetchFunction(username)
      
      if (stats) {
        console.log(`✅ Profile verification successful for ${platform}/${username}`)
        return NextResponse.json({
          success: true,
          platform,
          username,
          verified: true,
          message: `Profile found for ${username} on ${platform}`,
          stats: {
            // Return basic stats for verification feedback
            username: stats.username,
            hasData: Object.keys(stats).length > 1 // More than just username
          }
        })
      } else {
        console.log(`❌ Profile verification failed for ${platform}/${username}`)
        return NextResponse.json({
          success: false,
          platform,
          username,
          verified: false,
          message: `Profile not found for ${username} on ${platform}`
        })
      }
    } catch (error) {
      console.error(`Error verifying ${platform} profile:`, error)
      return NextResponse.json({
        success: false,
        platform,
        username,
        verified: false,
        message: `Failed to verify profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }

  } catch (error) {
    console.error("=== PLATFORM VERIFICATION ERROR ===", error)
    return NextResponse.json(
      { error: `Failed to verify platform: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}