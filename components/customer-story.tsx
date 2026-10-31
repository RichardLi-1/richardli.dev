"use client"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Mail } from "lucide-react"
import { StaggeredContent } from "@/components/staggered-content"
import { CaseStudyImage } from "@/components/case-study-image"
import { mainProjects } from "@/components/mainProjects"

// Building blocks for the experimental "customer story" case study layout
// (app/transitplanner/case-study, app/amd/case-study). Each page composes
// these with its own copy, since the stories don't share one shape.

export type Stat = { value: string; label: string }
export type Quote = { text: string; name: string; role: string }

// Boxed panels (Key Results, sidebar CTA): one step lifted from the page.
// Inverting the theme (background: var(--text)) was too harsh in dark mode,
// a bright cream block on pure black.
export const SLAB: React.CSSProperties = {
  background: "var(--surface)",
  color: "var(--text)",
  border: "1px solid var(--border-2)",
}

export function BracketLabel({ children }: { children: React.ReactNode }) {
  return <p className="section-label mb-3">[ {children} ]</p>
}

// Thin border box with short L-shaped marks on each corner.
// Each mark is an empty span showing two of its four borders.
export function CornerBrackets({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const mark = "pointer-events-none absolute h-2 w-2 border-current"
  return (
    <span className={`relative inline-flex items-center px-6 py-2.5 border border-[var(--border-2)] ${className}`}>
      <span className={`${mark} -left-px -top-px border-l border-t`} />
      <span className={`${mark} -right-px -top-px border-r border-t`} />
      <span className={`${mark} -bottom-px -left-px border-b border-l`} />
      <span className={`${mark} -bottom-px -right-px border-b border-r`} />
      <span className="section-label" style={{ color: "inherit", fontSize: 12 }}>{children}</span>
    </span>
  )
}

// `slot` is only used in the dev placeholder, to say which entry to fill in
export function PullQuote({ quote, slot }: { quote: Quote | null; slot: string }) {
  if (!quote) {
    // 📖 Learn: process.env.NODE_ENV in Next.js ("development" in npm run dev,
    // "production" in builds), so the placeholder never ships
    if (process.env.NODE_ENV === "production") return null
    return (
      <div className="my-10 border border-dashed border-[var(--text-4)] p-5 text-sm" style={{ color: "var(--text-3)" }}>
        Quote placeholder: fill <code>QUOTES.{slot}</code> in this page&apos;s file.
      </div>
    )
  }
  return (
    <figure className="my-10 border-l-2 pl-6" style={{ borderColor: "var(--text-4)" }}>
      <blockquote className="text-2xl leading-snug" style={{ color: "var(--text)" }}>
        &ldquo;{quote.text}&rdquo;
      </blockquote>
      <figcaption className="section-label mt-4">
        / {quote.name} &nbsp; / {quote.role}
      </figcaption>
    </figure>
  )
}

// size "lg" for the full-width hero, "md" inside the narrower story column.
// whitespace-nowrap keeps a value like "6 agents" on one line.
export function StatRow({ stats, size = "lg" }: { stats: Stat[]; size?: "lg" | "md" }) {
  const valueSize = size === "lg" ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl"
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label}>
          <p className={`${valueSize} whitespace-nowrap`}>{stat.value}</p>
          <p className="section-label mt-2">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}

export function KeyResults({ eyebrow, stats }: { eyebrow: string; stats: Stat[] }) {
  return (
    <div className="my-10 p-8 md:p-10" style={SLAB}>
      <p className="section-label">{eyebrow}</p>
      <p className="mt-1 text-2xl">Key Results</p>
      <div className="mt-8 border-t pt-8" style={{ borderColor: "var(--border-2)" }}>
        <StatRow stats={stats} size="md" />
      </div>
    </div>
  )
}

// Full-width hero. `backdrop` is the decorative layer on the right (an image,
// an animation); the page passes it in already positioned and masked.
export function StoryHero({
  title,
  subtitle,
  badge,
  stats,
  backdrop,
}: {
  title: React.ReactNode
  subtitle: string
  badge?: React.ReactNode // optional: leave out for no badge box
  stats: Stat[]
  backdrop: React.ReactNode
}) {
  // Hovering anywhere on the title (not just the highlighted words) runs the sweep
  const titleRef = useRef<HTMLHeadingElement>(null)
  const sweep = useUnderlineSweep(titleRef)

  return (
    <section className="relative overflow-hidden">
      {backdrop}
      <div className="relative mx-auto flex min-h-[80vh] max-w-7xl flex-col px-[var(--page-gutter)] pb-12 pt-24">
        {/* flex-1 makes this block take all the height the stats don't use, and
            justify-center puts the text in the middle of it. Before, the whole
            column was pushed to the bottom (justify-end), leaving the title low
            with an empty band above it. 📖 Learn: flex-grow (flex-1) */}
        <div className="flex flex-1 flex-col justify-center">
          <StaggeredContent delay={0}>
            <h1
              ref={titleRef}
              onMouseEnter={sweep.onMouseEnter}
              className="story-hero-title max-w-3xl text-4xl leading-[1.1] md:text-6xl"
            >
              {title}
            </h1>
          </StaggeredContent>
          <StaggeredContent delay={100}>
            <p className="mt-6 max-w-xl text-lg" style={{ color: "var(--text-2)" }}>{subtitle}</p>
            {badge && (
              <span className="mt-10 inline-block border px-3 py-2 text-sm" style={{ borderColor: "var(--text-3)" }}>
                {badge}
              </span>
            )}
          </StaggeredContent>
        </div>
        {/* Stats stay pinned to the bottom edge of the hero */}
        <StaggeredContent delay={200}>
          <div className="mt-16 border-t pt-6" style={{ borderColor: "var(--border-2)" }}>
            <StatRow stats={stats} />
          </div>
        </StaggeredContent>
      </div>
    </section>
  )
}

