"use client"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"
import { RelatedProjects } from "@/components/related-projects"
import { useState, useEffect } from "react"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { useIsPanel } from "@/hooks/use-is-panel"
import { X, ArrowUpRight } from "lucide-react"
import { CollapsibleDetails } from "@/components/collapsible-details"

export default function SalesPatriotProjectPage() {
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
      <div className="min-h-screen page-bg">
        <AnimatedHeader
          backHref="/work"
          backText="Back"
          currentPage="/work/salespatriot"
          rightLinks={[{ href: "https://salespatriot.com/", text: "Website", external: true }]}
        />
        {isPanel && <div style={{ position: "fixed", top: 16, right: 16, display: "flex", gap: 6, zIndex: 50 }}>
          <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "open" }, "*")} className="nav-item" style={{ padding: "6px" }}><ArrowUpRight className="w-4 h-4" /></button>
          <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "close" }, "*")} className="nav-item" style={{ padding: "6px" }}><X className="w-4 h-4" /></button>
        </div>}

        <main className="antialiased max-w-3xl mx-auto p-6" style={{ paddingTop: isMobile ? "0px" : "60px" }}>
          <StaggeredContent delay={0}>
            <div className="text-left mb-4">
              <h1 className="text-3xl font-bold mb-2">SalesPatriot (YC W25)</h1>
              <h1 className="text-m text-gray-300">Work, 2025</h1>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={100}>
            {/* Hero Image */}
            <div className="relative mb-8 aspect-video w-full bg-gray-800 overflow-hidden" style={{cornerShape:"squircle", borderRadius:16}}>
              <img
                src="/images/projects/salespatriot/hero.png"
                alt="SalesPatriot screenshots"
                className="w-full h-full object-cover"
              />
            </div>
          </StaggeredContent>

          <StaggeredContent delay={300}>
            <CollapsibleDetails labels={["Timeline", "Team", "Tools", "Overview"]}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div>
                  <p className="section-label mb-2">Timeline</p>
                  <p className="text-gray-300">2 months, 2025</p>
                </div>

                <div>
                  <p className="section-label mb-2">Team</p>
                  <div className="space-y-1 text-gray-300">
                    <a href="https://www.linkedin.com/in/matthewkkimm/" target="_blank" className="underline">
                      <p>Matthew Kim</p>
                    </a>
                    <a href="https://www.linkedin.com/in/james-pham-915a08309/" target="_blank"  className="underline">
                      <p>James Pham</p>
                    </a>
                      <p>Nour Tanta</p>
                      <p>Praneil Bhashyakarla</p>
                  </div>
                </div>

                <div>
                  <p className="section-label mb-2">Tools</p>
                  <div className="space-y-1 text-gray-300">
                    <p>Figma</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="section-label mb-2">Overview</p>
                <div className="space-y-4 text-gray-300">
                  <p>
                    SalesPatriot is a San Francisco-based B2B SaaS platform that simplifies the
                    complexities of bidding on and managing contracts for NSNs for distributors and contractors.
                  </p>
                </div>
              </div>
            </div>
            </CollapsibleDetails>
          </StaggeredContent>

          {/* Mission — uncomment and fill in when ready
          <StaggeredContent delay={350}>
            <div className="py-8">
              <p className="section-label mb-2">The Mission</p>
              <p className="text-3xl leading-snug" style={{ color: "var(--text)" }}>
                TODO: What was the goal of SalesPatriot?
              </p>
            </div>
          </StaggeredContent>
*/}

          {/* New section for Figma prototype */}
          <StaggeredContent delay={500}>
            <section className="space-y-6 mb-12">
              <h2 className="text-2xl font-bold text-green-400 mb-4">Example Work</h2>
              <div className="relative mb-8 aspect-video w-full bg-gray-800 overflow-hidden rounded-lg border border-gray-700" style={{cornerShape:"squircle", borderRadius:16}}>
                <img
                  src="/images/projects/salespatriot/ai-prototype.png"
                  alt="SalesPatriot AI Proposal Writing Figma Prototype"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-gray-300">
                I designed an AI proposal writing
                feature seamlessly integrated into the existing workflow for contractors. The design focuses on
                simplifying the complex process of generating and managing proposals by leveraging AI to assist with
                content creation, compliance checks, and data sourcing.
              </p>

              <p className="text-gray-300">
                I also planned and facilitated team meetings with my group of interns.
              </p>
            </section>
          </StaggeredContent>
          {!isPanel && (
            <RelatedProjects currentId="salespatriot" />
          )}
        </main>

        <StaggeredContent delay={1100}>
        </StaggeredContent>
      </div>
    </AnimatedPage>
  )
}
