"use client"
import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"
import { mainProjects } from "@/components/mainProjects"

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
                A collection of work and projects, from mobile games to non-profit initiatives.
              </p>
            </div>
          </StaggeredContent>
          <StaggeredContent delay={100}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
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
                    <Card className="transition-all duration-300 cursor-pointer group border-background bg-background mb-5">
                      <CardContent className="p-0">
                        <div className="aspect-video w-full bg-gray-800 overflow-hidden">
                          <img
                            src={project.image || "/placeholder.svg"}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-300"
                          />
                        </div>
                        <div className="p-6 px-3">
                          <div className="flex mb-2">
                            <img
                              src={project.logo || "/placeholder.svg?height=80&width=80"}
                              alt={`${project.title} logo`}
                              className={`w-10 h-10 rounded-xl mr-4 flex-shrink-0 object-contain ${
                                !project.logo || project.logo.includes("placeholder.svg") ? "hidden" : ""
                              }`}
                            />
                            <div className="flex-grow">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-bold text-white -mb-4 -mt-4">{project.title}</h3>
                                <span className="text-gray-400 text-sm">{project.year}</span>
                              </div>
                              <p className="text-gray-300 text-sm leading-relaxed">{project.description}</p>
                            </div>
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
              <div className="mt-12 text-center flex justify-center gap-4">
                <Button
                  onClick={() => setShowAdditional(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                >
                  Load More Projects
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white px-6 py-2 bg-transparent"
                >
                  <Link href="https://drive.google.com/file/d/1iwZR7PxbnDqifQlcb7evC5AoHHFYaA30/view?usp=sharing" target="_blank">Resume</Link>
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
