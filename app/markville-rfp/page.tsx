"use client"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"
import { Button } from "@/components/ui/button"
import { ExternalLink, Award, FileText, X, ArrowUpRight } from "lucide-react"
import { useState, useEffect } from "react"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { useIsPanel } from "@/hooks/use-is-panel"
import { RelatedProjects } from "@/components/related-projects"
import { CollapsibleDetails, itemVariants } from "@/components/collapsible-details"
import { motion } from "framer-motion"

export default function MarkvilleRFPProjectPage() {
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
          currentPage="/markville-rfp"
          rightLinks={[
            {
              href: "https://devpost.com/software/rebranding-the-markville-secondary-plan-with-tod",
              text: "Devpost",
              external: true,
            },
            {
              href: "https://drive.google.com/file/d/1MNG2sU7dm8WwcadvKp_FIT0mVTRGYa7f/view?usp=sharing",
              text: "View Document",
              external: true,
            },
          ]}
        />
        {isPanel && <div style={{ position: "fixed", top: 16, right: 16, display: "flex", gap: 6, zIndex: 50 }}>
          <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "open" }, "*")} className="nav-item" style={{ padding: "6px" }}><ArrowUpRight className="w-4 h-4" /></button>
          <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "close" }, "*")} className="nav-item" style={{ padding: "6px" }}><X className="w-4 h-4" /></button>
        </div>}

        <main className="max-w-3xl mx-auto p-6 [&_p]:text-[var(--text-2)]" style={{ paddingTop: isMobile ? "0px" : "60px" }}>
          <StaggeredContent delay={0}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold italic mb-2">
                RFP: Rebranding the Markville Secondary Plan
              </h1>
              <p className="text-lg text-[var(--text-2)]">Urban Planning Design, 2024</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">City Design Challenge Winner</span>
              </div>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={100}>
            {/* Hero Image */}
            <div className="relative mb-8 aspect-video w-full bg-[var(--surface)] overflow-hidden rounded-lg">
              <img
                src="/images/markville-rfp-cover.png"
                alt="RFP: Rebranding the Markville Secondary Plan cover"
                className="w-full h-full object-cover"
              />
            </div>
          </StaggeredContent>

          <StaggeredContent delay={300}>
            <CollapsibleDetails labels={["Timeline", "Achievement", "Tools", "Overview"]} animateContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Timeline</p>
                  <p className="text-[var(--text-2)]">Hackathon project, 2024</p>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Achievement</p>
                  <div className="space-y-2 text-[var(--text-2)]">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span>Winner - City Design Challenge Hackathon</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Tools</p>
                  <div className="space-y-1 text-[var(--text-2)]">
                    <p>Urban Planning Research</p>
                    <p>Design Strategy</p>
                    <p>Transit-Oriented Development (TOD)</p>
                    <p>Community Engagement</p>
                  </div>
                </motion.div>
              </div>

              <motion.div variants={itemVariants}>
                <p className="section-label mb-2">Overview</p>
                <div className="space-y-4 text-[var(--text-2)]">
                  <p>
                    A comprehensive rebranding proposal for the Markville Secondary Plan that won the City Design
                    Challenge hackathon. This project focused on reimagining urban development through transit-oriented
                    design principles.
                  </p>
                  <p>
                    The proposal addresses key urban planning challenges and presents innovative solutions for
                    sustainable community development, integrating transportation, housing, and commercial spaces.
                  </p>
                  <p>
                    The hackathon was judged by Reid McAlpine, Councillor - Ward 3 Unionville at City of Markham, making
                    this project also a form of advocacy.
                  </p>
                </div>
              </motion.div>
            </div>
            </CollapsibleDetails>
          </StaggeredContent>

          {/* Mission — uncomment and fill in when ready
          <StaggeredContent delay={350}>
            <div className="py-8">
              <p className="section-label mb-2">The Mission</p>
              <p className="text-3xl leading-snug" style={{ color: "var(--text)" }}>
                TODO: What was the goal of the Markville RFP?
              </p>
            </div>
          </StaggeredContent>
*/}

          <StaggeredContent delay={500}>
            <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-2)] mb-8">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Project Documentation
              </h3>
              <p className="text-[var(--text-2)] mb-4">
                View the complete RFP document detailing our comprehensive rebranding strategy and urban planning
                proposals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="bg-[var(--text)] hover:bg-[var(--text-2)] text-[var(--bg)]">
                  <a
                    href="https://drive.google.com/file/d/1MNG2sU7dm8WwcadvKp_FIT0mVTRGYa7f/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Full Document
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-[var(--border-2)] text-[var(--text)] hover:bg-[var(--surface)] bg-transparent"
                >
                  <a
                    href="https://devpost.com/software/rebranding-the-markville-secondary-plan-with-tod"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    View on Devpost
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={700}>
            <div className="prose prose-invert prose-green max-w-none">
              <h2 className="text-2xl font-bold mb-4">Project Highlights</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-2)]">
                  <h4 className="font-bold mb-2">Transit-Oriented Development</h4>
                  <p className="text-[var(--text-2)] text-sm">
                    Integrated transportation planning with residential and commercial development to create
                    sustainable, walkable communities.
                  </p>
                </div>

                <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-2)]">
                  <h4 className="font-bold mb-2">Community Engagement</h4>
                  <p className="text-[var(--text-2)] text-sm">
                    Developed strategies for meaningful community involvement in the planning process, ensuring resident
                    voices are heard.
                  </p>
                </div>

                <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-2)]">
                  <h4 className="font-bold mb-2">Sustainable Design</h4>
                  <p className="text-[var(--text-2)] text-sm">
                    Incorporated environmental sustainability principles and green infrastructure throughout the
                    planning proposal.
                  </p>
                </div>

                <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-2)]">
                  <h4 className="font-bold mb-2">Economic Viability</h4>
                  <p className="text-[var(--text-2)] text-sm">
                    Balanced ambitious planning goals with practical economic considerations and implementation
                    strategies.
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">Impact & Recognition</h2>
              <p className="text-[var(--text-2)] mb-4">
                This project was recognized as the winner of the City Design Challenge hackathon, demonstrating
                innovative approaches to urban planning and community development. The comprehensive proposal showcases
                the potential for reimagining suburban development through transit-oriented design principles.
              </p>

              <p className="text-[var(--text-2)]">
                The project represents a collaborative effort to address real-world urban planning challenges while
                considering the needs of diverse community stakeholders and long-term sustainability goals.
              </p>
            </div>
          </StaggeredContent>

          {!isPanel && (
            <RelatedProjects currentId="markville-rfp" />
          )}
        </main>

        <StaggeredContent delay={1100}>
        </StaggeredContent>
      </div>
    </AnimatedPage>
  )
}
