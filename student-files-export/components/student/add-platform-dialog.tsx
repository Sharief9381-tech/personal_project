"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Code, Trophy, GitBranch, Loader2, Check, ExternalLink, Globe } from "lucide-react"
import { toast } from "sonner"

interface AddPlatformDialogProps {
  onPlatformAdded?: () => void
  connectedPlatforms?: string[]
}

interface Platform {
  id: string
  name: string
  description: string
  url: string
  icon: any
  placeholder: string
  example: string
  isCustom?: boolean
}

const predefinedPlatforms: Platform[] = [
  {
    id: "leetcode",
    name: "LeetCode",
    description: "Practice coding problems and prepare for interviews",
    url: "https://leetcode.com",
    icon: Code,
    placeholder: "Enter username or profile URL",
    example: "e.g., john_doe or https://leetcode.com/u/john_doe"
  },
  {
    id: "hackerrank",
    name: "HackerRank",
    description: "Skills assessment and coding challenges",
    url: "https://hackerrank.com",
    icon: Trophy,
    placeholder: "Enter your HackerRank username",
    example: "e.g., username"
  },
  {
    id: "codechef",
    name: "CodeChef",
    description: "Monthly contests and practice problems",
    url: "https://codechef.com",
    icon: Code,
    placeholder: "Enter your CodeChef username",
    example: "e.g., admin"
  },
  {
    id: "codeforces",
    name: "Codeforces",
    description: "Competitive programming and algorithmic contests",
    url: "https://codeforces.com",
    icon: Trophy,
    placeholder: "Enter username or profile URL",
    example: "e.g., tourist or https://codeforces.com/profile/tourist"
  },
  {
    id: "geeksforgeeks",
    name: "GeeksforGeeks",
    description: "Programming articles, tutorials, and practice problems",
    url: "https://geeksforgeeks.org",
    icon: Globe,
    placeholder: "Enter your GeeksforGeeks username",
    example: "e.g., username or https://auth.geeksforgeeks.org/user/username/profile"
  },
  {
    id: "hackerearth",
    name: "HackerEarth",
    description: "Programming challenges and hackathons",
    url: "https://hackerearth.com",
    icon: Code,
    placeholder: "Enter your HackerEarth username",
    example: "e.g., @username"
  },
  {
    id: "atcoder",
    name: "AtCoder",
    description: "Japanese competitive programming platform with high-quality contests",
    url: "https://atcoder.jp",
    icon: Trophy,
    placeholder: "Enter your AtCoder username",
    example: "e.g., tourist"
  },
  {
    id: "spoj",
    name: "SPOJ",
    description: "Sphere Online Judge with thousands of problems",
    url: "https://spoj.com",
    icon: Code,
    placeholder: "Enter your SPOJ username",
    example: "e.g., username"
  },
  {
    id: "topcoder",
    name: "TopCoder",
    description: "Competitive programming and software development challenges",
    url: "https://topcoder.com",
    icon: Trophy,
    placeholder: "Enter your TopCoder handle",
    example: "e.g., petr"
  },
  {
    id: "interviewbit",
    name: "InterviewBit",
    description: "Interview preparation and programming practice",
    url: "https://interviewbit.com",
    icon: Code,
    placeholder: "Enter your InterviewBit username",
    example: "e.g., username"
  },
  {
    id: "cses",
    name: "CSES Problem Set",
    description: "High-quality competitive programming problems",
    url: "https://cses.fi",
    icon: Trophy,
    placeholder: "Enter your CSES username",
    example: "e.g., username"
  },
  {
    id: "codestudio",
    name: "CodeStudio",
    description: "Coding Ninjas practice platform",
    url: "https://codestudio.com",
    icon: Code,
    placeholder: "Enter your CodeStudio username",
    example: "e.g., username"
  },
  {
    id: "exercism",
    name: "Exercism",
    description: "Code practice and mentorship platform",
    url: "https://exercism.org",
    icon: Globe,
    placeholder: "Enter your Exercism username",
    example: "e.g., username"
  },
  {
    id: "kaggle",
    name: "Kaggle",
    description: "Data science competitions and datasets",
    url: "https://kaggle.com",
    icon: Trophy,
    placeholder: "Enter your Kaggle username",
    example: "e.g., username"
  },
  {
    id: "uva",
    name: "UVa Online Judge",
    description: "Classic competitive programming problems",
    url: "https://onlinejudge.org",
    icon: Code,
    placeholder: "Enter your UVa username",
    example: "e.g., username"
  },
  {
    id: "github",
    name: "GitHub",
    description: "Showcase your projects and contributions",
    url: "https://github.com",
    icon: GitBranch,
    placeholder: "Enter username or profile URL",
    example: "e.g., johndoe or https://github.com/johndoe"
  },
  {
    id: "kattis",
    name: "Kattis",
    description: "Programming contest platform used in ICPC",
    url: "https://open.kattis.com",
    icon: Trophy,
    placeholder: "Enter your Kattis username",
    example: "e.g., username"
  }
]

