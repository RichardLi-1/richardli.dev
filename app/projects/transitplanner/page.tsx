"use client"
import { Footer } from "@/components/footer"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"
import { ExternalLink } from "lucide-react"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { RelatedProjects } from "@/components/related-projects"

export default function TransitPlannerProjectPage() {
  usePageViewTracker()

  return (
    <AnimatedPage>
      <div className="mx-auto p-6 space-y-6">
        <AnimatedHeader
          backHref="/projects"
          backText="Back"
          currentPage="/projects/transitplanner"
        />

        <main className="max-w-6xl mx-auto p-6 space-y-6" style={{ paddingTop: "60px" }}>
          <StaggeredContent delay={0}>
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Transit Planner</h1>
              <p className="text-m text-gray-400">Web App, 2026</p>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={100}>
            <div className="relative aspect-video w-full overflow-hidden" style={{ borderRadius: 25 }}>
              <video
                src="/videos/transitplanfinal.mov"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                style={{ borderRadius: 25 }}
              />
            </div>
          </StaggeredContent>

          <StaggeredContent delay={300}>
            <div className="bg-zinc-800 max-width rounded-md mb-8 border-2">
              <p className="p-2 py-3 px-3.5 text-zinc-300">🥇 This project was awarded at Hack Canada 2026 in the Google - Build with AI Track!</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-2">Timeline</h3>
                  <p>2026</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Team</h3>
                  <div className="space-y-1">
                    <p>Fiona Fang</p>
                    <p>Evan Yang</p>
                    <p>Christopher Stevers</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Links</h3>
                  <a href="https://transit-planner-web.vercel.app/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:underline">
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
                  <p>The system runs on Kubernetes with write-through caching, paired with a Next.js + map frontend for interactive exploration of transit plans.</p>
                </div>
              </div>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={400}>
            <div className="mb-8">
              <h3 className="font-bold mb-4">Initial System Architecture</h3>
              <div className="photo-card" style={{ padding: 0, overflow: "hidden", borderRadius: 20 }}>
                <img
                  src="/images/transit-planner/transit-initial-system-diagram.png"
                  alt="Transit Planner System Diagram"
                  className="w-full"
                  style={{ display: "block", borderRadius: 18 }}
                />
              </div>
            </div>
          </StaggeredContent>

          <RelatedProjects currentId="transitplanner" />
        </main>

        <StaggeredContent delay={1100}>
          <Footer />
        </StaggeredContent>
      </div>
    </AnimatedPage>
  )
}
