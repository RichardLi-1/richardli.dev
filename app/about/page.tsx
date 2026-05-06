"use client"
import { AnimatedPage } from "@/components/animated-page"
import { AnimatedHeader } from "@/components/animated-header"
import { useWindowsXP } from "@/contexts/windows-xp-context"
import { DraggableSticker } from "@/components/draggable-sticker"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { useEffect, useState } from "react"

// Sticker images for the "Things I love" masonry grid
const LOVE_STICKERS = [
  { src: "/images/about/functions/photo1sticker.png", alt: "" },
  { src: "/images/about/functions/photo2sticker.png", alt: "" },
  { src: "/images/about/functions/photo3sticker.png", alt: "" },
  { src: "/images/about/functions/photo4sticker.png", alt: "" },
  { src: "/images/about/functions/photo5sticker.png", alt: "" },
  { src: "/images/about/functions/photo6sticker.png", alt: "" },
  { src: "/images/about/functions/photo7sticker.png", alt: "" },
  { src: "/images/about/functions/photo8sticker.png", alt: "" },
]

// Placeholder experience data — fill in real entries
const EXPERIENCES = [
  {
    logo: "/logos/safuture.png",
    title: "Software Engineer",
    company: "SaFuture Inc. and Qwhery",
    year: "2025-2026",
  },
  {
    logo: "/logos/hack-the-north.png",
    title: "Logistics Organizer",
    company: "Hack the North",
    year: "2026",
  },
  {
    logo: "/logos/safuture.png",
    title: "Software Engineer",
    company: "Career Education Council",
    year: "2023",
  },
]

// Placeholder updates — add real entries here
const UPDATES = [
  { date: "prev", text: "april 2: today is autism acceptance day!" },
]

export default function MorePage() {
  usePageViewTracker()
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
      <div className="page-bg min-h-screen flex flex-col" style={{ position: "relative" }}>
        <AnimatedHeader currentPage="/about" />

        <div
          style={{
            margin: "0 17px",
            padding: "80px 24px 0",
            // Two-column layout matching the screenshot's 50/50 split
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 41.05%",
            gap: 64,
            alignItems: "start",
          }}
        >
          {/* ── Left column: bio + things I love ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <h1
              style={{
                fontFamily: "'SFCamera', sans-serif",
                fontSize: "clamp(48px, 6vw, 56px)",
                fontWeight: "normal",
                lineHeight: 1.1,
                color: "var(--text)",
                margin: 0,
              }}
            >
              About
            </h1>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p
                style={{
                  fontFamily: "'SFCamera', sans-serif",
                  fontSize: 20,
                  lineHeight: 1.7,
                  color: "var(--text-2)",
                  margin: 0,
                  maxWidth: 480,
                }}
              >
                Hi, I'm Richard. I strongly believe in building AI that enhances our work, not replaces it. There’s no one to distill myself into one paragraph, but here are some things I love:
                
              </p>
            </div>

            {/* Things I love */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {/*
                CSS multi-column layout creates a masonry-like effect automatically.
                breakInside: "avoid" keeps each image from splitting across columns.
                📖 Learn: CSS columns property for masonry layouts
              */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {LOVE_STICKERS.map((s, i) => (
                  <img
                    key={i}
                    src={s.src}
                    alt={s.alt}
                    style={{ height: 100, width: "auto", borderRadius: 12, display: "block" }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column: portrait + experiences ── */}
          {/* No positioning needed — the parent grid places this automatically in column 2 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Portrait — swap the commented-out img for a real photo*/}
            {!isMobile && (
              <div
              style={{
                width: "100%",
                aspectRatio: "4 / 5",
                borderRadius: 24,
                overflow: "hidden",
                background: "var(--card-bg)",
                border: "1px solid var(--border-2)",
              }}>
              <img src="/images/about/me.jpg" alt="Richard Li" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> 
            </div>
            )} 
            
              

            {/* Experiences */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <p className="section-label" style={{ margin: "0 0 12px" }}>Experiences</p>

              {EXPERIENCES.map((exp, i) => (
                <div key={i}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0" }}>
                    {/* Logo thumbnail */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        overflow: "hidden",
                        background: "var(--surface)",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={exp.logo}
                        alt={exp.company}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    </div>

                    {/* Title + company — flex: 1 pushes year to the right */}
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontFamily: "'SFCamera', sans-serif",
                          fontSize: 14,
                          color: "var(--text)",
                          margin: 0,
                          letterSpacing: "0.01em",
                        }}
                      >
                        {exp.title}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Toronto Subway', sans-serif",
                          fontSize: 12,
                          color: "var(--text-3)",
                          margin: 0,
                          letterSpacing: "0.03em",
                        }}
                      >
                        {exp.company}
                      </p>
                    </div>

                    <p
                      style={{
                        fontFamily: "'Toronto Subway', sans-serif",
                        fontSize: 12,
                        color: "var(--text-4)",
                        margin: 0,
                        letterSpacing: "0.05em",
                        flexShrink: 0,
                      }}
                    >
                      {exp.year}
                    </p>
                  </div>

                  {i < EXPERIENCES.length - 1 && (
                    <div style={{ height: 1, background: "var(--border-2)" }} />
                  )}
                </div>
              ))}
              {/* ── Updates — kept below the two-column grid ── */}
              <section
                style={{
                  width: "100%",
                  paddingTop: "32px",
                  borderTop: "1px solid var(--border-2)",
                }}
              >
                <p className="section-label" style={{ margin: "0 0 16px" }}>Updates</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {UPDATES.map((u, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                      <span
                        style={{
                          fontFamily: "'Toronto Subway', sans-serif",
                          fontSize: 11,
                          color: "var(--text-4)",
                          letterSpacing: "0.04em",
                          flexShrink: 0,
                        }}
                      >
                        {u.date}
                      </span>
                      <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.6, margin: 0 }}>
                        {u.text}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        

        {/* Personalized mode draggable sticker */}
        {isPersonalized && (
          <a href="/about/functions">
            <DraggableSticker src="/images/about/functions/photo1sticker.png" ix={0.85} iy={0.6} size={120} />
          </a>
        )}
      </div>
    </AnimatedPage>
  )
}
