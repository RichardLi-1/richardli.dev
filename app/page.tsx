"use client"
import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ExternalLink } from "lucide-react"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { ResponsiveHeader } from "@/components/responsiveheader"
import { mainProjects } from "@/components/mainProjects"
import { ProjectImageCycler } from "@/components/project-image-cycler"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { useWindowsXP } from "@/contexts/windows-xp-context"
import { DraggableSticker } from "@/components/draggable-sticker"
import { trackEvent } from "@/lib/track"

const activities = [
  "somewhere on the ttc",
  "listening to bollywood music",
  "reading about urban planning",
  "tinkering with geospatial data",
  "photographing line 1",
  "cooking new steak recipes",
  "drinking molly tea",
]

const currently = [
  { image: "/logos/hack-the-north.png", text: "Transportation @ Hack the North" },
  { image: "/logos/waterloo.png", text: "Systems Design Engineering @ UWaterloo" },
]

const currently_more = [
  { image: "/logos/safuture.png", text: "Organizer @ Canadian Undergraduate Tech Conference" },
  { image: "/logos/hack-the-north.png", text: "Events @ Institute of Transport Engineers UW" },
]

const previously = [
  { image: "/logos/safuture.png", text: "Engineering @ SaFuture Inc." },
  { image: "/logos/formulatech-hacks.jpeg", text: "Full-Stack Developer @ FormulaTech Hacks" },
  { image: "/images/projects/cec/logo.webp", text: "Software Developer @ Career Education Council" },
]

