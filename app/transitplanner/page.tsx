"use client"
import Image from "next/image"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"
import { ExternalLink, X, ArrowUpRight, ChevronDown } from "lucide-react"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { RelatedProjects } from "@/components/related-projects"
import { useState, useEffect } from "react"
import { useIsPanel } from "@/hooks/use-is-panel"
import { CaseStudyNav } from "@/components/case-study-nav"
import { CollapsibleDetails, itemVariants } from "@/components/collapsible-details"
import { motion } from "framer-motion"
import { SyntaxCodeBlock } from "@/components/syntax-code-block"

const PROPOSE_ROUTE_TOOL_SNIPPET = `const PROPOSE_ROUTE_TOOL: ToolDefinition = {
  name: "propose_route",
  description: "Submit the proposed subway route after your written analysis.",
  inputSchema: {
    type: "object",
    properties: {
      name:  { type: "string" },
      type:  { type: "string", enum: ["subway"] },
      color: { type: "string", description: "Hex colour, e.g. #2563eb" },
      stops: {
        type: "array",
        minItems: 6,
        maxItems: 20,
        items: {
          type: "object",
          properties: {
            name:   { type: "string" },
            coords: { type: "array", items: { type: "number" }, minItems: 2 },
          },
          required: ["name", "coords"],
        },
      },
    },
    required: ["name", "type", "color", "stops"],
  },
};`

