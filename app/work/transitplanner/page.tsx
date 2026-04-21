"use client"
import Image from "next/image"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"
import { ExternalLink, X, ArrowUpRight } from "lucide-react"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { RelatedProjects } from "@/components/related-projects"
import { useState, useEffect } from "react"
import { useIsPanel } from "@/hooks/use-is-panel"

export default function TransitPlannerProjectPage() {
  usePageViewTracker()
  const isPanel = useIsPanel()
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    if ((window as any).twttr?.widgets) {
      (window as any).twttr.widgets.load()
    }
  }, [])

  return (
    <AnimatedPage>
      <div className="mx-auto">
        <AnimatedHeader
          backHref="/work"
          backText="Back"
          currentPage="/work/transitplanner"
        />

        <main className="max-w-6xl mx-auto p-6 space-y-6" style={{ paddingTop: isMobile ? "0px" : "40px" }}>
          <StaggeredContent delay={0}>
            <div className="flex">
              <div className="mb-0">
                <h2 className="text-4xl font-bold mb-2">Transit Planner</h2>
                <p className="text-m text-gray-400">Web App, 2026</p>
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
            <div className="relative w-full overflow-hidden squircle rounded-lg bg-[var(--surface)]" style={{ aspectRatio: "960/594" }}>
              <video
                src="/videos/transitplanfinal.mov"
                aria-label="Transit Planner app demo"
                className="w-full h-full object-cover squircle"
                autoPlay
                loop
                disablePictureInPicture
                disableRemotePlayback
                muted
                playsInline
              />
            </div>
          </StaggeredContent>

          <StaggeredContent delay={300}>
            <div className="flex space-x-3 mb-4">
              <div className="flex squircle bg-zinc-200 dark:bg-zinc-800 max-width w-full rounded-xl border-2">
                <p className="p-2 py-3 px-3.5 text-zinc-800 dark:text-zinc-300">🥇 This project was awarded at Hack Canada 2026 in the Google - Build with AI Track</p>
              </div>
              <a href="https://www.transitplan.xyz/" target="_blank" rel="noopener noreferrer" className="truncate squircle rounded-xl flex items-center justify-center p-2 py-3 px-3.5 bg-zinc-800 text-zinc-200 dark:text-zinc-800 dark:bg-zinc-200 transition-transform duration-150 hover:scale-95 active:scale-90">Try it out!</a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-2">Timeline</h3>
                  <p>2026 - Present</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Team</h3>
                  <div className="space-y-1">
                    <a className="hover:underline" href="https://www.linkedin.com/in/fiona-fangg/" target="_blank"><p>Fiona Fang</p></a>
                    <a className="hover:underline" href="https://www.linkedin.com/in/evanzyang/" target="_blank"><p>Evan Yang</p></a>
                    <a className="hover:underline" href="https://www.linkedin.com/in/christopher-stevers-07b9a5204" target="_blank"><p>Christopher Stevers</p></a>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Links</h3>
                  <a href="https://www.transitplan.xyz/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:underline">
                    <ExternalLink className="w-4 h-4" />
                    Transit Planner App
                  </a>
                  <a href="https://devpost.com/software/transit-planner" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:underline">
                    <ExternalLink className="w-4 h-4" />
                    Devpost
                  </a>
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-2">Overview</h3>
                <div className="space-y-4">
                  <p>Transit Planner is an AI-powered transit optimization system that models and routes public transit networks at scale. An orchestrator-agent architecture ingests real-time and historical data — pricing, population density, ridership patterns, and vehicle traffic speeds — and synthesizes optimal routes and timelines.</p>
                </div>
                <h3 className="font-bold mb-2 mt-4">Technologies</h3>
                <div className="space-y-4">
                  <p>Next.js + Mapbox frontend, Python + FastAPI backend</p>
                </div>
              </div>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={400}>
            <div className="mb-8">
              <h2 className="font-bold mb-4 text-2xl">Project Origins</h2>
              <div className="photo-card" style={{ padding: 0, overflow: "hidden", borderRadius: 20 }}>
                <div className="flex items-start gap-6 p-6">
                  <div className="w-2/3 shrink-0">
                    <Image
                      src="/images/projects/transitplanner/initial-system-diagram.png"
                      alt="Transit Planner System Diagram"
                      width={1678}
                      height={1760}
                      className="w-full h-auto"
                      style={{ display: "block", borderRadius: 12 }}
                    />
                  </div>
                  <div className="w-1/3">
                    <p>The initial architecture we drew</p>
                  </div>
                </div>
              </div>


              <h2 className="font-bold mt-8 mb-2 text-2xl">Inspiration</h2>
              <p>As a kid, I spent countless hours on subway builders like JP Wright's <a href="https://jpwright.github.io/subway/" target="_blank" rel="noopener noreferrer" className="underline inline-block transition-transform duration-150 hover:scale-95">Brand New Subway</a>.</p>

              <h2 className="font-bold mt-8 mb-2 text-2xl">Initial Development</h2>
              <p className="mb-2">The initial launch received 1.4K likes and positive feedback on X.</p>
              <img src="/images/projects/transitplanner/launch-tweet.png" alt="Transit Planner Launch Tweet by Fiona Fang" className="w-full squircle rounded-lg aspect-square sm:aspect-auto object-cover" />
              
              <h2 className="font-bold mt-8 mb-2 text-2xl">More features</h2>
              <p className="mb-2">We're excited to develop this further. Here are some features I've added since: </p>
                
                <h3 className="font-semibold mt-4 mb-2 text-lg">Surface Route Accuracy</h3>
              <p className="mb-2">Initially, bus and streetcar routes floated from one point to another. I added automatic snapping to roads as well as portals to indicate underground sections that don't have to follow road medians.</p>
            <video src="/videos/road-snapping.mov" aria-label="Road snapping feature demo" autoPlay loop muted playsInline className="w-full squircle rounded-lg" />

            <p className="mb-2 mt-4">This project has introduced me to much of the small but active community of transit data and modelling professionals, from whom I have a lot to learn from.</p>
             <p className="mb-2 mt-4">I hope to make this project either useful professionally or as an educational tool or game for transit enthusiasts. If you have any feedback or suggestions, or would like to collaborate, please reach out!</p>
            </div>

            <h3 className="font-semibold mt-4 mb-2 text-lg">Next Steps</h3>
            <p className="mb-2">There are still a lot of features I'd like to explore with Transit Planner. To list a few:</p>
            <ul className="list-disc list-inside mb-2">
              <li>Data driven analysis of accessibility</li>
              <li>GTFS Realtime and visualization of moving vehicles</li>
              <li>Transit modelling features</li>
            </ul>

            <p className="mt-4" style={{ color: "var(--text-3)" }}>
              The project is fully open source on GitHub —{" "}
              <a href="https://github.com/evanzyang91/transit-planner" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text)", textDecoration: "underline" }}>
                give it a star 🙏
              </a>
            </p>

          </StaggeredContent>
            
          {!isPanel && (
            <RelatedProjects currentId="transitplanner" />
          )
          
          }
          
        </main>

      </div>
    </AnimatedPage>
  )
}
