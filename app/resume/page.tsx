"use client"

import type { ReactNode } from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { ResponsiveHeader } from "@/components/responsiveheader"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink } from "lucide-react"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { cn } from "@/lib/utils"

/** Shared project row: optional internal `href` shows link affordance like the PDF resume. */
function ResumeProjectBlock({
  href,
  title,
  tech,
  date,
  children,
}: {
  href?: string
  title: string
  tech: string
  date: string
  children: ReactNode
}) {
  const titleLine = (
    <>
      <span className="font-semibold" style={{ color: "var(--text)" }}>
        {title}
      </span>
      <span style={{ color: "var(--text-4)" }} aria-hidden>
        {" "}
        |{" "}
      </span>
      <span className="italic" style={{ color: "var(--text-2)" }}>
        {tech}
      </span>
    </>
  )

  return (
    <div>
      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="min-w-0 flex-1 text-sm sm:text-base">
          {href ? (
            <Link
              href={href}
              className="inline-flex items-start gap-1.5 rounded-sm underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-4)]"
            >
              <ExternalLink
                className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-70"
                aria-hidden
              />
              <span>{titleLine}</span>
            </Link>
          ) : (
            <span>{titleLine}</span>
          )}
        </div>
        <span className="shrink-0 text-sm" style={{ color: "var(--text-3)" }}>
          {date}
        </span>
      </div>
      <ul
        className="list-outside list-disc space-y-1 pl-5 text-sm leading-relaxed"
        style={{ color: "var(--text-2)" }}
      >
        {children}
      </ul>
    </div>
  )
}

