export interface CodeforcesStats {
  username: string
  rating: number
  maxRating: number
  rank: string
  maxRank: string
  contribution: number
  friendOfCount: number
  avatar: string
  problemsSolved: number
  contests: {
    contestId: number
    contestName: string
    rank: number
    oldRating: number
    newRating: number
    ratingChange: number
  }[]
  submissions: {
    problem: {
      name: string
      rating: number
      tags: string[]
    }
    verdict: string
    language: string
    creationTimeSeconds: number
  }[]
}

export async function fetchCodeforcesStats(username: string): Promise<CodeforcesStats | null> {
  try {
    // Clean the username - handle both username and full URL
    let cleanUsername = username.trim()
    
    // Extract username from Codeforces URL if provided
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?codeforces\.com\/profile\/([^\/\?\s]+)/i
    const match = cleanUsername.match(urlPattern)
    if (match) {
      cleanUsername = match[1]
    }
    
    console.log(`Fetching real-time Codeforces stats for: ${cleanUsername}`)
    
    // Method 1: Try cp-rating-api first (more reliable for some users)
    try {
      console.log(`Trying cp-rating-api for Codeforces: ${cleanUsername}`)
      const cpApiResponse = await fetch(`https://cp-rating-api.vercel.app/codeforces/${cleanUsername}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; StatsBot/1.0)',
        },
        signal: AbortSignal.timeout(8000),
      })

      if (cpApiResponse.ok) {
        const cpData = await cpApiResponse.json()
        console.log(`cp-rating-api Codeforces response:`, cpData)
        
        if (cpData && !cpData.error && cpData.success !== false) {
          return {
            username: cleanUsername,
            rating: cpData.rating || cpData.current_rating || 0,
            maxRating: cpData.max_rating || cpData.highest_rating || cpData.rating || 0,
            rank: cpData.rank || 'unrated',
            maxRank: cpData.max_rank || cpData.rank || 'unrated',
            contribution: cpData.contribution || 0,
            friendOfCount: cpData.friend_of_count || 0,
            avatar: cpData.avatar || 'https://userpic.codeforces.org/no-avatar.jpg',
            problemsSolved: cpData.problems_solved || cpData.solved || 0,
            contests: cpData.contests || [],
            submissions: cpData.submissions || []
          }
        }
      }
    } catch (cpApiError) {
      console.log('cp-rating-api for Codeforces failed:', cpApiError)
    }
    
    // Method 2: Use official Codeforces API
    const userResponse = await fetch(
      `https://codeforces.com/api/user.info?handles=${cleanUsername}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; CodeTrack/1.0)",
        },
      }
    )

    if (!userResponse.ok) {
      console.error("Codeforces user API error:", userResponse.status)
      return null
    }

    const userData = await userResponse.json()
    
    if (userData.status !== "OK" || !userData.result?.[0]) {
      console.log(`Codeforces user "${cleanUsername}" not found`)
      return null // Return null instead of fake data when profile doesn't exist
    }

    const user = userData.result[0]

    // Fetch rating history
    const ratingResponse = await fetch(
      `https://codeforces.com/api/user.rating?handle=${cleanUsername}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; CodeTrack/1.0)",
        },
      }
    )
    
    let contests: CodeforcesStats["contests"] = []
    if (ratingResponse.ok) {
      const ratingData = await ratingResponse.json()
      if (ratingData.status === "OK") {
        contests = ratingData.result
          .slice(-10)
          .reverse()
          .map((contest: {
            contestId: number
            contestName: string
            rank: number
            oldRating: number
            newRating: number
          }) => ({
            contestId: contest.contestId,
            contestName: contest.contestName,
            rank: contest.rank,
            oldRating: contest.oldRating,
            newRating: contest.newRating,
            ratingChange: contest.newRating - contest.oldRating,
          }))
      }
    }

    // Fetch submissions
    const submissionsResponse = await fetch(
      `https://codeforces.com/api/user.status?handle=${cleanUsername}&from=1&count=100`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; CodeTrack/1.0)",
        },
      }
    )

    let submissions: CodeforcesStats["submissions"] = []
    let problemsSolved = 0
    const solvedSet = new Set<string>()

    if (submissionsResponse.ok) {
      const submissionsData = await submissionsResponse.json()
      if (submissionsData.status === "OK") {
        for (const sub of submissionsData.result) {
          if (sub.verdict === "OK") {
            const problemKey = `${sub.problem.contestId}-${sub.problem.index}`
            solvedSet.add(problemKey)
          }
        }
        problemsSolved = solvedSet.size

        submissions = submissionsData.result
          .slice(0, 10)
          .map((sub: {
            problem: { name: string; rating: number; tags: string[] }
            verdict: string
            programmingLanguage: string
            creationTimeSeconds: number
          }) => ({
            problem: {
              name: sub.problem.name,
              rating: sub.problem.rating || 0,
              tags: sub.problem.tags || [],
            },
            verdict: sub.verdict,
            language: sub.programmingLanguage,
            creationTimeSeconds: sub.creationTimeSeconds,
          }))
      }
    }

    return {
      username: cleanUsername,
      rating: user.rating || 0,
      maxRating: user.maxRating || 0,
      rank: user.rank || "unrated",
      maxRank: user.maxRank || "unrated",
      contribution: user.contribution || 0,
      friendOfCount: user.friendOfCount || 0,
      avatar: user.avatar || user.titlePhoto || "",
      problemsSolved,
      contests,
      submissions,
    }
  } catch (error) {
    console.error("Error fetching Codeforces stats:", error)
    return null // Return null instead of fake data when error occurs
  }
}

function getRankFromRating(rating: number): string {
  if (rating >= 3000) return "legendary grandmaster"
  if (rating >= 2600) return "international grandmaster"
  if (rating >= 2400) return "grandmaster"
  if (rating >= 2300) return "international master"
  if (rating >= 2100) return "master"
  if (rating >= 1900) return "candidate master"
  if (rating >= 1600) return "expert"
  if (rating >= 1400) return "specialist"
  if (rating >= 1200) return "pupil"
  return "newbie"
}
