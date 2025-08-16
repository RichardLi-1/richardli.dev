"use client"
import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"

const mainProjects = [
  {
    id: "boink",
    title: "Bo!nk",
    year: "2021",
    description: "A Windows Vista-inspired inkball game published on the App Store",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-OFGQDkrP2BvNmhLieOxExwEZBsCGcq.png",
    logo: "/images/boink-logo.webp",
    tags: ["iOS", "Swift", "Game Development"],
  },
  {
    id: "salespatriot",
    title: "SalesPatriot (YC W25)",
    year: "2025",
    description: "Internship",
    image: "https://richardli-1.github.io/Personal-Website/salespatriott.png?height=400&width=600",
    tags: ["Internship", "Product Design", "AI"],
  },
  {
    id: "futureforward",
    title: "Future Forward",
    year: "2024-2025",
    description: "Non-profit focusing on helping students discover their vocations",
    image: "images/IMG_7745.jpeg",
    logo: "/images/future-forward-logo.png",
    tags: ["Non-profit", "Web Development", "Community"],
  },
  {
    id: "yrhacks",
    title: "YRHacks",
    year: "2024-2025",
    description: "Helped organize Canada's largest high school hackathon",
    image: "images/yrhacks crowd.jpeg",
    logo: "/images/yrhacks-logo.png",
    tags: ["Community", "Logistics", "Organizations"],
  },
  {
    id: "cec",
    title: "Career Education Council",
    year: "2024-2025",
    description: "",
    image: "",
    logo: "/images/cec-logo.webp",
    tags: ["iOS", "Swift", "App Development"],
  },
]

const additionalProjects = [
  {
    id: "markville-rfp",
    title: "RFP: Rebranding the Markville Secondary Plan",
    year: "2024",
    description:
      "City Design Challenge hackathon winner - comprehensive rebranding proposal for Markville Secondary Plan",
    image: "/images/markville-rfp-cover.png",
    tags: ["Design", "Urban Planning", "Hackathon Winner"],
  },
]

export default function ProjectsPage() {
  const [showAdditional, setShowAdditional] = useState(false)

  const allProjects = showAdditional ? [...mainProjects, ...additionalProjects] : mainProjects

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-black text-green-400">
        <AnimatedHeader
          backHref="/"
          backText="Back"
          currentPage="/projects"
          rightLinks={[
            { href: "mailto:richardli0@outlook.com", text: "CONTACT" },
            { href: "https://www.linkedin.com/in/richardli0/", text: "LINKEDIN", external: true },
            { href: "https://github.com/RichardLi-1", text: "GITHUB", external: true },
          ]}
        />

        <main className="max-w-7xl mx-auto p-6" style={{ paddingTop: "120px" }}>
          <StaggeredContent delay={0}>
            <div className="mb-12">
              <h1 className="text-4xl font-bold mb-4">Work</h1>
              <p className="text-gray-300 text-lg">
                A collection of work I've done and projects I've built, from mobile games to non-profit initiatives.
              </p>
            </div>
          </StaggeredContent>
          <StaggeredContent delay={100}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {allProjects.map((project, index) => (
                <div
                  key={project.id}
                  className={`transition-all duration-700 ease-out`}
                  style={{
                    animationDelay: `${300 + index * 100}ms`,
                    opacity: 0,
                    transform: "translateY(20px)",
                    animation: "fadeInUp 0.7s ease-out forwards",
                  }}
                >
                  <Link href={`/projects/${project.id}`}>
                    <Card className="bg-gray-900 border-gray-700 hover:border-green-400 transition-all duration-300 cursor-pointer group">
                      <CardContent className="p-0">
                        <div className="aspect-video w-full bg-gray-800 overflow-hidden">
                          <img
                            src={project.image || "/placeholder.svg"}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-6">
                          <div className="flex mb-4">
                            <img
                              src={project.logo || "/placeholder.svg?height=80&width=80"}
                              alt={`${project.title} logo`}
                              className={`w-10 h-10 rounded-xl mr-4 flex-shrink-0 object-contain ${
                                !project.logo || project.logo.includes("placeholder.svg") ? "hidden" : ""
                              }`}
                            />
                            <div className="flex-grow">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-bold text-green-400">{project.title}</h3>
                                <span className="text-gray-400 text-sm">{project.year}</span>
                              </div>
                              <p className="text-gray-300 text-sm leading-relaxed">{project.description}</p>
                            </div>
                          </div>
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
                </div>
              ))}
            </div>
          </StaggeredContent>

          {!showAdditional && (
            <StaggeredContent delay={700}>
              <div className="mt-12 text-center">
                <Button
                  onClick={() => setShowAdditional(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                >
                  Load More Projects
                </Button>
              </div>
            </StaggeredContent>
          )}

          <StaggeredContent delay={700}>
            <div className="mt-16 text-center">
              <h2 className="text-2xl font-bold mb-4">More Projects Coming Soon</h2>
              <p className="text-gray-300">I'm always working on new projects. Check back soon for updates!</p>
            </div>
          </StaggeredContent>
        </main>

        <StaggeredContent delay={900}>
          <Footer />
        </StaggeredContent>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </AnimatedPage>
  )
}
