export interface ExercismStats {
  username: string
  completedExercises: number
  languages: string[]
  reputation: number
  badges: number
  profileUrl: string
}

export async function fetchExercismStats(username: string): Promise<ExercismStats | null> {
  try {
    // Clean the username - handle both username and full URL
    let cleanUsername = username.trim()
    
    // Extract username from Exercism URL if provided
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?exercism\.org\/profiles\/([^\/\?\s]+)/i
    const match = cleanUsername.match(urlPattern)
    if (match) {
      cleanUsername = match[1]
    }
    
    console.log(`Fetching real-time Exercism stats for: ${cleanUsername}`)
    console.log(`Fetching real-time Exercism stats for: ${cleanUsername}`)
    
    const profileUrl = `https://exercism.org/profiles/${cleanUsername}`
    
    // Method 1: Try third-party APIs
    const thirdPartyApis = [
      `https://competitive-coding-api.herokuapp.com/api/exercism/${cleanUsername}`,
      `https://cp-api.vercel.app/exercism/${cleanUsername}`,
    ]

    for (const apiUrl of thirdPartyApis) {
      try {
        console.log(`Trying Exercism third-party API: ${apiUrl}`)
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; StatsBot/1.0)',
          },
          signal: AbortSignal.timeout(8000),
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`Exercism third-party API response:`, data)
          
          if (data && !data.error && data.success !== false) {
            return {
              username: cleanUsername,
              completedExercises: data.completed_exercises || data.exercises || 0,
              languages: data.languages || [],
              reputation: data.reputation || 0,
              badges: data.badges || 0,
              profileUrl
            }
          }
        }
      } catch (apiError) {
        console.log(`Exercism third-party API ${apiUrl} failed:`, apiError)
        continue
      }
    }
    
    // Method 2: Try Exercism profile scraping
    try {
      const response = await fetch(profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(15000)
      })
      
      if (!response.ok) {
        console.log(`Exercism profile not found for ${cleanUsername}`)
        return null
      }
      
      const html = await response.text()
      
      // Check if profile exists
      if (html.includes('User not found') || html.includes('404') || html.includes('Profile not found')) {
        console.log(`Exercism profile not found for: ${cleanUsername}`)
        return null
      }
      
      console.log(`Exercism profile exists for: ${cleanUsername}`)
      
      // Extract stats from HTML
      let completedExercises = 0
      let languages: string[] = []
      let reputation = 0
      let badges = 0
      
      // Enhanced regex patterns for Exercism
      const exercisesMatch = html.match(/exercises?[_\s]*completed["\s]*:[\s]*(\d+)/gi) ||
                            html.match(/completed["\s]*:[\s]*(\d+)/gi) ||
                            html.match(/(\d+)\s*exercises?\s*completed/gi)
      
      const reputationMatch = html.match(/reputation["\s]*:[\s]*(\d+)/gi) ||
                             html.match(/(\d+)\s*reputation/gi)
      
      const badgesMatch = html.match(/badges?["\s]*:[\s]*(\d+)/gi) ||
                         html.match(/(\d+)\s*badges?/gi)
      
      // Extract languages
      const languageMatches = html.match(/language[s]?["\s]*:[\s]*\[(.*?)\]/gi) ||
                             html.match(/"language":\s*"([^"]+)"/gi)
      
      if (exercisesMatch && exercisesMatch[0].match(/\d+/)) {
        completedExercises = parseInt(exercisesMatch[0].match(/\d+/)![0])
      }
      if (reputationMatch && reputationMatch[0].match(/\d+/)) {
        reputation = parseInt(reputationMatch[0].match(/\d+/)![0])
      }
      if (badgesMatch && badgesMatch[0].match(/\d+/)) {
        badges = parseInt(badgesMatch[0].match(/\d+/)![0])
      }
      if (languageMatches) {
        languages = languageMatches.map(match => match.replace(/["\[\]]/g, '').trim()).filter(l => l.length > 0)
      }
      
      console.log(`Exercism real-time stats: exercises=${completedExercises}, languages=${languages.length}, reputation=${reputation}, badges=${badges}`)
      
      const stats: ExercismStats = {
        username: cleanUsername,
        completedExercises: completedExercises,
        languages: languages,
        reputation: reputation,
        badges: badges,
        profileUrl
      }
      
      console.log(`Exercism stats for ${cleanUsername}:`, stats)
      return stats
      
    } catch (error) {
      console.log('Exercism fetch failed:', error)
    }

    // Method 3: Basic profile validation (fallback)
    if (cleanUsername && cleanUsername.length > 0 && /^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
      console.log(`Exercism: returning basic profile for ${cleanUsername}`)
      
      return {
        username: cleanUsername,
        completedExercises: 0,
        languages: [],
        reputation: 0,
        badges: 0,
        profileUrl
      }
    }
    
    return null
  } catch (error) {
    console.error("Error fetching Exercism real-time stats:", error)
    return null
  }
}