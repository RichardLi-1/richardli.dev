"use client"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, ArrowLeft } from "lucide-react"
import { Footer } from "@/components/footer"

const projects = [
  {
    id: "boink",
    title: "Bo!nk",
    year: "2021",
    description: "A Windows Vista-inspired inkball game published on the App Store",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-OFGQDkrP2BvNmhLieOxExwEZBsCGcq.png",
    tags: ["iOS", "Swift", "Game Development"],
  },
  {
    id: "salespatriot",
    title: "SalesPatriot (YC W25)",
    year: "2025",
    description: "Summer Internship",
    image: "/salespatriot.png?height=400&width=600",
    tags: ["Non-profit", "Web Development", "Community"],
  },
  {
    id: "future-forward",
    title: "Future Forward",
    year: "2024",
    description: "Non-profit focusing on helping students discover their vocations",
    image: "/placeholder.svg?height=400&width=600",
    tags: ["Non-profit", "Web Development", "Community"],
  },
  {
    id: "tutoring-platform",
    title: "Tutoring Platform",
    year: "2023",
    description: "Custom learning management system for personalized education",
    image: "/placeholder.svg?height=400&width=600",
    tags: ["Education", "React", "Node.js"],
  },
]

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-gray-800">
        <Link href="/" className="flex items-center text-secondary transition-all hover:text-green-300">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
        <nav className="flex space-x-8">
          <a href="mailto:richardli0@outlook.com" className="hover:text-green-300 transition-colors">
            CONTACT
          </a>
          <a
            href="https://www.linkedin.com/in/richardli0/"
            className="hover:text-green-300 transition-colors flex items-center gap-1"
          >
            LINKEDIN <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://github.com/RichardLi-1"
            className="hover:text-green-300 transition-colors flex items-center gap-1"
          >
            GITHUB <ExternalLink className="w-3 h-3" />
          </a>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Projects</h1>
          <p className="text-gray-300 text-lg">
            A collection of projects I've built, from mobile games to non-profit initiatives.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="bg-gray-900 border-gray-700 hover:border-green-400 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-0">
                  {/* Project Image */}
                  <div className="aspect-video w-full bg-gray-800 overflow-hidden">
                    <img
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Project Info */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-green-400">{project.title}</h3>
                      <span className="text-gray-400 text-sm">{project.year}</span>
                    </div>

                    <p className="text-gray-300 mb-4 text-sm leading-relaxed">{project.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">More Projects Coming Soon</h2>
          <p className="text-gray-300">I'm always working on new projects. Check back soon for updates!</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
