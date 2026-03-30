"use client"
import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { ResponsiveHeader } from "@/components/responsiveheader"
import { mainProjects } from "@/components/mainProjects"
import { ProjectImageCycler } from "@/components/project-image-cycler"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { useWindowsXP } from "@/contexts/windows-xp-context"
import { DraggableSticker } from "@/components/draggable-sticker"

const activities = [
  "listening to bollywood music",
  "somewhere on the ttc",
  "reading about urban planning",
  "tinkering with geospatial info",
  "photographing line 1",
  "cooking new steak recipes",
  "drinking molly tea",
]

const currently = [
  { image: "/logos/safuture.png", text: "Engineering @ SaFuture Inc." },
  { image: "/logos/hack-the-north.png", text: "Transportation @ Hack the North" },
  { image: "/logos/waterloo.png", text: "Systems Design Engineering @ UWaterloo" },
]

const previously = [
  { image: "🏎️", text: "Full-Stack Developer @ FormulaTech Hacks" },
  { image: "🚌", text: "Transportation Logistics" },
  { image: "💼", text: "Software Developer @ Career Education Council" },
]

export default function PersonalWebsite() {
  const { isPersonalized } = useWindowsXP()
  const [activityIndex, setActivityIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  usePageViewTracker()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setActivityIndex(i => (i + 1) % activities.length), 3500)
    return () => clearInterval(interval)
  }, [])

  const visibleProjects = mainProjects.filter(p => !(p as any).hidden).slice(0, 4)

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
            <section style={{ marginBottom: 64, maxWidth: 700 }}>
              <h1 style={{ fontSize: "clamp(36px, 3vw, 52px)", lineHeight: 1.2, marginBottom: 14, fontFamily: "'SFCamera', sans-serif" }}>
                Richard Li is a software engineer and full-time public transit enthusiast.
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
              marginBottom: 64,
            }}>
              <div>
                <p className="section-label" style={{ marginBottom: 14 }}>Currently</p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {currently.map(item => (
                    <li key={item.text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-2)", listStyle: "none" }}>
                      <img src={item.image} style={{ maxHeight: 18, maxWidth: 18, borderRadius: "50%", objectFit: "cover" }}></img>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>{/*  
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
              </div>*/}
            </section>
          </StaggeredContent>

          {/* ── Projects ── */}
          <StaggeredContent delay={200}>
            <section style={{ marginBottom: 64 }}>
              <p className="section-label" style={{ marginBottom: 20 }}>Projects</p>
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: "32px 24px",
              }}>
                {visibleProjects.map(project => (
                  <Link key={project.id} href={`/projects/${project.id}`} style={{ textDecoration: "none" }}>
                    <div
                      style={{ cursor: "pointer" }}
                      onMouseEnter={e => (e.currentTarget.querySelector(".proj-img") as HTMLElement)!.style.transform = "scale(1.02)"}
                      onMouseLeave={e => (e.currentTarget.querySelector(".proj-img") as HTMLElement)!.style.transform = "scale(1)"}
                    >
                      <div style={{
                        width: "100%",
                        aspectRatio: "16/9",
                        overflow: "hidden",
                        borderRadius: 16,
                        background: "var(--surface)",
                        marginBottom: 10,
                      }}>
                        <div className="proj-img" style={{ width: "100%", height: "100%", transition: "transform 0.35s ease" }}>
                          <ProjectImageCycler
                            images={[project.image, (project as any).image2, (project as any).image3]}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                        <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5, margin: 0 }}>
                          {project.title}
                          {project.description && (
                            <span style={{ color: "var(--text-3)" }}> — {project.description}</span>
                          )}
                        </p>
                        <span style={{ fontSize: 12, color: "var(--text-4)", flexShrink: 0, fontFamily: "'Toronto Subway', sans-serif", letterSpacing: "0.03em" }}>
                          {project.year}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <Link href="/projects" style={{ fontSize: 12, color: "var(--text-4)", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "'Toronto Subway', sans-serif", textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--text-2)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-4)"}
                >
                  See all work →
                </Link>
              </div>
            </section>
          </StaggeredContent>

          {isPersonalized && (
            <DraggableSticker src="/images/homepagestickers/mollytea.png" ix={0.90} iy={0.55} size={80} />
          )}

          <Footer />
        </main>
      </div>

      <style jsx>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </AnimatedPage>
  )
}
