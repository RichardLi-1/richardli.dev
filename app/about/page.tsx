"use client"
import { AnimatedPage } from "@/components/animated-page"
import { AnimatedHeader } from "@/components/animated-header"
import { useWindowsXP } from "@/contexts/windows-xp-context"
import { DraggableSticker } from "@/components/draggable-sticker"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { useEffect, useState } from "react"

// Favourites — placeholder data for "A little bit about me..." section.
// Fill in image paths, titles, and captions.
const FAVOURITES = [
  { image: "images/about/hawker.png", title: "The Toronto Subway.", caption: "click for the Hawker Siddeley H5's propulsion sound" },
  { image: "", title: "Apple products,", caption: "the first of which owned was an iPhone 3GS" },
  { image: "", title: "", caption: "" },
]

// Social links — replace href="#" with real URLs
const SOCIALS = [
  { label: "Twitter", href: "https://x.com/transitfanner" },
  { label: "Linkedin", href: "https://www.linkedin.com/in/richardli0" },
  { label: "GitHub", href: "https://github.com/RichardLi-1" },
  //{ label: "Devpost", href: "#" },
]

const EMAIL = "richardli0@outlook.com"

// Sticker images for the "Things I love" masonry grid
// Alt text helps AI crawlers (and screen readers) understand visual content.
// Even short descriptions are far better than empty strings.
const LOVE_STICKERS = [
  { src: "/images/about/functions/photo1sticker.png", alt: "Sticker 1" },
  { src: "/images/about/functions/photo2sticker.png", alt: "Sticker 2" },
  { src: "/images/about/functions/photo3sticker.png", alt: "Sticker 3" },
  { src: "/images/about/functions/photo4sticker.png", alt: "Sticker 4" },
  { src: "/images/about/functions/photo5sticker.png", alt: "Sticker 5" },
  { src: "/images/about/functions/photo6sticker.png", alt: "Sticker 6" },
  { src: "/images/about/functions/photo7sticker.png", alt: "Sticker 7" },
  { src: "/images/about/functions/photo8sticker.png", alt: "Sticker 8" },
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
    link: "https://hackthenorth.com/"
  },
  {
    logo: "/images/projects/cec/logo.webp",
    title: "Software Engineer",
    company: "Career Education Council",
    year: "2025",
  },
  {
    logo: "/logos/salespatriot.png",
    title: "Intern (HUVTSP)",
    company: "SalesPatriot (YC W25)",
    year: "2025",
  },
]

// Placeholder updates — add real entries here
const UPDATES = [
  { date: "prev", text: "april 2: today is autism acceptance day!" },
]

// Communities — each gets a slight rotation for the tilted/polaroid look in the mock
// 📖 Learn: CSS transform: rotate() — applied per-item so cards lean different directions
const COMMUNITIES = [
  { label: "CUTC", image: "/images/about/cutc.JPG", rotate: -3 },
  { label: "Hack the North", image: "", rotate: 2 },
  { label: "SYDE", image: "", rotate: -2 },
]

