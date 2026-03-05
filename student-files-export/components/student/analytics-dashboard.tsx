"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts"
import { TrendingUp, Award, Target, Calendar, Trophy, Star } from "lucide-react"
import type { StudentProfile } from "@/lib/types"

interface AnalyticsDashboardProps {
  student: StudentProfile
}

export function AnalyticsDashboard({ student }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/student/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analytics || !analytics.hasStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analytics Dashboard
          </CardTitle>
          <CardDescription>
            {analytics?.message || 'Connect platforms and sync stats to see detailed analytics'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No analytics data available yet
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { aggregatedStats, skillsAnalysis, progressData, platformStats, achievements, ranking } = analytics

  // Prepare chart data
  const difficultyData = [
    { name: 'Easy', value: skillsAnalysis.difficultyDistribution.easy, color: '#10B981' },
    { name: 'Medium', value: skillsAnalysis.difficultyDistribution.medium, color: '#F59E0B' },
    { name: 'Hard', value: skillsAnalysis.difficultyDistribution.hard, color: '#EF4444' }
  ]

  const platformComparisonData = platformStats.map((platform: any) => ({
    name: platform.platform,
    problems: platform.problems || 0,
    contributions: platform.contributions || 0,
    rating: platform.rating || 0
  }))

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 border-blue-700 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-200">Global Rank</CardTitle>
            <Trophy className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">#{ranking.overallRank}</div>
            <p className="text-xs text-blue-300">
              Overall ranking
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 border-emerald-700 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-200">Problems Rank</CardTitle>
            <Target className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">#{ranking.problemsRank}</div>
            <p className="text-xs text-emerald-300">
              Problems solved ranking
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 border-purple-700 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-200">Contributions Rank</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">#{ranking.contributionsRank}</div>
            <p className="text-xs text-purple-300">
              GitHub contributions ranking
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 border-amber-700 shadow-2xl hover:shadow-amber-500/25 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-200">Activity Level</CardTitle>
            <Star className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{skillsAnalysis.activityLevel}</div>
            <p className="text-xs text-amber-300">
              Current activity level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 border-gray-700 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            Progress Over Time
          </CardTitle>
          <CardDescription className="text-gray-300">
            Your problem-solving progress throughout the year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: "#d1d5db" }} />
              <YAxis tick={{ fill: "#d1d5db" }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#f9fafb"
                }}
              />
              <Line 
                type="monotone" 
                dataKey="problems" 
                stroke="#60a5fa" 
                strokeWidth={3}
                dot={{ fill: '#60a5fa', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Difficulty Distribution */}
        <Card className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 border-indigo-700 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Problem Difficulty Distribution</CardTitle>
            <CardDescription className="text-indigo-200">
              Breakdown of problems solved by difficulty level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f9fafb"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Comparison */}
        <Card className="bg-gradient-to-br from-teal-900 via-cyan-900 to-blue-900 border-teal-700 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Platform Comparison</CardTitle>
            <CardDescription className="text-teal-200">
              Problems solved across different platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={platformComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: "#d1d5db" }} />
                <YAxis tick={{ fill: "#d1d5db" }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f9fafb"
                  }}
                />
                <Bar dataKey="problems" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 border-orange-700 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
          <CardDescription className="text-orange-200">
            Milestones you've unlocked based on your coding activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {achievements.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {achievements.map((achievement: string) => (
                <Badge key={achievement} className="gap-1 bg-orange-600 text-white border-orange-500 shadow-lg">
                  <Award className="h-3 w-3" />
                  {achievement}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-orange-200">
              Keep coding to unlock achievements!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Skills Summary */}
      <Card className="bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 border-violet-700 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white">Skills Summary</CardTitle>
          <CardDescription className="text-violet-200">
            Your programming languages and expertise level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-sm font-medium text-violet-200">Overall Rank:</span>
            <Badge className="ml-2 bg-violet-600 text-white border-violet-500 shadow-lg" variant={
              skillsAnalysis.overallRank === 'Expert' ? 'default' : 'secondary'
            }>
              {skillsAnalysis.overallRank}
            </Badge>
          </div>
          
          {skillsAnalysis.primaryLanguages.length > 0 && (
            <div>
              <span className="text-sm font-medium mb-2 block text-violet-200">Primary Languages:</span>
              <div className="flex flex-wrap gap-2">
                {skillsAnalysis.primaryLanguages.map((lang: string) => (
                  <Badge key={lang} className="bg-fuchsia-600 text-white border-fuchsia-500 shadow-md">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}