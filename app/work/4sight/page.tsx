"use client"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"
import { RelatedProjects } from "@/components/related-projects"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { useState, useEffect } from "react"
import { useIsPanel } from "@/hooks/use-is-panel"
import { X, ArrowUpRight } from "lucide-react"
import { CollapsibleDetails, itemVariants } from "@/components/collapsible-details"
import { motion } from "framer-motion"

export default function SightProjectPage() {
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
          currentPage="/work/4sight"
          rightLinks={[
            { href: "https://eye-tester-app.vercel.app/", text: "Live Demo", external: true },
            { href: "https://github.com/justinwuzijin/eye-tester-app", text: "GITHUB", external: true },
          ]}
        />
        {isPanel && <div style={{ position: "fixed", top: 16, right: 16, display: "flex", gap: 6, zIndex: 50 }}>
          <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "open" }, "*")} className="nav-item" style={{ padding: "6px" }}><ArrowUpRight className="w-4 h-4" /></button>
          <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "close" }, "*")} className="nav-item" style={{ padding: "6px" }}><X className="w-4 h-4" /></button>
        </div>}

        <main className="max-w-3xl mx-auto p-6 [&_p]:text-[var(--text-2)]" style={{ paddingTop: isMobile ? "0px" : "60px" }}>
          <StaggeredContent delay={0}>
            {" "}
            {/* Changed from 200 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold italic mb-2 flex items-center justify-center gap-2">
                <img
                  src="/images/projects/4sight/logo.png"
                  alt="4Sight project logo"
                  className="w-8 h-8 object-contain rounded-md" // Adjusted size for title
                />
                4Sight
              </h1>
              <p className="text-lg text-[var(--text-2)]">Project, 2025</p>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={100}>
            {" "}
            {/* Changed from 400 */}
            <div className="relative mb-8 aspect-video w-full bg-[var(--surface)] overflow-hidden rounded-lg">
              <img
                src=""
                alt="4Sight project screenshots"
                className="w-full h-full object-cover"
              />
            </div>
          </StaggeredContent>

          <StaggeredContent delay={300}>
            {" "}
            {/* Changed from 600 */}
            <CollapsibleDetails labels={["Timeline", "Tools", "Team", "Overview"]} animateContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Timeline</p>
                  <p className="text-[var(--text-2)]">May 2025</p>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Tools</p>
                  <div className="space-y-1 text-[var(--text-2)]">
                    <p>Next.js (App Router)</p>
                    <p>Web Speech API</p>
                    <p>TouchDesigner</p>
                    <p>Tailwind CSS</p>
                    <p>face-api.js</p>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Team</p>
                  <div className="space-y-1 text-[var(--text-2)]">
                    <a className="hover:underline" target="_blank" href="https://www.linkedin.com/in/fiona-fangg/"><p>Fiona Fang</p></a>
                    <a className="hover:underline" target="_blank" href="https://www.linkedin.com/in/justin-wu-171481162/"><p>Justin Wu</p></a>
                    <a className="hover:underline" target="_blank" href="https://www.linkedin.com/in/petersen-matthew/"><p>Matthew Petersen</p></a>
                  </div>
                </motion.div>
              </div>
              <motion.div variants={itemVariants}>
                <p className="section-label mb-2">Overview</p>
                <div className="space-y-4 text-[var(--text-2)]">
                  <p>
                    An experimental Next.js application for vision testing that includes gaze tracking and peripheral vision assessments. The app uses the device webcam and microphone, face-api.js models, and a modern UI built with Tailwind CSS and Radix UI.</p>

                  <p>
                    Half of the global population is expected to be myopic by 2050. 4Sight is an accessible, user-friendly way to screen for vision loss without needing a clinic. It provides a convenient, at-home method to track vision changes — see clearly, live fully.
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
                TODO: What was the goal of 4sight?
              </p>
            </div>
          </StaggeredContent>
*/}

          {/* Wrap all remaining content sections in StaggeredContent with increasing delays */}
          <StaggeredContent delay={500}>
            {" "}
            {/* Changed from 800 */}
            <div className="prose prose-invert prose-green max-w-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Demo</h2>
                  <iframe width="560" height="315" src="https://www.youtube.com/embed/nIDPlmvfIDk?si=uIwV_3CJ0K1jFEXh" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                </div>
                
              </div>
              </div>

              <div className="my-12">
              <iframe width="560" height="315" src="https://www.youtube.com/embed/G-rITGNKfxI?si=7lBqLqzAdgIEbJIf" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                <p>Shoutout Justin for this</p>
                
              </div>

              <h2 className="text-2xl font-bold mb-4">Design</h2>
              <p className="text-[var(--text-2)] mb-4">
                
                <ul className="text-[var(--text-2)] space-y-2 mb-6">
                  <li></li>
                  <li></li>
                </ul>
              </p>

              

          </StaggeredContent>
          {!isPanel && (
            <RelatedProjects currentId="4sight" />
          )}
        </main>

        <StaggeredContent delay={1100}>
        </StaggeredContent>
      </div>
    </AnimatedPage>
  )
}
