"use client"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"
import { X, ArrowUpRight, Lock } from "lucide-react"
import { useState, useEffect } from "react"
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
              <div className="flex items-start gap-3">
                <span
                  className="flex shrink-0 items-center justify-center rounded-full"
                  style={{ width: 32, height: 32, background: "var(--surface-hover)", color: "var(--text-2)" }}
                >
                  <Lock className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className="mt-1">
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

          {!isPanel && <RelatedProjects currentId="amd" />}
        </main>
      </div>
    </AnimatedPage>
  )
}
