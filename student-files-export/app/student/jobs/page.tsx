import { DashboardHeader } from "@/components/dashboard/header"
import { JobMatches } from "@/components/student/job-matches"

export default function JobsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader
        title="AI Job Matches"
        description="Personalized job recommendations based on your skills and coding performance"
      />
      <div className="flex-1 p-6">
        <JobMatches />
      </div>
    </div>
  )
}
