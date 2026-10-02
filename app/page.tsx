"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { launchApp } from "@/components/app-launch"
import { ExternalLink } from "lucide-react"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { ResponsiveHeader } from "@/components/responsiveheader"
import { mainProjects } from "@/components/mainProjects"
import { ProjectImageCycler } from "@/components/project-image-cycler"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { useWindowsXP } from "@/contexts/windows-xp-context"
// import { DraggableSticker } from "@/components/draggable-sticker"
import { trackEvent } from "@/lib/track"
import posthog from "posthog-js"
import { AmdAtmosphere } from "@/components/amd-atmosphere"

const activities = [
  "somewhere on the ttc",
  "reading context engineering research",
  "listening to bollywood music",
  "cooking new steak recipes",
  "drinking molly tea",
  "flibbertigibbeting with claude",
]

const currently = [
  { image: "/logos/AMD_BIG.D.png", text: "Software Engineering @ AMD" },
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
  { image: "/images/projects/cec/logo.webp", text: "Software Engineer @ Career Education Council" },
]

export default function PersonalWebsite() {
  const pathname = usePathname()
  const router = useRouter()
  // The homepage zooms in behind a project as it opens (see components/app-launch.tsx)
  const mainRef = useRef<HTMLElement>(null)
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

  // Experimental TikTok-style project feed on mobile, behind the PostHog flag
  // "mobile-project-feed" (off until projects have videos). `?feed=1` in the URL
  // forces it on for testing on a phone. Flags arrive from the network after
  // mount, so this starts false and flips once PostHog answers.
  // onFeatureFlags returns an unsubscribe function, used as the effect cleanup.
  // 📖 Learn: PostHog feature flags (onFeatureFlags, isFeatureEnabled)
  const [feedFlagOn, setFeedFlagOn] = useState(false)
  useEffect(() => {
    const forcedByUrl = new URLSearchParams(window.location.search).get("feed") === "1"
    if (forcedByUrl) {
      setFeedFlagOn(true)
      return
    }
    return posthog.onFeatureFlags(() => {
      setFeedFlagOn(posthog.isFeatureEnabled("mobile-project-feed") === true)
    })
  }, [])
  // Not named `useFeed`: names starting with "use" are reserved for React hooks
  const showFeed = isMobile && feedFlagOn

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
  const visibleProjects = mainProjects.filter(p => !(p as any).hidden).slice(0, 8)

  return (
    <AnimatedPage>
      <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
        <ResponsiveHeader isHomepage={true} currentPage="/" />

        <main ref={mainRef} style={{
          margin: "0 auto",
          padding: isMobile ? "32px var(--page-gutter) 0" : "80px 40px 0",
        }}>

          {/* ────────────────────── Hero ────────────────────── */}
          <StaggeredContent delay={0}>
            <section style={{
              marginBottom: isMobile? 48 : 64,
               maxWidth: 700,
              // Mobile feed: the hero is the first snap stop. The huge scroll margin
              // asks to snap *above* the page top, which the browser clamps to 0,
              // so this stop always means "the very top of the page".
              ...(showFeed && { scrollSnapAlign: "start", scrollMarginTop: "100dvh" }),
            }}>
              <h1 style={{ fontSize: "clamp(40px, 7vw, 56px)", lineHeight: 1.2, letterSpacing: -1, marginBottom: 14, fontFamily: "'SFCamera', sans-serif" }}>
                Richard Li is a software engineer and full-time public transit enthusiast.<mark className="hero-highlight"></mark>
              </h1>
              <p style={{ fontSize: 16, color: "var(--text-2)", letterSpacing: "0.02em" }}>
                Most days, you'll find him —{" "}
                <span
                  key={activityIndex}
                  style={{
                    color: "var(--text)",
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
                    <li key={item.text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--text-2)", listStyle: "none" }}>
                      <img src={item.image} alt="" width={18} height={18} className={item.image.includes("AMD") ? "invert-on-light" : undefined} style={{ maxHeight: 18, maxWidth: 18, borderRadius: "0%", objectFit: "cover" }} />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>  
              <div>
                <p className="section-label" style={{ marginBottom: 14 }}>Previously</p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {previously.map(item => (
                    <li key={item.text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--text-2)", listStyle: "none" }}>
                      <img src={item.image} alt="" style={{ maxHeight: 18, maxWidth: 18, borderRadius: "50%" }} />
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
              <p className="section-label" style={{ marginBottom: 20 }}>Work</p>
              {/* `snap-feed` (mobile + flag only) switches on TikTok-style snapping for the
                  page scroller. See the "Mobile project feed" rules in globals.css. */}
              <div className={showFeed ? "snap-feed" : undefined} style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                // Feed: a small gap so peeking neighbours read as separate cards
                gap: showFeed ? 12 : "32px 16px",
              }}>
                {visibleProjects.map(project => {
                  const externalOnly = (project as { externalOnly?: boolean }).externalOnly
                  const externalLink = (project as { externalLink?: string }).externalLink
                  const cardHref =
                    externalOnly && externalLink ? externalLink : `/${project.id}`
                  return (
                  <Link
                    key={project.id}
                    href={cardHref}
                    {...(externalOnly && externalLink
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    // iOS-style "open app" animation for internal project pages.
                    // Only a plain left click is taken over; cmd/ctrl/shift/middle
                    // clicks keep their normal "open in new tab/window" behaviour.
                    // If launchApp returns false (reduced motion, slow device or
                    // network), we don't preventDefault, so the Link navigates as usual.
                    onClick={e => {
                      if (externalOnly) return
                      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                      const source = e.currentTarget.querySelector<HTMLElement>("[data-launch-source]")
                      if (!source) return
                      const tookOver = launchApp({
                        href: cardHref,
                        source,
                        backdrop: mainRef.current,
                        push: href => router.push(href),
                        prefetch: href => router.prefetch(href),
                      })
                      if (tookOver) e.preventDefault()
                    }}
                    style={{
                      textDecoration: "none",
                      // Mobile feed: each card is one snap stop, a bit shorter than the
                      // visible area and snapped to its centre, so the previous and next
                      // cards peek in by --feed-peek (vars set in globals.css).
                      // scroll-snap-stop: always = one swipe moves exactly one card.
                      // 📖 Learn: CSS Scroll Snap (scroll-snap-align, scroll-snap-stop), dvh units, calc()
                      ...(showFeed && {
                        display: "flex",
                        flexDirection: "column",
                        height: "calc(100dvh - var(--feed-pill-clearance, 88px) - 2 * var(--feed-peek, 48px))",
                        scrollSnapAlign: "center",
                        scrollSnapStop: "always",
                      }),
                    }}
                  >
                    <div
                      style={{
                        cursor: "pointer",
                        // Feed: fill the frame so the image can stretch tall
                        ...(showFeed && { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }),
                      }}
                      // Track hover so the title underlines and the "Try it out"
                      // button can appear; no image scaling on hover.
                      onMouseEnter={() => setHoveredId(project.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => posthog.capture("project_card_clicked", { project_id: project.id, project_title: project.title, destination: cardHref })}
                    >
                      {/* data-cursor-surface: the iPad pointer lifts just the image, not the caption.
                          data-cursor-growth: these cards are already special, so they lift
                          a bit less than the sitewide default (16px).
                          data-cursor-glare: a softer white glare spot than the default (0.5). */}
                      {/* data-launch-source: the box that grows into the page when opened */}
                      <div data-cursor-surface data-launch-source data-cursor-growth="13" data-cursor-glare="0.35" style={{
                        position: "relative",
                        width: "100%",
                        // Feed: take all the frame's height left over after the caption.
                        // minHeight: 0 lets a flex child shrink below its content size.
                        ...(showFeed ? { flex: 1, minHeight: 0 } : { aspectRatio: "16/9" }),
                        borderRadius: 16,
                        cornerShape: "squircle",
                        background: "var(--pure)",
                        marginBottom: 8,
                      }}>
                        <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: 16, cornerShape: "squircle" } as React.CSSProperties}>
                          <div id={`proj-img-${project.id}`} className="proj-img" style={{ width: "100%", height: "100%", transition: "transform 0.35s ease" }}>
                            {project.id === "amd" ? (
                              <AmdAtmosphere className="w-full h-full flex items-center justify-center">
                                <img
                                  src="/logos/AMD_BIG.D.png"
                                  alt="AMD"
                                  className="invert-on-light"
                                  style={{ width: isMobile ? 84 : 120, height: "auto", opacity: 0.9 }}
                                />
                              </AmdAtmosphere>
                            ) : (
                              <ProjectImageCycler
                                images={[project.image, (project as any).image2, (project as any).image3]}
                                alt={project.title}
                                className="w-full h-full object-cover"
                                fit={showFeed ? "blur-backdrop" : "cover"}
                              />
                            )}
                          </div>
                        </div>
                        {/* "Try it out" button only appears on hover and only if the project has an external link */}
                        {hoveredId === project.id && externalLink && !externalOnly && (
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
                              window.open(externalLink, "_blank", "noopener,noreferrer")
                            }}
                            className="liquid-glass-pill squircle"
                            style={{
                              position: "absolute", top: 10, right: 10,
                              display: "flex", alignItems: "center", gap: 6,
                              padding: "6px 14px",
                              borderRadius: 10,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                            // Hover feedback comes from the iPad pointer's highlight effect (components/ipad-cursor.tsx)
                          >
                            <span style={{ fontSize: 16, fontFamily: "'Toronto Subway', sans-serif", letterSpacing: "0.02em", color: "inherit" }}>Click here to use!</span>
                            <ExternalLink style={{ width: 12, height: 12, opacity: 0.65 }} />
                          </button>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                        <p style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.5, margin: 0 }}>
                          <span style={{
                            textDecoration: hoveredId === project.id ? "underline" : "none",
                            textUnderlineOffset: 3,
                          }}>
                            {project.title}
                          </span>
                          {project.description && (
                            <span style={{ fontSize: 14, color: "var(--text-3)" }}> — {project.description}</span>
                          )}
                        </p>
                        {/*<span style={{ fontSize: 12, color: "var(--text-4)", flexShrink: 0, fontFamily: "'Toronto Subway', sans-serif", letterSpacing: "0.03em" }}>
                          {project.year
                        </span>}*/}
                      </div>
                    </div>
                  </Link>
                  )
                })}
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

          {/* {isPersonalized && (
            <DraggableSticker src="/images/decorative/stickers/molly-tea.png" ix={0.90} iy={0.55} size={80} />
          )} */}

          
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
