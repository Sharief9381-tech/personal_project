"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { ResumeBuilder } from "@/components/student/resume-builder"
import { ProfileForm } from "@/components/student/profile-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader
        title="Profile & Resume"
        description="Manage your profile and build your professional resume"
      />
      <div className="flex-1 p-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="resume">Resume Builder</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <ProfileForm />
          </TabsContent>
          <TabsContent value="resume">
            <ResumeBuilder />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
