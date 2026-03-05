"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Save, Loader2 } from "lucide-react"

export function ProfileForm() {
  const [saving, setSaving] = useState(false)
  const [skills, setSkills] = useState<string[]>(["JavaScript", "React", "Python", "Node.js"])
  const [newSkill, setNewSkill] = useState("")

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill])
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  const handleSave = async () => {
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 border-gray-700 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white">Personal Information</CardTitle>
          <CardDescription className="text-gray-300">Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-200">Full Name</Label>
              <Input id="name" placeholder="John Doe" defaultValue="John Doe" className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" defaultValue="john@example.com" className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-200">Phone</Label>
              <Input id="phone" placeholder="+91 9876543210" className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-gray-200">Location</Label>
              <Input id="location" placeholder="Mumbai, India" className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-gray-200">Bio</Label>
            <Textarea id="bio" placeholder="Tell us about yourself..." rows={4} className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 border-blue-700 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white">Education</CardTitle>
          <CardDescription className="text-blue-200">Add your educational background</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="college" className="text-blue-200">College/University</Label>
              <Input id="college" placeholder="IIT Delhi" className="bg-blue-800/50 border-blue-600 text-white placeholder:text-blue-300" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="degree" className="text-blue-200">Degree</Label>
              <Select defaultValue="btech">
                <SelectTrigger className="bg-blue-800/50 border-blue-600 text-white">
                  <SelectValue placeholder="Select degree" />
                </SelectTrigger>
                <SelectContent className="bg-blue-800 border-blue-600">
                  <SelectItem value="btech">B.Tech</SelectItem>
                  <SelectItem value="be">B.E.</SelectItem>
                  <SelectItem value="bsc">B.Sc</SelectItem>
                  <SelectItem value="mtech">M.Tech</SelectItem>
                  <SelectItem value="mca">MCA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch" className="text-blue-200">Branch/Major</Label>
              <Select defaultValue="cse">
                <SelectTrigger className="bg-blue-800/50 border-blue-600 text-white">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent className="bg-blue-800 border-blue-600">
                  <SelectItem value="cse">Computer Science</SelectItem>
                  <SelectItem value="it">Information Technology</SelectItem>
                  <SelectItem value="ece">Electronics & Communication</SelectItem>
                  <SelectItem value="ee">Electrical Engineering</SelectItem>
                  <SelectItem value="me">Mechanical Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="graduation" className="text-blue-200">Graduation Year</Label>
              <Select defaultValue="2025">
                <SelectTrigger className="bg-blue-800/50 border-blue-600 text-white">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="bg-blue-800 border-blue-600">
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cgpa" className="text-blue-200">CGPA</Label>
              <Input id="cgpa" type="number" step="0.01" placeholder="8.5" className="bg-blue-800/50 border-blue-600 text-white placeholder:text-blue-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 border-emerald-700 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white">Skills</CardTitle>
          <CardDescription className="text-emerald-200">Add your technical skills</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} className="gap-1 px-3 py-1 bg-emerald-600 text-white border-emerald-500 shadow-lg">
                {skill}
                <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-red-300 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              className="bg-emerald-800/50 border-emerald-600 text-white placeholder:text-emerald-300"
            />
            <Button onClick={addSkill} size="icon" className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900 border-purple-700 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white">Social Links</CardTitle>
          <CardDescription className="text-purple-200">Add your professional links</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-purple-200">LinkedIn</Label>
              <Input id="linkedin" placeholder="https://linkedin.com/in/username" className="bg-purple-800/50 border-purple-600 text-white placeholder:text-purple-300" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio" className="text-purple-200">Portfolio Website</Label>
              <Input id="portfolio" placeholder="https://yourportfolio.com" className="bg-purple-800/50 border-purple-600 text-white placeholder:text-purple-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Profile
        </Button>
      </div>
    </div>
  )
}
