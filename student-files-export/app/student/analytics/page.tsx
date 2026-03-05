import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "student") {
    redirect("/login")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader
        title="Analytics"
        description="Detailed insights into your coding progress and performance"
      />
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Analytics</h2>
          <p className="text-gray-600">View your coding analytics and performance insights here.</p>
        </div>
      </div>
    </div>
  )
}
