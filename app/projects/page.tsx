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
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"

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
  usePageViewTracker()
  const [showAdditional, setShowAdditional] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const allProjects = (showAdditional ? [...mainProjects, ...additionalProjects] : mainProjects).filter(p => !(p as any).hidden)

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

        <main className="max-w-[98%] mx-auto p-6" style={{ paddingTop: "50px" }}>
          <StaggeredContent delay={0}>
            <div className="mb-12">
              <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", marginBottom: "12px" }}>Work</h1>
              <p style={{ fontSize: "14px", color: "var(--text-3)", letterSpacing: "0.02em", marginBottom: "-32px" }}>
                A collection of work and projects, from mobile games to non-profit initiatives.
              </p>
            </div>
          </StaggeredContent>
          <StaggeredContent delay={100}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-4 gap-y-[15px]">
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
                      style={{ position: "relative", "--glow-color": (project as any).colors || "#22c55e44" } as React.CSSProperties}
                    >
                      <div className="relative aspect-video w-full overflow-hidden squircle-lg transition-shadow duration-300" style={{ background: "var(--surface)", borderRadius: 48 }} onMouseEnter={() => setHoveredId(project.id)} onMouseLeave={() => setHoveredId(null)}>
                        <ProjectImageCycler
                          images={[project.image, (project as any).image2, (project as any).image3]}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-300"
                        />
                        <div className="header-pill absolute bottom-0 backdrop-blur-md flex items-center gap-2 mx-3 my-3 px-4 py-2 shadow-lg border border-white/10"  style={{ background: "var(--glass-bg)", whiteSpace: "nowrap" }}>
                          <h3 className="text-nowrap" style={{ fontSize: "15px", letterSpacing: "0.02em", fontWeight: 500, color: "var(--text)" }}>
                            {project.title}
                          </h3>
                          <span style={{ fontSize: "12px", color: "var(--text-3)", letterSpacing: "0.04em", paddingTop: "2px" }}>{project.year}</span>
                        </div>
                      </div>
                      
                      <p style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: "100%",
                        fontSize: "13px",
                        color: "var(--text-2)",
                        lineHeight: "1.6",
                        opacity: hoveredId === project.id ? 1 : 0,
                        transform: hoveredId === project.id ? "translateY(0)" : "translateY(-6px)",
                        transition: "opacity 0.25s ease, transform 0.25s ease",
                        pointerEvents: "none",
                        paddingTop: "8px",
                      }}>{project.description}</p>
                      
                      
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
