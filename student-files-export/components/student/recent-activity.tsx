"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Code2, GitCommit, Trophy } from "lucide-react"
import type { StudentProfile } from "@/lib/types"

interface RecentActivityProps {
  student: StudentProfile
}

export function RecentActivity({ student }: RecentActivityProps) {
  // Sample activities - in production, this would come from actual platform data
  const activities = [
    {
      id: 1,
      type: "problem",
      title: "Solved Two Sum",
      platform: "LeetCode",
      time: "2 hours ago",
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      id: 2,
      type: "commit",
      title: "Pushed to portfolio",
      platform: "GitHub",
      time: "5 hours ago",
      icon: GitCommit,
      color: "text-chart-2",
    },
    {
      id: 3,
      type: "contest",
      title: "Participated in Weekly Contest",
      platform: "Codeforces",
      time: "1 day ago",
      icon: Trophy,
      color: "text-chart-3",
    },
    {
      id: 4,
      type: "problem",
      title: "Solved Binary Tree Inorder",
      platform: "LeetCode",
      time: "2 days ago",
      icon: Code2,
      color: "text-chart-1",
    },
  ]

  return (
    <Card className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 border-gray-700 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-white text-xl font-bold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {activities.map((activity) => {
          const Icon = activity.icon
          return (
            <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:bg-gray-800/70 transition-all duration-200">
              <div className={`mt-1 p-2 rounded-lg bg-gray-700 ${activity.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-white">{activity.title}</p>
                <p className="text-xs text-gray-400">
                  <span className="font-medium text-blue-400">{activity.platform}</span> • {activity.time}
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
