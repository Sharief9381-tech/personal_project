export interface KattisStats {
  username: string
  problemsSolved: number
  score: number
  rank: number
  country: string
  university: string
  profileUrl: string
}

export async function fetchKattisStats(username: string): Promise<KattisStats | null> {
  try {
    // Clean the username - handle both username and full URL
    let cleanUsername = username.trim()
    
    // Extract username from Kattis URL if provided
    const urlPattern = /(?:https?:\/\/)?(?:open\.)?kattis\.com\/users\/([^\/\?\s]+)/i
    const match = cleanUsername.match(urlPattern)
    if (match) {
      cleanUsername = match[1]
    }
    
    console.log(`Fetching real-time Kattis stats for: ${cleanUsername}`)
    
    const profileUrl = `https://open.kattis.com/users/${cleanUsername}`
    
    // Method 1: Try third-party APIs
    const thirdPartyApis = [
      `https://competitive-coding-api.herokuapp.com/api/kattis/${cleanUsername}`,
      `https://cp-api.vercel.app/kattis/${cleanUsername}`,
    ]

    for (const apiUrl of thirdPartyApis) {
      try {
        console.log(`Trying Kattis third-party API: ${apiUrl}`)
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; StatsBot/1.0)',
          },
          signal: AbortSignal.timeout(8000),
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`Kattis third-party API response:`, data)
          
          if (data && !data.error && data.success !== false) {
            return {
              username: cleanUsername,
              problemsSolved: data.problems_solved || data.solved || 0,
              score: data.score || data.points || 0,
              rank: data.rank || 0,
              country: data.country || '',
              university: data.university || data.institution || '',
              profileUrl
            }
          }
        }
      } catch (apiError) {
        console.log(`Kattis third-party API ${apiUrl} failed:`, apiError)
        continue
      }
    }
    
    // Method 2: Try Kattis profile scraping
    try {
      // Try to fetch user profile page
      const response = await fetch(profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        signal: AbortSignal.timeout(10000)
      })
      
      if (!response.ok) {
        console.log(`Kattis profile not found for ${cleanUsername}`)
        return null
      }
      
      const html = await response.text()
      
      // Check if profile exists
      if (html.includes('User not found') || html.includes('404') || html.includes('does not exist')) {
        console.log(`Kattis profile not found for: ${cleanUsername}`)
        return null
      }
      
      console.log(`Kattis profile exists for: ${cleanUsername}`)
      
      // Extract stats from HTML
      const stats = await extractKattisStats(html, cleanUsername)
      
      console.log(`Kattis stats for ${cleanUsername}:`, stats)
      return stats
      
    } catch (fetchError) {
      console.log('Kattis fetch failed:', fetchError)
    }

    // Method 3: Basic profile validation (fallback)
    if (cleanUsername && cleanUsername.length > 0 && /^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
      console.log(`Kattis: returning basic profile for ${cleanUsername}`)
      
      return {
        username: cleanUsername,
        problemsSolved: 0,
        score: 0,
        rank: 0,
        country: '',
        university: '',
        profileUrl
      }
    }
    
    return null
  } catch (error) {
    console.error("Error fetching Kattis real-time stats:", error)
    return null
  }
}

async function extractKattisStats(html: string, username: string): Promise<KattisStats> {
  const stats: KattisStats = {
    username,
    problemsSolved: 0,
    score: 0,
    rank: 0,
    country: '',
    university: '',
    profileUrl: `https://open.kattis.com/users/${username}`
  }

  try {
    console.log(`Extracting real-time Kattis stats for ${username}`)
    
    // Extract problems solved
    const problemsMatch = html.match(/Problems\s*solved[:\s]*(\d+)/i) ||
                         html.match(/Solved[:\s]*(\d+)/i) ||
                         html.match(/(\d+)\s*problems?\s*solved/i) ||
                         html.match(/AC[:\s]*(\d+)/i)
    
    if (problemsMatch) {
      stats.problemsSolved = parseInt(problemsMatch[1])
    }

    // Extract score
    const scoreMatch = html.match(/Score[:\s]*(\d+(?:\.\d+)?)/i) ||
                      html.match(/Points[:\s]*(\d+(?:\.\d+)?)/i) ||
                      html.match(/Total[:\s]*(\d+(?:\.\d+)?)/i)
    
    if (scoreMatch) {
      stats.score = parseFloat(scoreMatch[1])
    }

    // Extract rank
    const rankMatch = html.match(/Rank[:\s]*(\d+)/i) ||
                     html.match(/Position[:\s]*(\d+)/i) ||
                     html.match(/#(\d+)/i)
    
    if (rankMatch) {
      stats.rank = parseInt(rankMatch[1])
    }

    // Extract country
    const countryMatch = html.match(/Country[:\s]*([A-Za-z\s]+)/i) ||
                        html.match(/Nation[:\s]*([A-Za-z\s]+)/i)
    
    if (countryMatch) {
      stats.country = countryMatch[1].trim()
    }

    // Extract university/institution
    const universityMatch = html.match(/University[:\s]*([^<\n]+)/i) ||
                           html.match(/Institution[:\s]*([^<\n]+)/i) ||
                           html.match(/School[:\s]*([^<\n]+)/i)
    
    if (universityMatch) {
      stats.university = universityMatch[1].trim()
    }

    console.log(`Kattis real-time stats extracted: problems=${stats.problemsSolved}, score=${stats.score}, rank=${stats.rank}`)
    return stats

  } catch (error) {
    console.error('Error extracting Kattis stats:', error)
    
    // Return basic real stats (zeros) if extraction fails
    return {
      username,
      problemsSolved: 0,
      score: 0,
      rank: 0,
      country: '',
      university: '',
      profileUrl: `https://open.kattis.com/users/${username}`
    }
  }
}