"use client"
import React, { useState, useEffect } from "react"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { ExternalLink, X, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
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
    description: "City Design Challenge hackathon winner - comprehensive rebranding proposal for Markville Secondary Plan",
    image: "/images/markville-rfp-cover.png",
    tags: ["Design", "Urban Planning", "Hackathon Winner"],
  },
]

export default function ProjectsPage() {
  usePageViewTracker()
  const [showAdditional, setShowAdditional] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [])
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])


  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type !== "panel-action") return
      if (e.data.action === "close") setSelectedId(null)
      if (e.data.action === "open") window.open(`/projects/${selectedId}`)
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [selectedId])

  const allProjects = (showAdditional ? [...mainProjects, ...additionalProjects] : mainProjects).filter(p => !(p as any).hidden)
  const selectedProject = allProjects.find(p => p.id === selectedId)

  const handleCardClick = (id: string) => {
    if (isMobile) { window.location.href = `/projects/${id}`; return }
    setSelectedId(prev => prev === id ? null : id)
  }

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

        <main className="max-w-[100%] mx-auto p-6" style={{
          maxHeight: selectedId && !isMobile ? "calc(100vh - 70px)" : "none",
          overflow: selectedId && !isMobile ? "hidden" : "visible",
        }}>
          <StaggeredContent delay={100}>
            <LayoutGroup>
            <motion.div layout transition={{ type: "spring", stiffness: 260, damping: 30 }} style={{ display: "flex", alignItems: "flex-start", gap: selectedId ? 16 : 0 }}>

              {/* ── Left Column Left Panel── */}
              <motion.div layout transition={{ type: "spring", stiffness: 260, damping: 30 }} style={{
                flex: selectedId ? "0 0 19.8%" : "1 1 100%", // 15.8%, 24.2%, 32.6%
                minWidth: 0,
                paddingRight: isMobile? "0px" : selectedId? "36px" : "15px",
                paddingLeft: isMobile? "0px" : "15px",
                borderRadius: isMobile? 0 : 24,
                cornerShape: "superellipse(1)",
                borderRight: selectedId ? "1px solid var(--border-2)" : "none",
                borderTop: selectedId ? "1px solid var(--border-2)" : "none",
                maxHeight: selectedId ? "calc(100vh - 120px)" : "none",
                overflow: "auto",
                paddingTop: isMobile ? "0px" :"36px"
              }}>
                <StaggeredContent delay={0}>
                  <div style={{ marginBottom: "3rem", overflow: "hidden" }}>
                    <h1 style={{ fontSize: "clamp(28px, 8vw, 48px)", marginBottom: "12px" }}>Work</h1>{/* Consider changing this to 56px max */}
                    <p style={{ fontSize: "14px", color: "var(--text-3)", letterSpacing: "0.02em" }}>
                      A collection of work and projects, from mobile games to non-profit initiatives.
                    </p>
                  </div>
                </StaggeredContent>
                <div style={{ 
                  display: "grid",
                  gridTemplateColumns: (selectedId || isMobile) ? "1fr" : "repeat(2, 1fr)",
                  gap: selectedId || isMobile ? 0 : "15px 16px" 
                  }}>
                  {allProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      layout
                      transition={{ layout: { type: "spring", stiffness: 280, damping: 28 } }}
                      style={{ minWidth: 0 }}
                    >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        opacity: { duration: 0.5, delay: 0.3 + index * 0.08 },
                        y: { duration: 0.5, delay: 0.3 + index * 0.08 },
                      }}
                    >
                      <div
                        className="photo-card mb-6 cursor-pointer group"
                        onClick={() => handleCardClick(project.id)}
                        style={{
                          position: "relative",
                          cornerShape: "squircle",
                          "--glow-color": (project as any).colors || "#22c55e44",
                          borderRadius: 30,
                          opacity: selectedId && selectedId !== project.id ? 0.75 : 1,
                          transform: selectedId === project.id ? "scale(0.96)" : hoveredId === project.id ? "scale(0.97)" : "scale(1)",
                          boxShadow: selectedId === project.id ? "0 0 0 2.5px var(--text), inset 0 0 0 2.5px var(--text)" : "none",
                          transition: "transform 0.25s ease, box-shadow 0.25s ease, opacity 0.3s ease",
                        } as React.CSSProperties}
                      >
                        <div
                          className="relative aspect-video w-full overflow-hidden squircle-lg transition-shadow duration-300"
                          style={{ 
                            background: "var(--surface)", 
                            borderRadius: selectedId || isMobile ? 28 : 52 }} // IMPORTANT border radius of cards + image
                          onMouseEnter={() => setHoveredId(project.id)}
                          onMouseLeave={() => setHoveredId(null)}
                        >
                          <ProjectImageCycler
                            images={[project.image, (project as any).image2, (project as any).image3]}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-300"
                          />
                          <div className="liquid-glass-pill squircle absolute bottom-0 flex items-center gap-2 mx-3 my-3 px-4 py-2" style={{ whiteSpace: "nowrap" }}>
                            <h3 className="text-nowrap" style={{ fontSize: "15px", letterSpacing: "0.02em", fontWeight: 500, color: "inherit" }}>{project.title}</h3>
                            <span style={{ fontSize: "12px", opacity: 0.65, letterSpacing: "0.04em", paddingTop: "2px" }}>{project.year}</span>
                          </div>
                          {(hoveredId === project.id && (project as any).externalLink) && (
                            <a
                              href={(project as any).externalLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="liquid-glass-pill squircle absolute top-0 right-0 flex items-center gap-2 mx-3 my-3 px-4 py-2"
                              style={{ whiteSpace: "nowrap", textDecoration: "none", transition: "transform 0.15s ease" }}
                              onClick={e => e.stopPropagation()}
                              onMouseEnter={e => (e.currentTarget.style.transform = "scale(0.96)")}
                              onMouseDown={e => (e.currentTarget.style.transform = "scale(0.92)")}
                              onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                            >
                              <span style={{ fontSize: "15px",
                                fontFamily: "'Toronto Subway', sans-serif",
                                letterSpacing: "0.02em",
                                fontWeight: 500,
                                color: "inherit" }}
                                >Try it out</span>
                              <ExternalLink style={{ width: "13px", height: "13px", opacity: 0.65 }} />
                            </a>
                          )}
                        </div>
                        {/* Description: always visible on mobile, hover-reveal on desktop */}
                        {(!selectedId || isMobile) && (
                          <p style={{
                            position: isMobile ? "static" : "absolute", left: 0, right: 0, top: "100%",
                            fontSize: "13px", color: "var(--text-2)", lineHeight: "1.6",
                            opacity: isMobile ? 1 : (hoveredId === project.id ? 1 : 0),
                            transform: isMobile ? "none" : (hoveredId === project.id ? "translateY(0)" : "translateY(-6px)"),
                            transition: "opacity 0.25s ease, transform 0.25s ease",
                            pointerEvents: "none", paddingTop: "8px", paddingLeft: isMobile ? "0" : "13.5px",
                          }}>{project.description}</p>
                        )}
                      </div>
                    </motion.div>
                    </motion.div>
                  ))}
                </div>

                {/* Load more */}
                <div style={{ opacity: selectedId ? 0 : 1, transition: "opacity 0.3s ease", pointerEvents: selectedId ? "none" : "auto" }}>
                  <div className="flex justify-center mt-6">
                    {!showAdditional && (
                      <Button onClick={() => setShowAdditional(true)} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 squircle-lg">
                        Load More Projects
                      </Button>
                    )}
                  </div>
                  <div className="mt-8">
                    <p style={{ fontSize: "13px", color: "var(--text-3)", letterSpacing: "0.02em" }}>You've reached the terminus, but new projects are always coming. Check back soon for updates!</p>
                  </div>
                </div>
              </motion.div>

              {/* ── Right panel (desktop only) ── */}
              <AnimatePresence>
                {selectedId && !isMobile && (
                  <motion.div
                    key="panel"
                    layout
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ type: "spring", stiffness: 260, damping: 30 }}
                    style={{
                      flex: 1,
                      position: "sticky",
                      top: "80px",
                      height: "calc(100vh - 120px)", //used to be -96px
                      borderRadius: 24,
                      marginBottom: 24,
                      overflow: "hidden",
                      background: "var(--card-bg)",
                      display: "flex",
                      flexDirection: "column",
                      minWidth: 0,
                    }}
                  >
                    <iframe
                      key={selectedId}
                      src={`/projects/${selectedId}?panel=1`}
                      style={{ flex: 1, border: "none", width: "100%", background: "var(--bg)" }}
                      title={selectedProject?.title}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
            </LayoutGroup>
          </StaggeredContent>

        </main>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </AnimatedPage>
  )
}
