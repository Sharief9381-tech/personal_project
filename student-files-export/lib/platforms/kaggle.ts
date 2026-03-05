export interface KaggleStats {
  username: string
  tier: string
  competitions: number
  datasets: number
  notebooks: number
  discussions: number
  profileUrl: string
}

export async function fetchKaggleStats(username: string): Promise<KaggleStats | null> {
  try {
    // Clean the username - handle both username and full URL
    let cleanUsername = username.trim()
    
    // Extract username from Kaggle URL if provided
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?kaggle\.com\/([^\/\?\s]+)/i
    const match = cleanUsername.match(urlPattern)
    if (match) {
      cleanUsername = match[1]
    }
    
    console.log(`Fetching real-time Kaggle stats for: ${cleanUsername}`)
    console.log(`Fetching real-time Kaggle stats for: ${cleanUsername}`)
    
    const profileUrl = `https://www.kaggle.com/${cleanUsername}`
    
    // Method 1: Try Kaggle official API (most reliable)
    try {
      console.log(`Trying Kaggle official API for: ${cleanUsername}`)
      const apiResponse = await fetch(`https://www.kaggle.com/api/v1/users/${cleanUsername}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Referer': 'https://www.kaggle.com/',
        },
        signal: AbortSignal.timeout(10000),
      })

      if (apiResponse.ok) {
        const apiData = await apiResponse.json()
        console.log('Kaggle official API response:', apiData)
        
        if (apiData && !apiData.error) {
          return {
            username: cleanUsername,
            tier: apiData.tier || apiData.performanceTier || 'Novice',
            competitions: apiData.totalCompetitions || apiData.competitions || 0,
            datasets: apiData.totalDatasets || apiData.datasets || 0,
            notebooks: apiData.totalNotebooks || apiData.notebooks || 0,
            discussions: apiData.totalDiscussions || apiData.discussions || 0,
            profileUrl
          }
        }
      }
    } catch (apiError) {
      console.log('Kaggle official API failed:', apiError)
    }

    // Method 2: Try third-party APIs
    const thirdPartyApis = [
      `https://cp-rating-api.vercel.app/kaggle/${cleanUsername}`,
      `https://competitive-coding-api.herokuapp.com/api/kaggle/${cleanUsername}`,
      `https://cp-api.vercel.app/kaggle/${cleanUsername}`,
    ]

    for (const apiUrl of thirdPartyApis) {
      try {
        console.log(`Trying Kaggle third-party API: ${apiUrl}`)
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; StatsBot/1.0)',
          },
          signal: AbortSignal.timeout(8000),
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`Kaggle third-party API response:`, data)
          
          if (data && !data.error && data.success !== false) {
            return {
              username: cleanUsername,
              tier: data.tier || 'Novice',
              competitions: data.competitions || 0,
              datasets: data.datasets || 0,
              notebooks: data.notebooks || 0,
              discussions: data.discussions || 0,
              profileUrl
            }
          }
        }
      } catch (apiError) {
        console.log(`Kaggle third-party API ${apiUrl} failed:`, apiError)
        continue
      }
    }
    
    // Method 3: Try Kaggle profile scraping
    try {
      const response = await fetch(profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(15000)
      })
      
      if (!response.ok) {
        console.log(`Kaggle profile not found for ${cleanUsername}`)
        return null
      }
      
      const html = await response.text()
      
      // Check if profile exists
      if (html.includes('User not found') || html.includes('404') || html.includes('Profile not found')) {
        console.log(`Kaggle profile not found for: ${cleanUsername}`)
        return null
      }
      
      console.log(`Kaggle profile exists for: ${cleanUsername}`)
      
      // Extract stats from HTML
      let tier = 'Novice'
      let competitions = 0
      let datasets = 0
      let notebooks = 0
      let discussions = 0
      
      // Enhanced regex patterns for Kaggle
      const tierMatch = html.match(/tier["\s]*:[\s]*"([^"]+)"/gi) ||
                       html.match(/rank["\s]*:[\s]*"([^"]+)"/gi) ||
                       html.match(/(Novice|Contributor|Expert|Master|Grandmaster)/gi)
      
      const competitionsMatch = html.match(/competitions?["\s]*:[\s]*(\d+)/gi) ||
                               html.match(/(\d+)\s*competitions?/gi)
      
      const datasetsMatch = html.match(/datasets?["\s]*:[\s]*(\d+)/gi) ||
                           html.match(/(\d+)\s*datasets?/gi)
      
      const notebooksMatch = html.match(/notebooks?["\s]*:[\s]*(\d+)/gi) ||
                            html.match(/(\d+)\s*notebooks?/gi)
      
      const discussionsMatch = html.match(/discussions?["\s]*:[\s]*(\d+)/gi) ||
                              html.match(/(\d+)\s*discussions?/gi)
      
      if (tierMatch) {
        tier = tierMatch[0].replace(/["\[\]]/g, '').trim()
      }
      if (competitionsMatch && competitionsMatch[0].match(/\d+/)) {
        competitions = parseInt(competitionsMatch[0].match(/\d+/)![0])
      }
      if (datasetsMatch && datasetsMatch[0].match(/\d+/)) {
        datasets = parseInt(datasetsMatch[0].match(/\d+/)![0])
      }
      if (notebooksMatch && notebooksMatch[0].match(/\d+/)) {
        notebooks = parseInt(notebooksMatch[0].match(/\d+/)![0])
      }
      if (discussionsMatch && discussionsMatch[0].match(/\d+/)) {
        discussions = parseInt(discussionsMatch[0].match(/\d+/)![0])
      }
      
      console.log(`Kaggle real-time stats: tier=${tier}, competitions=${competitions}, datasets=${datasets}, notebooks=${notebooks}, discussions=${discussions}`)
      
      const stats: KaggleStats = {
        username: cleanUsername,
        tier: tier,
        competitions: competitions,
        datasets: datasets,
        notebooks: notebooks,
        discussions: discussions,
        profileUrl
      }
      
      console.log(`Kaggle stats for ${cleanUsername}:`, stats)
      return stats
      
    } catch (error) {
      console.log('Kaggle fetch failed:', error)
    }

    // Method 4: Basic profile validation (fallback)
    if (cleanUsername && cleanUsername.length > 0 && /^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
      console.log(`Kaggle: returning basic profile for ${cleanUsername}`)
      
      return {
        username: cleanUsername,
        tier: 'Novice',
        competitions: 0,
        datasets: 0,
        notebooks: 0,
        discussions: 0,
        profileUrl
      }
    }
    
    return null
  } catch (error) {
    console.error("Error fetching Kaggle real-time stats:", error)
    return null
  }
}