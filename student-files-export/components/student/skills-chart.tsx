"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import type { StudentProfile } from "@/lib/types"

interface SkillsChartProps {
  student: StudentProfile
}

export function SkillsChart({ student }: SkillsChartProps) {
  const stats = student.stats || {
    totalProblems: 0,
    easyProblems: 0,
    mediumProblems: 0,
    hardProblems: 0,
    githubContributions: 0,
    contestsParticipated: 0,
    rating: 0,
  }

  const data = [
    {
      name: "Easy",
      value: stats.easyProblems,
      fill: "#00d4aa", // teal-400
    },
    {
      name: "Medium", 
      value: stats.mediumProblems,
      fill: "#fbbf24", // yellow-400
    },
    {
      name: "Hard",
      value: stats.hardProblems,
      fill: "#fb7185", // rose-400
    },
    {
      name: "Contests",
      value: stats.contestsParticipated,
      fill: "#60a5fa", // blue-400
    },
    {
      name: "Contrib",
      value: Math.floor(stats.githubContributions / 10), // Scale down for better visualization
      fill: "#a78bfa", // violet-400
    },
  ]

  return (
    <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-white font-bold text-lg">Skill Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#374151" opacity={0.8} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: "#d1d5db", fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: "#6b7280", strokeWidth: 1 }}
              />
              <YAxis 
                tick={{ fill: "#d1d5db", fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: "#6b7280", strokeWidth: 1 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#f9fafb",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
                }}
                cursor={{ fill: "rgba(107, 114, 128, 0.1)" }}
              />
              <Bar 
                dataKey="value" 
                radius={[6, 6, 0, 0]}
                stroke="#1f2937"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
