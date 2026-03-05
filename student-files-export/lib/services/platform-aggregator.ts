import { 
  fetchLeetCodeStats, 
  fetchGitHubStats, 
  fetchCodeforcesStats, 
  fetchCodeChefStats,
  fetchHackerRankStats
} from '@/lib/platforms'

export interface AggregatedStats {
  totalProblems: number
  githubContributions: number
  contestsAttended: number
  currentRating: number
  platformBreakdown: {
    leetcode: {
      problems: number
      easy: number
      medium: number
      hard: number
      rating: number
      contributionPoints: number
      reputation: number
    }
    github: {
      contributions: number
      repositories: number
      followers: number
      following: number
      languages: Record<string, number>
    }
    codeforces: {
      problems: number
      rating: number
      contests: number
      maxRating: number
      rank: string
      contribution: number
    }
    codechef: {
      problems: number
      rating: number
      stars: string
      highestRating: number
      globalRank: number
    }
    hackerrank: {
      badges: number
      certifications: number
      skills: number
      level: number
      totalScore: number
      globalRank: number
    }
  }
  skillsAnalysis: {
    primaryLanguages: string[]
    difficultyDistribution: {
      easy: number
      medium: number
      hard: number
    }
    activityLevel: 'Low' | 'Medium' | 'High' | 'Very High'
    overallRank: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  }
  lastUpdated: Date
}

export class PlatformAggregator {
  static async aggregateUserStats(linkedPlatforms: Record<string, string>): Promise<AggregatedStats> {
    const platformBreakdown = {
      leetcode: { problems: 0, easy: 0, medium: 0, hard: 0, rating: 0, contributionPoints: 0, reputation: 0 },
      github: { contributions: 0, repositories: 0, followers: 0, following: 0, languages: {} },
      codeforces: { problems: 0, rating: 0, contests: 0, maxRating: 0, rank: 'unrated', contribution: 0 },
      codechef: { problems: 0, rating: 0, stars: '1*', highestRating: 0, globalRank: 0 },
      hackerrank: { badges: 0, certifications: 0, skills: 0, level: 0, totalScore: 0, globalRank: 0 }
    }

    let totalProblems = 0
    let githubContributions = 0
    let contestsAttended = 0
    let currentRating = 0
    const primaryLanguages: string[] = []

    // Fetch and aggregate LeetCode stats
    if (linkedPlatforms.leetcode) {
      try {
        const leetcodeStats = await fetchLeetCodeStats(linkedPlatforms.leetcode)
        if (leetcodeStats) {
          platformBreakdown.leetcode = {
            problems: leetcodeStats.totalSolved || 0,
            easy: leetcodeStats.easySolved || 0,
            medium: leetcodeStats.mediumSolved || 0,
            hard: leetcodeStats.hardSolved || 0,
            rating: leetcodeStats.ranking || 0,
            contributionPoints: leetcodeStats.contributionPoints || 0,
            reputation: leetcodeStats.reputation || 0
          }
          totalProblems += leetcodeStats.totalSolved || 0
          // Note: LeetCode ranking is not a rating system, so we don't include it in currentRating
          // LeetCode doesn't provide contest rating in their public API
        }
      } catch (error) {
        console.error('Error fetching LeetCode stats:', error)
      }
    }

    // Fetch and aggregate GitHub stats
    if (linkedPlatforms.github) {
      try {
        const githubStats = await fetchGitHubStats(linkedPlatforms.github)
        if (githubStats) {
          platformBreakdown.github = {
            contributions: githubStats.totalContributions || 0,
            repositories: githubStats.publicRepos || 0,
            followers: githubStats.followers || 0,
            following: githubStats.following || 0,
            languages: githubStats.languages || {}
          }
          githubContributions = githubStats.totalContributions || 0
          
          // Extract primary languages
          const languages = Object.entries(githubStats.languages || {})
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .slice(0, 3)
            .map(([lang]) => lang)
          primaryLanguages.push(...languages)
        }
      } catch (error) {
        console.error('Error fetching GitHub stats:', error)
      }
    }

    // Fetch and aggregate Codeforces stats
    if (linkedPlatforms.codeforces) {
      try {
        const codeforcesStats = await fetchCodeforcesStats(linkedPlatforms.codeforces)
        if (codeforcesStats) {
          platformBreakdown.codeforces = {
            problems: codeforcesStats.problemsSolved || 0,
            rating: codeforcesStats.rating || 0,
            contests: codeforcesStats.contests?.length || 0,
            maxRating: codeforcesStats.maxRating || codeforcesStats.rating || 0,
            rank: codeforcesStats.rank || 'unrated',
            contribution: codeforcesStats.contribution || 0
          }
          totalProblems += codeforcesStats.problemsSolved || 0
          contestsAttended += codeforcesStats.contests?.length || 0
          // Use maxRating instead of current rating
          currentRating = Math.max(currentRating, codeforcesStats.maxRating || codeforcesStats.rating || 0)
        }
      } catch (error) {
        console.error('Error fetching Codeforces stats:', error)
      }
    }

    // Fetch and aggregate CodeChef stats
    if (linkedPlatforms.codechef) {
      try {
        const codechefStats = await fetchCodeChefStats(linkedPlatforms.codechef)
        if (codechefStats) {
          platformBreakdown.codechef = {
            problems: codechefStats.problemsSolved,
            rating: codechefStats.currentRating,
            stars: codechefStats.stars,
            highestRating: codechefStats.highestRating,
            globalRank: codechefStats.globalRank
          }
          totalProblems += codechefStats.problemsSolved
          // Use highestRating instead of currentRating
          currentRating = Math.max(currentRating, codechefStats.highestRating || codechefStats.currentRating)
        }
      } catch (error) {
        console.error('Error fetching CodeChef stats:', error)
      }
    }

    // Fetch and aggregate HackerRank stats
    if (linkedPlatforms.hackerrank) {
      try {
        const hackerrankStats = await fetchHackerRankStats(linkedPlatforms.hackerrank)
        if (hackerrankStats) {
          platformBreakdown.hackerrank = {
            badges: hackerrankStats.badges.length,
            certifications: hackerrankStats.certifications.length,
            skills: hackerrankStats.skills.length,
            level: hackerrankStats.level,
            totalScore: hackerrankStats.totalScore,
            globalRank: hackerrankStats.globalRank
          }
          // HackerRank doesn't have traditional "problems solved" but we can count skills/challenges
          totalProblems += hackerrankStats.skills.length
          currentRating = Math.max(currentRating, hackerrankStats.totalScore)
        }
      } catch (error) {
        console.error('Error fetching HackerRank stats:', error)
      }
    }

    // Calculate skills analysis
    const skillsAnalysis = this.calculateSkillsAnalysis(
      totalProblems,
      githubContributions,
      contestsAttended,
      currentRating,
      platformBreakdown,
      primaryLanguages
    )

    return {
      totalProblems,
      githubContributions,
      contestsAttended,
      currentRating,
      platformBreakdown,
      skillsAnalysis,
      lastUpdated: new Date()
    }
  }

