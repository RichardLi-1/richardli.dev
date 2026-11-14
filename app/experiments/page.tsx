"use client"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { ArrowUpRight, Play } from "lucide-react"
import { motion } from "framer-motion"
import { AnimatedPage } from "@/components/animated-page"
import { AnimatedHeader } from "@/components/animated-header"
import { CollapsibleDetails, itemVariants } from "@/components/collapsible-details"
import { StaggeredContent } from "@/components/staggered-content"
import { TransitControlVisual } from "@/components/transit-control-visual/transit-control-visual"
import { startAgentRun, EXPAND_CHAT_EVENT } from "@/components/agent-orb"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { runChatTurn } from "@/lib/chat-client"
import { cn } from "@/lib/utils"
// Each image's width/height, generated from public/images/projects by scripts/generate-image-placeholders.mjs
// before every dev/build (same file CaseStudyImage uses)
import placeholders from "@/lib/image-placeholders.json"

const IMAGE_SIZES = placeholders as Record<string, { w: number; h: number }>

// Starts the AI tour exactly like typing "give me a tour" into the chat (components/chat-box.tsx):
// the bot plans the stops and replies with a start_tour action, then the agent orb
// (components/agent-orb.tsx) flies the visitor to each page and has the bot present it.
async function startAiTour() {
  const result = await runChatTurn({ text: "Give me a tour of the site", agent: true }).catch(() => null)
  if (!result?.actions.length) return
  const started = await startAgentRun(result.actions)
  // The orb loads a moment after the page does; if it isn't there yet, open the chat
  // window instead so the visitor still sees the reply
  if (!started) window.dispatchEvent(new Event(EXPAND_CHAT_EVENT))
}

// A still copy of the agent orb, reusing its real classes from globals.css
// (.agent-orb-glow = the slowly turning ring of light, .agent-orb-core = the dark centre)
function OrbVisual() {
  return (
    <div className="flex items-center justify-center" style={{ aspectRatio: "16 / 10", background: "var(--surface)" }}>
      <div style={{ position: "relative", width: 72, height: 72, borderRadius: 999 }}>
        <div className="agent-orb-glow" />
        <div className="agent-orb-core" />
      </div>
    </div>
  )
}

