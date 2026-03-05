"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Code2,
  Trophy,
  Briefcase,
  User,
  Settings,
  LogOut,
  GraduationCap,
  Building2,
  Users,
  BarChart3,
  Search,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { StudentProfile, CollegeProfile, RecruiterProfile } from "@/lib/types"

interface DashboardSidebarProps {
  user: StudentProfile | CollegeProfile | RecruiterProfile
}

const studentLinks = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/platforms", label: "Platforms", icon: Code2 },
  { href: "/student/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/student/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/student/jobs", label: "Job Matches", icon: Briefcase },
  { href: "/student/profile", label: "Profile", icon: User },
]

const collegeLinks = [
  { href: "/college/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/college/students", label: "Students", icon: GraduationCap },
  { href: "/college/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/college/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/college/placements", label: "Placements", icon: Briefcase },
  { href: "/college/settings", label: "Settings", icon: Settings },
]

const recruiterLinks = [
  { href: "/recruiter/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/recruiter/search", label: "Search Talent", icon: Search },
  { href: "/recruiter/shortlists", label: "Shortlists", icon: Users },
  { href: "/recruiter/jobs", label: "Job Postings", icon: FileText },
  { href: "/recruiter/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/recruiter/settings", label: "Settings", icon: Settings },
]

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const links =
    user.role === "student"
      ? studentLinks
      : user.role === "college"
        ? collegeLinks
        : recruiterLinks

  const roleIcon =
    user.role === "student"
      ? GraduationCap
      : user.role === "college"
        ? Building2
        : Briefcase

  const RoleIcon = roleIcon

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Code2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-semibold text-foreground">CodeTrack</h1>
          <p className="text-xs capitalize text-muted-foreground">{user.role} Portal</p>
        </div>
      </div>

      <div className="flex items-center gap-3 border-b border-border p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
          <RoleIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="truncate font-medium text-foreground">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
