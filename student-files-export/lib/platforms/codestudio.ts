export interface CodeStudioStats {
  username: string
  problemsSolved: number
  score: number
  rank: number
  streakDays: number
  profileUrl: string
}

export async function fetchCodeStudioStats(username: string): Promise<CodeStudioStats | null> {
  try {
    // Clean the username - handle both username and full URL
    let cleanUsername = username.trim()
    
    // Extract username from CodeStudio URL if provided
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?codingninjas\.com\/studio\/profile\/([^\/\?\s]+)/i
    const match = cleanUsername.match(urlPattern)
    if (match) {
      cleanUsername = match[1]
    }
    
    console.log(`Fetching real-time CodeStudio stats for: ${cleanUsername}`)
    console.log(`Fetching real-time CodeStudio stats for: ${cleanUsername}`)
    
    const profileUrl = `https://www.codingninjas.com/studio/profile/${cleanUsername}`
    
    // Method 1: Try third-party competitive programming APIs
    const thirdPartyApis = [
      `https://cp-rating-api.vercel.app/codestudio/${cleanUsername}`,
      `https://competitive-coding-api.herokuapp.com/api/codestudio/${cleanUsername}`,
      `https://cp-api.vercel.app/codestudio/${cleanUsername}`,
      `https://competitive-coding-api.herokuapp.com/api/codingninjas/${cleanUsername}`,
    ]

    for (const apiUrl of thirdPartyApis) {
      try {
        console.log(`Trying CodeStudio third-party API: ${apiUrl}`)
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; StatsBot/1.0)',
          },
          signal: AbortSignal.timeout(8000),
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`CodeStudio third-party API response:`, data)
          
          if (data && !data.error && data.success !== false) {
            return {
              username: cleanUsername,
              problemsSolved: data.problems_solved || data.solved || 0,
              score: data.score || data.points || 0,
              rank: data.rank || 0,
              streakDays: data.streak_days || data.streak || 0,
              profileUrl
            }
          }
        }
      } catch (apiError) {
        console.log(`CodeStudio third-party API ${apiUrl} failed:`, apiError)
        continue
      }
    }
    
    // Method 2: Try CodeStudio profile scraping
    try {
      const response = await fetch(profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(15000)
      })
      
      if (!response.ok) {
        console.log(`CodeStudio profile not found for ${cleanUsername}`)
        return null
      }
      
      const html = await response.text()
      
      // Check if profile exists
      if (html.includes('User not found') || html.includes('404') || html.includes('Profile not found')) {
        console.log(`CodeStudio profile not found for: ${cleanUsername}`)
        return null
      }
      
      console.log(`CodeStudio profile exists for: ${cleanUsername}`)
      
      // Extract stats from HTML
      let problemsSolved = 0
      let score = 0
      let rank = 0
      let streakDays = 0
      
      // Enhanced regex patterns for CodeStudio
      const problemsMatch = html.match(/problems?[_\s]*solved["\s]*:[\s]*(\d+)/gi) ||
                           html.match(/solved["\s]*:[\s]*(\d+)/gi) ||
                           html.match(/(\d+)\s*problems?\s*solved/gi)
      
      const scoreMatch = html.match(/score["\s]*:[\s]*(\d+)/gi) ||
                        html.match(/points?["\s]*:[\s]*(\d+)/gi) ||
                        html.match(/(\d+)\s*points?/gi)
      
      const rankMatch = html.match(/rank["\s]*:[\s]*(\d+)/gi) ||
                       html.match(/(\d+)\s*rank/gi)
      
      const streakMatch = html.match(/streak["\s]*:[\s]*(\d+)/gi) ||
                         html.match(/(\d+)\s*days?\s*streak/gi)
      
      if (problemsMatch && problemsMatch[0].match(/\d+/)) {
        problemsSolved = parseInt(problemsMatch[0].match(/\d+/)![0])
      }
      if (scoreMatch && scoreMatch[0].match(/\d+/)) {
        score = parseInt(scoreMatch[0].match(/\d+/)![0])
      }
      if (rankMatch && rankMatch[0].match(/\d+/)) {
        rank = parseInt(rankMatch[0].match(/\d+/)![0])
      }
      if (streakMatch && streakMatch[0].match(/\d+/)) {
        streakDays = parseInt(streakMatch[0].match(/\d+/)![0])
      }
      
      console.log(`CodeStudio real-time stats: problems=${problemsSolved}, score=${score}, rank=${rank}, streak=${streakDays}`)
      
      const stats: CodeStudioStats = {
        username: cleanUsername,
        problemsSolved: problemsSolved,
        score: score,
        rank: rank,
        streakDays: streakDays,
        profileUrl
      }
      
      console.log(`CodeStudio stats for ${cleanUsername}:`, stats)
      return stats
      
    } catch (error) {
      console.log('CodeStudio fetch failed:', error)
    }

    // Method 3: Basic profile validation (fallback)
    if (cleanUsername && cleanUsername.length > 0 && /^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
      console.log(`CodeStudio: returning basic profile for ${cleanUsername}`)
      
      return {
        username: cleanUsername,
        problemsSolved: 0,
        score: 0,
        rank: 0,
        streakDays: 0,
        profileUrl
      }
    }
    
    return null
  } catch (error) {
    console.error("Error fetching CodeStudio real-time stats:", error)
    return null
  }
}