export default function TransitPlannerProjectPage() {
  usePageViewTracker()
  const isPanel = useIsPanel()
  const [isMobile, setIsMobile] = useState(false)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  const [zoom, setZoom] = useState({ scale: 1, tx: 0, ty: 0 })
  const [dragging, setDragging] = useState<{ startX: number; startY: number; startTx: number; startTy: number } | null>(null)
  const [showDiagram, setShowDiagram] = useState(false)
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
      {zoomedImage && (
        <div
          onClick={() => { setZoomedImage(null); setZoom({ scale: 1, tx: 0, ty: 0 }) }}
          className="fixed inset-0 z-[200] overflow-hidden"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", cursor: dragging ? "grabbing" : zoom.scale > 1 ? "grab" : "zoom-in" }}
          onWheel={(e) => {
            e.preventDefault()
            // Cursor position relative to the viewport
            const cx = e.clientX
            const cy = e.clientY
            const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15
            const newScale = Math.min(Math.max(zoom.scale * factor, 1), 8)
            // Keep the pixel under the cursor fixed: shift translate proportionally
            setZoom(prev => ({
              scale: newScale,
              tx: cx - (cx - prev.tx) * (newScale / prev.scale),
              ty: cy - (cy - prev.ty) * (newScale / prev.scale),
            }))
          }}
          onMouseDown={(e) => {
            if (zoom.scale <= 1) return
            e.stopPropagation()
            setDragging({ startX: e.clientX, startY: e.clientY, startTx: zoom.tx, startTy: zoom.ty })
          }}
          onMouseMove={(e) => {
            if (!dragging) return
            setZoom(prev => ({ ...prev, tx: dragging.startTx + (e.clientX - dragging.startX), ty: dragging.startTy + (e.clientY - dragging.startY) }))
          }}
          onMouseUp={() => setDragging(null)}
          onMouseLeave={() => setDragging(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setZoomedImage(null); setZoom({ scale: 1, tx: 0, ty: 0 }) }}
            className="absolute top-4 right-4 flex items-center justify-center w-9 h-9 rounded-full z-10"
            style={{ background: "var(--surface)", color: "var(--text-2)" }}
          >
            <X className="w-4 h-4" />
          </button>
          <img
            src={zoomedImage}
            onClick={(e) => {
              e.stopPropagation()
              if (zoom.scale > 1) {
                setZoom({ scale: 1, tx: 0, ty: 0 })
              } else {
                const newScale = 2.5
                const cx = e.clientX
                const cy = e.clientY
                setZoom(prev => ({
                  scale: newScale,
                  tx: cx - (cx - prev.tx) * (newScale / prev.scale),
                  ty: cy - (cy - prev.ty) * (newScale / prev.scale),
                }))
              }
            }}
            draggable={false}
            className="absolute max-w-[90vw] max-h-[90vh] w-auto h-auto rounded-xl shadow-2xl"
            style={{
              top: "50%",
              left: "50%",
              transformOrigin: "0 0",
              transform: `translate(calc(-50% + ${zoom.tx}px), calc(-50% + ${zoom.ty}px)) scale(${zoom.scale})`,
              transition: dragging ? "none" : "transform 0.15s ease-out",
              cursor: zoom.scale > 1 ? "zoom-out" : "zoom-in",
            }}
          />
        </div>
      )}
      {!isPanel && (
        <CaseStudyNav sections={[
          { id: "inspiration", label: "Inspiration" },
          { id: "architecture", label: "Architecture" },
          { id: "initial-development", label: "Launch" },
          { id: "more-features", label: "More Features" },
          { id: "conclusion", label: "Conclusion" },
        ]} />
      )}
      <div className="mx-auto">
        <AnimatedHeader currentPage="/transitplanner" />

        <main className="max-w-3xl mx-auto p-6 space-y-6 [&_p]:text-[var(--text-2)] [&_li]:text-[var(--text-2)]" style={{ paddingTop: isMobile ? "0px" : "40px" }}>
          <StaggeredContent delay={0}>
            <div className={`relative mb-1 ${isPanel ? "pr-20" : ""}`}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <h2 className="text-4xl font-bold mb-0">Transit Planner</h2>
                <nav className="flex shrink-0 items-center gap-1" aria-label="Transit Planner project links">
                  <a
                    href="https://www.transitplan.xyz/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Transit Planner website (opens in a new tab)"
                    className="inline-flex rounded-md p-2 text-[var(--text-3)] transition-colors hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-3)]"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                  <a
                    href="https://github.com/evanzyang91/transit-planner"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Transit Planner source code on GitHub (opens in a new tab)"
                    className="inline-flex rounded-md p-2 text-[var(--text-3)] transition-colors hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-3)]"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.866-.013-1.7-2.782.605-3.369-1.343-3.369-1.343-.454-1.157-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.748-1.026 2.748-1.026.546 1.378.202 2.398.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.31.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .269.18.58.688.481A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
                    </svg>
                  </a>
                </nav>
              </div>
              <p className="text-m" style={{ color: "var(--text-3)" }}>Web App, 2026</p>
              {isPanel && (
                <span className="right-4 top-0.5 absolute">
                  <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "open" }, "*")}><ArrowUpRight className="w-6 h-6" /></button>
                  <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "close" }, "*")}><X className="w-6 h-6" /></button>
                </span>
              )}
            </div>
            
          </StaggeredContent>

          <StaggeredContent delay={100}>
            <div className="relative w-full overflow-hidden squircle rounded-lg bg-[var(--surface)]" style={{ aspectRatio: "960/594", borderRadius: 16 }}>
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
                <p className="p-2 py-3 px-3.5 text-zinc-800 dark:text-zinc-300">🥇 This project was awarded at Hack Canada 2026</p>
              </div>
              <a href="https://www.transitplan.xyz/" target="_blank" rel="noopener noreferrer" className="truncate squircle rounded-xl flex items-center justify-center p-2 py-3 px-3.5 bg-zinc-800 text-zinc-200 dark:text-zinc-800 dark:bg-zinc-200 transition-transform duration-150 hover:scale-95 active:scale-90">Try it out!</a>
            </div>
            <CollapsibleDetails labels={["Timeline", "Team", "Stats", "Links", "Overview", "Technologies"]} animateContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Timeline</p>
                  <p>2026 - Present</p>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Team</p>
                  <div className="space-y-1">
                    <a className="hover:underline" href="https://www.linkedin.com/in/fiona-fangg/" target="_blank"><p>Fiona Fang</p></a>
                    <a className="hover:underline" href="https://www.linkedin.com/in/evanzyang/" target="_blank"><p>Evan Yang</p></a>
                    <a className="hover:underline" href="https://www.linkedin.com/in/christopher-stevers-07b9a5204" target="_blank"><p>Christopher Stevers</p></a>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Stats</p>
                  <div className="space-y-1">
                    <p>1.8K+ likes</p>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Links</p>
                  <a href="https://www.transitplan.xyz/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:underline">
                    <ExternalLink className="w-4 h-4" />
                    Transit Planner App
                  </a>
                  <a href="https://github.com/evanzyang91/transit-planner" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:underline">
                    <ExternalLink className="w-4 h-4" />
                    GitHub
                  </a>
                  <a href="https://devpost.com/software/transit-planner" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:underline">
                    <ExternalLink className="w-4 h-4" />
                    Devpost
                  </a>
                </motion.div>
              </div>
              <div>
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Overview</p>
                  <div className="space-y-4">
                    <p>Transit Planner is an AI-powered transit planning sandbox.</p>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2 mt-4">Technologies</p>
                  <div className="space-y-4">
                    <p>Next.js + Mapbox frontend, Python + FastAPI backend</p>
                  </div>
                </motion.div>
              </div>
            </div>
            </CollapsibleDetails>
          </StaggeredContent>

          <StaggeredContent delay={350}>
            <div className="py-8">
              <p className="section-label mb-2">The Mission</p>
              <p className="text-3xl leading-snug" style={{ color: "var(--text)" }}>
                Build a feature-rich, easy to use tool to democratize transit planning decision making.
              </p>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={400}>
            <div className="mb-8">
              <h2 id="inspiration" className="font-bold mb-2 text-2xl">Inspiration</h2>
              <p>As a kid, I spent countless hours on subway builders like JP Wright's <a href="https://jpwright.github.io/subway/" target="_blank" rel="noopener noreferrer" className="underline inline-block transition-transform duration-150 hover:scale-95">Brand New Subway</a>.</p>

              <h2 id="architecture" className="font-bold mt-8 mb-4 text-2xl">Architecture</h2>
              <button
                onClick={() => setShowDiagram(v => !v)}
                className="flex items-center gap-2 mb-3"
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--text)" }}
              >
                <ChevronDown
                  className="w-4 h-4 transition-transform duration-200"
                  style={{ transform: showDiagram ? "rotate(0deg)" : "rotate(-90deg)" }}
                />
                The initial architecture we drew
              </button>
              {showDiagram && (
                <div className="photo-card mb-6" style={{ padding: 0, overflow: "hidden", borderRadius: 20 }}>
                  <button
                    onClick={() => setZoomedImage("/images/projects/transitplanner/initial-system-diagram.png")}
                    className="w-full p-0 border-0 bg-transparent cursor-zoom-in"
                  >
                    <Image
                      src="/images/projects/transitplanner/initial-system-diagram.png"
                      alt="Transit Planner System Diagram"
                      width={1678}
                      height={1760}
                      className="w-full h-auto"
                      style={{ display: "block", borderRadius: 20 }}
                    />
                  </button>
                </div>
              )}

              <h3 className="font-semibold mt-4 mb-2 text-lg">Database</h3>
              <p className="mb-2">Transit Planner uses PostgreSQL for its PostGIS extension.</p>

              <h3 className="font-semibold mt-4 mb-2 text-lg">Frontend</h3>
              <p className="mb-2">Transit Planner uses Next.js, TypeScript, and is styled with Tailwind.</p>

              <h3 className="font-semibold mt-4 mb-2 text-lg">Backend server: LLM Setup</h3>
              <p className="mb-2">
                Transit Planner uses Anthropic and Gemini APIs, allowing both as options to users. Dialog is streamed via SSE (FastAPI{" "}
                <code className="text-sm px-1 py-0.5 rounded" style={{ background: "var(--surface)", color: "var(--text)" }}>StreamingResponse</code>
                ), and the client renders tokens as they arrive.
              </p>

              <h4 className="font-semibold mt-6 mb-2 text-base" style={{ color: "var(--text)" }}>Structured routes: tool schema</h4>
              <p className="mb-2">
                Free-form text is great for reasoning, but the map needs structured data like coordinates and stop order. After a council member's reasoning, it must emit a{" "}
                <code className="text-sm px-1 py-0.5 rounded" style={{ background: "var(--surface)", color: "var(--text)" }}>propose_route</code> tool call. The vendor's tool-use layer validates it against{" "}
                <code className="text-sm px-1 py-0.5 rounded" style={{ background: "var(--surface)", color: "var(--text)" }}>inputSchema</code>, as shown below.{" "}
              </p>
              <p className="mb-3 text-sm" style={{ color: "var(--text-3)" }}>
                Constraints like <code className="text-xs">minItems</code>/<code className="text-xs">maxItems</code> on stops and required fields keep generations in a band the renderer expects (e.g. 6–20 stops, hex colour, <code className="text-xs">[lng, lat]</code> pairs per stop).
              </p>
              <SyntaxCodeBlock language="typescript" code={PROPOSE_ROUTE_TOOL_SNIPPET} />

              <h2 id="initial-development" className="font-bold mt-8 mb-2 text-2xl">Launch</h2>
              <p className="mb-2">The initial launch received 1.4K likes and positive feedback on X.</p>
              <div className="w-full overflow-hidden squircle rounded-lg" style={{ aspectRatio: "4 / 3" }}>
                <img
                  src="/images/projects/transitplanner/launch-tweet.png"
                  alt="Transit Planner Launch Tweet by Fiona Fang"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="w-full overflow-hidden squircle rounded-lg">
                <br></br>
                <p className="mb-2">We also had the opportunity to demo at AI Tinkerers Toronto in the Shopify office.</p>
                <img
                  src="/images/projects/transitplanner/ai-tinkerers.JPG"
                  alt="Transit Planner Presentation at AI Tinkerers Toronto, Shopify"
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 id="more-features" className="font-bold mt-8 mb-2 text-2xl">More features</h2>
              <p className="mb-2">We're excited to develop this further. Here are some features we've added since: </p>
                
                <h3 className="font-semibold mt-4 mb-2 text-lg">Surface Route Accuracy</h3>
              <p className="mb-2">Initially, bus and streetcar routes floated from one point to another. I added automatic snapping to roads as well as portals to indicate underground sections that don't have to follow road medians.</p>
            <video src="/videos/road-snapping.mov" aria-label="Road snapping feature demo" autoPlay loop muted playsInline className="w-full squircle rounded-lg" />
            
              <h3 className="font-semibold mt-4 mb-2 text-lg">Agentic Commuter Simulation</h3>
              <p className="mb-2">This mode dispatches hundreds of AI agents to act as commuters. Eventually, this will be a tool available to the transit council members.</p>

              <h3 className="font-semibold mt-4 mb-2 text-lg">More map overlays</h3>
              <p className="mb-2">Isochrone, Canada-wide population density, transit deserts, custom SHP/KML/KMZ uploads, GTFS live vehicle data, etc.</p>
            </div>
            

            <h3 className="font-semibold mt-4 mb-2 text-lg">Next Steps</h3>
            <p className="mb-2">There are still a lot of features I'd like to explore with Transit Planner. To list a few:</p>
            <ul className="list-disc list-inside mb-2">
              <li>Data driven analysis of accessibility</li>
              <li>GTFS Realtime and visualization of moving vehicles</li>
              <li>Transit modelling features</li>
              <li>Support for more cities</li>
              <li>Graph-based, non-deterministic council debating</li>
              <li>Different interaction methods to initiate the AI council, such as chatting or using points of strain from agentic simulation as a jumping off point</li>
            </ul>

            <h2 id="conclusion" className="font-semibold mt-8 mb-2 text-2xl">Conclusion</h2>
            <p className="mb-2 mt-4">This project has introduced me to much of the small but active community of transit data and modelling professionals, from whom I have a lot to learn from.</p>
             <p className="mb-2 mt-4">I hope to make this project either useful professionally or as an educational tool or game for transit enthusiasts. If you have any feedback or suggestions, or would like to collaborate, please <a href="mailto:richardli0@outlook.com?subject=Transit%20Planner%20Collaboration&body=Hi%20Richard%2C%0A%0AI%27d%20love%20to%20collaborate%20on%20Transit%20Planner.%0A%0A" style={{ color: "var(--text)", textDecoration: "underline" }}>reach out</a>!</p>
              <p className="mb-2 mt-4">Also big shoutout to Fiona, Evan, and Chris for building this with me.</p>

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
