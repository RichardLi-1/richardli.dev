"use client"
import { Lock } from "lucide-react"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"
import { TrackedExternalLink } from "@/components/tracked-external-link"
import { CaseStudyImage } from "@/components/case-study-image"
import { AmdAtmosphere } from "@/components/amd-atmosphere"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { useEndSlowdownScroll } from "@/hooks/use-end-slowdown-scroll"
import {
  BACKDROP_MASK,
  BracketLabel,
  CollaborateCTA,
  CornerBrackets,
  Highlight,
  KeyResults,
  PullQuote,
  ReadMoreProjects,
  ShareButtons,
  SidebarField,
  SidebarTags,
  SLAB,
  StoryBody,
  StoryHero,
  type Quote,
  type Stat,
} from "@/components/customer-story"

// This work is under NDA. Everything here comes from what app/amd/page.tsx
// already shows publicly; its hidden sections ({false && ...}) and commented-out
// stats stay out of this page too.

const CONFIDENTIAL_MAILTO =
  "mailto:r575li@uwaterloo.ca?subject=AMD%20Case%20Study&body=Hi%20Richard%2C%0A%0AI%27d%20like%20to%20hear%20more%20about%20your%20work%20at%20AMD.%0A%0A"

// Shown in the hero and repeated in the Key Results box
const STATS: Stat[] = [
  { value: "1M+", label: "Rows and documents indexed" },
  { value: "1 source", label: "Of company data for every agent" },
  { value: "On-prem", label: "LLMs served locally on GPU" },
]

// TODO: paste real quotes. Check they're cleared for public use first,
// since the rest of this work is under NDA.
const QUOTES: { problem: Quote | null; results: Quote | null } = {
  problem: null,
  results: null,
}

