import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { serializeUser } from "@/lib/serialize"
import type { StudentProfile } from "@/lib/types"
import { DashboardClient } from "@/components/student/dashboard-client"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function StudentDashboard() {
  const user = await getCurrentUser()

  if (!user || user.role !== "student") {
    redirect("/login")
  }

  const student = serializeUser(user) as StudentProfile

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader
        title="Dashboard"
        description="Track your coding progress across all platforms"
      />
      <div className="flex-1 space-y-6 p-6">
        <DashboardClient student={student} />
      </div>
    </div>
  )
}
