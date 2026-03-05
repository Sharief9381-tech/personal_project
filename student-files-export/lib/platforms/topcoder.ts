export interface TopCoderStats {
  username: string
  rating: number
  maxRating: number
  rank: string
  competitions: number
  wins: number
  profileUrl: string
}

export async function fetchTopCoderStats(username: string): Promise<TopCoderStats | null> {
  try {
    // Clean the username - handle both username and full URL
    let cleanUsername = username.trim()
    
    // Extract username from TopCoder URL if provided
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?topcoder\.com\/members\/([^\/\?\s]+)/i
    const match = cleanUsername.match(urlPattern)
    if (match) {
      cleanUsername = match[1]
    }
    
    console.log(`Fetching real-time TopCoder stats for: ${cleanUsername}`)
    
    const profileUrl = `https://www.topcoder.com/members/${cleanUsername}`
    
    // Method 1: Try third-party competitive programming APIs
    const thirdPartyApis = [
      `https://cp-rating-api.vercel.app/topcoder/${cleanUsername}`,
      `https://competitive-coding-api.herokuapp.com/api/topcoder/${cleanUsername}`,
      `https://cp-api.vercel.app/topcoder/${cleanUsername}`,
    ]

    for (const apiUrl of thirdPartyApis) {
      try {
        console.log(`Trying TopCoder third-party API: ${apiUrl}`)
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; StatsBot/1.0)',
          },
          signal: AbortSignal.timeout(8000),
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`TopCoder third-party API response:`, data)
          
          if (data && !data.error && data.success !== false) {
            return {
              username: cleanUsername,
              rating: data.rating || data.algorithm_rating || 0,
              maxRating: data.max_rating || data.highest_rating || data.rating || 0,
              rank: data.rank || getRankFromRating(data.rating || 0),
              competitions: data.competitions || data.srms || 0,
              wins: data.wins || 0,
              profileUrl
            }
          }
        }
      } catch (apiError) {
        console.log(`TopCoder third-party API ${apiUrl} failed:`, apiError)
        continue
      }
    }
    
    // Method 2: Try TopCoder profile scraping
    try {
      const response = await fetch(profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(15000)
      })
      
      if (!response.ok) {
        console.log(`TopCoder profile not found for ${cleanUsername}`)
        return null
      }
      
      const html = await response.text()
      
      // Check if profile exists
      if (html.includes('Member not found') || html.includes('404') || html.includes('User not found')) {
        console.log(`TopCoder profile not found for: ${cleanUsername}`)
        return null
      }
      
      console.log(`TopCoder profile exists for: ${cleanUsername}`)
      
      // Extract stats from HTML
      let rating = 0
      let maxRating = 0
      let competitions = 0
      let wins = 0
      
      // Enhanced regex patterns for TopCoder
      const ratingMatch = html.match(/rating["\s]*:[\s]*(\d+)/gi) ||
                         html.match(/(\d+)\s*rating/gi) ||
                         html.match(/<span[^>]*class="[^"]*rating[^"]*"[^>]*>(\d+)<\/span>/gi)
      
      const maxRatingMatch = html.match(/max[_\s]*rating["\s]*:[\s]*(\d+)/gi) ||
                            html.match(/highest[_\s]*rating["\s]*:[\s]*(\d+)/gi)
      
      const competitionsMatch = html.match(/competitions?["\s]*:[\s]*(\d+)/gi) ||
                               html.match(/srms?["\s]*:[\s]*(\d+)/gi) ||
                               html.match(/(\d+)\s*competitions?/gi)
      
      const winsMatch = html.match(/wins?["\s]*:[\s]*(\d+)/gi) ||
                       html.match(/(\d+)\s*wins?/gi)
      
      if (ratingMatch && ratingMatch[0].match(/\d+/)) {
        rating = parseInt(ratingMatch[0].match(/\d+/)![0])
      }
      if (maxRatingMatch && maxRatingMatch[0].match(/\d+/)) {
        maxRating = parseInt(maxRatingMatch[0].match(/\d+/)![0])
      }
      if (competitionsMatch && competitionsMatch[0].match(/\d+/)) {
        competitions = parseInt(competitionsMatch[0].match(/\d+/)![0])
      }
      if (winsMatch && winsMatch[0].match(/\d+/)) {
        wins = parseInt(winsMatch[0].match(/\d+/)![0])
      }
      
      // Ensure maxRating is at least equal to current rating
      if (maxRating < rating) maxRating = rating
      
      console.log(`TopCoder real-time stats: rating=${rating}, max=${maxRating}, competitions=${competitions}, wins=${wins}`)
      
      const stats: TopCoderStats = {
        username: cleanUsername,
        rating: rating,
        maxRating: maxRating,
        rank: getRankFromRating(rating),
        competitions: competitions,
        wins: wins,
        profileUrl
      }
      
      console.log(`TopCoder stats for ${cleanUsername}:`, stats)
      return stats
      
    } catch (error) {
      console.log('TopCoder fetch failed:', error)
    }

    // Method 3: Basic profile validation (fallback)
    if (cleanUsername && cleanUsername.length > 0 && /^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
      console.log(`TopCoder: returning basic profile for ${cleanUsername}`)
      
      return {
        username: cleanUsername,
        rating: 0,
        maxRating: 0,
        rank: 'Unrated',
        competitions: 0,
        wins: 0,
        profileUrl
      }
    }
    
    return null
  } catch (error) {
    console.error("Error fetching TopCoder real-time stats:", error)
    return null
  }
}

// Helper function to determine rank from rating
function getRankFromRating(rating: number): string {
  if (rating >= 3000) return 'Target'
  if (rating >= 2200) return 'Red'
  if (rating >= 1500) return 'Yellow'
  if (rating >= 1200) return 'Blue'
  if (rating >= 900) return 'Green'
  if (rating > 0) return 'Gray'
  return 'Unrated'
}