import { NextResponse } from "next/server"
import {
  fetchLeetCodeStats,
  fetchGitHubStats,
  fetchCodeChefStats,
  fetchCodeforcesStats,
  fetchHackerRankStats,
  fetchHackerEarthStats,
} from "@/lib/platforms"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const platform = searchParams.get("platform")
  const username = searchParams.get("username")

  if (!platform || !username) {
    return NextResponse.json(
      { error: "Platform and username are required" },
      { status: 400 }
    )
  }

  try {
    let stats = null

    switch (platform.toLowerCase()) {
      case "leetcode":
        stats = await fetchLeetCodeStats(username)
        break
      case "github":
        stats = await fetchGitHubStats(username)
        break
      case "codechef":
        stats = await fetchCodeChefStats(username)
        break
      case "codeforces":
        stats = await fetchCodeforcesStats(username)
        break
      case "hackerrank":
        stats = await fetchHackerRankStats(username)
        break
      case "hackerearth":
        stats = await fetchHackerEarthStats(username)
        break
      default:
        return NextResponse.json(
          { error: "Unsupported platform" },
          { status: 400 }
        )
    }

    if (!stats) {
      // For CodeChef and HackerEarth, allow connection even if API fails due to known limitations
      if (platform.toLowerCase() === "codechef") {
        return NextResponse.json({
          stats: {
            username: username,
            name: username,
            currentRating: 0,
            highestRating: 0,
            stars: "N/A",
            countryRank: 0,
            globalRank: 0,
            problemsSolved: 0,
            contests: [],
            _apiLimited: true,
            _message: "CodeChef API is currently limited. You can add manual stats after linking."
          }
        })
      }
      
      if (platform.toLowerCase() === "hackerearth") {
        return NextResponse.json({
          stats: {
            username: username,
            name: username,
            rating: 0,
            maxRating: 0,
            globalRank: 0,
            countryRank: 0,
            problemsSolved: 0,
            contests: [],
            badges: [],
            skills: [],
            _apiLimited: true,
            _message: "HackerEarth API is currently limited. You can add manual stats after linking."
          }
        })
      }

      if (platform.toLowerCase() === "hackerrank") {
        return NextResponse.json({
          stats: {
            username: username,
            name: username,
            country: '',
            school: '',
            company: '',
            avatar: '',
            level: 0,
            badges: [],
            certifications: [],
            skills: [],
            contests: [],
            totalScore: 0,
            globalRank: 0,
            countryRank: 0,
            _apiLimited: true,
            _message: "HackerRank API is currently limited. You can add manual stats after linking."
          }
        })
      }
      
      return NextResponse.json(
        { error: "User not found or API error" },
        { status: 404 }
      )
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Platform API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch platform stats" },
      { status: 500 }
    )
  }
}
