"use client"
import type React from "react"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { ResponsiveHeader } from "@/components/responsiveheader"
import { mainProjects } from "@/components/mainProjects"
import { ProjectImageCycler } from "@/components/project-image-cycler"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { ChatBox } from "@/components/chat-box"

export default function PersonalWebsite() {
  usePageViewTracker()

  return (
    <AnimatedPage>
      <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
        <ResponsiveHeader isHomepage={true} currentPage="/" />

        <main className="antialiased max-w-4xl mx-auto p-6 space-y-8 pt-[60px] sm:pt-[120px]">
          {/* Introduction */}
          <StaggeredContent delay={0}>
            <section className="space-y-4">
              <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)" }}>Hey, I'm Richard!</h1>
              <div className="space-y-2" style={{ color: "var(--text-2)" }}>
                <p>I'm interested in public transportation, AI, PM, design, and development.</p>
              </div>
            </section>
          </StaggeredContent>

          {/* Current Activities */}
          <StaggeredContent delay={100}>
            <section className="space-y-4">
              <h2 className="text-xl section-label">I'm currently...</h2>
              <ul className="space-y-2 ml-4" style={{ color: "var(--text-2)" }}>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    studying{" "}
                    <a
                      href="https://uwaterloo.ca/systems-design-engineering/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-stone-100 transition-colors inline-block transform transition-transform duration-200 hover:scale-110"
                    >
                      {" "}
                      systems design engineering{" "}
                    </a>{" "}
                    at the{" "}
                    <img
                      alt="University of Waterloo"
                      className="inline w-4 h-4 mr-1"
                      src="/images/design-mode/901917f9b6e74d254525c3e37d3dd934.png"
                    />
                    <a
                      href="https://uwaterloo.ca/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-stone-100 transition-colors inline-block transform transition-transform duration-200 hover:scale-110"
                    >
                      university of waterloo
                    </a>
                  </span>
                </li>
                <li>
                  <span className="mr-2">•</span>
                  interning at safuture inc
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  open to chatting about fall 2026 internship opportunities
                </li>
              </ul>
            </section>
          </StaggeredContent>

          {/* Previous Experience */}
          <StaggeredContent delay={300}>
            <section className="space-y-4">
              <h2 className="text-xl section-label">Previously I...</h2>
              <ul className="space-y-2 ml-4" style={{ color: "var(--text-2)" }}>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>interned at a YC-backed SaaS startup, analyzing ai trends and working on UI/UX design</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    organized{" "}
                    <img
                      alt="YRHacks Logo"
                      className="inline w-4 h-4 mr-1"
                      src="/images/design-mode/logo.3aecaa9f.svg"
                    />
                    <a
                      href="https://yrhacks.ca/"
                      className="underline hover:text-stone-100 transition-colors inline-block transform transition-transform duration-200 hover:scale-110"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      YRHacks
                    </a>
                    , Canada's largest high school hackathon
                  </span>
                </li>
              </ul>
            </section>
          </StaggeredContent>

          {/* Projects */}
          <StaggeredContent delay={500}>
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl section-label">
                  Some{" "}
                  <a
                    href="/projects"
                    className="underline hover:text-stone-100 inline-block transform transition-transform duration-200 hover:scale-110"
                    style={{ color: "inherit" }}
                  >
                    projects
                  </a>{" "}
                  I made...
                </h2>
                <Link href="/projects">
                  <span className="text-xs hover:underline cursor-pointer" style={{ color: "var(--text-4)" }}>
                    See More
                  </span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mainProjects.slice(0, 3).map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div
                      className="photo-card h-full flex flex-col cursor-pointer group"
                      style={{ "--glow-color": project.colors || "#22c55e44" } as React.CSSProperties}
                    >
                      <div className="aspect-video w-full overflow-hidden squircle-lg transition-shadow duration-300 group-hover:shadow-[0_0px_120px_-20px_var(--glow-color)]" style={{ background: "var(--surface)" }}>
                        <ProjectImageCycler
                          images={[project.image, (project as any).image2, (project as any).image3]}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-300"
                        />
                      </div>
                      <div className="px-4 py-3 flex flex-col flex-grow">
                        <div className="flex items-center justify-between mb-1">
                          <h3 style={{ fontSize: "14px", letterSpacing: "0.02em", fontWeight: 500, color: "var(--text)" }}>
                            {project.title}
                          </h3>
                          <span style={{ fontSize: "11px", color: "var(--text-3)", letterSpacing: "0.04em" }}>{project.year}</span>
                        </div>
                        <p style={{ fontSize: "12px", color: "var(--text-2)", lineHeight: "1.6" }}>{project.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </StaggeredContent>

          {/* Future */}
          <StaggeredContent delay={500}>
            <section className="space-y-4">
              <h2 className="text-xl section-label">Looking ahead, I'd like to...</h2>
              <div className="ml-4" style={{ color: "var(--text-2)" }}>
                <ul className="space-y-2 ml-4 list-disc">
                  <li>
                    learn about best practices in software engineering and build scalable systems that impact millions
                    of users
                  </li>
                  <li>
                    contribute to the advancement of the North American public transit industry{" "}
                    <img alt="" className="inline h-4 mr-1" src="images/ttcsubwayiconwhite.png" />
                  </li>
                  <li>
                    explore design engineering and work in a role combining design, development, and project management
                  </li>
                </ul>
              </div>
            </section>
          </StaggeredContent>

          {/* Chatbot Section */}
          <StaggeredContent delay={700}>
            <section className="space-y-4">
              <h2 className="text-xl section-label">What else do you want to know about me?</h2>
              <div
                className="rounded-3xl border p-4"
                style={{ background: "var(--card-bg)", borderColor: "var(--border-2)" }}
              >
                <ChatBox />
              </div>
            </section>
          </StaggeredContent>

          <StaggeredContent delay={900}>
            <br />
            <span>
              I'd love to hear from you! Want to hire me? Or wanna chat? Feel free to reach out by{" "}
              <a
                href="mailto:richardli0@outlook.com"
                className="text-stone-400 underline hover:text-stone-100 inline-block transform transition-transform duration-200 hover:scale-110"
              >
                email
              </a>
              , or connect with me on{" "}
              <a
                href="https://www.linkedin.com/in/richardli0"
                className="text-stone-400 underline hover:text-stone-100 inline-block transform transition-transform duration-200 hover:scale-110"
              >
                LinkedIn
              </a>
              .
            </span>
          </StaggeredContent>
        </main>
        <StaggeredContent delay={1100}>
          <Footer />
        </StaggeredContent>
      </div>
    </AnimatedPage>
  )
}
