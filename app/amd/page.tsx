"use client"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"
import { X, ArrowUpRight, Lock, Users } from "lucide-react"
import { useState, useEffect, type CSSProperties } from "react"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { RelatedProjects } from "@/components/related-projects"
import { useIsPanel } from "@/hooks/use-is-panel"
import { CaseStudyNav } from "@/components/case-study-nav"
import { CollapsibleDetails, itemVariants } from "@/components/collapsible-details"
import { motion } from "framer-motion"
import { TrackedExternalLink } from "@/components/tracked-external-link"
import { AmdAtmosphere } from "@/components/amd-atmosphere"
import { CaseStudyImage } from "@/components/case-study-image"

// Prefilled mailto for the confidential card. encodeURIComponent-style escaping is
// written out literally here (%20, %0A) to match how the other case studies do it.
const CONFIDENTIAL_MAILTO =
  "mailto:r575li@uwaterloo.ca?subject=AMD%20Case%20Study&body=Hi%20Richard%2C%0A%0AI%27d%20like%20to%20hear%20more%20about%20your%20work%20at%20AMD.%0A%0A"

// ── Takeaway icons ──
// lucide doesn't have either of these shapes, so they're drawn by hand with the
// same settings lucide uses (24×24 grid, 2px round strokes, currentColor) so they
// match the Users icon beside them. Size and colour come from className/style.
// 📖 Learn: SVG viewBox and paths — https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
type IconProps = { className?: string; style?: CSSProperties }

const ICON_SVG_PROPS = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true, // decorative: the heading next to it already says what it means
}

/** A desktop tower with a monitor standing in front of it. */
function PcWithMonitorIcon({ className, style }: IconProps) {
  return (
    <svg {...ICON_SVG_PROPS} className={className} style={style}>
      {/* Tower, at the back. Its left edge stops at y=8 and resumes at y=17 so it
          disappears behind the monitor instead of showing through it. */}
      <path d="M13 8V4a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-2" />
      <path d="M16 5h3" /> {/* drive bay */}
      <path d="M19 18h.01" /> {/* power light: a zero-length line with round caps draws a dot */}
      {/* Monitor, in front */}
      <rect x="2" y="8" width="14" height="9" rx="2" />
      <path d="M9 17v4" /> {/* stand */}
      <path d="M6 21h6" /> {/* base */}
    </svg>
  )
}

/** A circle with six small dots around it: pieces of context gathered around a model. */
function ContextDotsIcon({ className, style }: IconProps) {
  return (
    <svg {...ICON_SVG_PROPS} className={className} style={style}>
      <circle cx="12" cy="12" r="3" />
      {/* Six dots, 60° apart, 8.5 units from the centre (x = 12 ± 8.5·sin60°, y = 12 ± 8.5·cos60°).
          r=1 with a 2px stroke fills in, so each one reads as a solid dot. */}
      <circle cx="12" cy="3.5" r="1" />
      <circle cx="19.36" cy="7.75" r="1" />
      <circle cx="19.36" cy="16.25" r="1" />
      <circle cx="12" cy="20.5" r="1" />
      <circle cx="4.64" cy="16.25" r="1" />
      <circle cx="4.64" cy="7.75" r="1" />
    </svg>
  )
}