  private static calculateSkillsAnalysis(
    totalProblems: number,
    githubContributions: number,
    contestsAttended: number,
    currentRating: number,
    platformBreakdown: any,
    primaryLanguages: string[]
  ) {
    // Calculate difficulty distribution
    const difficultyDistribution = {
      easy: platformBreakdown.leetcode.easy,
      medium: platformBreakdown.leetcode.medium,
      hard: platformBreakdown.leetcode.hard
    }

    // Calculate activity level
    const totalActivity = totalProblems + Math.floor(githubContributions / 10) + (contestsAttended * 5)
    let activityLevel: 'Low' | 'Medium' | 'High' | 'Very High'
    
    if (totalActivity < 50) activityLevel = 'Low'
    else if (totalActivity < 200) activityLevel = 'Medium'
    else if (totalActivity < 500) activityLevel = 'High'
    else activityLevel = 'Very High'

    // Calculate overall rank
    let overallRank: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
    
    if (totalProblems < 50 && currentRating < 1200) overallRank = 'Beginner'
    else if (totalProblems < 200 && currentRating < 1600) overallRank = 'Intermediate'
    else if (totalProblems < 500 && currentRating < 2000) overallRank = 'Advanced'
    else overallRank = 'Expert'

    return {
      primaryLanguages: [...new Set(primaryLanguages)].slice(0, 5),
      difficultyDistribution,
      activityLevel,
      overallRank
    }
  }

  static async updateUserAggregatedStats(userId: string, linkedPlatforms: Record<string, string>) {
    try {
      const aggregatedStats = await this.aggregateUserStats(linkedPlatforms)
      
      // Update user's aggregated stats in database
      const { updateUser } = await import('@/lib/auth')
      await updateUser(userId, {
        aggregatedStats,
        lastStatsUpdate: new Date()
      })

      return aggregatedStats
    } catch (error) {
      console.error('Error updating aggregated stats:', error)
      throw error
    }
  }

  static calculateGlobalRanking(userStats: AggregatedStats, allUsersStats: AggregatedStats[]): {
    problemsRank: number
    contributionsRank: number
    contestsRank: number
    ratingRank: number
    overallRank: number
  } {
    const sortedByProblems = allUsersStats.sort((a, b) => b.totalProblems - a.totalProblems)
    const sortedByContributions = allUsersStats.sort((a, b) => b.githubContributions - a.githubContributions)
    const sortedByContests = allUsersStats.sort((a, b) => b.contestsAttended - a.contestsAttended)
    const sortedByRating = allUsersStats.sort((a, b) => b.currentRating - a.currentRating)
    
    // Calculate overall score for ranking
    const calculateOverallScore = (stats: AggregatedStats) => {
      return (stats.totalProblems * 2) + 
             (Math.floor(stats.githubContributions / 10)) + 
             (stats.contestsAttended * 5) + 
             (Math.floor(stats.currentRating / 100))
    }
    
    const sortedByOverall = allUsersStats.sort((a, b) => calculateOverallScore(b) - calculateOverallScore(a))

    return {
      problemsRank: sortedByProblems.findIndex(s => s === userStats) + 1,
      contributionsRank: sortedByContributions.findIndex(s => s === userStats) + 1,
      contestsRank: sortedByContests.findIndex(s => s === userStats) + 1,
      ratingRank: sortedByRating.findIndex(s => s === userStats) + 1,
      overallRank: sortedByOverall.findIndex(s => s === userStats) + 1
    }
  }
}