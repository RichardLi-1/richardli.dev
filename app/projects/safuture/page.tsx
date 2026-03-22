"use client"
import { Footer } from "@/components/footer"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"
import { ExternalLink, X, ArrowUpRight } from "lucide-react"
import { useState, useEffect } from "react"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { RelatedProjects } from "@/components/related-projects"
import { useIsPanel } from "@/hooks/use-is-panel"

export default function SaFuturePage() {
  usePageViewTracker()
  const isPanel = useIsPanel()
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return (
    <AnimatedPage>
      <div className="mx-auto">
        <AnimatedHeader
          backHref="/projects"
          backText="Back"
          currentPage="/projects/safuture"
        />
        {isPanel && <div style={{ position: "fixed", top: 16, right: 16, display: "flex", gap: 6, zIndex: 50 }}>
          <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "open" }, "*")} className="nav-item" style={{ padding: "6px" }}><ArrowUpRight className="w-4 h-4" /></button>
          <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "close" }, "*")} className="nav-item" style={{ padding: "6px" }}><X className="w-4 h-4" /></button>
        </div>}

        <main className="max-w-6xl mx-auto p-6 space-y-6 [&_p]:text-[var(--text)]" style={{ paddingTop: isMobile ? "0px" : "40px" }}>
          <StaggeredContent delay={0}>
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">SaFuture Inc & Qwhery</h1>
              <p className="text-m text-gray-400">Work, 2026</p>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={300}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-2">Timeline</h3>
                  <p>Winter 2026</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Role</h3>
                  <p>Software Engineer</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Links</h3>
                  <a href="#" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:underline">
                    <ExternalLink className="w-4 h-4" />
                    Website
                  </a>
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-2">Overview</h3>
                <div className="space-y-4">
                  <p>Add overview here.</p>
                </div>
                <h3 className="font-bold mb-2 mt-4">Technologies</h3>
                <div>
                  <p>Angular</p>
                  <p>PostgreSQL</p>
                  <p>SQLAlchemy</p>
                  <p>Python</p>
                  <p>FastAPI</p>
                  <p>TypeScript</p>
                  <p>JavaScript</p>
                  <p>jQuery</p>
                </div>
              </div>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={400}>
            <div className="mb-8">
              <h2 className="font-bold mb-4 text-2xl">Background</h2>
              <p>SaFuture Inc and Qwhery are two startups focused on developing IT and GIS solutions for municipalities</p>

              <h2 className="font-bold mt-8 mb-2 text-2xl">What I Did</h2>
              <p>Add content here.</p>

              <h2 className="font-bold mt-8 mb-2 text-2xl">Qwhery Quest</h2>
              <p>I worked on the data indexing pipeline and its integration into the web dashboard.</p>
            <p>The backend involved over 60 API routes to manage all of the moving parts involved with the product. I contributed to various parts of this, as well as writing new routes for control over data indexing.</p>



              <h2 className="font-bold mt-8 mb-2 text-2xl">Sales Lead Identifier</h2>
              <p>This was my overall favourite project as I got to build it from scratch and pilot it.</p>

              <h2 className="font-bold mt-8 mb-2 text-2xl">Work for ERIS</h2>
              <p>I can't disclose as much for this one, but I made changes. This project was interesting, and I learned how to manage stakeholders who are in charge of different parts of the tech stack.</p>

              <h2 className="font-bold mt-8 mb-2 text-2xl">The Experience</h2>
              <p>This was my first experience working with professional software engineering processes. I integrated into the team's workflow pretty quickly, shipping code from day two. We were given a lot of ownership over our projects and I learned a lot about both software engineering and mapping technologies.</p>
            </div>
          </StaggeredContent>

          <RelatedProjects currentId="safuture" />
        </main>

        <StaggeredContent delay={1100}>
          <Footer />
        </StaggeredContent>
      </div>
    </AnimatedPage>
  )
}