export default function AMDPage() {
  usePageViewTracker()
  const isPanel = useIsPanel()
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return (
    <AnimatedPage>
      {!isPanel && (
        <CaseStudyNav sections={[
          { id: "amd-role", label: "The Role" },
          { id: "amd-context-layer", label: "Context Layer" },
          { id: "amd-infra", label: "Infrastructure" },
          { id: "amd-triage", label: "Build Triage" },
          { id: "amd-takeaways", label: "Takeaways" },
          { id: "other", label: "Outside the Lab" },
        ]} />
      )}
      <div className="mx-auto">
        <AnimatedHeader currentPage="/amd" />

        <main className="max-w-3xl mx-auto py-6 px-[var(--page-gutter)] space-y-6 [&_p]:text-[var(--text-2)] [&_li]:text-[var(--text-2)]" style={{ paddingTop: isMobile ? "0px" : "40px" }}>
          <StaggeredContent delay={0}>
            <div className={`relative mb-1 ${isPanel ? "pr-20" : ""}`}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <h2 className="text-4xl font-bold mb-0">AMD</h2>
              </div>
              <p className="text-m" style={{ color: "var(--text-3)" }}>Work, 2026</p>
              {isPanel && (
                <span className="right-4 top-0.5 absolute">
                  <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "open" }, "*")}><ArrowUpRight className="w-6 h-6" /></button>
                  <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "close" }, "*")}><X className="w-6 h-6" /></button>
                </span>
              )}
            </div>
          </StaggeredContent>

          {/* Hero. There's no AMD banner asset yet, so this is the logo centred on a
              surface panel rather than an <img> that would 404. Drop a banner at
              /images/projects/amd/banner.webp and swap this block when one exists. */}
          <StaggeredContent delay={100}>
            {/* data-launch-target: the homepage card morphs into this banner (components/app-launch.tsx).
                On a wrapper because AmdAtmosphere doesn't pass extra attributes through. */}
            <div data-launch-target style={{ borderRadius: 16 }}>
            <AmdAtmosphere
              className="w-full squircle rounded-lg flex items-center justify-center"
              // 16:9, same as the homepage card, so the launch animation morphs
              // the card into this banner without any reshaping
              style={{ aspectRatio: "16/9", borderRadius: 16 }}
            >
              <img
                src="/logos/AMD_BIG.D.png"
                alt="AMD"
                // amd-logo: sized as a % of the banner width, the same on the homepage card
                // and the /amd hero, so the launch animation lands it exactly (globals.css)
                className="invert-on-light amd-logo"
                style={{ height: "auto", opacity: 0.9 }}
              />
            </AmdAtmosphere>
            </div>
          </StaggeredContent>

          {/* ── Confidential notice ──
              Placed directly under the hero, before any detail, so it frames
              everything that follows rather than reading as a footnote. */}
          <StaggeredContent delay={200}>
            <div
              className="squircle rounded-xl p-5"
              style={{ background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 16 }}
            >
              {/* items-center, not a margin nudge: keeps the icon and text centred
                  when the text wraps to two lines on narrow phones */}
              <div className="flex items-center gap-3">
                <span
                  className="flex shrink-0 items-center justify-center rounded-full"
                  style={{ width: 32, height: 32, background: "var(--surface-hover)", color: "var(--text-2)" }}
                >
                  <Lock className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p>
                    The details of this work are under NDA.
                  </p>
                </div>
              </div>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={300}>
            <CollapsibleDetails labels={["Timeline", "Team", "Stats", "Overview", "Technologies"]} animateContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Timeline</p>
                  <p>2026 - Present</p>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Team</p>
                  <p>Internal platform / GPU driver and firmware engineering</p>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Stats</p>
                  <div className="space-y-1">
                    <p>1,000,000+ rows and documents indexed</p>
                    {/* <p>4 teams onboarded</p>
                    <p>60M tokens served daily</p>*/}
                  </div>
                </motion.div>
              </div>
              <div>
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Overview</p>
                  <div className="space-y-4">
                    <p>Building a universal data context layer so internal agents can answer questions across systems that don't talk to each other.</p>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2 mt-4">Technologies</p>
                  <div className="space-y-4">
                    <p>Python, graph-based indexing, Snowflake, Kubernetes, local LLM serving on GPU</p>
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
                Standardize agent data retrieval with a fast, universal, self-evolving source of company data.
              </p>
            </div>
          </StaggeredContent>

          {false && (
          <StaggeredContent delay={400}>
            <div className="mb-8">
              <h2 id="amd-role" className="font-bold mb-3 text-2xl">The Role</h2>
              <p className="mb-4">
                I work on internal AI infrastructure. The through-line of everything below is the same
                problem: engineers and agents both need answers that live across a warehouse, a
                requirements system, and a nightly build pipeline, and none of those were built to be
                queried together.
              </p>

              <h2 id="amd-context-layer" className="font-bold mt-8 mb-4 text-2xl">The Context Layer</h2>
              <p className="mb-4">
                I'm architecting a universal data context layer for agents, built 0 to 1, aiming to cut
                latency on complex queries by 80%. The core of it is a graph-based index spanning over
                1,000,000 Snowflake rows and JAMA documents.
              </p>
              <p className="mb-4">
                The reason it's a graph and not just a vector store: the questions people actually ask
                are relational. Flat semantic search returns passages that each look relevant on their
                own but don't connect, so the agent has to make several round trips to assemble one
                answer, and each hop costs latency. Indexing the relationships up front means a complex
                query resolves as a traversal instead of as a chain of retrievals.
              </p>

              <h2 id="amd-infra" className="font-bold mt-8 mb-4 text-2xl">Infrastructure</h2>

              <h3 className="font-semibold mt-4 mb-2 text-lg">Kubernetes deployment</h3>
              <p className="mb-4">
                I manage the context layer's Kubernetes deployment and support adoption across 4 teams.
                Onboarding a team is usually less about the infrastructure and more about the mapping:
                each team names the same concept differently, and the index has to reconcile that before
                it's useful to them.
              </p>

              <h3 className="font-semibold mt-4 mb-2 text-lg">GPU cluster for local inference</h3>
              <p className="mb-4">
                I built a 10-node GPU cluster, managed over SSH, to serve local LLMs. It currently
                processes around 60M tokens daily. Running inference locally is what makes the rest of
                this possible at all: internal data can't leave the network, so hosted model APIs were
                never an option.
              </p>

              <h2 id="amd-triage" className="font-bold mt-8 mb-4 text-2xl">Build Triage</h2>
              <p className="mb-4">
                Nightly firmware builds fail, and someone has to find the commit that broke them. That
                was taking about an hour of manual work per failure. I built a commit bisection tool that
                brings it down to 30 minutes.
              </p>
              <p className="mb-4">
                Bisection itself is a solved idea; the work was in the constraints around it. Nightly
                builds are expensive, so the tool has to be deliberate about which commits it actually
                spends a build on, and it has to tell the difference between a real regression and a
                flaky failure before it reports anything.
              </p>
              {/* 📖 Learn: git bisect — the binary search over commit history this is modelled on.
                  https://git-scm.com/docs/git-bisect */}
            </div>
          </StaggeredContent>
          )}


          <StaggeredContent delay={400}>
            <div className="mb-8">
              <h2 id="amd-takeaways" className="font-bold mt-8 mb-4 text-2xl">Takeaways, so far</h2>
              <p className="mb-4">
                Context engineering is so much more than prompt engineering.
                The biggest engineering challenge in giving agents context in an internal AI platform is managing data created by an organization pre-AI, never designed to be joined, where every team has a slightly different idea of how data should be stored. Quality of data in → quality of data out. It's not from inference layer.
              </p>
              <p className="mb-4">
                I'd like to write about this properly once there's something I can share publicly. Until
                then, if you want to talk about context layers, graph indexing, or running local
                inference on-prem, please{" "}
                <a href={CONFIDENTIAL_MAILTO} style={{ color: "var(--text)", textDecoration: "underline" }}>
                  reach out
                </a>.
              </p>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={400}>
            <div className="mb-8">
              <h2 id="other" className="font-bold mt-8 mb-4 text-2xl">Outside the Lab</h2>
              <h3 className="font-semibold mt-4 mb-2 text-lg">Take Our Kids to Work Day</h3>
              <p className="mb-4">
                I was invited along my co-intern Shelly to introduce and speak to 100 grade 9 students at AMD's Take Our Kids to Work Day. We gave two quick talks on AMD and our experiences.
              </p>
              <CaseStudyImage
                src="/images/projects/amd/take-our-kids-to-work-day.webp"
                alt="Richard speaking into a microphone to a row of seated grade 9 students at AMD, with Shelly beside him and a Radeon wall behind them"
                // Same setup as team-lunch below: reserve the image's box, load only near the viewport
                width={1600}
                height={1020}
                loading="lazy"
                className="w-full h-auto squircle rounded-lg mb-4"
                style={{ borderRadius: 16 }}
              />
              <p className="mb-4">
                Take Our Kids to Work Day is a national program in Ontario, which I never got to participate in due to COVID. So this opportunity was super fulfilling.
              </p>

              <h3 className="font-semibold mt-4 mb-2 text-lg">Apple picking</h3>
              {/* Portrait photos: side by side on desktop, stacked on phones where two columns would be tiny.
                  📖 Learn: Tailwind responsive prefixes (sm:) — https://tailwindcss.com/docs/responsive-design */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <CaseStudyImage
                  src="/images/projects/amd/apple-picking-1.webp"
                  alt="Group selfie at Applewood Farm, with two people balancing big pumpkins on their heads"
                  width={1200}
                  height={1600}
                  loading="lazy"
                  className="w-full h-auto squircle rounded-lg"
                  style={{ borderRadius: 16 }}
                />
                <CaseStudyImage
                  src="/images/projects/amd/apple-picking-2.webp"
                  alt="The same group at Applewood Farm, laughing with the pumpkins still balanced on two heads"
                  width={1200}
                  height={1600}
                  loading="lazy"
                  className="w-full h-auto squircle rounded-lg"
                  style={{ borderRadius: 16 }}
                />
              </div>
            </div>
          </StaggeredContent>


          <StaggeredContent delay={450}>
            <h3 className="font-semibold mt-4 mb-2 text-lg">Team lunch</h3>
            <CaseStudyImage
              src="/images/projects/amd/team-lunch.webp"
              alt="Lunch with team"
              // width/height reserve the 4:3 space before the file loads, so the
              // text above doesn't jump. CSS (w-full h-auto) still sets the real size.
              // 📖 Learn: Cumulative Layout Shift — https://web.dev/articles/cls
              width={1600}
              height={1200}
              // Bottom of the page, so only download it when it's about to scroll into view
              loading="lazy"
              className="w-full h-auto squircle rounded-lg"
              style={{ borderRadius: 16 }}
            />
            <p className="mt-8 mb-4">
              AMD was one of the best organization communities I've been a part of, and I'll never forget my experience.
            </p>
          </StaggeredContent>

          {/* Stacked rows (icon left, text right) instead of 3 columns: the page is only
              max-w-3xl wide, so columns left ~230px each and the longer takeaways got squished.
              📖 Learn: Flexbox — https://css-tricks.com/snippets/css/a-guide-to-flexbox/ */}
          <StaggeredContent delay={500}>
            <div className="mb-8">
              <h2 id="amd-key-takeaways" className="font-bold mt-8 mb-8 text-2xl">Takeaways</h2>
              {/* space-y-8 puts the same gap between each row without a margin on every item.
                  On each icon, shrink-0 stops flexbox from squeezing it when the text beside it
                  is long, and mt-0.5 nudges it down to line up with the title's first line. */}
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <PcWithMonitorIcon className="w-6 h-6 shrink-0 mt-0.5" style={{ color: "var(--text)" }} />
                  <div>
                    <h3 className="font-bold mb-2">The best engineers are also tech nerds</h3>
                    <p style={{ color: "var(--text-2)" }}>I used to believe that my childhood of binging Linus Tech Tips daily gave me no edge as I pursued software, or that I need to specialize my knowledge in strictly one area, but some of the best engineers I worked with were also gamers and PC building enthusiasts, who always had answers to my questions ranging from software design to Corsair power cables. I think this fundamentally changed the way I see software, away from a grind and more as an extension of my passion for tech, like it was as a kid!</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <ContextDotsIcon className="w-6 h-6 shrink-0 mt-0.5" style={{ color: "var(--text)" }} />
                  <div>
                    <h3 className="font-bold mb-2">Context engineering and inference engineering are crucial</h3>
                    <p style={{ color: "var(--text-2)" }}>As foundation models advance, the next step in agentic workflows is properly organized context. Hardware is another bottleneck; I got the chance to learn about the emerging field of low-latency inference engineering. Really interested in this now.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Users className="w-6 h-6 shrink-0 mt-0.5" style={{ color: "var(--text)" }} />
                  <div>
                    <h3 className="font-bold mb-2">Gaining people's trust</h3>
                    <p style={{ color: "var(--text-2)" }}>Once you are knowledgeable enough, everything is a matter of fact. I think this is crucial for allowing people to trust your vision.</p>
                  </div>
                </div>
              </div>
            </div>
          </StaggeredContent>

          {!isPanel && <RelatedProjects currentId="amd" />}
        </main>
      </div>
    </AnimatedPage>
  )
}
