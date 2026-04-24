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
          currentPage="/work/cec"
          rightLinks={[{ href: "https://www.careereducationcouncil.ca/", text: "Website", external: true }]}
        />
        {isPanel && <div style={{ position: "fixed", top: 16, right: 16, display: "flex", gap: 6, zIndex: 50 }}>
          <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "open" }, "*")} className="nav-item" style={{ padding: "6px" }}><ArrowUpRight className="w-4 h-4" /></button>
          <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "close" }, "*")} className="nav-item" style={{ padding: "6px" }}><X className="w-4 h-4" /></button>
        </div>}

        <main className="max-w-3xl mx-auto p-6" style={{ paddingTop: isMobile ? "0px" : "60px" }}>
          <StaggeredContent delay={0}>
            {" "}
            {/* Changed from 200 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold italic text-green-400 mb-2 flex items-center justify-center gap-2">
                <img
                  src="/images/projects/cec/logo.webp"
                  alt="Career Education Council Logo"
                  className="w-8 h-8 object-contain" // Adjusted size for title
                />
                Career Education Council
              </h1>
              <p className="text-lg text-gray-300">Work, 2024-2025</p>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={100}>
            {" "}
            {/* Changed from 400 */}
            {/* Hero Image */}
            <div className="relative mb-8 aspect-video w-full bg-gray-800 overflow-hidden rounded-lg">
              <img src="/placeholder.svg" alt="" className="w-full h-full object-cover" />
            </div>
          </StaggeredContent>

          <StaggeredContent delay={300}>
            {" "}
            {/* Changed from 600 */}
            <CollapsibleDetails labels={["Timeline", "Team", "Overview"]}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div>
                  <p className="section-label mb-2">Timeline</p>
                  <p className="text-gray-300">5 months, September 2024-January 2025</p>
                </div>

                <div>
                  <p className="section-label mb-2">Team</p>
                  <div className="space-y-1 text-gray-300"></div>
                </div>
              </div>

              <div>
                <p className="section-label mb-2">Overview</p>
                <div className="space-y-4 text-gray-300">
                  <p>Page is WIP. Career Education Council is based in Guelph, Ontario.</p>
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
                TODO: What was the goal of the Career Education Council work?
              </p>
            </div>
          </StaggeredContent>
*/}
          {!isPanel && (
            <RelatedProjects currentId="cec" />
          )}
        </main>

        <StaggeredContent delay={1100}>
        </StaggeredContent>
      </div>
    </AnimatedPage>
  )
}