export default function PersonalWebsite() {
  const pathname = usePathname()
  const { isPersonalized } = useWindowsXP()
  const [activityIndex, setActivityIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  usePageViewTracker()

  // Detect viewport width on mount and on every resize.
  // The cleanup `return` removes the listener when the component unmounts,
  // preventing a memory leak.
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Cycle through activities every 3.5 s using setInterval.
  // The cleanup clears the interval so it doesn't keep firing after unmount.
  // 📖 Learn: useEffect cleanup — https://react.dev/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development
  useEffect(() => {
    const interval = setInterval(() => setActivityIndex(i => (i + 1) % activities.length), 3500)
    return () => clearInterval(interval)
  }, [])

  // `/#projects`: body does not scroll — `.app-scroll-shell` does — so native hash
  // scrolling does nothing. Next.js `<Link href="/#projects">` from `/` often skips
  // `hashchange`, so we also listen in capture phase and retry after the URL updates.
  useEffect(() => {
    if (pathname !== "/") return

    const scrollProjectsIntoView = () => {
      if (window.location.hash !== "#projects") return
      document.getElementById("projects")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    const onHashChange = () => scrollProjectsIntoView()

    const onDocClickCapture = (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest("a")
      if (!a) return
      const raw = a.getAttribute("href")
      if (raw !== "/#projects" && raw !== "#projects") return
      window.setTimeout(scrollProjectsIntoView, 0)
      window.setTimeout(scrollProjectsIntoView, 80)
    }

    scrollProjectsIntoView()
    const t = window.setTimeout(scrollProjectsIntoView, 0)
    window.addEventListener("hashchange", onHashChange)
    document.addEventListener("click", onDocClickCapture, true)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener("hashchange", onHashChange)
      document.removeEventListener("click", onDocClickCapture, true)
    }
  }, [pathname])

  // Cast to `any` to access optional fields (image2, image3, hidden) that aren't
  // in the TypeScript type — a pragmatic shortcut while the data model is loose.
  const visibleProjects = mainProjects.filter(p => !(p as any).hidden).slice(0, 7)

  return (
    <AnimatedPage>
      <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
        <ResponsiveHeader isHomepage={true} currentPage="/" />

        <main style={{
          margin: "0 auto",
          padding: isMobile ? "32px 24px 0" : "80px 40px 0",
        }}>

          {/* ────────────────────── Hero ────────────────────── */}
          <StaggeredContent delay={0}>
            <section style={{ 
              marginBottom: isMobile? 48 : 64,
               maxWidth: 700 }}>
              <h1 style={{ fontSize: "clamp(40px, 7vw, 56px)", lineHeight: 1.2, letterSpacing: -1, marginBottom: 14, fontFamily: "'SFCamera', sans-serif" }}>
                Richard Li is a software engineer and full-time public transit enthusiast.<mark className="hero-highlight"></mark>
              </h1>
              <p style={{ fontSize: 16, color: "var(--text-3)", letterSpacing: "0.02em" }}>
                Most days, you'll find him —{" "}
                <span
                  key={activityIndex}
                  style={{
                    color: "var(--text-2)",
                    display: "inline-block",
                    animation: "fadeSlideIn 0.4s ease",
                  }}
                >
                  {activities[activityIndex]}
                </span>
              </p>
            </section>
          </StaggeredContent>

          {/* ────────────────────── Currently / Previously ────────────────────── */}
          <StaggeredContent delay={100}>
            <section style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: isMobile ? 32 : 48,
              marginBottom: isMobile ? 48 : 64,
            }}>
              <div>
                <p className="section-label" style={{ marginBottom: 14 }}>Currently</p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {currently.map(item => (
                    <li key={item.text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-2)", listStyle: "none" }}>
                      <img src={item.image} alt="" width={18} height={18} style={{ maxHeight: 18, maxWidth: 18, borderRadius: "50%", objectFit: "cover" }} />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>  
              <div>
                <p className="section-label" style={{ marginBottom: 14 }}>Previously</p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {previously.map(item => (
                    <li key={item.text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-2)", listStyle: "none" }}>
                      <img src={item.image} style={{ maxHeight: 18, maxWidth: 18, borderRadius: "50%" }}></img>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </StaggeredContent>

          {/* ── Projects ── */}
          <StaggeredContent delay={200}>
            <section
              id="projects"
              style={{
                marginBottom: 64,
                // Offset for sticky desktop header when scrolling via /#projects
                scrollMarginTop: isMobile ? 20 : 88,
              }}
            >
              <p className="section-label" style={{ marginBottom: 20 }}>Projects</p>
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: "32px 24px",
              }}>
                {visibleProjects.map(project => (
                  <Link key={project.id} href={`/${project.id}`} style={{ textDecoration: "none" }}>
                    <div
                      style={{ cursor: "pointer" }}
                      // Imperatively scale the image wrapper on hover. Using direct DOM
                      // manipulation (querySelector) here avoids re-rendering the whole
                      // card just to update a CSS transform.
                      onMouseEnter={() => { setHoveredId(project.id); (document.querySelector(`#proj-img-${project.id}`) as HTMLElement)!.style.transform = "scale(1.02)" }}
                      onMouseLeave={() => { setHoveredId(null); (document.querySelector(`#proj-img-${project.id}`) as HTMLElement)!.style.transform = "scale(1)" }}
                    >
                      <div style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "16/9",
                        borderRadius: 16,
                        cornerShape: "squircle",
                        background: "var(--pure)",
                        marginBottom: 10,
                      }}>
                        <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: 16, cornerShape: "squircle" } as React.CSSProperties}>
                          <div id={`proj-img-${project.id}`} className="proj-img" style={{ width: "100%", height: "100%", transition: "transform 0.35s ease" }}>
                            <ProjectImageCycler
                              images={[project.image, (project as any).image2, (project as any).image3]}
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        {/* "Try it out" button only appears on hover and only if the project has an external link */}
                        {hoveredId === project.id && (project as any).externalLink && (
                          <button
                            // stopPropagation prevents the card's Link from also navigating
                            onClick={e => {
                              e.preventDefault()
                              e.stopPropagation()
                              // Track outbound project intent before opening a new tab.
                              // 📖 Learn: fire-and-forget telemetry pattern
                              trackEvent("🚀 Project external link clicked", {
                                projectId: project.id,
                                projectTitle: project.title,
                                location: "homepage project card",
                              })
                              window.open((project as any).externalLink, "_blank", "noopener,noreferrer")
                            }}
                            className="liquid-glass-pill squircle"
                            style={{
                              position: "absolute", top: 10, right: 10,
                              display: "flex", alignItems: "center", gap: 6,
                              padding: "6px 14px",
                              borderRadius: 10,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              transition: "transform 0.15s ease",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.transform = "scale(0.96)")}
                            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                          >
                            <span style={{ fontSize: 16, fontFamily: "'Toronto Subway', sans-serif", letterSpacing: "0.02em", color: "inherit" }}>Try it out</span>
                            <ExternalLink style={{ width: 12, height: 12, opacity: 0.65 }} />
                          </button>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                        <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.5, margin: 0 }}>
                          {project.title}
                          {project.description && (
                            <span style={{ color: "var(--text-3)" }}> — {project.description}</span>
                          )}
                        </p>
                        {/*<span style={{ fontSize: 12, color: "var(--text-4)", flexShrink: 0, fontFamily: "'Toronto Subway', sans-serif", letterSpacing: "0.03em" }}>
                          {project.year
                        </span>}*/}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {/*<div style={{ marginTop: 16 }}>
                <Link href="/#projects" style={{ fontSize: 12, color: "var(--text-2)", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "'Toronto Subway', sans-serif", textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--text-1)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-2)"}
                >
                  See all projects →
                </Link>
              </div>*/}
            </section>
          </StaggeredContent>

          {isPersonalized && (
            <DraggableSticker src="/images/decorative/stickers/molly-tea.png" ix={0.90} iy={0.55} size={80} />
          )}

          
        </main>
      </div>

      {/* `style jsx` is a styled-jsx block — scoped CSS that only applies to this
          component. The fadeSlideIn animation is used by the cycling activity line.
          📖 Learn: styled-jsx — https://github.com/vercel/styled-jsx */}
      <style jsx>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </AnimatedPage>
  )
}
