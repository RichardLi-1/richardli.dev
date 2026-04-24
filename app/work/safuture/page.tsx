"use client"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"
import { ExternalLink, X, ArrowUpRight, Maximize2, Code2, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { RelatedProjects } from "@/components/related-projects"
import { useIsPanel } from "@/hooks/use-is-panel"
import { CaseStudyNav } from "@/components/case-study-nav"
import { CollapsibleDetails } from "@/components/collapsible-details"

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
      {!isPanel && (
        <CaseStudyNav sections={[
          { id: "sf-background", label: "Background" },
          { id: "sf-chatbots", label: "Chatbots" },
          { id: "sf-sales", label: "Sales Lead Identifier" },
          { id: "sf-clients", label: "Work for Clients" },
          { id: "sf-experience", label: "The Experience" },
          { id: "sf-takeaways", label: "Takeaways" },
        ]} />
      )}
      <div className="mx-auto">
        <AnimatedHeader
          backHref="/work"
          backText="Back"
          currentPage="/work/safuture"
        />
        {isPanel && <div style={{ position: "fixed", top: 16, right: 16, display: "flex", gap: 6, zIndex: 50 }}>
          <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "open" }, "*")} className="nav-item" style={{ padding: "6px" }}><ArrowUpRight className="w-4 h-4" /></button>
          <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "close" }, "*")} className="nav-item" style={{ padding: "6px" }}><X className="w-4 h-4" /></button>
        </div>}

        <main className="max-w-3xl mx-auto p-6 space-y-6 [&_p]:text-[var(--text-2)]" style={{ paddingTop: isMobile ? "0px" : "40px" }}>
          <StaggeredContent delay={0}>
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">SaFuture Inc & Qwhery</h1>
              <p className="text-m text-gray-400">Work, 2026</p>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={100}>
            {" "}
            {/* Changed from 400 */}
            <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-lg">
              <img
                src="/images/projects/safuture/SaFuture Banner.png"
                alt="Smart Rutherford screenshots"
                className="w-full h-full object-cover"
              />
            </div>
          </StaggeredContent>

          <StaggeredContent delay={300}>
            <CollapsibleDetails labels={["Timeline", "Role", "Links", "Overview", "Tools"]}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div>
                  <p className="section-label mb-2">Timeline</p>
                  <p>Dec 2025 - Apr 2026</p>
                </div>
                <div>
                  <p className="section-label mb-2">Role</p>
                  <p>Software Engineer</p>
                </div>
                <div>
                  <p className="section-label mb-2">Links</p>
                  <a href="https://safuture.net/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:underline">
                    <ExternalLink className="w-4 h-4" />
                    Website
                  </a>
                </div>
              </div>
              <div>
                <p className="section-label mb-2">Overview</p>
                <div className="space-y-4">
                  <p>AI and GIS</p>
                </div>
                <p className="section-label mb-2">Tools</p>
                <div>
                  <p>Angular</p>
                  <p>PostgreSQL</p>
                  <p>SQLAlchemy</p>
                  <p>Python</p>
                  <p>FastAPI</p>
                  <p>TypeScript</p>
                  <p>JavaScript</p>
                  <p>jQuery</p>
                  <p>Azure DevOps</p>
                </div>
              </div>
            </div>
            </CollapsibleDetails>
          </StaggeredContent>

          {/* Mission — uncomment and fill in when ready*/}
          <StaggeredContent delay={350}>
            <div className="py-8">
              <p className="section-label mb-2">The Mission</p>
              <p className="text-3xl leading-snug" style={{ color: "var(--text)" }}>
                Support municipalities in adopting AI and NG911 
              </p>
            </div>
          </StaggeredContent>


          <StaggeredContent delay={400}>
            <div className="mb-8">
              <h2 id="sf-background" className="font-bold mb-4 text-2xl">Background</h2>
              <p>SaFuture Inc and Qwhery are two startups focused on developing IT and GIS solutions for counties and municipalities.</p>

              <h2 className="font-bold mt-8 mb-2 text-2xl">What I Did</h2>
              <p>The internship was split in three parts with the intent goal of <br></br>1.  creating an improved data indexing pipeline<br></br>2.  improving sales prospecting<br></br>3.  on knocking out a long list of feature requests for a client.</p>

              <h2 id="sf-chatbots" className="font-bold mt-8 mb-2 text-2xl">Chatbots for Property Assessment</h2>
              <p>I worked on improving the existing data indexing pipeline and its integration into the web dashboard.</p>
            <p>The backend involved over 60 API routes to manage all of the moving parts involved with the product. I contributed to various parts of this, as well as writing new routes for control over data indexing. This was a unique challenge as changes would require simultaneous modifications in three repositories.</p>
            {/*<br></br><p>Without revealing too much:</p>
            <img src="/images/projects/safuture/Frame 44.png" className="w-full squircle rounded-lg" />*/}

              <h2 id="sf-sales" className="font-bold mt-8 mb-2 text-2xl">Sales Lead Identifier</h2>
              <p>The existing flow for identifying sales prospects was to manually web search government directories for leads. Thus, automation had huge potential benefit here.<br></br><br></br>Automation had been previously tested using web scraping, but yielded low accuracy results. I experimented with web search APIs, Playwright web scraping, and LLMs with web search like <code className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: "var(--surface)", color: "var(--text-2)" }}>gpt-4o-mini-search-preview</code>. LLMs proved to be the most efficient. I integrated the Hunter.io API for email search and LangChain for orchestration. <br></br><br></br>The tool achieved 80% accuracy and saved 30+ hours of manual searching per week. This was my overall favourite project as I got to build it from scratch and pilot it.</p>

              <h2 id="sf-clients" className="font-bold mt-8 mb-2 text-2xl">Work for Clients</h2>
              <p>I can't disclose as much for this one, but I shipped 25+ feature requests. This project was interesting, and I learned how to manage stakeholders who are in charge of different parts of the tech stack.</p>
              <ul className="list-disc list-inside mt-2 mb-2 space-y-1" style={{ color: "var(--text-2)" }}>
                <li>UI improvements and bug fixes across map dashboards</li>
                <li>New API endpoints and database queries for client-specific data and features such as notes</li>
                <li>Improving usage of Google Maps API for better map indicators</li>
              </ul>

              <h2 id="sf-experience" className="font-bold mt-8 mb-2 text-2xl">The Experience</h2>
              <p>This was my first experience working with professional software engineering processes at scale. I integrated into the team's workflow pretty quickly, shipping code from day two. We were given a lot of ownership over our projects and I learned a lot about both software engineering and mapping technologies.</p>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={500}>
            <div className="mb-8">
              <h2 id="sf-takeaways" className="font-bold mb-8 text-2xl">Takeaways</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <Maximize2 className="w-6 h-6 mb-4" style={{ color: "var(--text)" }} />
                  <h3 className="font-bold mb-2">Working At A Larger Scale</h3>
                  <p style={{ color: "var(--text-2)" }}>Navigating larger codebases and multi-repo projects were challenging but rewarding.</p>
                </div>
                <div>
                  <Code2 className="w-6 h-6 mb-4" style={{ color: "var(--text)" }} />
                  <h3 className="font-bold mb-2">Emphasizing Quality and Testing</h3>
                  <p style={{ color: "var(--text-2)" }}>Trial and error taught me how important testing and quality are; especially to prevent silent failures.</p>
                </div>
                <div>
                  <Users className="w-6 h-6 mb-4" style={{ color: "var(--text)" }} />
                  <h3 className="font-bold mb-2">Teamwork & Collaboration</h3>
                  <p style={{ color: "var(--text-2)" }}>Effective cross-functional communication in projects with many moving parts.</p>
                </div>
              </div>
            </div>
          </StaggeredContent>

          {!isPanel && (
            <RelatedProjects currentId="safuture" />
          )}
        </main>

      </div>
    </AnimatedPage>
  )
}
