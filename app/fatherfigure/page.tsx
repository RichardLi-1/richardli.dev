"use client"
import { useState, useEffect } from "react"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"
import { useWindowsXP } from "@/contexts/windows-xp-context"
import { DraggableSticker } from "@/components/draggable-sticker"
import { RelatedProjects } from "@/components/related-projects"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { useIsPanel } from "@/hooks/use-is-panel"
import { ExternalLink, X, ArrowUpRight } from "lucide-react"
import { CollapsibleDetails, itemVariants } from "@/components/collapsible-details"
import { motion } from "framer-motion"


export default function SalesPatriotProjectPage() {
  const chromeStoreLink = "https://chromewebstore.google.com/detail/father-figure/dmkminnihibbmkjahphedaldbldpabnl"
  usePageViewTracker()
  const isPanel = useIsPanel()
  const { isPersonalized } = useWindowsXP()
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return (
    <AnimatedPage>
      <div className="min-h-screen page-bg" style={{ position: "relative" }}>
        <AnimatedHeader currentPage="/fatherfigure" />

        <main className="max-w-3xl mx-auto p-6 [&_p]:text-[var(--text-2)]" style={{ paddingTop: isMobile ? "0px" : "60px" }}>
          <StaggeredContent delay={0}>
            <div className={`relative ${isPanel ? "pr-20" : ""}`}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <h1 className="text-4xl font-bold mb-0">Father Figure</h1>
                <nav className="flex shrink-0 items-center gap-1" aria-label="Father Figure project links">
                  <a
                    href={chromeStoreLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Father Figure on Chrome Web Store (opens in a new tab)"
                    className="inline-flex rounded-md p-2 text-[var(--text-3)] transition-colors hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-3)]"
                  >
                    <img
                      src="/images/icons/chrome-web-store.svg"
                      alt="Chrome Web Store"
                      className="h-5 w-5"
                      style={{ filter: "grayscale(1) saturate(0) brightness(0.9)", opacity: 0.78 }}
                    />
                  </a>
                  <a
                    href="https://github.com/fiof25/father-figure-htn"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Father Figure source code on GitHub (opens in a new tab)"
                    className="inline-flex rounded-md p-2 text-[var(--text-3)] transition-colors hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-3)]"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.866-.013-1.7-2.782.605-3.369-1.343-3.369-1.343-.454-1.157-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.748-1.026 2.748-1.026.546 1.378.202 2.398.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.31.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .269.18.58.688.481A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
                    </svg>
                  </a>
                </nav>
              </div>
              <div className="mb-4">
                <p className="text-m" style={{ color: "var(--text-3)" }}>Project, 2025</p>
              </div>

              {isPanel && (
                <span className="right-4 top-0.5 absolute">
                  <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "open" }, "*")}><ArrowUpRight className="w-6 h-6" /></button>
                  <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "close" }, "*")}><X className="w-6 h-6" /></button>
                </span>
              )}
            </div>
          </StaggeredContent>

          <StaggeredContent delay={100}>
            <div className="relative mb-8 aspect-video w-full bg-[var(--surface)] overflow-hidden squircle" style={{ borderRadius: 16 }}>
              <img src="/images/projects/fatherfigure/banner.png" alt="Father Figure app banner" className="w-full h-full object-cover" />
            </div>
          </StaggeredContent>

          <StaggeredContent delay={300}>
            <CollapsibleDetails labels={["Timeline", "Team"]} animateContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Timeline</p>
                  <p className="text-[var(--text-2)]">Hack the North (September 2025)</p>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Team</p>
                  <a href="https://www.linkedin.com/in/fiona-fangg/" target="_blank"><p>Fiona Fang</p></a>
                  <div className="space-y-1 text-[var(--text-2)]"></div>
                </motion.div>
              </div>
              <motion.div variants={itemVariants}>
                <h3 className="font-bold mb-2">Inspiration</h3>
                <div className="space-y-4 text-[var(--text-2)]">
                  <p>We built Father Figure at Hack the North around one idea: browsing can feel lonely, especially during long nights of school, work, or doomscrolling.</p>
                  <p>Instead of a generic productivity bot, we designed a playful dad companion that checks in, jokes around, and gives practical support directly in the browser where stress actually happens.</p>
                </div>
              </motion.div>
            </div>
            </CollapsibleDetails>
          </StaggeredContent>

          {/* Mission — uncomment and fill in when ready*/}
          <StaggeredContent delay={350}>
            <div className="py-8">
              <p className="section-label mb-2">The Mission</p>
              <p className="text-3xl leading-snug" style={{ color: "var(--text)" }}>
                Build a caring, funny browser-side companion that feels human and supportive, not robotic.
              </p>
            </div>
          </StaggeredContent>


          <StaggeredContent delay={300}>
            <a
              href={chromeStoreLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-2)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              Check it out on the Chrome Web Store
              <ExternalLink className="w-4 h-4" />
            </a>
          </StaggeredContent>

          <StaggeredContent delay={300}>
            <div className="mt-6 space-y-4 text-[var(--text-2)]">
              <p className="section-label">Case Study</p>
              <p>We implemented three distinct father personas (Bill, Dave, and Chang), each with separate system instructions, voice mapping, and conversation history so interactions stay consistent per character.</p>
              <p>The content script injects a draggable on-page dad avatar that can wake/sleep, chat, and react with animated states. We also built timed behavior loops for dad jokes, encouragement messages, video prompts, and random sneezes to make the companion feel alive over long browsing sessions.</p>
              <p>For intelligence, we used Gemini to generate short in-character responses and context-aware jokes. When users ask for help, we extract visible page text and append that context to the prompt so advice can reference what is currently on screen.</p>
              <p>For voice, we integrated ElevenLabs with per-persona voices plus browser speech synthesis fallback when API keys are missing. A speech queue prevents overlapping audio/events so responses feel natural instead of chaotic.</p>
              <p>One challenge was balancing novelty with usability. We solved that by using lightweight overlays, clear close controls, and activity-aware triggers (for example, only running noisy interactions on visible tabs).</p>
              <p>Publishing on the Chrome Web Store also taught me a lot about extension permissions and review expectations. We had to be deliberate about what we requested, why we requested it, and how to explain that clearly in our listing and privacy materials.</p>
              <p>Fiona likes chess, so we built a playful "Chess with Dad" mode directly into the extension as an extra way to interact beyond chat.</p>
              <div className="mt-6 space-y-4">
                <p className="section-label">Screenshots</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="squircle bg-[var(--surface)] p-2" style={{ borderRadius: 16 }}>
                    <img
                      src="/images/projects/fatherfigure/popup-persona-picker.png"
                      alt="Father Figure browser extension popup with Bill, Dave, and Chang persona cards and quick action buttons"
                      className="w-full h-auto squircle"
                      style={{ borderRadius: 12 }}
                      loading="lazy"
                    />
                  </div>
                  <div className="squircle bg-[var(--surface)] p-2" style={{ borderRadius: 16 }}>
                    <img
                      src="/images/projects/fatherfigure/chat-chang.png"
                      alt="In-page chat with the Chang persona responding to a sad message with comforting advice"
                      className="w-full h-auto squircle"
                      style={{ borderRadius: 12 }}
                      loading="lazy"
                    />
                  </div>
                </div>
                <p className="section-label">Demo Videos</p>
                <div className="squircle bg-[var(--surface)] p-2" style={{ borderRadius: 16 }}>
                  <div className="relative aspect-video w-full overflow-hidden squircle" style={{ borderRadius: 12 }}>
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/rnDSdft8QbM"
                      title="Father Figure full demo"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                </div>
                <div className="squircle bg-[var(--surface)] p-2" style={{ borderRadius: 16 }}>
                  <div className="relative aspect-video w-full overflow-hidden squircle" style={{ borderRadius: 12 }}>
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/Pkpd0WDR_sA"
                      title="Father Figure sneeze clip"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            </div>
          </StaggeredContent>
          {!isPanel && (
            <RelatedProjects currentId="fatherfigure" />
          )}
        </main>
        {isPersonalized && (
          <>
            <DraggableSticker src="/images/projects/fatherfigure/sneeze.png"       ix={0.72} iy={0.55} size={150} delay={0} />
            <DraggableSticker src="/images/projects/fatherfigure/sneeze-chang.png" ix={0.80} iy={0.25} size={130} delay={200} />
            <DraggableSticker src="/images/projects/fatherfigure/sneeze-dave.png"  ix={0.06} iy={0.45} size={140} delay={400} />
          </>
        )}
      </div>
    </AnimatedPage>
  )
}
