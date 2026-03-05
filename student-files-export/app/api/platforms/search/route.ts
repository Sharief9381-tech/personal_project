import { NextRequest, NextResponse } from "next/server"

interface SearchResult {
  title: string
  url: string
  snippet: string
}

interface Platform {
  id: string
  name: string
  description: string
  url: string
  icon: string
  placeholder: string
  example: string
  isCustom: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      )
    }

    // Use web search to find coding platforms
    const searchResponse = await fetch('https://api.search.brave.com/res/v1/web/search', {
      method: 'GET',
      headers: {
        'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY || '',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!searchResponse.ok) {
      // Fallback to mock results if search API fails
      console.log('Search API failed, using mock results')
      return getMockPlatforms(query)
    }

    const searchData = await searchResponse.json()
    const platforms = await processPlatformResults(searchData.web?.results || [], query)

    return NextResponse.json({
      platforms,
      query,
      total: platforms.length
    })

  } catch (error) {
    console.error("Platform search error:", error)
    
    // Return mock results as fallback
    return getMockPlatforms(await request.json().then(data => data.query))
  }
}

async function processPlatformResults(results: SearchResult[], query: string): Promise<Platform[]> {
  const platforms: Platform[] = []
  const seenDomains = new Set<string>()

  // Known coding platform patterns
  const codingPlatformPatterns = [
    /coding|programming|algorithm|contest|competitive/i,
    /leetcode|codeforces|codechef|hackerrank|hackerearth|atcoder|topcoder|spoj/i,
    /judge|oj|online.*judge/i,
    /practice.*problem|problem.*solving/i
  ]

  for (const result of results.slice(0, 10)) {
    try {
      const url = new URL(result.url)
      const domain = url.hostname.replace('www.', '')
      
      // Skip if we've already seen this domain
      if (seenDomains.has(domain)) continue
      
      // Check if this looks like a coding platform
      const isCodingPlatform = codingPlatformPatterns.some(pattern => 
        pattern.test(result.title + ' ' + result.snippet + ' ' + domain)
      )

      if (isCodingPlatform) {
        seenDomains.add(domain)
        
        // Extract platform name from title or domain
        let platformName = result.title.split('|')[0].split('-')[0].trim()
        if (platformName.length > 50) {
          platformName = domain.split('.')[0]
        }
        
        // Clean up the name
        platformName = platformName.replace(/\b(home|official|website|platform)\b/gi, '').trim()
        
        const platform: Platform = {
          id: domain.replace(/[^a-z0-9]/g, ''),
          name: platformName || domain,
          description: result.snippet.slice(0, 100) + (result.snippet.length > 100 ? '...' : ''),
          url: `https://${domain}`,
          icon: 'Globe', // Will be rendered as Globe icon for custom platforms
          placeholder: `Enter your ${platformName} username`,
          example: "e.g., username",
          isCustom: true
        }
        
        platforms.push(platform)
      }
    } catch (error) {
      console.log('Error processing result:', error)
      continue
    }
  }

  return platforms
}

function getMockPlatforms(query: string): NextResponse {
  // Mock platforms for common searches when API is not available
  const mockPlatforms: { [key: string]: Platform[] } = {
    'atcoder': [{
      id: 'atcoder',
      name: 'AtCoder',
      description: 'AtCoder is a programming contest site for anyone from beginners to experts.',
      url: 'https://atcoder.jp',
      icon: 'Globe',
      placeholder: 'Enter your AtCoder username',
      example: 'e.g., tourist',
      isCustom: true
    }],
    'topcoder': [{
      id: 'topcoder',
      name: 'TopCoder',
      description: 'TopCoder is a crowdsourcing marketplace that connects businesses with hard-to-find expertise.',
      url: 'https://topcoder.com',
      icon: 'Globe',
      placeholder: 'Enter your TopCoder handle',
      example: 'e.g., petr',
      isCustom: true
    }],
    'spoj': [{
      id: 'spoj',
      name: 'SPOJ',
      description: 'Sphere Online Judge (SPOJ) is an online judge system with over 315,000 registered users.',
      url: 'https://spoj.com',
      icon: 'Globe',
      placeholder: 'Enter your SPOJ username',
      example: 'e.g., username',
      isCustom: true
    }],
    'cses': [{
      id: 'cses',
      name: 'CSES',
      description: 'CSES Problem Set contains a collection of competitive programming practice problems.',
      url: 'https://cses.fi',
      icon: 'Globe',
      placeholder: 'Enter your CSES username',
      example: 'e.g., username',
      isCustom: true
    }],
    'kattis': [{
      id: 'kattis',
      name: 'Kattis',
      description: 'Kattis is a programming contest platform used in ICPC and other competitions.',
      url: 'https://open.kattis.com',
      icon: 'Globe',
      placeholder: 'Enter your Kattis username',
      example: 'e.g., username',
      isCustom: true
    }],
    'usaco': [{
      id: 'usaco',
      name: 'USACO',
      description: 'USA Computing Olympiad - training platform for competitive programming.',
      url: 'http://www.usaco.org',
      icon: 'Globe',
      placeholder: 'Enter your USACO username',
      example: 'e.g., username',
      isCustom: true
    }],
    'dmoj': [{
      id: 'dmoj',
      name: 'DMOJ',
      description: 'Don Mills Online Judge - modern competitive programming platform.',
      url: 'https://dmoj.ca',
      icon: 'Globe',
      placeholder: 'Enter your DMOJ username',
      example: 'e.g., username',
      isCustom: true
    }],
    'timus': [{
      id: 'timus',
      name: 'Timus',
      description: 'Timus Online Judge from Ural Federal University.',
      url: 'https://acm.timus.ru',
      icon: 'Globe',
      placeholder: 'Enter your Timus username',
      example: 'e.g., username',
      isCustom: true
    }],
    'uva': [{
      id: 'uva',
      name: 'UVa Online Judge',
      description: 'University of Valladolid Online Judge with thousands of problems.',
      url: 'https://onlinejudge.org',
      icon: 'Globe',
      placeholder: 'Enter your UVa username',
      example: 'e.g., username',
      isCustom: true
    }],
    'projecteuler': [{
      id: 'projecteuler',
      name: 'Project Euler',
      description: 'Project Euler is a series of challenging mathematical/computer programming problems.',
      url: 'https://projecteuler.net',
      icon: 'Globe',
      placeholder: 'Enter your Project Euler username',
      example: 'e.g., username',
      isCustom: true
    }]
  }

  const queryLower = query.toLowerCase()
  let platforms: Platform[] = []

  // Find matching mock platforms
  for (const [key, platformList] of Object.entries(mockPlatforms)) {
    if (queryLower.includes(key) || key.includes(queryLower)) {
      platforms.push(...platformList)
    }
  }

  // If no specific matches, return a generic platform based on the search
  if (platforms.length === 0 && query.trim()) {
    const cleanQuery = query.replace(/coding|platform|programming/gi, '').trim()
    if (cleanQuery) {
      platforms.push({
        id: cleanQuery.replace(/[^a-z0-9]/gi, '').toLowerCase(),
        name: cleanQuery,
        description: `${cleanQuery} - Custom coding platform`,
        url: `https://${cleanQuery.toLowerCase().replace(/\s+/g, '')}.com`,
        icon: 'Globe',
        placeholder: `Enter your ${cleanQuery} username`,
        example: 'e.g., username',
        isCustom: true
      })
    }
  }

  return NextResponse.json({
    platforms,
    query,
    total: platforms.length,
    note: "Using mock results - search API not configured"
  })
}