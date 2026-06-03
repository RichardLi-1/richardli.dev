"use client"
import { useState, useEffect } from "react"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"
import { Youtube, X, ArrowUpRight, Compass, Layers, Users } from "lucide-react"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { RelatedProjects } from "@/components/related-projects"
import { useIsPanel } from "@/hooks/use-is-panel"
import { CaseStudyNav } from "@/components/case-study-nav"
import { CollapsibleDetails, itemVariants } from "@/components/collapsible-details"
import { motion } from "framer-motion"

// Small inline code token, matching the safuture case-study styling.
function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="text-sm px-1 py-0.5 rounded" style={{ background: "var(--surface)", color: "var(--text)" }}>
      {children}
    </code>
  )
}

// Short, simplified code block: illustrative, not exhaustive.
function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre
      className="squircle text-sm overflow-x-auto my-4"
      style={{ background: "var(--surface)", border: "1px solid var(--border-2)", color: "var(--text-2)", padding: "14px 16px", lineHeight: 1.6 }}
    >
      <code>{children}</code>
    </pre>
  )
}

export default function FutureForwardProjectPage() {
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
          { id: "ff-background", label: "Background" },
          { id: "ff-architecture", label: "Architecture" },
          { id: "ff-matching", label: "The Matching Engine" },
          { id: "ff-app", label: "Inside the App" },
          { id: "ff-results", label: "Results" },
          { id: "ff-takeaways", label: "Takeaways" },
        ]} />
      )}
      <div className="mx-auto">
        <AnimatedHeader currentPage="/futureforward" />
        {isPanel && <div style={{ position: "fixed", top: 16, right: 16, display: "flex", gap: 6, zIndex: 50 }}>
          <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "open" }, "*")} className="nav-item" style={{ padding: "6px" }}><ArrowUpRight className="w-4 h-4" /></button>
          <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "close" }, "*")} className="nav-item" style={{ padding: "6px" }}><X className="w-4 h-4" /></button>
        </div>}

        <main className="max-w-3xl mx-auto p-6 space-y-6 [&_p]:text-[var(--text-2)]" style={{ paddingTop: isMobile ? "0px" : "40px" }}>
          {/* Header */}
          <StaggeredContent delay={0}>
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
                <img src="/images/projects/future-forward/logo.png" alt="Future Forward logo" className="w-8 h-8 object-contain" />
                Future Forward
              </h1>
              <p className="text-m" style={{ color: "var(--text-3)" }}>Non-profit, 2024–2025</p>
            </div>
          </StaggeredContent>

          {/* Hero */}
          <StaggeredContent delay={100}>
            <div className="relative mb-8 aspect-video w-full overflow-hidden squircle rounded-lg">
              <img
                src="/images/projects/future-forward/workshop-hero.jpeg"
                alt="Future Forward workshop"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </StaggeredContent>

          {/* Metadata */}
          <StaggeredContent delay={300}>
            <CollapsibleDetails labels={["Timeline", "Role", "Team", "Tools", "Overview"]} animateContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Timeline</p>
                  <p>2024 – 2025</p>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Role</p>
                  <p>Built FF Careers, contributed to org initiatives</p>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Team</p>
                  <div className="space-y-1">
                    <a href="https://www.linkedin.com/in/michelle-matthew-35b6931aa/" target="_blank" className="underline" rel="noreferrer"><p>Michelle Matthew</p></a>
                    <a href="https://www.linkedin.com/in/kirsten-hsiang-bb64b2324/" target="_blank" className="underline" rel="noreferrer"><p>Kirsten Hsiang</p></a>
                  </div>
                </motion.div>
              </div>
              <div>
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Tools</p>
                  <div>
                    <p>React Native / SwiftUI</p>
                    <p>TypeScript</p>
                    <p>Express</p>
                    <p>Redis</p>
                    <p>PostgreSQL</p>
                    <p>Firebase</p>
                    <p>Pinecone</p>
                    <p>AWS EC2</p>
                    <p>Docker</p>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <p className="section-label mt-4 mb-2">Overview</p>
                  <div className="space-y-4">
                    <p>Future Forward is a student NPO helping people figure out what to actually do with their careers. I built FF Careers: an app that matches you to careers from the work you've already done.</p>
                  </div>
                </motion.div>
              </div>
            </div>
            </CollapsibleDetails>
          </StaggeredContent>

          {/* Mission */}
          <StaggeredContent delay={350}>
            <div className="py-8">
              <p className="section-label mb-2">The Mission</p>
              <p className="text-3xl leading-snug" style={{ color: "var(--text)" }}>
                Surface students' real interests, not what they think they should like.
              </p>
            </div>
          </StaggeredContent>

          {/* Background */}
          <StaggeredContent delay={400}>
            <div className="mb-8">
              <h2 id="ff-background" className="font-bold mb-4 text-2xl">Background</h2>
              <p className="mb-3">Career tests have a known flaw: people answer what they <em>want</em> to like, not what they actually like. Ask someone if they'd enjoy being a doctor and they picture the title, not the work. I wanted a tool that did the opposite: inferring interests from things a person had already done and actually felt something about.</p>
              <p className="mb-3">That idea became FF Careers. The first version was a web-only React quiz, and it worked well enough to take the project to <strong>Ontario DECA Provincials, where it won Provincial Champion</strong>. After Provincials, I rebuilt FF Careers from scratch as part of my internship with the Career Education Council.</p>
            </div>
          </StaggeredContent>

          {/* Architecture */}
          <StaggeredContent delay={420}>
            <div className="mb-8">
              <h2 id="ff-architecture" className="font-bold mb-4 text-2xl">Architecture</h2>
              <p className="mb-3">FF Careers v2 unified what had been two separate codebases, a React web app and a native iOS app, onto <strong>React Native</strong> (with <strong>SwiftUI</strong> for the native iOS pieces). One shared codebase across iOS, Android, and Web cut future development time by around 20%, since a feature ships once instead of three times.</p>
              <p className="mb-3">The backend is <strong>Express + TypeScript</strong>. I rewrote 20+ of its APIs with <strong>Redis</strong> caching and backwards-compatible contracts, which dropped query latency by roughly 30% without breaking existing clients.</p>
              <p className="mb-3">The data started in Firestore, but as access patterns got more relational I migrated everything to <strong>PostgreSQL</strong>, AWS-hosted on <strong>EC2</strong> and running in <strong>Docker</strong>, with sensitive user fields encrypted at rest using <Code>pgcrypto</Code>. Postgres became the single source of truth. Auth still runs through Firebase on the client and Firebase Admin on the server.</p>
              <p className="mb-3">One detail I cared about: typing <Code>req.user</Code> end-to-end instead of casting to <Code>any</Code> on every protected route. TypeScript declaration merging extends Express's own <Code>Request</Code> type, so the decoded Firebase user is correctly typed everywhere downstream.</p>
              <CodeBlock>{`// declaration merging: req.user is typed end-to-end
declare global {
  namespace Express {
    interface Request {
      user?: DecodedIdToken
    }
  }
}`}</CodeBlock>
              <p className="mb-3">Instead of a quiz, users log tasks they've actually done (group projects, side hustles, classes) and rate how each one felt. Those ratings build up a <em>signature</em> over time.</p>
            </div>
          </StaggeredContent>

          {/* Matching Engine: the signature subsystem */}
          <StaggeredContent delay={440}>
            <div className="mb-8">
              <h2 id="ff-matching" className="font-bold mb-4 text-2xl">The Matching Engine</h2>
              <p className="mb-3">The naive approach here is a hardcoded mapping from answers to careers, which is exactly the aspirational-bias trap I was trying to escape. Instead, matching is built on embeddings.</p>
              <p className="mb-3">Every task (its title, description, and the user's written reflection) gets embedded with <strong>all-MiniLM-L6-v2</strong> and stored in <strong>Pinecone</strong>, keyed to that user. I picked that model deliberately: it's a small, fast sentence-transformer producing 384-dimension embeddings, cheap to run and strong at semantic similarity on short text, which is exactly what a one-paragraph reflection is. A heavier model would have added latency and cost for little real gain at this scale.</p>
              <p className="mb-3">A separate namespace holds embedded career descriptions. When a user asks for matches, the backend averages their task embeddings into a single signature vector and runs a top-k nearest-neighbour search against the careers namespace.</p>
              <CodeBlock>{`// average the user's task embeddings into one "signature" vector
const signature = mean(userTaskEmbeddings)

// nearest-neighbour search against the careers namespace
const matches = await pinecone.query({
  vector: signature,
  namespace: "careers",
  topK: 10,
})`}</CodeBlock>
              <p className="mb-3">Pulling matches from unstructured reflections this way surfaced around 80% more relevant insights than the keyword matching it replaced. The signal comes from <em>how</em> someone describes their work, not whether a keyword happened to appear, so it reflects real experience rather than self-reporting.</p>
            </div>
          </StaggeredContent>

          {/* Inside the App */}
          <StaggeredContent delay={460}>
            <div className="mb-8">
              <h2 id="ff-app" className="font-bold mb-4 text-2xl">Inside the App</h2>
              <p className="mb-4">You browse careers, log tasks, and rate each one with a score <em>and</em> a written response. That response feeds straight back into your signature, so the more you use it the sharper your matches get.</p>
              <div className="relative aspect-video w-full overflow-hidden squircle rounded-lg my-4">
                <img
                  src="/images/projects/future-forward/ffcareerslanding.png"
                  alt="FF Careers app"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="mb-3">
                It's live at{" "}
                <a href="https://ffcareers.app" target="_blank" rel="noreferrer" className="underline">ffcareers.app</a>, running off the same codebase as the iOS and Android builds.
              </p>
            </div>
          </StaggeredContent>

          {/* Featured video */}
          <StaggeredContent delay={480}>
            <div className="mb-8">
              <p className="mb-4">I really love the mission behind Future Forward, and beyond building the app I got to contribute to a lot of the org's other initiatives too. Here's a video covering some of that work:</p>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Youtube className="w-5 h-5" />
                Featured Video
              </h3>
              <div className="aspect-video w-full overflow-hidden squircle rounded-xl" style={{ background: "var(--surface)" }}>
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/FL8_oEPPx0c"
                  title="Future Forward video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </StaggeredContent>

          {/* Results */}
          <StaggeredContent delay={500}>
            <div className="mb-8">
              <h2 id="ff-results" className="font-bold mb-4 text-2xl">Results</h2>
              <p className="mb-4">FF Careers generated <strong>481+ career reports</strong>, reached users across <strong>8 states</strong>, holds a <strong>4.2★ Trustpilot</strong> rating, and was featured at an Apple × CEC App Showcase.</p>
              <p className="mb-4">Beyond the app, I contributed to a few of Future Forward's other initiatives:</p>
              <div className="space-y-2">
                <p><strong>Career Fair:</strong> a virtual fair with 6 speakers (a McKinsey analyst, the Basel Medical Group CEO, and others); 53 attendees, 29 personalized reports.</p>
                <p><strong>Mentorship:</strong> in-class sessions across middle and high schools reaching 400+ students, with a measured +80% lift in self-reported future readiness.</p>
                <p><strong>Community:</strong> helped seed branches and a 300+ member Discord.</p>
              </div>
            </div>
          </StaggeredContent>

          {/* Takeaways */}
          <StaggeredContent delay={520}>
            <div className="mb-8">
              <h2 id="ff-takeaways" className="font-bold mb-8 text-2xl">Takeaways</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <Compass className="w-6 h-6 mb-4" style={{ color: "var(--text)" }} />
                  <h3 className="font-bold mb-2">Designing for Real Signal</h3>
                  <p style={{ color: "var(--text-2)" }}>Embedding real logged work beat any quiz I could have written; the data design <em>was</em> the product.</p>
                </div>
                <div>
                  <Layers className="w-6 h-6 mb-4" style={{ color: "var(--text)" }} />
                  <h3 className="font-bold mb-2">Shipping Cross-Platform</h3>
                  <p style={{ color: "var(--text-2)" }}>One Expo codebase to iOS, Android, and Web meant less duplication but careful platform-specific edges.</p>
                </div>
                <div>
                  <Users className="w-6 h-6 mb-4" style={{ color: "var(--text)" }} />
                  <h3 className="font-bold mb-2">Building Within an Org</h3>
                  <p style={{ color: "var(--text-2)" }}>The app mattered more because it plugged into real programs and the students they reached.</p>
                </div>
              </div>
            </div>
          </StaggeredContent>

          {!isPanel && (
            <RelatedProjects currentId="futureforward" />
          )}
        </main>

      </div>
    </AnimatedPage>
  )
}
