export interface HackerRankStats {
  username: string
  name: string
  country: string
  school: string
  company: string
  avatar: string
  level: number
  badges: {
    name: string
    level: string
    badge_type: string
    earned_date: string
  }[]
  certifications: {
    name: string
    level: string
    issued_date: string
    certificate_url: string
  }[]
  skills: {
    name: string
    level: number
    max_score: number
    score: number
    percentage: number
    stars: number
  }[]
  contests: {
    name: string
    rank: number
    score: number
    participants: number
  }[]
  totalScore: number
  globalRank: number
  countryRank: number
}

export async function fetchHackerRankStats(username: string): Promise<HackerRankStats | null> {
  try {
    // Clean the username - handle both username and full URL
    let cleanUsername = username.trim()
    
    // Extract username from HackerRank URL if provided
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?hackerrank\.com\/(?:profile\/)?([^\/\?\s]+)/i
    const match = cleanUsername.match(urlPattern)
    if (match) {
      cleanUsername = match[1]
    }
    
    console.log(`Fetching real-time HackerRank stats for: ${cleanUsername}`)
    
    console.log(`Fetching real-time HackerRank stats for: ${cleanUsername}`)
    
    // Method 1: Try third-party competitive programming APIs
    const thirdPartyApis = [
      `https://cp-rating-api.vercel.app/hackerrank/${cleanUsername}`,
      `https://competitive-coding-api.herokuapp.com/api/hackerrank/${cleanUsername}`,
      `https://cp-api.vercel.app/hackerrank/${cleanUsername}`,
      `https://codeforces-api.herokuapp.com/hackerrank/${cleanUsername}`,
    ]

    for (const apiUrl of thirdPartyApis) {
      try {
        console.log(`Trying HackerRank third-party API: ${apiUrl}`)
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; StatsBot/1.0)',
          },
          signal: AbortSignal.timeout(8000),
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`HackerRank third-party API response:`, data)
          
          if (data && !data.error && data.success !== false) {
            return {
              username: cleanUsername,
              name: data.name || data.full_name || cleanUsername,
              country: data.country || '',
              school: data.school || '',
              company: data.company || '',
              avatar: data.avatar || '',
              level: data.level || 0,
              badges: data.badges || [],
              certifications: data.certifications || [],
              skills: data.skills || [],
              contests: data.contests || [],
              totalScore: data.total_score || data.score || 0,
              globalRank: data.global_rank || data.rank || 0,
              countryRank: data.country_rank || 0,
            }
          }
        }
      } catch (apiError) {
        console.log(`HackerRank third-party API ${apiUrl} failed:`, apiError)
        continue
      }
    }

    // Method 2: Try HackerRank official API
    let apiResult = null
    try {
      const apiResponse = await fetch(`https://www.hackerrank.com/rest/hackers/${cleanUsername}/recent_challenges?limit=1`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Referer': 'https://www.hackerrank.com/',
        },
        signal: AbortSignal.timeout(10000),
      })

      if (apiResponse.ok) {
        const apiData = await apiResponse.json()
        console.log('HackerRank API response:', apiData)
        
        // If API works, fetch more detailed data
        const profileResponse = await fetch(`https://www.hackerrank.com/rest/hackers/${cleanUsername}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json',
            'Referer': 'https://www.hackerrank.com/',
          },
          signal: AbortSignal.timeout(10000),
        })

        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          console.log('HackerRank profile data:', profileData)
          
          if (profileData && profileData.model) {
            apiResult = {
              username: cleanUsername,
              name: profileData.model.name || cleanUsername,
              country: profileData.model.country || '',
              school: profileData.model.school || '',
              company: profileData.model.company || '',
              avatar: profileData.model.avatar || '',
              level: profileData.model.level || 0,
              badges: profileData.model.badges || [],
              certifications: profileData.model.certifications || [],
              skills: profileData.model.skills || [],
              contests: profileData.model.contests || [],
              totalScore: profileData.model.score || 0,
              globalRank: profileData.model.rank || 0,
              countryRank: profileData.model.country_rank || 0,
            }
          }
        }
      }
    } catch (apiError) {
      console.log('HackerRank API method failed:', apiError)
    }

    if (apiResult) {
      return apiResult
    }

    // Method 3: Try HackerRank profile scraping
    let scrapingResult = null
    try {
      const profileUrl = `https://www.hackerrank.com/profile/${cleanUsername}`
      console.log(`Scraping HackerRank profile: ${profileUrl}`)
      
      const response = await fetch(profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(15000),
      })

      if (response.ok) {
        const html = await response.text()
        
        // Check if profile exists
        if (html.includes('Page not found') || html.includes('404') || html.includes('User not found')) {
          console.log(`HackerRank profile not found for: ${cleanUsername}`)
          return null
        }
        
        console.log(`HackerRank profile exists for: ${cleanUsername}`)
        
        // Extract stats from HTML
        let totalScore = 0
        let globalRank = 0
        let level = 0
        let name = cleanUsername
        
        // Enhanced regex patterns for HackerRank
        const scoreMatch = html.match(/total[_\s]*score["\s]*:[\s]*(\d+)/gi) || 
                          html.match(/score["\s]*:[\s]*(\d+)/gi) ||
                          html.match(/(\d+)\s*points?/gi)
        
        const rankMatch = html.match(/global[_\s]*rank["\s]*:[\s]*(\d+)/gi) ||
                         html.match(/rank["\s]*:[\s]*(\d+)/gi) ||
                         html.match(/(\d+)\s*rank/gi)
        
        const levelMatch = html.match(/level["\s]*:[\s]*(\d+)/gi) ||
                          html.match(/(\d+)\s*level/gi)
        
        const nameMatch = html.match(/<title>([^|]+)\s*\|\s*HackerRank/i) ||
                         html.match(/"name":\s*"([^"]+)"/gi)
        
        if (scoreMatch && scoreMatch[0].match(/\d+/)) {
          totalScore = parseInt(scoreMatch[0].match(/\d+/)![0])
        }
        if (rankMatch && rankMatch[0].match(/\d+/)) {
          globalRank = parseInt(rankMatch[0].match(/\d+/)![0])
        }
        if (levelMatch && levelMatch[0].match(/\d+/)) {
          level = parseInt(levelMatch[0].match(/\d+/)![0])
        }
        if (nameMatch) {
          name = nameMatch[1].trim()
        }
        
        console.log(`HackerRank real-time stats: score=${totalScore}, rank=${globalRank}, level=${level}`)
        
        scrapingResult = {
          username: cleanUsername,
          name: name,
          country: '',
          school: '',
          company: '',
          avatar: '',
          level: level,
          badges: [],
          certifications: [],
          skills: [],
          contests: [],
          totalScore: totalScore,
          globalRank: globalRank,
          countryRank: 0,
        }
      }
    } catch (scrapingError) {
      console.log(`HackerRank scraping failed: ${scrapingError}`)
    }

    if (scrapingResult) {
      return scrapingResult
    }

    // Method 4: Basic profile validation (fallback)
    if (cleanUsername && cleanUsername.length > 0 && /^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
      console.log(`HackerRank: returning basic profile for ${cleanUsername}`)
      
      return {
        username: cleanUsername,
        name: cleanUsername,
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
      }
    }
    
    return null
  } catch (error) {
    console.error("Error fetching HackerRank real-time stats:", error)
    return null
  }
}