export default function MorePage() {
  usePageViewTracker()
  const { isPersonalized } = useWindowsXP()
  const [isMobile, setIsMobile] = useState(false)
  // 📖 Learn: navigator.clipboard.writeText — async clipboard API; needs HTTPS or localhost
  const [copied, setCopied] = useState(false)
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable (e.g. http context) — silently no-op
    }
  }
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

        {/* Centered content wrapper — caps width and centers everything below the header.
            All sections live inside this so they share the same 1200px column.
            📖 Learn: margin: "0 auto" + maxWidth centers a block horizontally. */}
        <div style={{ maxWidth: 1000, width: "100%", margin: "0 auto", padding: "0 17px" }}>

        <div
          style={{
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
            {/*<h1
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
            </h1>*/}

            <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 480 }}>
              <p
                style={{
                  fontFamily: "'SFCamera', sans-serif",
                  fontSize: 32,
                  lineHeight: 1.7,
                  color: "var(--text)",
                  margin: 0,
                  maxWidth: 480,
                }}
              >
                Hi, I'm Richard.
              </p>

              <p
                style={{
                  fontFamily: "'SFCamera', sans-serif",
                  fontSize: 15,
                  lineHeight: 1.55,
                  color: "var(--text-2)",
                  margin: 0,
                }}
              >
                I'm currently studying <strong style={{ color: "var(--text)", fontWeight: 600 }}>Systems Design Engineering</strong> at the University of Waterloo and <strong style={{ color: "var(--text)", fontWeight: 600 }}>seeking Fall 2026 internships!</strong>
              </p>

              <p
                style={{
                  fontFamily: "'SFCamera', sans-serif",
                  fontSize: 14,
                  color: "var(--text-3)",
                  margin: 0,
                }}
              >
                Excited to meet you!
              </p>

              {/* Social links — inline row, wraps on small viewports */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "'SFCamera', sans-serif",
                      fontSize: 13,
                      color: "var(--text)",
                      textDecoration: "none",
                    }}
                  >
                    {s.label}
                  </a>
                ))}
              </div>

              {/* Copy-email button. onClick writes to clipboard + flips label for 2s. */}
              <button
                type="button"
                onClick={handleCopyEmail}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  alignSelf: "flex-start",
                  padding: "8px 14px",
                  background: "var(--surface)",
                  border: "1px solid var(--border-2)",
                  borderRadius: 10,
                  color: "var(--text)",
                  fontFamily: "'SFCamera', sans-serif",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <span aria-hidden style={{ fontSize: 14, lineHeight: 1 }}>✉</span>
                {copied ? "Copied!" : EMAIL}
              </button>
            </div>

          </div>

          {/* ── Right column: portrait + experiences ── */}
          {/* No positioning needed — the parent grid places this automatically in column 2 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Portrait — shorter aspect ratio on mobile so it doesn't dominate the viewport */}
            <div
              style={{
                width: "100%",
                aspectRatio: isMobile ? "12 / 9" : "4 / 5",
                borderRadius: 24,
                overflow: "hidden",
                background: "var(--card-bg)",
                border: "1px solid var(--border-2)",
              }}>
              <img src="/images/about/me.jpg" alt="Richard Li" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition: isMobile ? "center 38%" : "center" }} />
            </div>
            
              

            {/* Experiences */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <p className="section-label" style={{ margin: "0 0 12px" }}>Experiences</p>

              {EXPERIENCES.map((exp, i) => (
                <a href={exp.link || "#"} target="_blank" rel="noopener noreferrer" key={i} style={{ textDecoration: "none" }}>
                  <div key={i}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0" }}>
                      {/* Logo thumbnail */}
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          overflow: "hidden",
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
                </a>
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

        </div>
        {/* /centered content wrapper — sections below are full width */}

        {/* ── A little bit about me... ── */}
        <section
          style={{
            margin: "80px 17px 0",
            padding: "0 24px",
          }}
        >
          <h2
            style={{
              fontFamily: "'SFCamera', sans-serif",
              fontSize: "clamp(24px, 2.5vw, 28px)",
              fontWeight: "normal",
              color: "var(--text)",
              letterSpacing: "-0.03em",
              margin: "0 0 20px",
            }}
          >
            A little bit about me...
          </h2>
          <p
            style={{
              fontFamily: "'SFCamera', sans-serif",
              fontSize: 16,
              lineHeight: 1.6,
              color: "var(--text-2)",
              margin: "0 0 32px",
              maxWidth: 900,
            }}
          >
            My love for technology comes from my obsessions with subway systems, consumer electronics and all sorts of other interests. Here, you can find some of my favourites that inspired the way I think.
          </p>

          {/* Three favourites cards — same flex pattern as Communities, but no rotation */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: isMobile ? 32 : 24,
            }}
          >
            {FAVOURITES.map((f, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  flex: isMobile ? "1 1 100%" : "1 1 0",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "4 / 3",
                    background: "var(--card-bg)",
                    border: "1px solid var(--border-2)",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  {f.image && (
                    <img
                      src={f.image}
                      alt={f.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                </div>
                {(f.title || f.caption) && (
                  <p
                    style={{
                      fontFamily: "'SFCamera', sans-serif",
                      fontSize: 15,
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    <strong style={{ color: "var(--text)", fontWeight: 600 }}>{f.title}</strong>{" "}
                    <span style={{ color: "var(--text-3)" }}>{f.caption}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Building Communities ── */}
        <section
          style={{
            margin: "80px 17px 0",
            padding: "0 24px",
          }}
        >
          <h2
            style={{
              fontFamily: "'SFCamera', sans-serif",
              fontSize: "clamp(24px, 2.5vw, 28px)",
              fontWeight: "normal",
              color: "var(--text)",
              letterSpacing: "-0.03em",
              margin: "0 0 32px",
            }}
          >
            Building Communities
          </h2>

          {/* Three tilted cards. flex with gap; each card rotates independently.
              On mobile, flex-wrap lets them stack. */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: isMobile ? 32 : 24,
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            {COMMUNITIES.map((c, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  transform: `rotate(${c.rotate}deg)`,
                  transformOrigin: "center center",
                  flex: isMobile ? "1 1 100%" : "1 1 0",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "4 / 3",
                    background: "var(--card-bg)",
                    border: "1px solid var(--border-2)",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  {c.image && (
                    <img
                      src={c.image}
                      alt={c.label}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                </div>
                <p
                  style={{
                    fontFamily: "'SFCamera', sans-serif",
                    fontSize: 16,
                    color: "var(--text)",
                    margin: 0,
                  }}
                >
                  {c.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Another thing ── */}
        <section
          style={{
            margin: "80px 17px 80px",
            padding: "0 24px",
          }}
        >
          <h2
            style={{
              fontFamily: "'SFCamera', sans-serif",
              fontSize: "clamp(24px, 2.5vw, 28px)",
              fontWeight: "normal",
              color: "var(--text)",
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Another thing
          </h2>
        </section>

        {/* ── Things I love (moved to end) ── */}
        <section
          style={{
            margin: "0 17px 80px",
            padding: "0 24px",
          }}
        >
          <h2
            style={{
              fontFamily: "'SFCamera', sans-serif",
              fontSize: "clamp(24px, 2.5vw, 28px)",
              fontWeight: "normal",
              color: "var(--text)",
              letterSpacing: "-0.03em",
              margin: "0 0 32px",
            }}
          >
            More
          </h2>
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
        </section>

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
