export interface AtCoderStats {
  username: string
  rating: number
  highestRating: number
  rank: string
  problemsSolved: number
  contests: Array<{
    name: string
    rank: number
    rating: number
    date: string
  }>
  profileUrl: string
}

export async function fetchAtCoderStats(username: string): Promise<AtCoderStats | null> {
  try {
    console.log(`Fetching REAL AtCoder stats for: ${username}`)
    
    // Clean the username - handle both username and full URL
    let cleanUsername = username.trim()
    
    // Extract username from AtCoder URL if provided
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?atcoder\.jp\/users\/([^\/\?\s]+)/i
    const match = cleanUsername.match(urlPattern)
    if (match) {
      cleanUsername = match[1]
    }
    
    console.log(`Cleaned AtCoder username: ${cleanUsername}`)
    
    // Method 1: Try third-party competitive programming APIs
    const thirdPartyApis = [
      `https://cp-rating-api.vercel.app/atcoder/${cleanUsername}`,
      `https://competitive-coding-api.herokuapp.com/api/atcoder/${cleanUsername}`,
      `https://cp-api.vercel.app/atcoder/${cleanUsername}`,
    ]

    for (const apiUrl of thirdPartyApis) {
      try {
        console.log(`Trying AtCoder third-party API: ${apiUrl}`)
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; StatsBot/1.0)',
          },
          signal: AbortSignal.timeout(8000),
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`AtCoder third-party API response:`, data)
          
          if (data && !data.error && data.success !== false) {
            return {
              username: cleanUsername,
              rating: data.rating || data.current_rating || 0,
              highestRating: data.max_rating || data.highest_rating || data.rating || 0,
              rank: data.rank || getRankFromRating(data.rating || 0),
              problemsSolved: data.problems_solved || data.solved || 0,
              contests: data.contests || [],
              profileUrl: `https://atcoder.jp/users/${cleanUsername}`
            }
          }
        }
      } catch (apiError) {
        console.log(`AtCoder third-party API ${apiUrl} failed:`, apiError)
        continue
      }
    }
    
    // Method 2: AtCoder profile URLs
    const profileUrl = `https://atcoder.jp/users/${cleanUsername}`
    const historyUrl = `https://atcoder.jp/users/${cleanUsername}/history/json`
    
    try {
      // Try to fetch user profile page
      const profileResponse = await fetch(profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        signal: AbortSignal.timeout(15000)
      })
      
      if (!profileResponse.ok) {
        console.log(`AtCoder profile not found for ${cleanUsername} (HTTP ${profileResponse.status})`)
        return null // Return null instead of fake data when profile doesn't exist
      }
      
      const profileHtml = await profileResponse.text()
      console.log(`AtCoder HTML fetched for ${cleanUsername}, length: ${profileHtml.length}`)
      
      // Check if profile exists but user doesn't exist
      if (profileHtml.includes('User not found') || profileHtml.includes('404') || profileHtml.includes('ユーザーが見つかりません')) {
        console.log(`AtCoder user ${cleanUsername} does not exist`)
        return null
      }
      
      // Extract REAL stats from HTML - no fallbacks, return actual data
      const stats = await extractRealAtCoderStats(profileHtml, cleanUsername)
      
      // Try to get contest history for more accurate data
      try {
        const historyResponse = await fetch(historyUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json',
            'Referer': profileUrl
          },
          signal: AbortSignal.timeout(10000)
        })
        
        if (historyResponse.ok) {
          const historyData = await historyResponse.json()
          if (Array.isArray(historyData) && historyData.length > 0) {
            console.log(`AtCoder contest history found: ${historyData.length} contests`)
            stats.contests = historyData.slice(-10).map((contest: any) => ({
              name: contest.ContestName || contest.ContestScreenName || 'Contest',
              rank: contest.Place || 0,
              rating: contest.NewRating || contest.OldRating || 0,
              date: contest.EndTime || ''
            }))
            
            // Update rating from contest history if available
            const latestContest = historyData[historyData.length - 1]
            if (latestContest && latestContest.NewRating !== undefined) {
              stats.rating = latestContest.NewRating
              stats.rank = getRankFromRating(latestContest.NewRating)
            }
            
            // Find highest rating from history
            const maxRating = Math.max(...historyData.map((c: any) => c.NewRating || c.OldRating || 0))
            if (maxRating > stats.highestRating) {
              stats.highestRating = maxRating
            }
          } else {
            console.log(`AtCoder user ${cleanUsername} has no contest history - unrated user`)
          }
        }
      } catch (historyError) {
        console.log('Could not fetch AtCoder contest history:', historyError)
      }
      
      console.log(`REAL AtCoder stats for ${cleanUsername}:`, stats)
      return stats
      
    } catch (fetchError) {
      console.log('AtCoder fetch failed:', fetchError)
      return null // Return null instead of fake data when fetch fails
    }

  } catch (error) {
    console.error("Error fetching AtCoder stats:", error)
    return null // Return null instead of fake data when error occurs
  }
}