export function AddPlatformDialog({ onPlatformAdded, connectedPlatforms = [] }: AddPlatformDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [username, setUsername] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [searchQuery, setSearchQuery] = useState("")

  // Filter out already connected platforms
  const availablePlatforms = predefinedPlatforms.filter(platform => 
    !connectedPlatforms.includes(platform.id)
  )

  // Filter platforms based on search query
  const filteredPlatforms = searchQuery 
    ? availablePlatforms.filter(platform => 
        platform.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        platform.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availablePlatforms

  // Dynamic color assignment for platform selection
  const availableColors = [
    '#f97316', // orange-500
    '#f59e0b', // amber-500  
    '#10b981', // green-500
    '#64748b', // slate-500
    '#3b82f6', // blue-500
    '#8b5cf6', // purple-500
    '#ef4444', // red-500
    '#06b6d4', // cyan-500
    '#84cc16', // lime-500
    '#f472b6', // pink-500
    '#a855f7', // violet-500
    '#22c55e', // green-400
  ]

  const getPlatformColor = (index: number) => {
    return availableColors[index % availableColors.length]
  }

  // Extract username from URL or return as-is if it's already a username
  const extractUsername = (input: string, platformId: string): string => {
    const trimmedInput = input.trim()
    
    // Platform-specific URL patterns
    const urlPatterns: Record<string, RegExp> = {
      leetcode: /(?:https?:\/\/)?(?:www\.)?leetcode\.com\/(?:u\/)?([^\/\?\s]+)/i,
      github: /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/\?\s]+)/i,
      codeforces: /(?:https?:\/\/)?(?:www\.)?codeforces\.com\/profile\/([^\/\?\s]+)/i,
      codechef: /(?:https?:\/\/)?(?:www\.)?codechef\.com\/users\/([^\/\?\s]+)/i,
      hackerrank: /(?:https?:\/\/)?(?:www\.)?hackerrank\.com\/(?:profile\/)?([^\/\?\s]+)/i,
      hackerearth: /(?:https?:\/\/)?(?:www\.)?hackerearth\.com\/@?([^\/\?\s]+)/i,
      geeksforgeeks: /(?:https?:\/\/)?(?:auth\.|www\.)?geeksforgeeks\.org\/user\/([^\/\?\s]+)(?:\/profile)?/i,
      atcoder: /(?:https?:\/\/)?(?:www\.)?atcoder\.jp\/users\/([^\/\?\s]+)/i,
      spoj: /(?:https?:\/\/)?(?:www\.)?spoj\.com\/users\/([^\/\?\s]+)/i,
      kattis: /(?:https?:\/\/)?(?:open\.)?kattis\.com\/users\/([^\/\?\s]+)/i,
      topcoder: /(?:https?:\/\/)?(?:www\.)?topcoder\.com\/members\/([^\/\?\s]+)/i,
      interviewbit: /(?:https?:\/\/)?(?:www\.)?interviewbit\.com\/profile\/([^\/\?\s]+)/i,
      cses: /(?:https?:\/\/)?(?:www\.)?cses\.fi\/user\/([^\/\?\s]+)/i,
      codestudio: /(?:https?:\/\/)?(?:www\.)?codingninjas\.com\/studio\/profile\/([^\/\?\s]+)/i,
      exercism: /(?:https?:\/\/)?(?:www\.)?exercism\.org\/profiles\/([^\/\?\s]+)/i,
      kaggle: /(?:https?:\/\/)?(?:www\.)?kaggle\.com\/([^\/\?\s]+)/i,
      uva: /(?:https?:\/\/)?(?:uhunt\.)?onlinejudge\.org\/id\/([^\/\?\s]+)/i,
    }

    const pattern = urlPatterns[platformId]
    if (pattern) {
      const match = trimmedInput.match(pattern)
      if (match) {
        return match[1]
      }
    }

    // If no URL pattern matches, assume it's already a username
    return trimmedInput
  }

  const verifyProfile = async () => {
    if (!selectedPlatform || !username.trim()) {
      toast.error("Please enter a username or profile URL")
      return
    }

    setIsVerifying(true)
    setVerificationStatus('idle')

    try {
      const extractedUsername = extractUsername(username, selectedPlatform.id)
      
      const response = await fetch("/api/platforms/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          platform: selectedPlatform.id,
          username: extractedUsername,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success && data.verified) {
        setVerificationStatus('success')
        toast.success(`✅ Profile verified! Found ${selectedPlatform.name} profile for "${extractedUsername}"`)
        // Update the username field with the extracted username
        setUsername(extractedUsername)
      } else {
        setVerificationStatus('error')
        toast.error(`❌ Profile not found. Please check the username or URL for ${selectedPlatform.name}`)
      }
    } catch (error) {
      console.error("Verification error:", error)
      setVerificationStatus('error')
      toast.error("Failed to verify profile. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleConnect = async () => {
    if (!selectedPlatform || !username.trim()) {
      toast.error("Please select a platform and enter your username or profile URL")
      return
    }

    // Verify profile first if not already verified
    if (verificationStatus !== 'success') {
      toast.error("Please verify your profile first before connecting")
      return
    }

    setIsConnecting(true)
    
    try {
      const extractedUsername = extractUsername(username, selectedPlatform.id)
      
      const response = await fetch("/api/platforms/link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          platform: selectedPlatform.id,
          username: extractedUsername,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success(`Successfully connected ${selectedPlatform.name}! Fetching stats...`)
        setOpen(false)
        setSelectedPlatform(null)
        setUsername("")
        setVerificationStatus('idle')
        
        // Call the callback to update parent component
        if (onPlatformAdded) {
          onPlatformAdded()
        }
      } else {
        toast.error(data.error || "Failed to connect platform")
      }
    } catch (error) {
      console.error("Connection error:", error)
      toast.error("Failed to connect platform. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleBack = () => {
    setSelectedPlatform(null)
    setUsername("")
    setSearchQuery("")
    setVerificationStatus('idle')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Platform
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedPlatform ? `Connect ${selectedPlatform.name}` : "Add Coding Platform"}
          </DialogTitle>
        </DialogHeader>

        {!selectedPlatform ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose from popular coding platforms to connect and showcase your programming skills
            </p>
            
            {/* Search/Filter Bar */}
            <div className="space-y-3">
              <Input
                placeholder="Search platforms (e.g., LeetCode, Codeforces, AtCoder)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Available Platforms */}
            {filteredPlatforms.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">All Platforms Connected!</h3>
                <p className="text-muted-foreground">
                  You've connected all available platforms. Great job!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Available Platforms:</h4>
                <div className="grid gap-3 md:grid-cols-2 max-h-96 overflow-y-auto">
                  {filteredPlatforms.map((platform, index) => {
                    const IconComponent = platform.icon === 'Globe' ? Globe : platform.icon
                    const dynamicColor = getPlatformColor(index)
                    return (
                      <Card
                        key={platform.id}
                        className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/50"
                        onClick={() => setSelectedPlatform(platform)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div 
                              className="h-10 w-10 rounded-lg flex items-center justify-center"
                              style={{ 
                                backgroundColor: dynamicColor + '20', 
                                border: `1px solid ${dynamicColor}` 
                              }}
                            >
                              <IconComponent 
                                className="h-5 w-5" 
                                style={{ color: dynamicColor }}
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{platform.name}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {platform.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <a
                              href={platform.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Visit Site
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <Badge variant="outline" className="text-xs">
                              Connect
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div 
                className="h-12 w-12 rounded-lg flex items-center justify-center"
                style={{ 
                  backgroundColor: getPlatformColor(availablePlatforms.findIndex(p => p.id === selectedPlatform.id)) + '20', 
                  border: `2px solid ${getPlatformColor(availablePlatforms.findIndex(p => p.id === selectedPlatform.id))}` 
                }}
              >
                {selectedPlatform.icon === 'Globe' ? (
                  <Globe 
                    className="h-6 w-6" 
                    style={{ color: getPlatformColor(availablePlatforms.findIndex(p => p.id === selectedPlatform.id)) }}
                  />
                ) : (
                  <selectedPlatform.icon 
                    className="h-6 w-6" 
                    style={{ color: getPlatformColor(availablePlatforms.findIndex(p => p.id === selectedPlatform.id)) }}
                  />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-lg">{selectedPlatform.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedPlatform.description}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username or Profile URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="username"
                    placeholder={selectedPlatform.placeholder}
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      setVerificationStatus('idle') // Reset verification when input changes
                    }}
                    disabled={isConnecting || isVerifying}
                    className={
                      verificationStatus === 'success' ? 'border-green-500' :
                      verificationStatus === 'error' ? 'border-red-500' : ''
                    }
                  />
                  <Button
                    onClick={verifyProfile}
                    disabled={isVerifying || isConnecting || !username.trim()}
                    className="gap-2 whitespace-nowrap min-w-[100px] flex items-center justify-center"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedPlatform.example}
                </p>
                {verificationStatus === 'success' && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Profile verified! You can now connect this platform.
                  </p>
                )}
                {verificationStatus === 'error' && (
                  <p className="text-xs text-red-600">
                    Profile not found. Please check your username or URL and try again.
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h5 className="font-medium text-sm mb-1">How to find your profile:</h5>
                <p className="text-xs text-muted-foreground">
                  You can enter either your username or copy the full profile URL from your {selectedPlatform.name} profile page.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isConnecting}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleConnect}
                disabled={isConnecting || isVerifying || !username.trim() || verificationStatus !== 'success'}
                className="flex-1 gap-2"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Connect Platform
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}