export default function ResumePage() {
  usePageViewTracker()
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return (
    <AnimatedPage>
      <div className="page-bg min-h-screen">
        <ResponsiveHeader currentPage="/resume" />

        <main
          className="mx-auto max-w-4xl px-6 pb-16"
          style={{ paddingTop: isMobile ? 24 : 120 }}
        >
          <StaggeredContent delay={0}>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="hero-title">Resume</h1>
              <Button variant="outline" asChild>
                <a
                  href="/resume.pdf"
                  download="Richard_Li_Resume.pdf"
                  className={cn(
                    "border-[color:var(--border-2)] bg-[var(--surface)] text-[var(--text)]",
                    "hover:bg-[var(--surface-hover)]",
                  )}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </a>
              </Button>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={100}>
            <div
              className="squircle-lg space-y-8 border p-6 md:p-8"
              style={{
                background: "var(--card-bg)",
                borderColor: "var(--border-2)",
              }}
            >
              {/* Header */}
              <div
                className="border-b pb-6 text-center"
                style={{ borderColor: "var(--border-2)" }}
              >
                <h2 className="mb-2 text-2xl font-semibold md:text-3xl" style={{ color: "var(--text)" }}>
                  Richard Li
                </h2>
                <div
                  className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm"
                  style={{ color: "var(--text-2)" }}
                >
                  <a
                    href="mailto:r575li@uwaterloo.ca?subject=Greetings!&body=Hi%20Richard%2C%0A%0A%0A%5BYour%20Name%5D"
                    className="underline-offset-2 hover:underline"
                    style={{ color: "var(--text-2)" }}
                  >
                    r575li@uwaterloo.ca
                  </a>
                  <span style={{ color: "var(--text-4)" }}>|</span>
                  <a
                    href="https://linkedin.com/in/richardli0/"
                    className="underline-offset-2 hover:underline"
                    style={{ color: "var(--text-2)" }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    linkedin.com/in/richardli0/
                  </a>
                  <span style={{ color: "var(--text-4)" }}>|</span>
                  <a
                    href="https://github.com/richardli-1"
                    className="underline-offset-2 hover:underline"
                    style={{ color: "var(--text-2)" }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    github.com/richardli-1
                  </a>
                  <span style={{ color: "var(--text-4)" }}>|</span>
                  <a
                    href="https://richardli.dev"
                    className="underline-offset-2 hover:underline"
                    style={{ color: "var(--text-2)" }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    richardli.dev
                  </a>
                </div>
              </div>

              {/* Technical Skills */}
              <section>
                <h3 className="section-label mb-3 border-b pb-2" style={{ borderColor: "var(--border-2)" }}>
                  Technical Skills
                </h3>
                <div className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
                  <p>
                    <strong style={{ color: "var(--text)" }}>Languages:</strong> Python, JavaScript/TypeScript, Java,
                    C++, SQL, Swift, HTML, CSS
                  </p>
                  <p>
                    <strong style={{ color: "var(--text)" }}>Frameworks:</strong> React, Next.js, Angular, FastAPI,
                    Express, Tailwind, SwiftUI
                  </p>
                  <p>
                    <strong style={{ color: "var(--text)" }}>AI &amp; ML:</strong> LangChain, LangGraph, PyTorch,
                    Hugging Face, OpenAI, Anthropic
                  </p>
                  <p>
                    <strong style={{ color: "var(--text)" }}>Cloud &amp; Tools:</strong> PostgreSQL, Firebase, Supabase,
                    AWS, Vercel, Docker, Azure DevOps
                  </p>
                  <p>
                    <strong style={{ color: "var(--text)" }}>Courses:</strong> Digital Computation (C++), Apple App
                    Development with Swift Certification
                  </p>
                </div>
              </section>

              {/* Experience */}
              <section>
                <h3 className="section-label mb-3 border-b pb-2" style={{ borderColor: "var(--border-2)" }}>
                  Experience
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                      <h4 className="font-semibold" style={{ color: "var(--text)" }}>
                        Software Developer
                      </h4>
                      <span className="shrink-0 text-sm" style={{ color: "var(--text-3)" }}>
                        Dec 2025 – Apr 2026
                      </span>
                    </div>
                    <div
                      className="mb-2 flex flex-col gap-1 text-sm italic sm:flex-row sm:justify-between sm:gap-4"
                      style={{ color: "var(--text-3)" }}
                    >
                      <span>SaFuture Inc.</span>
                      <span className="sm:text-right">Toronto, ON</span>
                    </div>
                    <ul
                      className="list-outside list-disc space-y-1 pl-5 text-sm leading-relaxed"
                      style={{ color: "var(--text-2)" }}
                    >
                      <li>
                        Optimized custom scraping and <strong>embedding</strong> pipeline using batch processing to
                        ingest <strong>10,000+</strong> unstructured geospatial records/hour; integrated{" "}
                        <strong>PostgreSQL</strong> queue manager and <strong>Angular</strong> admin dashboard via REST
                        APIs
                      </li>
                      <li>
                        Spearheaded <strong>LangChain</strong>-based sales tool to prospect <strong>200+</strong>{" "}
                        government contacts per hour, saving sales team <strong>30 hours</strong>/week by implementing{" "}
                        <strong>RAG</strong> and web search to achieve <strong>85%</strong> contact accuracy
                      </li>
                      <li>
                        Shipped <strong>25+ new features</strong> for <strong>Angular</strong>-based GIS tools by
                        coordinating with client and backend teams
                      </li>
                    </ul>
                  </div>

                  <div>
                    <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="font-semibold" style={{ color: "var(--text)" }}>
                          Full Stack Developer
                        </h4>
                        <p className="text-sm" style={{ color: "var(--text-3)" }}>
                          FormulaTech Hacks • Waterloo, ON
                        </p>
                      </div>
                      <span className="shrink-0 text-sm" style={{ color: "var(--text-3)" }}>
                        Oct 2025 – Present
                      </span>
                    </div>
                    <ul
                      className="list-outside list-disc space-y-1 pl-5 text-sm leading-relaxed"
                      style={{ color: "var(--text-2)" }}
                    >
                      <li>Building front-end and back-end for website and coordinating sponsorships for hackathon</li>
                    </ul>
                  </div>

                  <div>
                    <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="font-semibold" style={{ color: "var(--text)" }}>
                          iOS App Developer
                        </h4>
                        <p className="text-sm" style={{ color: "var(--text-3)" }}>
                          Career Education Council • Guelph, ON
                        </p>
                      </div>
                      <span className="shrink-0 text-sm" style={{ color: "var(--text-3)" }}>
                        Sep 2024 – Jan 2025
                      </span>
                    </div>
                    <ul
                      className="list-outside list-disc space-y-1 pl-5 text-sm leading-relaxed"
                      style={{ color: "var(--text-2)" }}
                    >
                      <li>
                        Built productivity iOS app in Swift that gauges user&apos;s happiness using Likert scale and
                        open-ended survey questions upon completing tasks, and integrated OpenAI API to suggest careers
                        aligned with user&apos;s personality
                      </li>
                      <li>
                        Re-implemented project fully from UIKit to SwiftUI to ensure future-proof project architecture
                      </li>
                      <li>Designed UI/UX through 3 rounds of wireframes and pitches to engineers and designers</li>
                    </ul>
                  </div>

                  <div>
                    <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="font-semibold" style={{ color: "var(--text)" }}>
                          Lead UI/UX Intern
                        </h4>
                        <p className="text-sm" style={{ color: "var(--text-3)" }}>
                          SalesPatriot (YC W25) via Harvard UVTSP • San Francisco, CA (Remote)
                        </p>
                      </div>
                      <span className="shrink-0 text-sm" style={{ color: "var(--text-3)" }}>
                        Jul 2025 – Aug 2025
                      </span>
                    </div>
                    <ul
                      className="list-outside list-disc space-y-1 pl-5 text-sm leading-relaxed"
                      style={{ color: "var(--text-2)" }}
                    >
                      <li>
                        Conducted 3 user tests observing qualitative and 6 quantitative metrics, identifying user
                        journey gap, and designed an AI-based proposal editor using Figma to fill gap to decrease
                        contract bidding time by predicted 20%
                      </li>
                      <li>
                        Led team of 8 interns to develop prototype from ideation to pitch to founders by facilitating
                        meetings and ensuring task completion, initiating the development of 2 new features
                      </li>
                      <li>
                        Guided product direction by analyzing AI trends and competitor offerings, in line with HBS
                        business practices
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Projects */}
              <section>
                <h3 className="section-label mb-3 border-b pb-2" style={{ borderColor: "var(--border-2)" }}>
                  Projects
                </h3>
                <div className="space-y-6">
                  <ResumeProjectBlock
                    href="/transitplanner"
                    title="Transit Planning Sandbox"
                    tech="LangGraph, Next.js, Mapbox GL, PostGIS, Supabase"
                    date="Mar 2026 – Present"
                  >
                    <li>
                      Designed a transit infrastructure planning sandbox with <strong>10+ city data overlays</strong>{" "}
                      including population and live vehicles.
                    </li>
                    <li>
                      Engineered a <strong>LangGraph</strong>-based AI council where 6 specialized agents debate to
                      route transit lines optimally.
                    </li>
                    <li>
                      Enabled simulation of <strong>50,000+ commuters</strong> across transit network using
                      Dijkstra&apos;s algorithm.
                    </li>
                    <li>
                      Gathered <strong>140k+ views</strong> and <strong>2,000+ likes</strong> across platforms,
                      attracting interest from researchers at <strong>UofT</strong>.
                    </li>
                  </ResumeProjectBlock>

                  <ResumeProjectBlock
                    href="/futureforward"
                    title="FF Careers - Career Coach"
                    tech="Express, React Native, PostgreSQL, AWS, Docker, Pinecone"
                    date="May 2025"
                  >
                    <li>
                      Developed continuously-learning career coach that surfaces personalized patterns from user
                      emotions over time.
                    </li>
                    <li>
                      Integrated <strong>Pinecone</strong> embedding and ANN search to retrieve unstructured user
                      reflections, improving career-relevant insight generation beyond keyword matching by{" "}
                      <strong>80%</strong> to match users to <strong>1,000+ career paths</strong>.
                    </li>
                    <li>
                      Protected sensitive user data by migrating from Firestore to AWS-hosted PostgreSQL DB, encrypted
                      with pgcrypto.
                    </li>
                  </ResumeProjectBlock>

                  <ResumeProjectBlock title="Class Data Profile" tech="React, TypeScript, HTML, Tailwind CSS" date="Sept 2025 – Present">
                    <li>
                      Collecting and democratizing anonymous personal and academic data from students in the University
                      of Waterloo Systems Design Engineering Class of 2030 to promote transparency for prospective
                      students
                    </li>
                    <li>Developed webpage with React, Vite, TypeScript, and Tailwind CSS</li>
                  </ResumeProjectBlock>

                  <ResumeProjectBlock title="Virtual Father Figure" tech="JavaScript, HTML, CSS" date="Sep 2025 – Present">
                    <li>
                      Developed emotionally intelligent father Chrome extension featuring 3 distinct personalities and 5
                      event triggers
                    </li>
                    <li>
                      Implemented advanced DOM manipulation to build responsive pop-up interface with draggable UI
                      elements, chatting features, chess game functionality, and contextual advice/dad joke generation
                      based on webpage content
                    </li>
                    <li>
                      Integrated Google Gemini API for conversation and ElevenLabs API for natural text-to-speech
                      synthesis
                    </li>
                  </ResumeProjectBlock>

                  <ResumeProjectBlock
                    title="4Sight"
                    tech="React, Next.js (App Router), TypeScript, TouchDesigner, face-api.js"
                    date="May 2025 – May 2025"
                  >
                    <li>
                      Developed and calibrated digital Snellen eye test based on screen pixel density, viewing distance,
                      and angular size, and added reminders when head distance is out of range
                    </li>
                    <li>Plotted results on graph in results view to track vision decline</li>
                    <li>Integrated audio input and Web Speech API for hands-free control and live audio feedback</li>
                    <li>
                      Designed responsive UI with Tailwind CSS, Radix UI components, and dark mode support via
                      next-themes
                    </li>
                  </ResumeProjectBlock>

                  <ResumeProjectBlock title="Bo!nk" tech="iOS, Unity" date="Jan 2021 – Jun 2021">
                    <li>
                      Designed and published Windows Vista Inkball-like iOS Game, and ensured balanced gameplay mechanics
                    </li>
                    <li>Rated 4.6/5 stars on App Store</li>
                  </ResumeProjectBlock>
                </div>
              </section>

              {/* Education */}
              <section>
                <h3 className="section-label mb-3 border-b pb-2" style={{ borderColor: "var(--border-2)" }}>
                  Education
                </h3>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="font-semibold" style={{ color: "var(--text)" }}>
                      University of Waterloo
                    </h4>
                    <p className="text-sm" style={{ color: "var(--text-2)" }}>
                      Bachelor&apos;s of Applied Science in Systems Design Engineering, BASc
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-3)" }}>
                      Academic Representative
                    </p>
                  </div>
                  <span className="shrink-0 text-sm" style={{ color: "var(--text-3)" }}>
                    Waterloo, ON
                  </span>
                </div>
              </section>
            </div>
          </StaggeredContent>
        </main>
      </div>
    </AnimatedPage>
  )
}