// A card image with a skeleton: a shimmering box in the image's exact shape until it loads,
// then the image fades in. Knowing the shape up front (IMAGE_SIZES) is what keeps the masonry
// columns from jumping as images arrive. Images with no known size (outside public/images/projects,
// or transparent ones the generator skips) get a 16:10 box that gives way to the real shape on load.
function ExperimentImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const size = IMAGE_SIZES[src]
  const ref = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)

  // The page is pre-rendered, so a cached image can finish before React attaches onLoad.
  // If it's already there, skip the skeleton. 📖 Learn: HTMLImageElement.complete, hydration
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true)
  }, [src])

  return (
    <div
      className={cn("relative", className)}
      style={{ aspectRatio: size ? `${size.w} / ${size.h}` : loaded ? undefined : "16 / 10" }}
    >
      {!loaded && (
        // The sweep reuses the `shimmer` keyframes in globals.css; motion-reduce turns it off
        // for visitors who ask their OS for less motion. 📖 Learn: prefers-reduced-motion
        <div
          aria-hidden
          className="absolute inset-0 animate-[shimmer_1.4s_ease-in-out_infinite] motion-reduce:animate-none"
          style={{
            background: "linear-gradient(100deg, var(--surface) 30%, var(--surface-hover) 50%, var(--surface) 70%)",
            backgroundSize: "300% 100%",
          }}
        />
      )}
      <img
        ref={ref}
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{
          display: "block",
          width: "100%",
          height: size ? "100%" : "auto", // known size: fill the reserved box; unknown: natural height
          opacity: loaded ? 1 : 0,
          transition: "opacity 300ms ease",
        }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// EDITABLE DATA — add / remove / reorder experiments here.
// Images can be any aspect ratio: tall and wide ones are what make the
// Pinterest-style stagger. Put files under public/images/projects/ (e.g.
// public/images/projects/experiments/) and reference them as "/images/projects/...":
// images there get their exact shape reserved while they load. The render code
// below never needs to change.
// ═══════════════════════════════════════════════════════════════════════════

type Experiment = {
  title: string
  image?: string       // shown as-is; also the poster frame when `video` is set
  imageDark?: string   // optional: shown instead of `image` when the site is in dark mode
  video?: string       // optional .mp4 that autoplays (muted, looping) in place of the image
  visual?: ReactNode   // optional: a custom element shown instead of an image (e.g. <OrbVisual />)
  description?: string // one short line under the title
  link?: string        // optional: makes the whole card clickable and shows a ↗ arrow.
                       // "https://..." opens in a new tab; "/page" stays on the site
  onClick?: () => void // optional: runs on click instead of following a link, shows a ▶ icon
}

const EXPERIMENTS: Experiment[] = [
  {
    title: "Data-Surveying Firefighting Helmet (1st at Hack the Valley!)",
    image: "/images/projects/experiments/pyrosense-thumbnail.jpg",
    //description: "Data-surveying firefighting helmet",
    link: "https://devpost.com/software/pyrosafe",
  },
  {
    title: "Search every photo you own by describing it, on-device",
    image: "/images/projects/experiments/photo-search.jpg", // drawn, not a screenshot: real results would show other people's photos (CC BY, needing credits)
    description: "\"The menu with the coffee prices\" finds the menu. SigLIP2, OCR, date and place parsing and a self-trained \"same place\" model all run locally. Right photo first: 67% → 82% for text to photo, 59% → 74% in the search box. Web demo and Mac app; iOS and Android apps in progress.",
    link: "https://photos.richardli.dev", // the hosted demo; the code is public at github.com/RichardLi-1/Photos
  },
  {
    title: "Automatic Transit Control Simulator for the TTC",
    // Drawn in code from recordings of the real simulator (components/transit-control-visual),
    // so it stays accurate and keeps running instead of being a frozen screenshot
    visual: <TransitControlVisual />,
    //description: "Simulating communications-based train control systems",
    link: "https://transitcontrol.richardli.dev/",
  },
  {
    title: "A virtual father Chrome extension you never knew you needed",
    image: "/images/projects/fatherfigure/banner.png",
    //description: "",
    link: "/fatherfigure", // internal link: opens the existing case study page
  },
  {
    title: "Bike Parking Alliance of Toronto Website (recently redesigned!)",
    image: "/images/projects/experiments/bpat-site.jpg",
    //description: "A virtual father Chrome extension you never knew you needed",
    link: "https://bpat.ca/", // internal link: opens the existing case study page
  },
  {
    title: "End-to-end UX for defense manufacturers at SalesPatriot (YC W25)",
    image: "/images/projects/salespatriot/hero.png",
    //description: "",
    link: "/salespatriot", // internal link: opens the existing case study page
  },
  {
    title: "Music streaming that listens to your body via EEG (Hack The 6ix '26)",
    image: "/images/projects/museic/feed.png",
    imageDark: "/images/projects/museic/feed-dark.png",
    //description: "",
    link: "https://github.com/VidsterBroyo/Museic-HT6",
  },
  {
    title: "This website, recreated as a Windows XP desktop",
    image: "/images/projects/experiments/xp-desktop.jpg", // screenshot of /xp, cropped above the taskbar
    //description: "",
    link: "/xp", // internal link: the standalone XP desktop page
  },
  /* AI tour: hidden for now. Remove these comment markers to bring the card back.
  {
    title: "An AI guide that takes you on a tour of this site",
    visual: <OrbVisual />,
    description: "Click to start. The chatbot plans 3 to 5 stops, then a glowing orb flies you to each page, points at what matters, and explains it. Type anything or hit × to take back the wheel.",
    onClick: startAiTour,
  },
  */
  {
    title: "Every Bike Share Toronto ride on one day, mapped",
    image: "/images/projects/experiments/bike-share-rides.jpg", // poster: a busy moment ~40% in, since the first frame is nearly empty
    video: "/videos/bike-share-rides.mp4",
    description: "45,305 rides on Thursday, August 13, 2026. Data: City of Toronto Open Data. Map © CARTO, © OpenStreetMap contributors.",
    link: "https://x.com/transitfanner/status/2118788160641548581",
  },


]

// The collapsible status section above the gallery. This is the only place to edit when
// the status changes: update `updated`, then the text. Write dates out in full ("Nov 6",
// not "today"), because visitors read this long after it's written.
type RunningExperiment = {
  title: string
  tag: string // short status shown next to the title
  sections: {
    label: string
    text?: string     // a paragraph
    points?: string[] // and/or a bulleted list
  }[]
}

const CURRENT_EXPERIMENTS: { updated: string; intro: string; projects: RunningExperiment[] } = {
  updated: "November 6, 2026",
  intro: "Two things are running right now: bus-speed data collection, which is working, and a check of election websites, which has no results yet.",
  projects: [
    {
      title: "Where the TTC crawls",
      tag: "Main project",
      sections: [
        {
          label: "Goal",
          text: "I'm recreating Chicago's \"Where the Bus Crawls\" poster for Toronto, showing average speed every ~220 m during the 4-6 PM rush on the 20 busiest bus and streetcar routes.",
        },
        {
          label: "Why it takes time",
          text: "Nobody publishes past TTC positions for free, so they have to be recorded first.",
        },
        {
          label: "Status",
          points: [
            "Collector: running on Google Cloud since 12:47 AM on Nov 6, with no errors so far",
            "Data so far: about 70,000 rows as of 1:20 AM on Nov 6, all overnight. Nov 6's rushes are the first it will capture",
            "Earlier data from my laptop (Nov 3-5): 946,897 rows, but only 9 minutes of evening rush, so not enough for the map",
            "Pipeline and poster: working in a test on about 10 minutes of data",
            "Accuracy check: speeds were 86-97% of schedule on 9 of the 12 routes checked. 512, 7 and 35 need another look with more data",
          ],
        },
        {
          label: "What's next",
          text: "A rough map needs about 3 evening rushes, and 5 would make it solid. If the Nov 6 rush is captured, the fifth is Thursday, Nov 12. Matching the original's 20 weekdays would take until Dec 3.",
        },
      ],
    },
    {
      title: "Election website check",
      tag: "Running now",
      sections: [
        {
          label: "Question",
          text: "How many 2026 Toronto candidate and councillor websites does the Internet Archive already have? The new council term starts Nov 15, and those sites may start disappearing after that.",
        },
        {
          label: "How it works",
          text: "For 276 sites, it checks whether the site is still up and finds the Archive snapshot closest to election day. Every \"not archived\" result gets a second lookup. It only reads, and saves nothing to the Archive.",
        },
        {
          label: "Results",
          text: "None yet. Two earlier runs didn't produce usable results, and a third is expected to take about 10 minutes. So far, one candidate site I spot-checked was captured on Nov 2, and I found no Archive-It collection for Toronto's elections, though that search wasn't definitive.",
        },
      ],
    },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════

// Reuses the case studies' CollapsibleDetails, which starts closed. With animateContent the
// content only exists while open, and each motion.div child staggers in via itemVariants.
// Its label fades out once open, so the same two labels are repeated inside as the heading.
function CurrentExperiments() {
  const labels = ["Current experiments running", `Last updated ${CURRENT_EXPERIMENTS.updated}`]
  const bodyStyle = { fontFamily: "'SFCamera', sans-serif", fontSize: 14, lineHeight: 1.5, color: "var(--text-2)" }

  return (
    <div style={{ marginTop: 24 }}>
      <CollapsibleDetails labels={labels} animateContent>
        <motion.div variants={itemVariants} className="mb-6" style={{ maxWidth: 680 }}>
          <p className="section-label mb-2">{labels.join(" · ")}</p>
          <p style={bodyStyle}>{CURRENT_EXPERIMENTS.intro}</p>
        </motion.div>

        {/* Same one-to-two column grid as the case study details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CURRENT_EXPERIMENTS.projects.map((project) => (
            <motion.div key={project.title} variants={itemVariants} className="space-y-4">
              <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "0 12px" }}>
                <h2 style={{ fontFamily: "'SFCamera', sans-serif", fontSize: 16, color: "var(--text)" }}>{project.title}</h2>
                <span className="section-label">{project.tag}</span>
              </div>
              {project.sections.map((section) => (
                <div key={section.label}>
                  <p className="section-label mb-2">{section.label}</p>
                  {section.text && <p style={bodyStyle}>{section.text}</p>}
                  {section.points && (
                    <ul className="list-disc pl-4 space-y-1" style={bodyStyle}>
                      {section.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      </CollapsibleDetails>
    </div>
  )
}

function ExperimentCard({ experiment }: { experiment: Experiment }) {
  const card = (
    <>
      {/* .squircle + overflow hidden rounds the media's corners to match the rest of the site */}
      <div className="squircle" style={{ overflow: "hidden", background: "var(--card-bg)", border: "1px solid var(--border-2)" }}>
        {experiment.visual ? (
          experiment.visual
        ) : experiment.video ? (
          // muted + playsInline are both required for autoplay on iOS Safari
          <video
            src={experiment.video}
            poster={experiment.image}
            autoPlay
            muted
            loop
            playsInline
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        ) : (
          // Each image keeps its natural aspect ratio, which creates the uneven column heights.
          // With an imageDark, both render and CSS hides one per theme (next-themes puts a "dark"
          // class on <html>); the hidden one never downloads, since lazy images that aren't shown
          // aren't fetched. 📖 Learn: Tailwind dark: variant (class strategy)
          experiment.image && (
            <>
              <ExperimentImage src={experiment.image} alt={experiment.title} className={cn(experiment.imageDark && "dark:hidden")} />
              {experiment.imageDark && (
                <ExperimentImage src={experiment.imageDark} alt={experiment.title} className="hidden dark:block" />
              )}
            </>
          )
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, padding: "10px 2px 0" }}>
        <span style={{ fontFamily: "'SFCamera', sans-serif", fontSize: 14, color: "var(--text)" }}>{experiment.title}</span>
        {/* ↗ = goes somewhere (link), ▶ = starts something (onClick); plain cards get neither */}
        {experiment.link && <ArrowUpRight className="w-4 h-4 shrink-0" style={{ color: "var(--text-3)" }} />}
        {!experiment.link && experiment.onClick && <Play className="w-4 h-4 shrink-0" style={{ color: "var(--text-3)" }} />}
      </div>
      {experiment.description && (
        <p style={{ fontFamily: "'SFCamera', sans-serif", fontSize: 13, lineHeight: 1.5, color: "var(--text-3)", margin: "4px 2px 0" }}>{experiment.description}</p>
      )}
    </>
  )

  // External links open in a new tab; internal ones ("/...") stay in this tab
  const isExternal = experiment.link?.startsWith("http")

  return (
    // breakInside: avoid stops a column break from splitting one card across two columns
    // 📖 Learn: CSS break-inside (used with multi-column layout)
    <div className="photo-card" style={{ breakInside: "avoid", marginBottom: 24 }}>
      {experiment.link ? (
        <a
          href={experiment.link}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          style={{ display: "block", textDecoration: "none" }}
        >
          {card}
        </a>
      ) : experiment.onClick ? (
        // A real <button> (not a clickable div) so it works with the keyboard and screen readers.
        // The resets stop the browser's default button look from changing the card.
        <button
          type="button"
          onClick={experiment.onClick}
          className="block w-full text-left"
          style={{ background: "none", border: "none", padding: 0, font: "inherit", color: "inherit", cursor: "pointer" }}
        >
          {card}
        </button>
      ) : (
        card
      )}
    </div>
  )
}

export default function ExperimentsPage() {
  usePageViewTracker()

  return (
    <AnimatedPage>
      <div className="page-bg min-h-screen">
        <AnimatedHeader currentPage="/experiments" />

        {/* Top spacing matches the case study pages (e.g. app/amd/page.tsx): pt-0 md:pt-10 = 0px / 40px.
            Width matches the homepage (app/page.tsx): no max-width, page-gutter sides on mobile,
            40px (md:px-10) on desktop. md = 768px, the same cutoff as the homepage's isMobile. */}
        <main className="py-6 pt-0 md:pt-10 px-[var(--page-gutter)] md:px-10">

          {/* ── Title block ── matches the case study "AMD / Work, 2026" heading */}
          <StaggeredContent delay={0}>
            <h1 className="text-4xl font-bold mb-2">Experiments</h1>
            <p className="text-m" style={{ fontFamily: "'SFCamera', sans-serif", color: "var(--text-3)" }}>Because not every creation is a product</p>
          </StaggeredContent>

          {/* ── What's running now ── collapsed by default; content lives in CURRENT_EXPERIMENTS */}
          <StaggeredContent delay={50}>
            <CurrentExperiments />
          </StaggeredContent>

          {/* ── Masonry gallery ──
              Uses CSS multi-column layout instead of a masonry library: the browser
              makes as many ~260px columns as fit (1 on phones, up to 4 on wide screens)
              and pours cards down each column in order. Tradeoff: order reads
              top-to-bottom per column, not left-to-right across rows.
              📖 Learn: CSS multi-column layout (`columns`, `column-gap`) */}
          <StaggeredContent delay={100}>
            {/* "360px 3" = columns at least 360px wide, at most 3 of them (bigger cards than the old "260px 4") */}
            <section style={{ padding: "32px 0 96px", columns: "360px 3", columnGap: 32 }}>
              {EXPERIMENTS.map((experiment) => (
                <ExperimentCard key={experiment.title} experiment={experiment} />
              ))}
            </section>

            {/* ── Hidden link to /writing ──
                Hard to spot on purpose: tiny and in --text-5, the faintest text color, barely darker
                (or lighter) than the background. Hover or keyboard focus slowly brings it up to
                --text-2 so it reads as a link once found. It's still a real <a>, so Tab reaches it.
                pb-24 on mobile lifts it above the fixed bottom nav pill: this page has no footer,
                whose spacer normally does that job.
                data-agent-ignore: the site's chatbot and in-browser AI agents never see or click it.
                rel="nofollow": asks search crawlers not to follow it to /writing. */}
            <div data-agent-ignore className="flex justify-end pb-24 md:pb-0">
              <a
                href="/writing"
                rel="nofollow"
                className="text-[var(--text-5)] transition-colors duration-500 hover:text-[var(--text-2)] focus-visible:text-[var(--text-2)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--text-4)]"
                style={{ fontFamily: "'Toronto Subway', sans-serif", fontSize: 11, letterSpacing: "0.08em", textDecoration: "none" }}
              >
                writing
              </a>
            </div>
          </StaggeredContent>
        </main>
      </div>
    </AnimatedPage>
  )
}
