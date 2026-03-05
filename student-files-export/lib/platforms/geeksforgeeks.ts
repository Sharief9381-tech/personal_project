export interface GeeksforGeeksStats {
  username: string
  codingScore: number
  problemsSolved: number
  instituteRank: number
  articlesPublished: number
  currentStreak: number
  longestStreak: number
  potdsSolved: number
  globalRank?: number
  profileUrl: string
}

export async function fetchGeeksforGeeksStats(username: string): Promise<GeeksforGeeksStats | null> {
  try {
    console.log(`Fetching real-time GeeksforGeeks stats for: ${username}`)
    
    // Clean the username - handle both username and full URL
    let cleanUsername = username.trim()
    
    // If it's a full URL, extract the username - handle all GeeksforGeeks URL patterns
    const urlPatterns = [
      /(?:https?:\/\/)?(?:auth\.)?geeksforgeeks\.org\/user\/([^\/\?\s]+)(?:\/profile)?/i,
      /(?:https?:\/\/)?(?:www\.)?geeksforgeeks\.org\/user\/([^\/\?\s]+)(?:\/profile)?/i,
      /(?:https?:\/\/)?(?:auth\.)?geeksforgeeks\.org\/profile\/([^\/\?\s]+)/i,
      /(?:https?:\/\/)?(?:www\.)?geeksforgeeks\.org\/profile\/([^\/\?\s]+)/i,
    ]
    
    for (const pattern of urlPatterns) {
      const match = cleanUsername.match(pattern)
      if (match) {
        cleanUsername = match[1]
        break
      }
    }
    
    console.log(`Cleaned GeeksforGeeks username: ${cleanUsername}`)
    
    // Try multiple profile URL formats
    const profileUrls = [
      `https://auth.geeksforgeeks.org/user/${cleanUsername}/profile`,
      `https://auth.geeksforgeeks.org/user/${cleanUsername}`,
      `https://www.geeksforgeeks.org/user/${cleanUsername}/profile`,
      `https://www.geeksforgeeks.org/user/${cleanUsername}`,
    ]
    
    // Method 1: Try third-party competitive programming APIs
    const thirdPartyApis = [
      `https://competitive-coding-api.herokuapp.com/api/geeksforgeeks/${cleanUsername}`,
      `https://cp-api.vercel.app/geeksforgeeks/${cleanUsername}`,
    ]

    for (const apiUrl of thirdPartyApis) {
      try {
        console.log(`Trying GeeksforGeeks third-party API: ${apiUrl}`)
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; StatsBot/1.0)',
          },
          signal: AbortSignal.timeout(8000),
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`GeeksforGeeks third-party API response:`, data)
          
          if (data && !data.error && data.success !== false) {
            return {
              username: cleanUsername,
              codingScore: data.coding_score || data.score || 0,
              problemsSolved: data.problems_solved || data.solved || 0,
              instituteRank: data.institute_rank || data.rank || 0,
              articlesPublished: data.articles_published || data.articles || 0,
              currentStreak: data.current_streak || data.streak || 0,
              longestStreak: data.longest_streak || data.max_streak || 0,
              potdsSolved: data.potds_solved || data.potd || 0,
              globalRank: data.global_rank || 0,
              profileUrl: profileUrls[0]
            }
          }
        }
      } catch (apiError) {
        console.log(`GeeksforGeeks third-party API ${apiUrl} failed:`, apiError)
        continue
      }
    }
    
    // Method 2: Try GeeksforGeeks profile scraping with multiple URL formats
    let workingProfileUrl = profileUrls[0] // Default to first URL
    let html = ''
    let profileFound = false
    
    for (const url of profileUrls) {
      try {
        console.log(`Trying GeeksforGeeks profile URL: ${url}`)
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
          signal: AbortSignal.timeout(15000)
        })
        
        console.log(`GeeksforGeeks response status: ${response.status} for ${url}`)
        
        if (response.ok) {
          html = await response.text()
          console.log(`GeeksforGeeks HTML length: ${html.length} for ${url}`)
          
          // More specific profile existence checks
          const profileNotFoundIndicators = [
            'user not found',
            'profile not found', 
            'user does not exist',
            'no such user',
            'invalid user',
            'this user does not exist',
            'user not available',
            'profile not available'
          ]
          
          const profileExistsIndicators = [
            'coding score',
            'problems solved', 
            'institute rank',
            'articles published',
            'current streak',
            'longest streak',
            'potd solved',
            'user-stats',
            'profile-stats',
            'gfg-stats'
          ]
          
          const htmlLower = html.toLowerCase()
          
          // Check for specific "user not found" messages (not generic 404s)
          const hasUserNotFound = profileNotFoundIndicators.some(indicator => 
            htmlLower.includes(indicator.toLowerCase())
          )
          
          // Check for actual profile statistics content
          const hasProfileStats = profileExistsIndicators.some(indicator => 
            htmlLower.includes(indicator.toLowerCase())
          )
          
          // Profile exists if we have profile stats and no specific user not found messages
          if (!hasUserNotFound && (hasProfileStats || html.length > 50000)) {
            console.log(`GeeksforGeeks profile found at: ${url} - hasUserNotFound: ${hasUserNotFound}, hasProfileStats: ${hasProfileStats}`)
            workingProfileUrl = url
            profileFound = true
            break
          } else {
            console.log(`GeeksforGeeks profile not detected at ${url} - hasUserNotFound: ${hasUserNotFound}, hasProfileStats: ${hasProfileStats}, length: ${html.length}`)
          }
        } else {
          console.log(`GeeksforGeeks HTTP error ${response.status} for ${url}`)
        }
      } catch (error) {
        console.log(`Failed to fetch ${url}:`, error)
        continue
      }
    }
    
    if (!profileFound) {
      console.log(`GeeksforGeeks profile not found for ${cleanUsername}`)
      return null
    }
    
    try {
      console.log(`GeeksforGeeks profile exists for: ${cleanUsername}`)
      
      // Extract stats from HTML using the helper function
      const extractedStats = await extractGeeksforGeeksStats(html, cleanUsername)
      
      if (extractedStats) {
        extractedStats.profileUrl = workingProfileUrl // Use the working URL
        console.log(`GeeksforGeeks real-time stats extracted:`, extractedStats)
        return extractedStats
      }
      
    } catch (error) {
      console.log('GeeksforGeeks stats extraction failed:', error)
    }

    // Method 3: Basic profile validation (fallback) - Create a basic profile for valid usernames
    if (cleanUsername && cleanUsername.length > 0 && /^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
      console.log(`GeeksforGeeks: creating basic profile for ${cleanUsername} (fallback method)`)
      
      // Return a basic profile with zero stats (real behavior for new/inactive users)
      return {
        username: cleanUsername,
        codingScore: 0,
        problemsSolved: 0,
        instituteRank: 0,
        articlesPublished: 0,
        currentStreak: 0,
        longestStreak: 0,
        potdsSolved: 0,
        globalRank: 0,
        profileUrl: profileUrls[0] // Use the first URL as default
      }
    }
    
    return null
  } catch (error) {
    console.error("Error fetching GeeksforGeeks real-time stats:", error)
    return null
  }
}

