"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Download, Eye, GripVertical, Sparkles, Loader2 } from "lucide-react"

interface Experience {
  id: string
  title: string
  company: string
  location: string
  startDate: string
  endDate: string
  description: string
}

interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  link: string
}

export function ResumeBuilder() {
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: "1",
      title: "Software Engineering Intern",
      company: "Google",
      location: "Bangalore, India",
      startDate: "May 2024",
      endDate: "Jul 2024",
      description: "Developed and maintained microservices using Go and Kubernetes. Improved API response times by 40%.",
    },
  ])

  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "CodeTrack",
      description: "A unified coding performance platform that aggregates stats from LeetCode, GitHub, Codeforces, and CodeChef.",
      technologies: ["Next.js", "TypeScript", "MongoDB", "Tailwind CSS"],
      link: "https://github.com/username/codetrack",
    },
  ])

  const [generating, setGenerating] = useState(false)

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: Date.now().toString(),
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ])
  }

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter((exp) => exp.id !== id))
  }

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setExperiences(experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)))
  }

  const addProject = () => {
    setProjects([
      ...projects,
      {
        id: Date.now().toString(),
        name: "",
        description: "",
        technologies: [],
        link: "",
      },
    ])
  }

  const removeProject = (id: string) => {
    setProjects(projects.filter((proj) => proj.id !== id))
  }

  const updateProject = (id: string, field: keyof Project, value: string | string[]) => {
    setProjects(projects.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj)))
  }

  const generateWithAI = async () => {
    setGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setGenerating(false)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 border-gray-700 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Work Experience</CardTitle>
              <CardDescription className="text-gray-300">Add your internships and work experience</CardDescription>
            </div>
            <Button onClick={addExperience} size="sm" className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {experiences.map((exp, index) => (
              <div key={exp.id} className="space-y-4 rounded-lg border border-gray-600 bg-gray-800/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 cursor-move text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">Experience {index + 1}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeExperience(exp.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-gray-200">Job Title</Label>
                    <Input
                      placeholder="Software Engineer Intern"
                      value={exp.title}
                      onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-200">Company</Label>
                    <Input
                      placeholder="Google"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-200">Location</Label>
                    <Input
                      placeholder="Bangalore, India"
                      value={exp.location}
                      onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <Label className="text-gray-200">Start Date</Label>
                      <Input
                        placeholder="May 2024"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label className="text-gray-200">End Date</Label>
                      <Input
                        placeholder="Jul 2024"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-200">Description</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                      onClick={generateWithAI}
                      disabled={generating}
                    >
                      {generating ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      Enhance with AI
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Describe your responsibilities and achievements..."
                    rows={3}
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 border-emerald-700 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Projects</CardTitle>
              <CardDescription className="text-emerald-200">Showcase your best projects</CardDescription>
            </div>
            <Button onClick={addProject} size="sm" className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 shadow-lg">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {projects.map((proj, index) => (
              <div key={proj.id} className="space-y-4 rounded-lg border border-emerald-600 bg-emerald-800/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 cursor-move text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-200">Project {index + 1}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeProject(proj.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-emerald-200">Project Name</Label>
                    <Input
                      placeholder="Project Name"
                      value={proj.name}
                      onChange={(e) => updateProject(proj.id, "name", e.target.value)}
                      className="bg-emerald-700/50 border-emerald-600 text-white placeholder:text-emerald-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-200">Project Link</Label>
                    <Input
                      placeholder="https://github.com/..."
                      value={proj.link}
                      onChange={(e) => updateProject(proj.id, "link", e.target.value)}
                      className="bg-emerald-700/50 border-emerald-600 text-white placeholder:text-emerald-300"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-200">Description</Label>
                  <Textarea
                    placeholder="Describe your project..."
                    rows={2}
                    value={proj.description}
                    onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                    className="bg-emerald-700/50 border-emerald-600 text-white placeholder:text-emerald-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-200">Technologies</Label>
                  <div className="flex flex-wrap gap-2">
                    {proj.technologies.map((tech) => (
                      <Badge key={tech} className="bg-emerald-600 text-white border-emerald-500 shadow-md">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add technologies (comma separated)"
                    className="bg-emerald-700/50 border-emerald-600 text-white placeholder:text-emerald-300"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const input = e.currentTarget.value
                        const techs = input.split(",").map((t) => t.trim()).filter(Boolean)
                        updateProject(proj.id, "technologies", [...proj.technologies, ...techs])
                        e.currentTarget.value = ""
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <Card className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 border-indigo-700 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Resume Preview</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2 bg-indigo-800/50 border-indigo-600 text-indigo-200 hover:bg-indigo-700/50">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button size="sm" className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="aspect-[8.5/11] rounded-lg border border-indigo-600 bg-gray-900 p-6 text-xs shadow-inner">
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-lg font-bold text-white">John Doe</h2>
                  <p className="text-indigo-300">Software Engineer</p>
                  <p className="text-indigo-400">john@example.com | +91 9876543210 | Mumbai, India</p>
                </div>
                
                <Separator className="bg-indigo-600" />
                
                <div>
                  <h3 className="mb-2 font-semibold text-white">Experience</h3>
                  {experiences.map((exp) => (
                    <div key={exp.id} className="mb-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-indigo-200">{exp.title || "Job Title"}</span>
                        <span className="text-indigo-400">{exp.startDate} - {exp.endDate}</span>
                      </div>
                      <p className="text-indigo-300">{exp.company || "Company"} | {exp.location}</p>
                      <p className="mt-1 text-gray-300">{exp.description}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-white">Projects</h3>
                  {projects.map((proj) => (
                    <div key={proj.id} className="mb-2">
                      <span className="font-medium text-indigo-200">{proj.name || "Project Name"}</span>
                      <p className="mt-1 text-gray-300">{proj.description}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {proj.technologies.map((tech) => (
                          <span key={tech} className="rounded bg-indigo-800/50 px-1 text-[10px] text-indigo-200">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-white">Coding Stats</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded bg-indigo-800/30 p-2 border border-indigo-700">
                      <p className="font-medium text-white">456</p>
                      <p className="text-indigo-300">Problems Solved</p>
                    </div>
                    <div className="rounded bg-indigo-800/30 p-2 border border-indigo-700">
                      <p className="font-medium text-white">1892</p>
                      <p className="text-indigo-300">Max Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
