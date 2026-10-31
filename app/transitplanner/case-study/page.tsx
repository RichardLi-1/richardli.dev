"use client"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"
import { TrackedExternalLink } from "@/components/tracked-external-link"
import { CaseStudyImage } from "@/components/case-study-image"
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

const SITE_URL = "https://www.transitplanner.app/"

// Shown in the hero and repeated in the Key Results box
const STATS: Stat[] = [
  { value: "Winner", label: "Awarded at Hack Canada 2026" },
  { value: "6 agents", label: "In the AI planning council" },
  { value: "1.8K+", label: "Likes on the launch post" },
]

// TODO: paste real quotes (launch post replies, AI Tinkerers feedback).
// While a slot is null, the page shows a dashed placeholder in development
// and nothing at all in production.
const QUOTES: { problem: Quote | null; results: Quote | null } = {
  problem: null,
  results: null,
}

export default function TransitPlannerCaseStudyPage() {
  usePageViewTracker()
  useEndSlowdownScroll() // experimental: scrolling eases off near the bottom

  return (
    <AnimatedPage>
      <div className="page-bg min-h-screen">
        <AnimatedHeader currentPage="/transitplanner" />

        <StoryHero
          // Richard's intended headline, not used yet:
          // "Agentifying and simulating the transit planning and stakeholder engagement process"
          title={<>How Transit Planner puts <Highlight>transit planning decisions</Highlight> in anyone&apos;s hands</>}
          subtitle="Census data, ridership models, and a six-agent AI council, all on one map. We built Transit Planner at Hack Canada 2026 so you can sketch a line and see who it serves, without a planning department behind you."
          badge="🥇 Hack Canada 2026"
          stats={STATS}
          backdrop={
            <div
              aria-hidden="true"
              className="absolute inset-y-0 right-0 w-full opacity-30 md:w-[60%] md:opacity-80"
              style={{
                backgroundImage: "url(/images/projects/transitplanner/banner-web.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                ...BACKDROP_MASK,
              }}
            />
          }
        />

        <StoryBody
          sidebar={
            <>
              <ShareButtons title="Transit Planner" />
              <SidebarField label="About Transit Planner">
                An AI-powered transit planning sandbox, live at transitplanner.app.
              </SidebarField>
              <SidebarField label="Category">Web App</SidebarField>
              <SidebarField label="Timeline">2026 - Present</SidebarField>
              <SidebarField label="Team">Fiona Fang, Evan Yang, Christopher Stevers, and me</SidebarField>
              <SidebarField label="Pain point" divider>
                Drawing a transit line is easy. Knowing who it serves usually takes a planning team.
              </SidebarField>
              <SidebarField label="Built with" divider>
                <SidebarTags tags={["Next.js", "Mapbox", "FastAPI", "PostGIS", "Claude", "Gemini"]} />
              </SidebarField>

              <div className="p-6" style={SLAB}>
                <p className="text-lg">Plan your own line.</p>
                <p className="mt-1" style={{ color: "var(--text-3)" }}>Draw a route and let the council argue about it.</p>
                <TrackedExternalLink
                  projectId="transitplanner"
                  linkLabel="Try it out"
                  location="case study sidebar"
                  href={SITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-block transition-transform duration-150 hover:scale-95"
                >
                  <CornerBrackets>Try it out →</CornerBrackets>
                </TrackedExternalLink>
              </div>
            </>
          }
        >
          <StaggeredContent delay={300}>
            <p className="text-2xl leading-snug" style={{ color: "var(--text)" }}>
              Transit planning runs on data most people never see: census blocks, travel times,
              ridership models, live vehicle feeds. Getting from &ldquo;this neighbourhood needs
              better transit&rdquo; to a route you can defend usually takes a professional planning team.
            </p>
            <p className="mt-6" style={{ color: "var(--text-2)" }}>
              As a kid I spent countless hours on subway builders like JP Wright&apos;s{" "}
              <a href="https://jpwright.github.io/subway/" target="_blank" rel="noopener noreferrer" className="underline">
                Brand New Subway
              </a>
              . I wanted my own version, with real analysis and AI behind every line you draw.
            </p>
          </StaggeredContent>

          {/* ── Problem ── */}
          <section className="mt-16 space-y-5" style={{ color: "var(--text-2)" }}>
            <BracketLabel>The problem</BracketLabel>
            <h2 className="text-2xl" style={{ color: "var(--text)" }}>Anyone can draw a line. Few can check it.</h2>
            <p>
              A transit enthusiast can sketch a new subway on any map. What they can&apos;t easily see is
              who lives along it, how long trips actually take, or whether riders would show up.
              That analysis lives in planning departments and consultant reports.
            </p>
            <p>
              Generic chatbots don&apos;t close the gap either. They can describe a route in prose, but
              they can&apos;t place stops at real coordinates or check them against population data.
              I wanted more than a chatbot.
            </p>
            <PullQuote quote={QUOTES.problem} slot="problem" />
          </section>

          {/* ── Solution ── */}
          <section className="mt-16 space-y-5" style={{ color: "var(--text-2)" }}>
            <BracketLabel>The solution</BracketLabel>
            <h2 className="text-2xl" style={{ color: "var(--text)" }}>A map, a council, and real data</h2>
            <p>
              Transit Planner starts with an interactive network editor: draw and edit lines directly
              on the map. Every layer you see is available to the AI too, including transit deserts,
              isochrones, gravity-model ridership, and equity and travel-time scoring, all built on
              Statistics Canada dissemination-block population data in PostGIS.
            </p>
            <p>
              On top of that sits a six-agent AI council, an 11-node StateGraph with two planners and
              one NIMBY. The naive approach would be letting each member describe its route in prose.
              That works for reasoning, but the map needs coordinates and stop order. Instead, every
              member has to finish with a <code className="text-sm">propose_route</code> tool call, validated
              against a schema that keeps routes between 6 and 20 stops with real{" "}
              <code className="text-sm">[lng, lat]</code> pairs.
            </p>
            <p>
              The agentic map assistant goes a step further. It can fly to and circle areas on the map,
              read census data, and drop pins, which makes it useful for spotting service gaps.
            </p>
          </section>

          {/* ── Results ── */}
          <section className="mt-16 space-y-5" style={{ color: "var(--text-2)" }}>
            <BracketLabel>The results</BracketLabel>
            <h2 className="text-2xl" style={{ color: "var(--text)" }}>From hackathon demo to live tool</h2>
            <p>
              Transit Planner won at Hack Canada 2026 and is now live at{" "}
              <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="underline">transitplanner.app</a>.
              The launch post on X got a great response, and we demoed it at AI Tinkerers Toronto in
              the Shopify office.
            </p>
          </section>

          <KeyResults eyebrow="Since launch" stats={STATS} />

          <div className="space-y-8" style={{ color: "var(--text-2)" }}>
            <div>
              <h3 className="text-lg" style={{ color: "var(--text)" }}>Surface routes that follow the street</h3>
              <p className="mt-1 text-sm">
                Bus and streetcar routes used to float from stop to stop. They now snap to roads, with
                portals marking underground sections that don&apos;t need to follow road medians.
              </p>
            </div>
            <div>
              <h3 className="text-lg" style={{ color: "var(--text)" }}>Agentic commuter simulation</h3>
              <p className="mt-1 text-sm">
                This mode dispatches hundreds of AI agents to act as commuters. Eventually it will be a
                tool the council members can use.
              </p>
            </div>
            <div>
              <h3 className="text-lg" style={{ color: "var(--text)" }}>More map overlays</h3>
              <p className="mt-1 text-sm">
                Isochrones, Canada-wide population density, transit deserts, custom SHP/KML/KMZ uploads,
                and live GTFS vehicle data.
              </p>
            </div>
          </div>

          <CaseStudyImage
            src="/images/projects/transitplanner/ai-tinkerers.JPG"
            alt="Transit Planner presentation at AI Tinkerers Toronto, Shopify. Photo by Amanda Xi."
            loading="lazy"
            decoding="async"
            className="mt-12 w-full"
          />

          <div className="mt-12 space-y-5" style={{ color: "var(--text-2)" }}>
            <p>
              This project introduced me to the small but active community of transit data and modelling
              professionals, and I have a lot to learn from them. Big shoutout to Fiona, Evan, and Chris
              for building this with me.
            </p>
            <PullQuote quote={QUOTES.results} slot="results" />
          </div>
        </StoryBody>

        <ReadMoreProjects currentId="transitplanner" />

        <CollaborateCTA
          label="Collaborate"
          heading="Let's Expand This Project Together"
          placeholder="What would you add..."
          buttonLabel="Reach out"
          subject="Transit Planner Collaboration"
          intro="I'd love to help expand Transit Planner. Here's my idea:"
        />
      </div>
    </AnimatedPage>
  )
}
