"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ExternalLink, Link2, Loader2, RefreshCw } from "lucide-react"
import type { StudentProfile } from "@/lib/types"
import type { LeetCodeStats } from "@/lib/platforms/leetcode"
import type { GitHubStats } from "@/lib/platforms/github"
import type { CodeforcesStats } from "@/lib/platforms/codeforces"
import type { CodeChefStats } from "@/lib/platforms/codechef"

interface PlatformCardsProps {
  student: StudentProfile
}

type PlatformStats = {
  leetcode: LeetCodeStats | null
  github: GitHubStats | null
  codeforces: CodeforcesStats | null
  codechef: CodeChefStats | null
}

const platforms = [
  {
    id: "leetcode",
    name: "LeetCode",
    color: "#FFA116",
    url: "https://leetcode.com",
  },
  {
    id: "github",
    name: "GitHub",
    color: "#238636",
    url: "https://github.com",
  },
  {
    id: "codeforces",
    name: "Codeforces",
    color: "#1890FF",
    url: "https://codeforces.com",
  },
  {
    id: "codechef",
    name: "CodeChef",
    color: "#5B4638",
    url: "https://codechef.com",
  },
]

export function PlatformCards({ student }: PlatformCardsProps) {
  const [stats, setStats] = useState<PlatformStats>({
    leetcode: null,
    github: null,
    codeforces: null,
    codechef: null,
  })
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkingPlatform, setLinkingPlatform] = useState("")
  const [linkUsername, setLinkUsername] = useState("")
  const [linkLoading, setLinkLoading] = useState(false)

  const linkedPlatforms = student.linkedPlatforms || {}

  const fetchPlatformStats = async (platform: string, username: string) => {
    setLoading((prev) => ({ ...prev, [platform]: true }))
    try {
      const response = await fetch(
        `/api/platforms?platform=${platform}&username=${username}`
      )
      if (response.ok) {
        const data = await response.json()
        setStats((prev) => ({ ...prev, [platform]: data.stats }))
      }
    } catch (error) {
      console.error(`Error fetching ${platform} stats:`, error)
    } finally {
      setLoading((prev) => ({ ...prev, [platform]: false }))
    }
  }

  useEffect(() => {
    for (const [platform, username] of Object.entries(linkedPlatforms)) {
      if (username) {
        fetchPlatformStats(platform, username)
      }
    }
  }, [])

  const handleLinkPlatform = async () => {
    if (!linkingPlatform || !linkUsername) return

    setLinkLoading(true)
    try {
      const response = await fetch("/api/student/link-platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: linkingPlatform,
          username: linkUsername,
        }),
      })

      if (response.ok) {
        await fetchPlatformStats(linkingPlatform, linkUsername)
        setLinkDialogOpen(false)
        setLinkUsername("")
        window.location.reload()
      }
    } catch (error) {
      console.error("Error linking platform:", error)
    } finally {
      setLinkLoading(false)
    }
  }

  const openLinkDialog = (platformId: string) => {
    setLinkingPlatform(platformId)
    setLinkDialogOpen(true)
  }

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Connected Platforms</CardTitle>
        <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Link2 className="h-4 w-4" />
              Link Platform
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Link a Platform</DialogTitle>
              <DialogDescription>
                Connect your coding platform account to track your progress
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                {platforms.map((platform) => (
                  <Button
                    key={platform.id}
                    variant={linkingPlatform === platform.id ? "default" : "outline"}
                    className="justify-start gap-2"
                    onClick={() => setLinkingPlatform(platform.id)}
                  >
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: platform.color }}
                    />
                    {platform.name}
                  </Button>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder={`Your ${platforms.find((p) => p.id === linkingPlatform)?.name || "platform"} username`}
                  value={linkUsername}
                  onChange={(e) => setLinkUsername(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleLinkPlatform}
                disabled={!linkingPlatform || !linkUsername || linkLoading}
              >
                {linkLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Link Account"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {platforms.map((platform) => {
          const username = linkedPlatforms[platform.id as keyof typeof linkedPlatforms]
          const platformStats = stats[platform.id as keyof PlatformStats]
          const isLoading = loading[platform.id]

          return (
            <Card
              key={platform.id}
              className="border border-border bg-secondary/30"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: platform.color }}
                    />
                    <span className="font-medium text-foreground">
                      {platform.name}
                    </span>
                  </div>
                  {username ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => fetchPlatformStats(platform.id, username)}
                        disabled={isLoading}
                      >
                        <RefreshCw
                          className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                        />
                      </Button>
                      <a
                        href={`${platform.url}/${username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openLinkDialog(platform.id)}
                    >
                      Connect
                    </Button>
                  )}
                </div>

                {username ? (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">
                      @{username}
                    </p>
                    {isLoading ? (
                      <div className="mt-2 flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : platformStats ? (
                      <div className="mt-3 space-y-2">
                        {platform.id === "leetcode" && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Problems Solved
                              </span>
                              <span className="font-medium text-foreground">
                                {(platformStats as LeetCodeStats).totalSolved}
                              </span>
                            </div>
                            <div className="flex gap-2 text-xs">
                              <span className="text-green-500">
                                Easy: {(platformStats as LeetCodeStats).easySolved}
                              </span>
                              <span className="text-yellow-500">
                                Med: {(platformStats as LeetCodeStats).mediumSolved}
                              </span>
                              <span className="text-red-500">
                                Hard: {(platformStats as LeetCodeStats).hardSolved}
                              </span>
                            </div>
                          </>
                        )}
                        {platform.id === "github" && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Contributions
                              </span>
                              <span className="font-medium text-foreground">
                                {(platformStats as GitHubStats).totalContributions}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Repositories
                              </span>
                              <span className="font-medium text-foreground">
                                {(platformStats as GitHubStats).publicRepos}
                              </span>
                            </div>
                          </>
                        )}
                        {platform.id === "codeforces" && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Rating
                              </span>
                              <span className="font-medium text-foreground">
                                {(platformStats as CodeforcesStats).rating}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Rank</span>
                              <span className="font-medium capitalize text-foreground">
                                {(platformStats as CodeforcesStats).rank}
                              </span>
                            </div>
                          </>
                        )}
                        {platform.id === "codechef" && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Rating
                              </span>
                              <span className="font-medium text-foreground">
                                {(platformStats as CodeChefStats).currentRating}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Stars</span>
                              <span className="font-medium text-foreground">
                                {(platformStats as CodeChefStats).stars}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Click refresh to load stats
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Not connected
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </CardContent>
    </Card>
  )
}
