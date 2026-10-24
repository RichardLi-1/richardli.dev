"use client"
import type { ReactNode } from "react"
import { ArrowUpRight, Play } from "lucide-react"
import { AnimatedPage } from "@/components/animated-page"
import { AnimatedHeader } from "@/components/animated-header"
import { StaggeredContent } from "@/components/staggered-content"
import { startAgentRun, EXPAND_CHAT_EVENT } from "@/components/agent-orb"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { runChatTurn } from "@/lib/chat-client"
import { cn } from "@/lib/utils"

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

// ═══════════════════════════════════════════════════════════════════════════
// EDITABLE DATA — add / remove / reorder experiments here.
// Images can be any aspect ratio: tall and wide ones are what make the
// Pinterest-style stagger. Put files in public/images/ and reference them as
// "/images/...". The render code below never needs to change.
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
    image: "/images/PyroSense Thumbnail.png",
    //description: "Data-surveying firefighting helmet",
    link: "https://devpost.com/software/pyrosafe",
  },
  {
    title: "Automatic Transit Control Simulator for the TTC",
    image: "/images/projects/cbtc/thumbnail1.png",
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
    image: "/images/bpat-site.png",
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
    image: "/images/windows-xp-wallpaper-wide.jpeg", // placeholder until there's a screenshot of /xp
    //description: "",
    link: "/xp", // internal link: the standalone XP desktop page
  },
  {
    title: "An AI guide that takes you on a tour of this site",
    visual: <OrbVisual />,
    description: "Click to start. The chatbot plans 3 to 5 stops, then a glowing orb flies you to each page, points at what matters, and explains it. Type anything or hit × to take back the wheel.",
    onClick: startAiTour,
  },

  
]

// ═══════════════════════════════════════════════════════════════════════════

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
          // height: auto keeps each image's natural aspect ratio, which creates the uneven column heights.
          // With an imageDark, both images render and CSS hides one per theme (next-themes puts
          // a "dark" class on <html>). display lives in className, not style, because an inline
          // display: block would override dark:hidden. 📖 Learn: Tailwind dark: variant (class strategy)
          <>
            <img
              src={experiment.image}
              alt={experiment.title}
              loading="lazy"
              className={cn("block", experiment.imageDark && "dark:hidden")}
              style={{ width: "100%", height: "auto" }}
            />
            {experiment.imageDark && (
              <img
                src={experiment.imageDark}
                alt={experiment.title}
                loading="lazy"
                className="hidden dark:block"
                style={{ width: "100%", height: "auto" }}
              />
            )}
          </>
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
          </StaggeredContent>
        </main>
      </div>
    </AnimatedPage>
  )
}
