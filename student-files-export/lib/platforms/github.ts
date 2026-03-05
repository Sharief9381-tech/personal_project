export interface GitHubStats {
  username: string
  name: string
  bio: string
  avatarUrl: string
  publicRepos: number
  followers: number
  following: number
  totalContributions: number
  repositories: {
    name: string
    description: string
    language: string
    stars: number
    forks: number
    url: string
  }[]
  languages: Record<string, number>
  contributionCalendar: {
    totalContributions: number
    weeks: {
      contributionDays: {
        date: string
        contributionCount: number
      }[]
    }[]
  }
}

export async function fetchGitHubStats(username: string): Promise<GitHubStats | null> {
  try {
    // Clean the username - handle both username and full URL
    let cleanUsername = username.trim()
    
    // Extract username from GitHub URL if provided
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/\?\s]+)/i
    const match = cleanUsername.match(urlPattern)
    if (match) {
      cleanUsername = match[1]
    }
    
    console.log(`Fetching real-time GitHub stats for: ${cleanUsername}`)
    
    // Fetch basic user info with better error handling
    const userResponse = await fetch(`https://api.github.com/users/${cleanUsername}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "CodeTrack/1.0",
        ...(process.env.GITHUB_TOKEN && {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        }),
      },
    })

    if (!userResponse.ok) {
      if (userResponse.status === 404) {
        console.log(`GitHub user "${cleanUsername}" not found`)
        return null // Return null instead of fake data when profile doesn't exist
      } else if (userResponse.status === 401) {
        console.log("GitHub API: Unauthorized - using fallback approach")
        // Try without authentication for public data
        const fallbackResponse = await fetch(`https://api.github.com/users/${cleanUsername}`, {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "Mozilla/5.0 (compatible; CodeTrack/1.0)",
          },
        })
        
        if (!fallbackResponse.ok) {
          console.error("GitHub fallback API error:", fallbackResponse.status, fallbackResponse.statusText)
          return null
        }
        
        const userData = await fallbackResponse.json()
        
        // Return basic stats without repositories for rate limit protection
        return {
          username: cleanUsername,
          name: userData.name || cleanUsername,
          bio: userData.bio || "",
          avatarUrl: userData.avatar_url,
          publicRepos: userData.public_repos,
          followers: userData.followers,
          following: userData.following,
          totalContributions: 0, // Not available without auth
          repositories: [], // Not fetched to avoid rate limits
          languages: {},
          contributionCalendar: {
            totalContributions: 0,
            weeks: [],
          },
        }
      } else {
        console.error("GitHub user API error:", userResponse.status, userResponse.statusText)
        return null
      }
    }

    const userData = await userResponse.json()

    // Fetch repositories with rate limit protection
    let reposData = []
    try {
      const reposResponse = await fetch(
        `https://api.github.com/users/${cleanUsername}/repos?sort=updated&per_page=10`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "CodeTrack/1.0",
            ...(process.env.GITHUB_TOKEN && {
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            }),
          },
        }
      )

      if (reposResponse.ok) {
        reposData = await reposResponse.json()
      } else {
        console.log("GitHub repos API error, skipping repositories")
      }
    } catch (error) {
      console.log("Error fetching repositories, continuing without them")
    }

    // Calculate language statistics
    const languages: Record<string, number> = {}
    for (const repo of reposData) {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1
      }
    }

    // Fetch contribution data using GraphQL (if token available)
    let contributionCalendar = {
      totalContributions: 0,
      weeks: [] as { contributionDays: { date: string; contributionCount: number }[] }[],
    }

    if (process.env.GITHUB_TOKEN) {
      try {
        const graphqlResponse = await fetch("https://api.github.com/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "CodeTrack/1.0",
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          },
          body: JSON.stringify({
            query: `
              query($username: String!) {
                user(login: $username) {
                  contributionsCollection {
                    contributionCalendar {
                      totalContributions
                      weeks {
                        contributionDays {
                          date
                          contributionCount
                        }
                      }
                    }
                  }
                }
              }
            `,
            variables: { username: cleanUsername },
          }),
        })

        if (graphqlResponse.ok) {
          const graphqlData = await graphqlResponse.json()
          if (graphqlData.data?.user?.contributionsCollection?.contributionCalendar) {
            contributionCalendar = graphqlData.data.user.contributionsCollection.contributionCalendar
          }
        }
      } catch (error) {
        console.log("GraphQL contributions fetch failed, using fallback")
      }
    }

    return {
      username: cleanUsername,
      name: userData.name || cleanUsername,
      bio: userData.bio || "",
      avatarUrl: userData.avatar_url,
      publicRepos: userData.public_repos,
      followers: userData.followers,
      following: userData.following,
      totalContributions: contributionCalendar.totalContributions,
      repositories: reposData.map((repo: {
        name: string
        description: string
        language: string
        stargazers_count: number
        forks_count: number
        html_url: string
      }) => ({
        name: repo.name,
        description: repo.description || "",
        language: repo.language || "Unknown",
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        url: repo.html_url,
      })),
      languages,
      contributionCalendar,
    }
  } catch (error) {
    console.error("Error fetching GitHub stats:", error)
    return null
  }
}
