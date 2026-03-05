export interface CSESStats {
  username: string
  problemsSolved: number
  totalProblems: number
  completionRate: number
  profileUrl: string
}

export async function fetchCSESStats(username: string): Promise<CSESStats | null> {
  try {
    // Clean the username - handle both username and full URL
    let cleanUsername = username.trim()
    
    // Extract username from CSES URL if provided
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?cses\.fi\/user\/([^\/\?\s]+)/i
    const match = cleanUsername.match(urlPattern)
    if (match) {
      cleanUsername = match[1]
    }
    
    console.log(`Fetching real-time CSES stats for: ${cleanUsername}`)
    console.log(`Fetching real-time CSES stats for: ${cleanUsername}`)
    
    const profileUrl = `https://cses.fi/user/${cleanUsername}`
    
    // Method 1: Try third-party competitive programming APIs
    const thirdPartyApis = [
      `https://cp-rating-api.vercel.app/cses/${cleanUsername}`,
      `https://competitive-coding-api.herokuapp.com/api/cses/${cleanUsername}`,
      `https://cp-api.vercel.app/cses/${cleanUsername}`,
    ]

    for (const apiUrl of thirdPartyApis) {
      try {
        console.log(`Trying CSES third-party API: ${apiUrl}`)
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; StatsBot/1.0)',
          },
          signal: AbortSignal.timeout(8000),
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`CSES third-party API response:`, data)
          
          if (data && !data.error && data.success !== false) {
            const solved = data.problems_solved || data.solved || 0
            const total = data.total_problems || data.total || 300 // CSES has ~300 problems
            return {
              username: cleanUsername,
              problemsSolved: solved,
              totalProblems: total,
              completionRate: total > 0 ? Math.round((solved / total) * 100) : 0,
              profileUrl
            }
          }
        }
      } catch (apiError) {
        console.log(`CSES third-party API ${apiUrl} failed:`, apiError)
        continue
      }
    }
    
    // Method 2: Try CSES profile scraping
    try {
      const response = await fetch(profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(15000)
      })
      
      if (!response.ok) {
        console.log(`CSES profile not found for ${cleanUsername}`)
        return null
      }
      
      const html = await response.text()
      
      // Check if profile exists
      if (html.includes('User not found') || html.includes('404') || html.includes('does not exist')) {
        console.log(`CSES profile not found for: ${cleanUsername}`)
        return null
      }
      
      console.log(`CSES profile exists for: ${cleanUsername}`)
      
      // Extract stats from HTML
      let problemsSolved = 0
      let totalProblems = 300 // CSES Problem Set has around 300 problems
      
      // Enhanced regex patterns for CSES
      const solvedMatch = html.match(/solved["\s]*:[\s]*(\d+)/gi) ||
                         html.match(/(\d+)\s*\/\s*(\d+)\s*problems?/gi) ||
                         html.match(/(\d+)\s*problems?\s*solved/gi)
      
      const totalMatch = html.match(/(\d+)\s*\/\s*(\d+)\s*problems?/gi) ||
                        html.match(/total["\s]*:[\s]*(\d+)/gi)
      
      if (solvedMatch) {
        if (solvedMatch[0].includes('/')) {
          // Format like "150/300 problems"
          const parts = solvedMatch[0].match(/(\d+)\s*\/\s*(\d+)/)
          if (parts) {
            problemsSolved = parseInt(parts[1])
            totalProblems = parseInt(parts[2])
          }
        } else {
          // Format like "solved: 150"
          const match = solvedMatch[0].match(/\d+/)
          if (match) {
            problemsSolved = parseInt(match[0])
          }
        }
      }
      
      if (totalMatch && solvedMatch && !solvedMatch[0]?.includes('/')) {
        const match = totalMatch[0].match(/\d+/)
        if (match) {
          totalProblems = parseInt(match[0])
        }
      }
      
      const completionRate = totalProblems > 0 ? Math.round((problemsSolved / totalProblems) * 100) : 0
      
      console.log(`CSES real-time stats: solved=${problemsSolved}, total=${totalProblems}, completion=${completionRate}%`)
      
      const stats: CSESStats = {
        username: cleanUsername,
        problemsSolved: problemsSolved,
        totalProblems: totalProblems,
        completionRate: completionRate,
        profileUrl
      }
      
      console.log(`CSES stats for ${cleanUsername}:`, stats)
      return stats
      
    } catch (error) {
      console.log('CSES fetch failed:', error)
    }

    // Method 3: Basic profile validation (fallback)
    if (cleanUsername && cleanUsername.length > 0 && /^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
      console.log(`CSES: returning basic profile for ${cleanUsername}`)
      
      return {
        username: cleanUsername,
        problemsSolved: 0,
        totalProblems: 300,
        completionRate: 0,
        profileUrl
      }
    }
    
    return null
  } catch (error) {
    console.error("Error fetching CSES real-time stats:", error)
    return null
  }
}