"use client"
import { useState, useEffect } from "react"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"
import { Youtube, X, ArrowUpRight } from "lucide-react"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { RelatedProjects } from "@/components/related-projects"
import { useIsPanel } from "@/hooks/use-is-panel"
import { CaseStudyNav } from "@/components/case-study-nav"
import { CollapsibleDetails, itemVariants } from "@/components/collapsible-details"
import { motion } from "framer-motion"


function StatBadge({ label }: { label: string }) {
  return (
    <span className="rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border-2)", padding: "3px 10px", fontSize: 12, color: "var(--text-2)" }}>
      {label}
    </span>
  )
}

function InitiativeImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div style={{ position: "relative" }}>
      <div className="photo-card squircle" style={{ overflow: "hidden", padding: 0 }}>
        <img src={src} alt={alt} className="w-full" style={{ aspectRatio: "16/9", objectFit: "cover", display: "block" }} />
      </div>
    </div>
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
  useEffect(() => {
    // window.location.href = "https://www.futureforward.info/"
  }, [])

  return (
    <AnimatedPage>
      {!isPanel && (
        <CaseStudyNav sections={[
          { id: "ff-marketing", label: "Marketing Club" },
          { id: "ff-financial", label: "Financial Literacy" },
          { id: "ff-careerfair", label: "Career Fair" },
          { id: "ff-app", label: "FF Careers App" },
          { id: "ff-branches", label: "Branches" },
          { id: "ff-ms-mentorship", label: "Middle School" },
          { id: "ff-hs-mentorship", label: "High School" },
        ]} />
      )}
      <div className="mx-auto">
        <AnimatedHeader currentPage="/futureforward" />
        {isPanel && <div style={{ position: "fixed", top: 16, right: 16, display: "flex", gap: 6, zIndex: 50 }}>
          <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "open" }, "*")} className="nav-item" style={{ padding: "6px" }}><ArrowUpRight className="w-4 h-4" /></button>
          <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "close" }, "*")} className="nav-item" style={{ padding: "6px" }}><X className="w-4 h-4" /></button>
        </div>}

        <main className="max-w-3xl mx-auto p-6 space-y-6 [&_p]:text-[var(--text-2)]" style={{ paddingTop: isMobile ? "0px" : "60px" }}>
          <StaggeredContent delay={0}>
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
                <img src="/images/projects/future-forward/logo.png" alt="Future Forward Logo" className="w-8 h-8 object-contain" />
                Future Forward
              </h1>
              <p className="text-m" style={{ color: "var(--text-3)" }}>Non-profit, 2024-2025</p>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={100}>
            <div className="relative aspect-video w-full overflow-hidden squircle">
              <img
                src="/images/projects/future-forward/workshop-hero.jpeg"
                alt="Future Forward screenshots"
                className="w-full h-full object-cover mx-0"
              />
            </div>
          </StaggeredContent>

          <StaggeredContent delay={300}>
            <div className="mb-4 flex squircle bg-zinc-200 dark:bg-zinc-800 max-width w-full rounded-xl border-2">
              <p className="p-2 py-3 px-3.5 text-zinc-800 dark:text-zinc-300">🥇 This project was awarded Provincial Champion at Ontario DECA Provincials 2025!</p>
            </div>
            <CollapsibleDetails labels={["Timeline", "Team", "Links", "Overview"]} animateContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Timeline</p>
                  <p>Sept 2024-Apr 2025</p>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Team</p>
                  <div className="space-y-1">
                    <a href="https://www.linkedin.com/in/michelle-matthew-35b6931aa/" target="_blank" className="underline" rel="noreferrer"><p>Michelle Matthew</p></a>
                    <a href="https://www.linkedin.com/in/kirsten-hsiang-bb64b2324/" target="_blank" className="underline" rel="noreferrer"><p>Kirsten Hsiang</p></a>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Links</p>
                  <a href="https://www.youtube.com/@FutureForward.Initiative" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:transition-colors">
                    <Youtube className="w-4 h-4" />
                    YouTube Channel
                  </a>
                </motion.div>
              </div>
              <motion.div variants={itemVariants}>
                <p className="section-label mb-2">Overview</p>
                <div className="space-y-4">
                  <p>Future Forward is a non-profit initiative dedicated to helping students discover their vocations and career paths. We aim to provide resources, mentorship, and opportunities to guide students in their educational and professional journeys.</p>
                  <p>Our mission is to bridge the gap between academic learning and real-world career opportunities, empowering students to make informed decisions about their future.</p>
                </div>
              </motion.div>
            </div>
            </CollapsibleDetails>
          </StaggeredContent>

          <StaggeredContent delay={350}>
            <div className="py-8">
              <p className="text-sm mb-6" style={{ color: "var(--text-3)" }}>Career tests tend to test what a user *wants* to like, not what they actually like. Thus:</p>
              <p className="section-label mb-2">The Mission</p>
              <p className="text-3xl leading-snug" style={{ color: "var(--text)" }}>
                Create a tool that surfaces students' real interests and career goals
              </p>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={200}>
            <div className="mb-8">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Youtube className="w-5 h-5" />
                Featured Video
              </h3>
              <div className="aspect-video w-full overflow-hidden squircle rounded-xl" style={{ background: "var(--surface)" }}>
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/FL8_oEPPx0c"
                  title="Future Forward Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={400}>
            <div className="space-y-20 mt-4">
              <p className="section-label">Initiatives</p>

              {/* 01 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="space-y-3">
                  <p className="section-label">Initiative 01</p>
                  <h3 id="ff-marketing" style={{ fontSize: "1.4rem", fontWeight: 600, color: "var(--text)" }}>📊 Marketing Club</h3>
                  <p style={{ color: "var(--text-3)", lineHeight: 1.75, fontSize: 15 }}>
                    A hands-on marketing firm serving six organizations. Members rotated through roles like Account Manager, tried each job, and got personalized career results based on surveys. Grew signups 300% to 59 members.
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["59 members", "6 clients served", "+300% signups"].map(s => <StatBadge key={s} label={s} />)}
                  </div>
                </div>
                <InitiativeImage src="/images/projects/future-forward/workshop-1.jpeg" alt="Marketing Club workshop" />
              </div>

              {/* 02 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="space-y-3 md:order-2">
                  <p className="section-label">Initiative 02</p>
                  <h3 id="ff-financial" style={{ fontSize: "1.4rem", fontWeight: 600, color: "var(--text)" }}>💰 Financial Literacy Series</h3>
                  <p style={{ color: "var(--text-3)", lineHeight: 1.75, fontSize: 15 }}>
                    Partnered with Markville Finance Club to deliver two financial literacy lessons to 15 students and hosted the University of Waterloo Financial Literacy Competition with 11 participants.
                  </p>
                  <p style={{ color: "var(--text-3)", fontSize: 13 }}>
                    Thanks <a className="underline" target="_blank" href="https://www.linkedin.com/in/holly-zhang-76702a248/" rel="noreferrer">Holly Zhang</a> for the inspiration.
                  </p>
                </div>
                <div className="md:order-1">
                  <InitiativeImage src="/images/projects/future-forward/workshop-2.jpeg" alt="Financial literacy session" />
                </div>
              </div>

              {/* 03 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="space-y-3">
                  <p className="section-label">Initiative 03</p>
                  <h3 id="ff-careerfair" style={{ fontSize: "1.4rem", fontWeight: 600, color: "var(--text)" }}>🎤 Career Fair</h3>
                  <p style={{ color: "var(--text-3)", lineHeight: 1.75, fontSize: 15 }}>
                    Hosted a virtual career fair with 6 speakers including the CEO of Basel Medical Group, a McKinsey Business Analyst, and a Program Manager at Alstom. Attendees completed surveys tied to the FF Careers AI to receive personalized career reports.
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["53 attendees", "29 career reports", "145 YouTube views"].map(s => <StatBadge key={s} label={s} />)}
                  </div>
                  <p style={{ color: "var(--text-3)", fontSize: 13, fontStyle: "italic" }}>"It was an emotional journey... I feel so much more confident about my future." — Attendee</p>
                </div>
                <InitiativeImage src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%203.png-jKOva7clSQUCHgEUarDDX86vX0w3Me.jpeg" alt="Career Fair" />
              </div>

              {/* 04 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="space-y-3 md:order-2">
                  <p className="section-label">Initiative 04</p>
                  <h3 id="ff-app" style={{ fontSize: "1.4rem", fontWeight: 600, color: "var(--text)" }}>📱 FF Careers App</h3>
                  <p style={{ color: "var(--text-3)", lineHeight: 1.75, fontSize: 15 }}>
                    Built an AI-powered career matching app at ffcareers.app. Instead of generic career tests, it prompts reflection questions and curates ranked careers with outlook ratings. Mentored by a former Apple Software Engineer and featured at an Apple × CEC App Showcase.
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["145 results given", "8 states reached", "4.2★ TrustPilot"].map(s => <StatBadge key={s} label={s} />)}
                  </div>
                  <p style={{ color: "var(--text-3)", fontSize: 13, fontStyle: "italic" }}>"Future Forward Careers is a dream come true." — Franca Giglia, Guidance Counselor</p>
                </div>
                <div className="md:order-1">
                  <InitiativeImage src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%204.png-NMSo9ZL9dNWIiNEavhdNlELQycDNz9.jpeg" alt="FF Careers App" />
                </div>
              </div>

              {/* 05 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="space-y-3">
                  <p className="section-label">Initiative 05</p>
                  <h3 id="ff-branches" style={{ fontSize: "1.4rem", fontWeight: 600, color: "var(--text)" }}>🌐 Branches & Community</h3>
                  <p style={{ color: "var(--text-3)", lineHeight: 1.75, fontSize: 15 }}>
                    Launched a Discord server and grew a 308-member community. Started FF New York and FF California branches with pre-packaged resources, which spun up their own social media and community servers totalling 200 members.
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["308 Discord members", "2 branches launched", "200+ branch members"].map(s => <StatBadge key={s} label={s} />)}
                  </div>
                </div>
                <InitiativeImage src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ffbanner.png-JMScQeCriXKG0sG0z3bc8GFrra41av.jpeg" alt="Community and branches" />
              </div>

              {/* 06 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="space-y-3 md:order-2">
                  <p className="section-label">Initiative 06</p>
                  <h3 id="ff-ms-mentorship" style={{ fontSize: "1.4rem", fontWeight: 600, color: "var(--text)" }}>🏫 Middle School Mentorship</h3>
                  <p style={{ color: "var(--text-3)", lineHeight: 1.75, fontSize: 15 }}>
                    Visited grades 7–8 at three Crowle Public Schools to introduce students to business careers before high school. Each session included a live trading game teaching collaboration, negotiation, and delegation.
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["7 classes", "180 students", "+81% interest in business"].map(s => <StatBadge key={s} label={s} />)}
                  </div>
                  <p style={{ color: "var(--text-3)", fontSize: 13, fontStyle: "italic" }}>"I now know a whole lot more about the business sector and may like to pursue that path." — Student</p>
                </div>
                <div className="md:order-1">
                  <InitiativeImage src="/images/projects/future-forward/workshop-hero.jpeg" alt="Middle school mentorship workshop" />
                </div>
              </div>

              {/* 07 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="space-y-3">
                  <p className="section-label">Initiative 07</p>
                  <h3 id="ff-hs-mentorship" style={{ fontSize: "1.4rem", fontWeight: 600, color: "var(--text)" }}>🎓 High School Mentorship</h3>
                  <p style={{ color: "var(--text-3)", lineHeight: 1.75, fontSize: 15 }}>
                    Delivered in-class presentations to grades 9–11 covering the FF Five framework, business case studies, and a LinkedIn Masterclass where students practiced networking with real professionals. Posted all recordings to YouTube for those who couldn't attend.
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["8 classes", "247 students", "+78% future readiness"].map(s => <StatBadge key={s} label={s} />)}
                  </div>
                  <p style={{ color: "var(--text-3)", fontSize: 13, fontStyle: "italic" }}>"My students are so unengaged — I want Future Forward in my classes!" — Accounting 11 Teacher</p>
                </div>
                <InitiativeImage src="/images/projects/future-forward/workshop-2.jpeg" alt="High school mentorship session" />
              </div>

            </div>
          </StaggeredContent>

          <StaggeredContent delay={500}>
            <p style={{ color: "var(--text-3)", fontSize: 14, marginTop: "2rem" }}>
              Unfortunately, now that I've graduated, the project is no longer continued and the website has been taken down. However, our project continues to be used for training at Markville DECA.
            </p>
          </StaggeredContent>

          {!isPanel && (
            <RelatedProjects currentId="futureforward" />
          )}
        </main>

      </div>
    </AnimatedPage>
  )
}