// Highlighted phrase in a hero title. Its underline is hidden at rest
// (.story-highlight in app/globals.css) and swept by useUnderlineSweep below.
export function Highlight({ children }: { children: React.ReactNode }) {
  return <span className="story-highlight">{children}</span>
}

// One sweep: grow from the left edge to full width, then shrink toward the
// right edge, like the Windows 10 indeterminate progress bar. The anchor
// switches from left to right at the halfway point, while the line is full
// width, so the switch can't be seen.
const SWEEP_KEYFRAMES: Keyframe[] = [
  { offset: 0, backgroundSize: "0% 3px", backgroundPosition: "left bottom", easing: "ease-in-out" },
  { offset: 0.5, backgroundSize: "100% 3px", backgroundPosition: "left bottom" },
  { offset: 0.5001, backgroundSize: "100% 3px", backgroundPosition: "right bottom", easing: "ease-in-out" },
  { offset: 1, backgroundSize: "0% 3px", backgroundPosition: "right bottom" },
]
const SWEEP_MS = 1400
const LOAD_DELAY_MS = 800 // waits for the page fade-in to finish

// Plays the sweep once on page load, and once each time `titleRef` is hovered.
// It never loops: staying on the title doesn't replay it.
// Driven by the Web Animations API instead of CSS: a CSS animation keeps
// running on its original clock when only its delay changes, so a hover could
// start mid-sweep or not at all. Here every hover gets a fresh animation.
// 📖 Learn: Web Animations API (element.animate, Animation.cancel, getComputedTiming)
function useUnderlineSweep(titleRef: React.RefObject<HTMLElement | null>) {
  const animationsRef = useRef<Animation[]>([])

  // Every highlighted phrase inside the title (usually one)
  const getLines = () =>
    Array.from(titleRef.current?.querySelectorAll<HTMLElement>(".story-highlight") ?? [])

  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

  // Replaces whatever was there with one new sweep
  const playOnce = (delay: number) => {
    animationsRef.current.forEach((animation) => animation.cancel())
    animationsRef.current = getLines().map((line) =>
      line.animate(SWEEP_KEYFRAMES, { duration: SWEEP_MS, delay, iterations: 1 }),
    )
  }

  // Page load. Cancelled on unmount so it can't outlive the page.
  useEffect(() => {
    if (!reducedMotion()) playOnce(LOAD_DELAY_MS)
    return () => animationsRef.current.forEach((animation) => animation.cancel())
  }, [])

  const onMouseEnter = () => {
    if (reducedMotion()) return
    // currentIteration is null unless the line is actually moving (it's null
    // once a sweep has finished, and while the load sweep waits out its delay).
    // If a sweep is mid-way, let it finish rather than jump back to the start.
    const current = animationsRef.current[0]
    const midSweep = current?.playState === "running" && current.effect?.getComputedTiming().currentIteration != null
    if (!midSweep) playOnce(0)
  }

  // No mouse-leave handler needed: each sweep stops by itself after one pass
  return { onMouseEnter }
}

// Gradient mask for hero backdrops: transparent on the left, solid from 45%.
// 📖 Learn: CSS mask-image (the gradient sets how opaque each part is)
export const BACKDROP_MASK: React.CSSProperties = {
  maskImage: "linear-gradient(to right, transparent, black 45%)",
  WebkitMaskImage: "linear-gradient(to right, transparent, black 45%)",
}

// Two-column body: sticky sidebar on the left, story on the right
export function StoryBody({ sidebar, children }: { sidebar: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:gap-24 px-[var(--page-gutter)] py-16 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      {/* 📖 Learn: position: sticky (md:sticky). self-start stops the grid from
          stretching the aside to full height, which would leave it no room to stick */}
      {/* Sidebar is deliberately quieter than the story: 13px text, labels at
          --text-4 and values at --text-3 (the story uses --text and --text-2) */}
      <aside className="space-y-6 self-start text-[13px] md:sticky md:top-24">{sidebar}</aside>
      <article className="max-w-3xl [&_p]:leading-relaxed">{children}</article>
    </div>
  )
}