export default function AMDCaseStudyPage() {
  usePageViewTracker()
  useEndSlowdownScroll() // experimental: scrolling eases off near the bottom

  return (
    <AnimatedPage>
      <div className="page-bg min-h-screen">
        <AnimatedHeader currentPage="/amd" />

        <StoryHero
          title={<>Building a <Highlight>universal data context layer</Highlight> for AMD&apos;s internal agents</>}
          subtitle="Internal agents need answers from systems that don't talk to each other. I'm building one fast, universal source of company data for them to query."
          stats={STATS}
          backdrop={
            // Wrapper does the positioning and fade, so AmdAtmosphere's own
            // styles (globals.css) can't override them
            <div
              aria-hidden="true"
              className="absolute inset-y-0 right-0 w-full opacity-30 md:w-[60%] md:opacity-80"
              style={BACKDROP_MASK}
            >
              <AmdAtmosphere className="flex h-full w-full items-center justify-center">
                <img src="/logos/AMD_BIG.D.png" alt="" className="invert-on-light amd-logo" style={{ height: "auto", opacity: 0.9 }} />
              </AmdAtmosphere>
            </div>
          }
        />

        <StoryBody
          sidebar={
            <>
              <ShareButtons title="AMD Case Study" />
              <SidebarField label="About this work">
                Building a universal data context layer so internal agents can answer questions across
                systems that don&apos;t talk to each other.
              </SidebarField>
              <SidebarField label="Category">Work</SidebarField>
              <SidebarField label="Timeline">2026 - Present</SidebarField>
              <SidebarField label="Team">Internal platform / GPU driver and firmware engineering</SidebarField>
              <SidebarField label="Pain point" divider>
                Company data created before AI, never designed to be joined, and stored differently by
                every team.
              </SidebarField>
              <SidebarField label="Built with" divider>
                <SidebarTags tags={["Python", "Graph indexing", "Snowflake", "Kubernetes", "Local LLMs"]} />
              </SidebarField>

              <div className="p-6" style={SLAB}>
                <p className="flex items-center gap-2 text-lg">
                  <Lock className="h-4 w-4" style={{ color: "var(--text-3)" }} />
                  Under NDA.
                </p>
                <p className="mt-1" style={{ color: "var(--text-3)" }}>The details of this work are confidential.</p>
                <TrackedExternalLink
                  projectId="amd"
                  linkLabel="Email for details"
                  location="case study sidebar"
                  href={CONFIDENTIAL_MAILTO}
                  className="mt-5 inline-block transition-transform duration-150 hover:scale-95"
                >
                  <CornerBrackets>Email for details →</CornerBrackets>
                </TrackedExternalLink>
              </div>
            </>
          }
        >
          <StaggeredContent delay={300}>
            <p className="text-2xl leading-snug" style={{ color: "var(--text)" }}>
              Standardize agent data retrieval with a single, fast, universal source of company data.
            </p>
            <p className="mt-6" style={{ color: "var(--text-2)" }}>
              That&apos;s the mission. Agents are only as useful as the context they can reach, and at a
              company this size, that context is spread across systems that were never built to be
              queried together.
            </p>
          </StaggeredContent>

          {/* ── Problem ── */}
          <section className="mt-16 space-y-5" style={{ color: "var(--text-2)" }}>
            <BracketLabel>The problem</BracketLabel>
            <h2 className="text-2xl" style={{ color: "var(--text)" }}>Data built before agents existed</h2>
            <p>
              The hardest part of giving agents context isn&apos;t the model. It&apos;s data an organization
              created before AI, never designed to be joined, where every team has a slightly different
              idea of how data should be stored.
            </p>
            <p>
              Quality of data in, quality of answers out. No amount of work at the inference layer makes
              up for context the agent can&apos;t find or can&apos;t trust.
            </p>
            <PullQuote quote={QUOTES.problem} slot="problem" />
          </section>

          {/* ── Solution ── */}
          <section className="mt-16 space-y-5" style={{ color: "var(--text-2)" }}>
            <BracketLabel>The solution</BracketLabel>
            <h2 className="text-2xl" style={{ color: "var(--text)" }}>One context layer for every agent</h2>
            <p>
              Instead of every agent wiring up its own retrieval for every system, the context layer
              gives them one place to ask. The stack is Python, graph-based indexing, Snowflake,
              Kubernetes, and local LLM serving on GPU.
            </p>
          </section>

          {/* ── Confidential ── */}
          <section className="mt-16 space-y-5" style={{ color: "var(--text-2)" }}>
            <BracketLabel>The details</BracketLabel>
            <h2 className="text-2xl" style={{ color: "var(--text)" }}>The rest is under NDA</h2>
            <p>
              I&apos;d like to write about this properly once there&apos;s something I can share publicly.
              Until then, if you want to hear more,{" "}
              <a href={CONFIDENTIAL_MAILTO} className="underline" style={{ color: "var(--text)" }}>
                email me
              </a>.
            </p>
          </section>

          {/* ── Results ── */}
          <section className="mt-16 space-y-5" style={{ color: "var(--text-2)" }}>
            <BracketLabel>The results</BracketLabel>
            <h2 className="text-2xl" style={{ color: "var(--text)" }}>Takeaways, so far</h2>
            <p>Context engineering is so much more than prompt engineering.</p>
          </section>

          <KeyResults eyebrow="So far" stats={STATS} />

          <CaseStudyImage
            src="/images/projects/amd/team-lunch.webp"
            alt="Lunch with team"
            width={1600}
            height={1200}
            loading="lazy"
            className="mt-4 h-auto w-full"
          />

          <PullQuote quote={QUOTES.results} slot="results" />
        </StoryBody>

        <ReadMoreProjects currentId="amd" />

        <CollaborateCTA
          label="Talk shop"
          heading="Let's Talk Context Layers"
          placeholder="What are you building..."
          buttonLabel="Reach out"
          subject="Context Layers"
          intro="I'd like to talk about context layers, graph indexing, or local inference. Here's what I'm working on:"
        />
      </div>
    </AnimatedPage>
  )
}