async function extractRealAtCoderStats(html: string, username: string): Promise<AtCoderStats> {
  const stats: AtCoderStats = {
    username,
    rating: 0,
    highestRating: 0,
    rank: 'Unrated',
    problemsSolved: 0,
    contests: [],
    profileUrl: `https://atcoder.jp/users/${username}`
  }

  try {
    console.log(`Extracting REAL AtCoder stats for ${username}`)
    
    // Check if user is unrated (hasn't participated in rated contests)
    if (html.includes('This user has not competed in a rated contest yet') || 
        html.includes('has not competed in a rated contest') ||
        html.includes('まだレーティング対象のコンテストに参加していません')) {
      console.log(`AtCoder user ${username} is unrated (no rated contests) - returning real stats: 0 rating, 0 problems`)
      
      // Return REAL stats for unrated user - all zeros
      stats.rating = 0
      stats.highestRating = 0
      stats.rank = 'Unrated'
      stats.problemsSolved = 0
      stats.contests = []
      
      return stats
    }
    
    // Extract rating - AtCoder shows current rating prominently
    // Look for patterns like "Rating: 1234" or in spans with specific classes
    const ratingPatterns = [
      /Rating[:\s]*<[^>]*>(\d+)</i,
      /Rating[:\s]*(\d+)/i,
      /<span[^>]*class="[^"]*user-[^"]*"[^>]*>(\d+)</i,
      /<b[^>]*>(\d{3,4})<\/b>/g,
      /現在のレーティング[:\s]*(\d+)/i, // Japanese
      /Current Rating[:\s]*(\d+)/i
    ]
    
    let ratingFound = false
    for (const pattern of ratingPatterns) {
      const match = html.match(pattern)
      if (match) {
        const rating = parseInt(match[1])
        if (rating >= 0 && rating <= 4000) { // Valid AtCoder rating range
          stats.rating = rating
          stats.highestRating = rating // Will be updated if we find highest rating
          stats.rank = getRankFromRating(rating)
          console.log(`Found REAL AtCoder rating: ${rating}`)
          ratingFound = true
          break
        }
      }
    }

    // Extract highest rating
    const highestPatterns = [
      /Highest[:\s]*<[^>]*>(\d+)</i,
      /Highest[:\s]*(\d+)/i,
      /Max[:\s]*(\d+)/i,
      /Peak[:\s]*(\d+)/i,
      /最高レーティング[:\s]*(\d+)/i // Japanese
    ]
    
    for (const pattern of highestPatterns) {
      const match = html.match(pattern)
      if (match) {
        const highest = parseInt(match[1])
        if (highest >= stats.rating && highest <= 4000) {
          stats.highestRating = highest
          console.log(`Found REAL AtCoder highest rating: ${highest}`)
          break
        }
      }
    }

    // Extract problems solved - look for AC (Accepted) count
    const problemsPatterns = [
      /AC[:\s]*<[^>]*>(\d+)</i,
      /AC[:\s]*(\d+)/i,
      /Accepted[:\s]*<[^>]*>(\d+)</i,
      /Accepted[:\s]*(\d+)/i,
      /Problems[:\s]*<[^>]*>(\d+)</i,
      /Problems[:\s]*(\d+)/i,
      /(\d+)\s*problems?\s*solved/i,
      /解いた問題数[:\s]*(\d+)/i // Japanese
    ]
    
    let problemsFound = false
    for (const pattern of problemsPatterns) {
      const match = html.match(pattern)
      if (match) {
        const problems = parseInt(match[1])
        if (problems >= 0 && problems <= 10000) { // Reasonable range
          stats.problemsSolved = problems
          console.log(`Found REAL AtCoder problems solved: ${problems}`)
          problemsFound = true
          break
        }
      }
    }

    // Try to extract from table data (AtCoder often uses tables)
    const tableMatches = html.match(/<td[^>]*>(\d+)<\/td>/g)
    if (tableMatches && (!ratingFound || !problemsFound)) {
      const numbers = tableMatches.map(match => {
        const num = parseInt(match.replace(/<[^>]*>/g, ''))
        return isNaN(num) ? 0 : num
      }).filter(num => num > 0)
      
      // Heuristic: larger numbers are likely ratings, smaller ones might be problems
      const potentialRatings = numbers.filter(n => n >= 400 && n <= 4000)
      const potentialProblems = numbers.filter(n => n >= 1 && n <= 5000)
      
      if (!ratingFound && potentialRatings.length > 0) {
        stats.rating = potentialRatings[0]
        stats.rank = getRankFromRating(stats.rating)
        console.log(`Extracted REAL rating from table: ${stats.rating}`)
      }
      
      if (!problemsFound && potentialProblems.length > 0) {
        // Take the largest reasonable number as problems solved
        stats.problemsSolved = Math.max(...potentialProblems.filter(n => n <= 2000))
        console.log(`Extracted REAL problems from table: ${stats.problemsSolved}`)
      }
    }

    // Ensure highest rating is at least current rating
    if (stats.highestRating < stats.rating) {
      stats.highestRating = stats.rating
    }

    console.log(`Final REAL AtCoder stats extracted:`, stats)
    return stats

  } catch (error) {
    console.error('Error extracting AtCoder stats:', error)
    
    // Return basic real stats (zeros) if extraction fails - no fake data
    console.log(`Extraction failed for ${username}, returning real zero stats`)
    return {
      username,
      rating: 0,
      highestRating: 0,
      rank: 'Unrated',
      problemsSolved: 0,
      contests: [],
      profileUrl: `https://atcoder.jp/users/${username}`
    }
  }
}

function getRankFromRating(rating: number): string {
  if (rating >= 3200) return 'Red'
  if (rating >= 2800) return 'Orange'
  if (rating >= 2400) return 'Yellow'
  if (rating >= 2000) return 'Blue'
  if (rating >= 1600) return 'Cyan'
  if (rating >= 1200) return 'Green'
  if (rating >= 800) return 'Brown'
  if (rating >= 400) return 'Gray'
  return 'Unrated'
}