export interface InterviewBitStats {
  username: string
  score: number
  rank: number
  problemsSolved: number
  streakDays: number
  profileUrl: string
}

export async function fetchInterviewBitStats(username: string): Promise<InterviewBitStats | null> {
  try {
    // Clean the username - handle both username and full URL
    let cleanUsername = username.trim()
    
    // Extract username from InterviewBit URL if provided
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?interviewbit\.com\/profile\/([^\/\?\s]+)/i
    const match = cleanUsername.match(urlPattern)
    if (match) {
      cleanUsername = match[1]
    }
    
    console.log(`Fetching real-time InterviewBit stats for: ${cleanUsername}`)
    console.log(`Fetching real-time InterviewBit stats for: ${cleanUsername}`)
    
    const profileUrl = `https://www.interviewbit.com/profile/${cleanUsername}`
    
    // Method 1: Try third-party competitive programming APIs
    const thirdPartyApis = [
      `https://cp-rating-api.vercel.app/interviewbit/${cleanUsername}`,
      `https://competitive-coding-api.herokuapp.com/api/interviewbit/${cleanUsername}`,
      `https://cp-api.vercel.app/interviewbit/${cleanUsername}`,
    ]

    for (const apiUrl of thirdPartyApis) {
      try {
        console.log(`Trying InterviewBit third-party API: ${apiUrl}`)
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; StatsBot/1.0)',
          },
          signal: AbortSignal.timeout(8000),
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`InterviewBit third-party API response:`, data)
          
          if (data && !data.error && data.success !== false) {
            return {
              username: cleanUsername,
              score: data.score || data.points || 0,
              rank: data.rank || 0,
              problemsSolved: data.problems_solved || data.solved || 0,
              streakDays: data.streak_days || data.streak || 0,
              profileUrl
            }
          }
        }
      } catch (apiError) {
        console.log(`InterviewBit third-party API ${apiUrl} failed:`, apiError)
        continue
      }
    }
    
    // Method 2: Try InterviewBit profile scraping
    try {
      const response = await fetch(profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(15000)
      })
      
      if (!response.ok) {
        console.log(`InterviewBit profile not found for ${cleanUsername}`)
        return null
      }
      
      const html = await response.text()
      
      // Check if profile exists
      if (html.includes('User not found') || html.includes('404') || html.includes('Profile not found')) {
        console.log(`InterviewBit profile not found for: ${cleanUsername}`)
        return null
      }
      
      console.log(`InterviewBit profile exists for: ${cleanUsername}`)
      
      // Extract stats from HTML
      let score = 0
      let rank = 0
      let problemsSolved = 0
      let streakDays = 0
      
      // Enhanced regex patterns for InterviewBit
      const scoreMatch = html.match(/score["\s]*:[\s]*(\d+)/gi) ||
                        html.match(/points?["\s]*:[\s]*(\d+)/gi) ||
                        html.match(/(\d+)\s*points?/gi)
      
      const rankMatch = html.match(/rank["\s]*:[\s]*(\d+)/gi) ||
                       html.match(/(\d+)\s*rank/gi)
      
      const problemsMatch = html.match(/problems?[_\s]*solved["\s]*:[\s]*(\d+)/gi) ||
                           html.match(/solved["\s]*:[\s]*(\d+)/gi) ||
                           html.match(/(\d+)\s*problems?\s*solved/gi)
      
      const streakMatch = html.match(/streak["\s]*:[\s]*(\d+)/gi) ||
                         html.match(/(\d+)\s*days?\s*streak/gi)
      
      if (scoreMatch && scoreMatch[0].match(/\d+/)) {
        score = parseInt(scoreMatch[0].match(/\d+/)![0])
      }
      if (rankMatch && rankMatch[0].match(/\d+/)) {
        rank = parseInt(rankMatch[0].match(/\d+/)![0])
      }
      if (problemsMatch && problemsMatch[0].match(/\d+/)) {
        problemsSolved = parseInt(problemsMatch[0].match(/\d+/)![0])
      }
      if (streakMatch && streakMatch[0].match(/\d+/)) {
        streakDays = parseInt(streakMatch[0].match(/\d+/)![0])
      }
      
      console.log(`InterviewBit real-time stats: score=${score}, rank=${rank}, problems=${problemsSolved}, streak=${streakDays}`)
      
      const stats: InterviewBitStats = {
        username: cleanUsername,
        score: score,
        rank: rank,
        problemsSolved: problemsSolved,
        streakDays: streakDays,
        profileUrl
      }
      
      console.log(`InterviewBit stats for ${cleanUsername}:`, stats)
      return stats
      
    } catch (error) {
      console.log('InterviewBit fetch failed:', error)
    }

    // Method 3: Basic profile validation (fallback)
    if (cleanUsername && cleanUsername.length > 0 && /^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
      console.log(`InterviewBit: returning basic profile for ${cleanUsername}`)
      
      return {
        username: cleanUsername,
        score: 0,
        rank: 0,
        problemsSolved: 0,
        streakDays: 0,
        profileUrl
      }
    }
    
    return null
  } catch (error) {
    console.error("Error fetching InterviewBit real-time stats:", error)
    return null
  }
}