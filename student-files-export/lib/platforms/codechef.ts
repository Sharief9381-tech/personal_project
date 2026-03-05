export interface CodeChefStats {
  username: string
  currentRating: number
  highestRating: number
  stars: string
  globalRank: number
  problemsSolved: number
}

export async function fetchCodeChefStats(username: string): Promise<CodeChefStats | null> {
  try {
    // Clean the username - handle both username and full URL
    let cleanUsername = username.trim()
    
    // Extract username from CodeChef URL if provided
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?codechef\.com\/users\/([^\/\?\s]+)/i
    const match = cleanUsername.match(urlPattern)
    if (match) {
      cleanUsername = match[1]
    }
    
    console.log(`Fetching real-time CodeChef stats for: ${cleanUsername}`)
    
    // Basic username validation - CodeChef usernames are typically alphanumeric with underscores
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      console.log(`Invalid CodeChef username format: ${cleanUsername}`)
      return null
    }
    
    // Try web scraping approach first (more reliable)
    try {
      const profileUrl = `https://www.codechef.com/users/${cleanUsername}`
      const response = await fetch(profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        const html = await response.text()
        
        // Enhanced data extraction from HTML based on actual CodeChef structure
        let currentRating = 0
        let globalRank = 0
        let problemsSolved = 0
        let stars = "1*"
        
        // Extract problems solved - this pattern works
        const problemsPatterns = [
          /Total Problems Solved:\s*(\d+)/i,
          /problems["\s]*solved["\s]*:[\s]*(\d+)/i,
          /fully["\s]*solved["\s]*:[\s]*(\d+)/i,
          /"solved"["\s]*:[\s]*(\d+)/i,
          /(\d+)\s*problems?\s*solved/i,
          /solved["\s]*:[\s]*(\d+)/i
        ]
        
        for (const pattern of problemsPatterns) {
          const match = html.match(pattern)
          if (match) {
            problemsSolved = parseInt(match[1])
            console.log(`Found CodeChef problems solved: ${problemsSolved} using pattern: ${pattern}`)
            break
          }
        }
        
        // Extract stars from HTML - look for patterns like "1★" or "2★"
        const starsPatterns = [
          /(\d+)★/g,
          /(\d+)\*/g,
          /(\d+)\s*star/gi
        ]
        
        for (const pattern of starsPatterns) {
          const match = html.match(pattern)
          if (match) {
            stars = match[1] + "*"
            console.log(`Found CodeChef stars: ${stars} using pattern: ${pattern}`)
            break
          }
        }
        
        // Extract contests participated (might help estimate rating)
        const contestsMatch = html.match(/No\. of Contests Participated:\s*(\d+)/i)
        let contestsParticipated = 0
        if (contestsMatch) {
          contestsParticipated = parseInt(contestsMatch[1])
          console.log(`Found CodeChef contests participated: ${contestsParticipated}`)
        }
        
        // Try to extract rating from various patterns - CodeChef might not show exact rating on public profile
        const ratingPatterns = [
          /rating["\s]*:[\s]*(\d+)/gi,
          /current[_\s]*rating["\s]*:[\s]*(\d+)/gi,
          /"rating"[:\s]*(\d+)/gi,
          /(\d{3,4})\s*rating/gi,
          /"current_rating"[:\s]*(\d+)/gi,
          /rating[^>]*>(\d+)</gi,
          /Rating:\s*(\d+)/gi
        ]
        
        for (const pattern of ratingPatterns) {
          const matches = html.match(pattern)
          if (matches) {
            for (const match of matches) {
              const ratingNum = match.match(/\d+/)
              if (ratingNum) {
                const rating = parseInt(ratingNum[0])
                if (rating >= 400 && rating <= 4000) {
                  currentRating = rating
                  console.log(`Found CodeChef rating: ${rating} using pattern: ${pattern}`)
                  break
                }
              }
            }
            if (currentRating > 0) break
          }
        }
        
        // Extract country rank information (if available)
        const countryRankPatterns = [
          /Country Rank:\s*(\d+)/i,
          /rank.*india.*:?\s*(\d+)/i,
          /india.*rank.*:?\s*(\d+)/i,
          /country.*rank.*:?\s*(\d+)/i,
          /rank.*country.*:?\s*(\d+)/i,
          /(\d+).*rank.*india/i,
          /(\d+).*india.*rank/i
        ]
        
        let extractedCountryRank = 0
        for (const pattern of countryRankPatterns) {
          const match = html.match(pattern)
          if (match) {
            extractedCountryRank = parseInt(match[1])
            console.log(`Found CodeChef country rank: ${extractedCountryRank} using pattern: ${pattern}`)
            break
          }
        }
        
        // Extract any ranking information from the profile
        const rankPatterns = [
          /rank[:\s]*(\d+)/gi,
          /ranking[:\s]*(\d+)/gi,
          /position[:\s]*(\d+)/gi,
          /(\d+)(?:st|nd|rd|th)?\s*rank/gi,
          /rank\s*(\d+)/gi
        ]
        
        let extractedRank = 0
        for (const pattern of rankPatterns) {
          const matches = html.match(pattern)
          if (matches) {
            for (const match of matches) {
              const rankNum = match.match(/\d+/)
              if (rankNum) {
                const rank = parseInt(rankNum[0])
                if (rank > 0 && rank < 1000000) { // Reasonable rank range
                  extractedRank = rank
                  console.log(`Found CodeChef rank: ${rank} using pattern: ${pattern}`)
                  break
                }
              }
            }
            if (extractedRank > 0) break
          }
        }
        
        // If we have contests but no rating, user might be unrated but active
        if (contestsParticipated > 0 && currentRating === 0) {
          console.log(`CodeChef user ${cleanUsername} has ${contestsParticipated} contests but no visible rating - might be unrated or rating not public`)
        }
        
        return {
          username: cleanUsername,
          currentRating,
          highestRating: extractedCountryRank || extractedRank || 0, // Use country rank in place of highest rating
          stars,
          globalRank: 0,
          problemsSolved,
        }
      }
    } catch (scrapingError: any) {
      console.log(`CodeChef web scraping failed: ${scrapingError.message}`)
    }
    
    // Fallback to third-party APIs
    const apis = [
      `https://cp-rating-api.vercel.app/codechef/${cleanUsername}`,
      `https://codechef-api.vercel.app/handle/${cleanUsername}`,
      `https://competitive-coding-api.herokuapp.com/api/codechef/${cleanUsername}`,
      `https://codechef-api.herokuapp.com/${cleanUsername}`,
      `https://api.codechef.com/users/${cleanUsername}`,
    ]

    for (const apiUrl of apis) {
      try {
        console.log(`Trying CodeChef API: ${apiUrl}`)
        const response = await fetch(apiUrl, {
          headers: {
            Accept: "application/json",
            "User-Agent": "Mozilla/5.0 (compatible; CodeTrack/1.0)",
          },
          signal: AbortSignal.timeout(8000),
        })

        console.log(`CodeChef API response status: ${response.status}`)

        if (response.ok) {
          const data = await response.json()
          console.log(`CodeChef API response data:`, data)
          
          if (data.success === false || data.error) {
            console.log(`CodeChef API returned error:`, data.error || 'Unknown error')
            continue
          }

          const problemsSolved = data.problemsSolved || 
                               data.fullySolved?.count || 
                               data.solved || 
                               data.totalSolved ||
                               data.problems_solved ||
                               0

          console.log(`CodeChef API problems solved found: ${problemsSolved}`)

          return {
            username: cleanUsername,
            currentRating: data.currentRating || data.rating || data.current_rating || 0,
            highestRating: data.countryRank || data.country_rank || data.highestRating || data.max_rating || 0,
            stars: data.stars || getStarsFromRating(data.currentRating || data.rating || 0),
            globalRank: data.globalRank || data.global_rank || 0,
            problemsSolved: problemsSolved,
          }
        }
      } catch (apiError: any) {
        console.log(`CodeChef API ${apiUrl} failed:`, apiError.message)
        continue
      }
    }

    // If all methods fail, return null instead of fake data
    console.log(`All CodeChef data sources failed for "${cleanUsername}"`)
    return null // Return null instead of fake data when all methods fail
  } catch (error) {
    console.error("Error fetching CodeChef stats:", error)
    return null
  }
}

function getStarsFromRating(rating: number): string {
  if (rating >= 2500) return "7*"
  if (rating >= 2200) return "6*"
  if (rating >= 2000) return "5*"
  if (rating >= 1800) return "4*"
  if (rating >= 1600) return "3*"
  if (rating >= 1400) return "2*"
  return "1*"
}