export function SidebarField({ label, children, divider = false }: { label: string; children: React.ReactNode; divider?: boolean }) {
  return (
    <div className={divider ? "border-t pt-6" : ""} style={divider ? { borderColor: "var(--border-2)" } : undefined}>
      <p className="section-label mb-1" style={{ color: "var(--text-4)" }}>{label}</p>
      <div style={{ color: "var(--text-3)" }}>{children}</div>
    </div>
  )
}

export function SidebarTags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span key={tag} className="section-label border px-2 py-1" style={{ borderColor: "var(--border-2)", color: "var(--text-4)" }}>
          {tag}
        </span>
      ))}
    </div>
  )
}

export function ShareButtons({ title }: { title: string }) {
  // Share links need this page's URL, which only exists in the browser.
  // Reading window in useEffect avoids a server/client hydration mismatch.
  const [pageUrl, setPageUrl] = useState("")
  useEffect(() => setPageUrl(window.location.href), [])

  const url = encodeURIComponent(pageUrl)
  const boxClass = "flex h-8 w-8 items-center justify-center border text-xs transition-colors hover:text-[var(--text)]"
  const boxStyle = { borderColor: "var(--border-2)", color: "var(--text-4)" }

  return (
    <div className="flex gap-2">
      <a href={`https://twitter.com/intent/tweet?url=${url}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X" className={boxClass} style={boxStyle}>
        X
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className={boxClass} style={boxStyle}>
        in
      </a>
      <a href={`mailto:?subject=${encodeURIComponent(title)}&body=${url}`} aria-label="Share by email" className={boxClass} style={boxStyle}>
        <Mail className="h-3.5 w-3.5" />
      </a>
    </div>
  )
}

// Three other case studies. Same filters as RelatedProjects: hidden projects
// and externalOnly ones (no on-site page) are skipped.
export function ReadMoreProjects({ currentId }: { currentId: string }) {
  const projects = mainProjects
    .filter((p) => !(p as any).hidden && !(p as any).externalOnly && p.id !== currentId)
    .slice(0, 3)

  return (
    <section className="border-t" style={{ borderColor: "var(--border-2)" }}>
      <div className="mx-auto max-w-7xl px-[var(--page-gutter)] py-16">
        <BracketLabel>Read more case studies</BracketLabel>
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          {projects.map((project) => {
            const isVideo = project.image.endsWith(".mov") || project.image.endsWith(".mp4")
            return (
              <Link key={project.id} href={`/${project.id}`} className="group block">
                <div className="aspect-[16/10] overflow-hidden" style={{ background: "var(--surface)" }}>
                  {isVideo ? (
                    <video src={project.image} muted autoPlay loop playsInline className="h-full w-full object-cover" />
                  ) : (
                    <CaseStudyImage src={project.image} alt={project.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  )}
                </div>
                <p className="section-label mt-4">/ {project.year} &nbsp; / Case study</p>
                <p className="mt-2 text-2xl group-hover:underline" style={{ color: "var(--text)" }}>{project.title}</p>
                {project.description && (
                  <p className="mt-2 text-sm" style={{ color: "var(--text-3)" }}>{project.description}</p>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const CONTACT_EMAIL = "r575li@uwaterloo.ca"

// Closing CTA. The contact API is retired, so submitting opens the visitor's
// mail app with the email prefilled. The sender's address comes with the email
// itself, which is why the field asks for an idea rather than an email address.
export function CollaborateCTA({
  label,
  heading,
  placeholder,
  buttonLabel,
  subject,
  intro,
}: {
  label: string
  heading: string
  placeholder: string
  buttonLabel: string
  subject: string
  intro: string // first line of the email body, before what the visitor typed
}) {
  const [message, setMessage] = useState("")

  // 📖 Learn: mailto: URLs and encodeURIComponent (spaces/newlines must be escaped)
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const body = `Hi Richard,\n\n${intro}\n\n${message}\n`
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <section className="px-[var(--page-gutter)] py-24 text-center">
      <BracketLabel>{label}</BracketLabel>
      <h2 className="text-3xl md:text-5xl" style={{ color: "var(--text)" }}>{heading}</h2>
      <form onSubmit={handleSubmit} className="mx-auto mt-10 flex max-w-xl flex-col items-center gap-6 sm:flex-row">
        <label htmlFor="collaborate-message" className="sr-only">{placeholder}</label>
        <input
          id="collaborate-message"
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={placeholder}
          className="w-full flex-1 border-b bg-transparent pb-2 text-xl outline-none placeholder:text-[var(--text-4)] focus:border-[var(--text-2)]"
          style={{ borderColor: "var(--text-4)", color: "var(--text)" }}
        />
        <button type="submit" className="shrink-0 transition-transform duration-150 hover:scale-95" style={{ color: "var(--text)" }}>
          <CornerBrackets>{buttonLabel}</CornerBrackets>
        </button>
      </form>
    </section>
  )
}
