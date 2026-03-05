"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Plus, Code, Trophy, GitBranch, Check, Trash2 } from "lucide-react"
import type { StudentProfile } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface PlatformsManagerProps {
  student: StudentProfile
}

const platforms = [
  {
    id: "leetcode",
    name: "LeetCode",
    description: "Practice coding problems and prepare for interviews",
    color: "#FFA116",
    url: "https://leetcode.com",
    features: ["Problem Solving", "Interview Prep", "Contests"],
    icon: Code,
    instructions: "Enter your LeetCode username or profile URL",
    placeholder: "e.g., john_doe",
    isCustom: false,
  },
  {
    id: "github",
    name: "GitHub",
    description: "Showcase your projects and contributions",
    color: "#238636",
    url: "https://github.com",
    features: ["Projects", "Contributions", "Collaboration"],
    icon: GitBranch,
    instructions: "Enter your GitHub username or profile URL",
    placeholder: "e.g., johndoe",
    isCustom: false,
  },
  {
    id: "codeforces",
    name: "Codeforces",
    description: "Competitive programming and algorithmic contests",
    color: "#1890FF",
    url: "https://codeforces.com",
    features: ["Competitive", "Contests", "Rating"],
    icon: Trophy,
    instructions: "Enter your Codeforces handle or profile URL",
    placeholder: "e.g., tourist",
    isCustom: false,
  },
  {
    id: "codechef",
    name: "CodeChef",
    description: "Monthly contests and practice problems",
    color: "#5B4638",
    url: "https://codechef.com",
    features: ["Contests", "Practice", "Learning"],
    icon: Code,
    instructions: "Enter your CodeChef username or profile URL",
    placeholder: "e.g., admin",
    isCustom: false,
  },
]

export function PlatformsManager({ student }: PlatformsManagerProps) {
  const router = useRouter()
  const [linkedPlatforms] = useState<Record<string, string>>(() => {
    const studentPlatforms = student.linkedPlatforms || {}
    return Object.fromEntries(
      Object.entries(studentPlatforms).map(([key, value]) => {
        // Extract username from platform data structure
        let username = ''
        if (value?.username) {
          // Standard structure: { username: "user", linkedAt: Date, isActive: true }
          username = value.username
        } else if (typeof value === 'string') {
          // Fallback: direct string username
          username = value
        }
        
        // Clean username (remove any URL parts or path segments)
        username = username.replace(/^https?:\/\/[^\/]+\//, '') // Remove full URL prefix
                          .replace(/^u\//, '')                    // Remove LeetCode /u/ prefix
                          .replace(/^profile\//, '')              // Remove HackerRank /profile/ prefix
                          .replace(/^users\//, '')                // Remove CodeChef /users/ prefix
                          .replace(/^@/, '')                      // Remove @ prefix if present
                          .replace(/\/$/, '')                     // Remove trailing slash
        
        return [key, username]
      })
    )
  })

  const handleUnlinkPlatform = async (platformId: string, platformName: string) => {
    try {
      const response = await fetch("/api/platforms/link", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform: platformId,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success(`Successfully unlinked ${platformName}!`)
        router.refresh()
      } else {
        toast.error(data.error || "Failed to unlink platform")
      }
    } catch (error) {
      console.error("Unlink error:", error)
      toast.error("Failed to unlink platform. Please try again.")
    }
  }

  const linkedPlatformsList = platforms.filter(p => linkedPlatforms[p.id])

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <Plus className="h-4 w-4" />
          Add Platform
        </Button>
      </div>

      {linkedPlatformsList.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {linkedPlatformsList.map((platform) => {
            const linkedUsername = linkedPlatforms[platform.id]

            return (
              <Card key={platform.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 shadow-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-gray-500 relative h-80">
                <CardContent className="p-6 pb-16 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div 
                        className="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                        style={{ backgroundColor: platform.color + '20', border: `2px solid ${platform.color}` }}
                      >
                        <platform.icon 
                          className="h-6 w-6" 
                          style={{ color: platform.color }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-lg text-white truncate">{platform.name}</h4>
                        <p className="text-sm text-gray-400 truncate">@{linkedUsername}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 text-center py-6">
                    <div className="text-lg text-green-400 font-bold mb-2">✅ Platform Connected</div>
                    <div className="text-sm text-gray-400">Ready to sync data</div>
                  </div>
                </CardContent>

                {/* Bottom section with View Details link, Verified badge, and Unlink button */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <a
                      href={`${platform.url}/${linkedUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200"
                    >
                      View Details
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <div className="flex-1 flex justify-center">
                      <Badge className="text-xs gap-1 bg-green-600 hover:bg-green-700 text-white border-green-500 shadow-lg">
                        <Check className="h-3 w-3" />
                        Verified
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnlinkPlatform(platform.id, platform.name)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2"
                      title={`Unlink ${platform.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 shadow-2xl">
          <CardContent className="text-center py-16">
            <div className="mx-auto w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-6 border-2 border-gray-600">
              <Code className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">No Platforms Connected</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Connect your coding platforms to start tracking your progress and showcase your skills across different platforms
            </p>
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="h-4 w-4" />
              Add Your First Platform
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}