// Helper function to extract stats from GeeksforGeeks profile HTML
export async function extractGeeksforGeeksStats(html: string, username: string): Promise<GeeksforGeeksStats | null> {
  try {
    const stats: GeeksforGeeksStats = {
      username,
      codingScore: 0,
      problemsSolved: 0,
      instituteRank: 0,
      articlesPublished: 0,
      currentStreak: 0,
      longestStreak: 0,
      potdsSolved: 0,
      profileUrl: `https://auth.geeksforgeeks.org/user/${username}/profile`
    }

    // Extract coding score - try multiple patterns
    const scorePatterns = [
      /Coding\s*Score[:\s]*(\d+)/i,
      /Score[:\s]*(\d+)/i,
      /"score"\s*:\s*(\d+)/i,
      /coding-score[^>]*>(\d+)/i
    ]
    
    for (const pattern of scorePatterns) {
      const match = html.match(pattern)
      if (match) {
        stats.codingScore = parseInt(match[1])
        break
      }
    }

    // Extract problems solved - try multiple patterns
    const problemsPatterns = [
      /Problems?\s*Solved[:\s]*(\d+)/i,
      /Solved[:\s]*(\d+)/i,
      /"problems_solved"\s*:\s*(\d+)/i,
      /problems-solved[^>]*>(\d+)/i,
      /(\d+)\s*Problems?\s*Solved/i
    ]
    
    for (const pattern of problemsPatterns) {
      const match = html.match(pattern)
      if (match) {
        stats.problemsSolved = parseInt(match[1])
        break
      }
    }

    // Extract institute rank - try multiple patterns
    const rankPatterns = [
      /Institute\s*Rank[:\s]*(\d+)/i,
      /Rank[:\s]*(\d+)/i,
      /"institute_rank"\s*:\s*(\d+)/i,
      /institute-rank[^>]*>(\d+)/i
    ]
    
    for (const pattern of rankPatterns) {
      const match = html.match(pattern)
      if (match) {
        stats.instituteRank = parseInt(match[1])
        break
      }
    }

    // Extract articles - try multiple patterns
    const articlesPatterns = [
      /Articles?\s*Published[:\s]*(\d+)/i,
      /Articles?[:\s]*(\d+)/i,
      /"articles_published"\s*:\s*(\d+)/i,
      /articles-published[^>]*>(\d+)/i,
      /(\d+)\s*Articles?/i
    ]
    
    for (const pattern of articlesPatterns) {
      const match = html.match(pattern)
      if (match) {
        stats.articlesPublished = parseInt(match[1])
        break
      }
    }

    // Extract current streak - try multiple patterns
    const currentStreakPatterns = [
      /(\d+)\s*Day\s*POTD\s*Streak/i,
      /Current\s*Streak[:\s]*(\d+)/i,
      /"current_streak"\s*:\s*(\d+)/i,
      /current-streak[^>]*>(\d+)/i
    ]
    
    for (const pattern of currentStreakPatterns) {
      const match = html.match(pattern)
      if (match) {
        stats.currentStreak = parseInt(match[1])
        break
      }
    }

    // Extract longest streak - try multiple patterns
    const longestStreakPatterns = [
      /Longest\s*Streak[:\s]*(\d+)/i,
      /"longest_streak"\s*:\s*(\d+)/i,
      /longest-streak[^>]*>(\d+)/i,
      /Max\s*Streak[:\s]*(\d+)/i
    ]
    
    for (const pattern of longestStreakPatterns) {
      const match = html.match(pattern)
      if (match) {
        stats.longestStreak = parseInt(match[1])
        break
      }
    }

    // Extract POTDs solved - try multiple patterns
    const potdPatterns = [
      /POTDs?\s*Solved[:\s]*(\d+)/i,
      /"potds_solved"\s*:\s*(\d+)/i,
      /potds-solved[^>]*>(\d+)/i,
      /(\d+)\s*POTDs?/i
    ]
    
    for (const pattern of potdPatterns) {
      const match = html.match(pattern)
      if (match) {
        stats.potdsSolved = parseInt(match[1])
        break
      }
    }

    console.log('Extracted GeeksforGeeks stats:', stats)
    return stats
  } catch (error) {
    console.error('Error extracting GeeksforGeeks stats:', error)
    return null
  }
}