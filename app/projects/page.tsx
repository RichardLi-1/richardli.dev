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
import { ProjectImageCycler } from "@/components/project-image-cycler"

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
      <div className="min-h-screen page-bg">
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

        <main className="max-w-screen-2xl mx-auto p-6" style={{ paddingTop: "120px" }}>
          <StaggeredContent delay={0}>
            <div className="mb-12">
              <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", marginBottom: "12px" }}>Work</h1>
              <p style={{ fontSize: "14px", color: "var(--text-3)", letterSpacing: "0.02em", marginBottom: "-32px" }}>
                A collection of work and projects, from mobile games to non-profit initiatives.
              </p>
            </div>
          </StaggeredContent>
          <StaggeredContent delay={100}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-4">
              {allProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="transition-all duration-700 ease-out"
                  style={{
                    animationDelay: `${300 + index * 100}ms`,
                    opacity: 0,
                    transform: "translateY(20px)",
                    animation: "fadeInUp 0.7s ease-out forwards",
                    // define a variable unique to this card
                    "--glow-color": project.colors || "#22c55e99",
                  }}
                >
                  <Link href={`/projects/${project.id}`}>
                    <div
                      className="photo-card mb-6 cursor-pointer group"
                      style={{ "--glow-color": (project as any).colors || "#22c55e44" } as React.CSSProperties}
                    >
                      <div className="aspect-video w-full overflow-hidden transition-shadow duration-300 group-hover:shadow-[0_0px_120px_-20px_var(--glow-color)]" style={{ background: "var(--surface)", cornerShape: "squircle", borderRadius: 25 }}>
                        <ProjectImageCycler
                          images={[project.image, (project as any).image2, (project as any).image3]}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-300"
                        />
                      </div>
                      <div className="px-5 py-4">
                        <div className="flex items-center justify-between mb-1">
                          <h3 style={{ fontSize: "15px", letterSpacing: "0.02em", fontWeight: 500, color: "var(--text)" }}>
                            {project.title}
                          </h3>
                          <span style={{ fontSize: "12px", color: "var(--text-3)", letterSpacing: "0.04em" }}>{project.year}</span>
                        </div>
                        <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: "1.6" }}>{project.description}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </StaggeredContent>

          <div className="flex justify-center space-x-2">
            {!showAdditional && (
              <StaggeredContent delay={700}>
                <Button
                  onClick={() => setShowAdditional(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                >
                  Load More Projects
                </Button>
              </StaggeredContent>
            )}

            <StaggeredContent delay={700}>
              <Button
                asChild
                variant="outline"
                className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white px-6 py-2 bg-transparent"
              >
                <Link
                  href="https://drive.google.com/file/d/1iwZR7PxbnDqifQlcb7evC5AoHHFYaA30/view?usp=sharing"
                  target="_blank"
                >
                  Resume
                </Link>
              </Button>
            </StaggeredContent>
          </div>

          <StaggeredContent delay={700}>
            <div className="mt-8 text-center">
              <p style={{ fontSize: "13px", color: "var(--text-3)", letterSpacing: "0.02em" }}>I'm always working on new projects. Check back soon for updates!</p>
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
