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
import { CollapsibleDetails } from "@/components/collapsible-details"


export default function SalesPatriotProjectPage() {
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
        <AnimatedHeader
          backHref="/work"
          backText="Back"
          currentPage="/work/fatherfigure"
          rightLinks={[{ href: "https://github.com/fiof25/father-figure-htn", text: "GitHub", external: true }]}
        />

        <main className="max-w-3xl mx-auto p-6" style={{ paddingTop: isMobile ? "0px" : "60px" }}>
          <StaggeredContent delay={0}>
            <div className="flex">
              <div className="mb-4">
                {isPersonalized && (
                  <h1 className="text-4xl mb-2 flex gap-2 text-[#00A6E3] [.light_&]:text-[#0082b12]/70">
                  Father Figure
                </h1>
                )}
                {!isPersonalized && (
                  <h1 className="text-4xl mb-2 flex gap-2 [.light_&]:text-[#0082b12]/70">
                  Father Figure
                </h1>
                )}
                
                <h1 className="text-m text-gray-400">Project, 2025</h1>
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
            <div className="relative mb-8 aspect-video w-full bg-gray-800 overflow-hidden squircle" style={{ borderRadius: 16 }}>
              <img src="/images/projects/fatherfigure/banner.png" alt="Father Figure app banner" className="w-full h-full object-cover" />
            </div>
          </StaggeredContent>

          <StaggeredContent delay={300}>
            <CollapsibleDetails labels={["Timeline", "Team"]}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div>
                  <p className="section-label mb-2">Timeline</p>
                  <p className="text-gray-300">Hack the North (September 2025)</p>
                </div>
                <div>
                  <p className="section-label mb-2">Team</p>
                  <a href="https://www.linkedin.com/in/fiona-fangg/" target="_blank"><p>Fiona Fang</p></a>
                  <div className="space-y-1 text-gray-300"></div>
                </div>
              </div>
              <div>
                <h3 className="text-green-400 font-bold mb-2">Inspiration</h3>
                <div className="space-y-4 text-gray-300">
                  <p>Fatherlessness makes ripples. Father Figure is not just another Chrome extension... It is a friend, a father and a way to make your doomscrolling even just a little less lonely. 😞</p>
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
                TODO: What was the goal of Father Figure?
              </p>
            </div>
          </StaggeredContent>
*/}

          <StaggeredContent delay={300}>
            <p>Watch Dad Sneeze: <a href="https://youtu.be/Pkpd0WDR_sA">https://youtu.be/Pkpd0WDR_sA</a></p>
          </StaggeredContent>

          <StaggeredContent delay={300}>
            <div className="space-y-4 text-gray-300">
              <p>Designed different personas that were composed of hand-drawn characters with different emotions Created custom event triggers for Dave to pop up on (e.g. tab overload, late night, emotional check-ins) Used Gemini AI to generate conversation and different personalities + ElevenLabs API to simulate dad voice Challenges we ran into but conquered successfully 🥊 Format... we weren't sure how we would display things to ensure convenience and seamlessness, but thank goodness it all worked out Timing the animation and audio correctly for maximum dad-ness 😅 😞</p>
            </div>
          </StaggeredContent>
          {!isPanel && (
            <RelatedProjects currentId="fatherfigure" />
          )}
        </main>

        <StaggeredContent delay={1100}>
        </StaggeredContent>

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
