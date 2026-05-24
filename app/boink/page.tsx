"use client"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"
import { RelatedProjects } from "@/components/related-projects"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { Github, X, ArrowUpRight } from "lucide-react"
import { AppStoreIcon } from "@/components/icons/app-store-icon"
import { useState, useEffect } from "react"
import { useIsPanel } from "@/hooks/use-is-panel"
import { CaseStudyNav } from "@/components/case-study-nav"
import { CollapsibleDetails, itemVariants } from "@/components/collapsible-details"
import { motion } from "framer-motion"
import { TrackedExternalLink } from "@/components/tracked-external-link"

const allTeam = [
  { name: "Dorian Chen", role: "Project Lead" },
  { name: "Richard Li", role: "UX Designer, Concept" },
  { name: "Jacqueline Ho" },
  { name: "Jonathan Feng" },
  { name: "Emily Lim" },
  { name: "Sky Chen" },
  { name: "Cynthia Feng" },
  { name: "Jerry Zhou" },
  { name: "Tim Yuan" },
  { name: "Brandon Chen" },
  { name: "Sarina Li" },
  { name: "Conan Wang" },
]

export default function BoinkProjectPage() {
  usePageViewTracker()
  const isPanel = useIsPanel()
  const [isMobile, setIsMobile] = useState(false)
  const [showAllTeam, setShowAllTeam] = useState(false)
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
          { id: "bk-background", label: "Background" },
          { id: "bk-design", label: "Design & Gameplay" },
          { id: "bk-technical", label: "Technical" },
          { id: "bk-reviews", label: "User Reviews" },
          { id: "bk-appstore", label: "App Store Journey" },
          { id: "bk-takeaways", label: "Results & Takeaways" },
        ]} />
      )}
      <div className="min-h-screen page-bg">
        <AnimatedHeader currentPage="/boink" />

        <main className="max-w-3xl mx-auto p-6 [&_p]:text-[var(--text-2)]" style={{ paddingTop: isMobile ? "0px" : "40px" }}>
          <StaggeredContent delay={0}>
            {" "}
            {/* Changed from 200 */}
            <div className={`relative text-left mb-8 ${isPanel ? "pr-20" : ""}`}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <h1 className="text-4xl font-bold flex min-w-0 items-center gap-2">
                  <img src="/images/projects/boink/logo.webp" alt="Bo!nk Logo" className="w-8 h-8 shrink-0 object-contain rounded-md" />
                  Bo!nk
                </h1>
                <nav className="flex shrink-0 items-center gap-1" aria-label="Boink project links">
                  <TrackedExternalLink
                    projectId="boink"
                    linkLabel="App Store icon"
                    location="header links"
                    href="https://apps.apple.com/ca/app/bo-nk/id1570376501"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Bo!nk on the App Store (opens in a new tab)"
                    className="inline-flex rounded-md p-2 text-[var(--text-3)] transition-colors hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-3)]"
                  >
                    <AppStoreIcon className="h-5 w-5" />
                  </TrackedExternalLink>
                  <a
                    href="https://github.com/MarkvilleDev/Boink"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Bo!nk source code on GitHub (opens in a new tab)"
                    className="inline-flex rounded-md p-2 text-[var(--text-3)] transition-colors hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-3)]"
                  >
                    <Github className="h-5 w-5" aria-hidden />
                  </a>
                </nav>
              </div>
              <p className="text-lg text-[var(--text-2)]">Game, 2021</p>
              {isPanel && (
                <span className="absolute right-0 top-0.5 flex gap-1">
                  <button type="button" onClick={() => window.parent.postMessage({ type: "panel-action", action: "open" }, "*")} aria-label="Open in full page">
                    <ArrowUpRight className="h-6 w-6" />
                  </button>
                  <button type="button" onClick={() => window.parent.postMessage({ type: "panel-action", action: "close" }, "*")} aria-label="Close panel">
                    <X className="h-6 w-6" />
                  </button>
                </span>
              )}
            </div>
          </StaggeredContent>

          <StaggeredContent delay={100}>
            {" "}
            {/* Changed from 400 */}
            <div className="relative mb-8 aspect-video w-full bg-[var(--surface)] overflow-hidden rounded-lg">
              <img
                src="/images/projects/boink/hero_new.png"
                alt="Bo!nk game screenshots"
                className="w-full h-full object-cover"
              />
            </div>
          </StaggeredContent>

          <StaggeredContent delay={300}>
            {" "}
            {/* Changed from 600 */}
            <CollapsibleDetails labels={["Timeline", "Tools", "Stats", "Team", "Overview"]} animateContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Timeline</p>
                  <p className="text-[var(--text-2)]">6 months, 2021</p>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Tools</p>
                  <div className="space-y-1 text-[var(--text-2)]">
                    <p>Unity</p>
                    <p>C#</p>
                    <p>ShaderLab</p>
                    <p>HLSL</p>
                    <p>App Store Connect</p>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Stats</p>
                  <div className="space-y-1 text-[var(--text-2)]">
                    <p>150+ Downloads</p>
                    <p>4.6 Star Rating</p>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <p className="section-label mb-2">Team</p>
                  <div className="space-y-1 text-[var(--text-2)]">
                    {allTeam.slice(0, 3).map((m) => (
                      <p key={m.name}>{m.name}{m.role ? <span className="text-[var(--text-4)]"> — {m.role}</span> : null}</p>
                    ))}
                    {showAllTeam && allTeam.slice(3).map((m) => (
                      <p key={m.name}>{m.name}</p>
                    ))}
                    <p
                      className="underline cursor-pointer hover:text-[var(--text)] transition-colors"
                      onClick={() => setShowAllTeam(v => !v)}
                    >
                      {showAllTeam ? "Show less" : `And ${allTeam.length - 3} more...`}
                    </p>
                  </div>
                </motion.div>
              </div>
              <motion.div variants={itemVariants}>
                <p className="section-label mb-2">Overview</p>
                <div className="space-y-4 text-[var(--text-2)]">
                  <p>
                    Bo!nk is a Windows Vista-inspired inkball game that I conceptualized and designed. As the lead UX
                    designer, I worked with Markville App Dev Club to bring this nostalgic game to the App Store.
                  </p>
                  <p>
                    The game features classic inkball mechanics with a nostalgic Windows Vista aesthetic, bringing back
                    memories of the beloved Microsoft game.
                  </p>
                  <p>
                    This project taught me valuable lessons about game development, user interface design, and the App
                    Store submission process.
                  </p>
                </div>
              </motion.div>
            </div>
            </CollapsibleDetails>
          </StaggeredContent>

          {/* Mission — uncomment and fill in when ready */}
          <StaggeredContent delay={350}>
            <div className="py-8">
              <p className="section-label mb-2">The Mission</p>
              <p className="text-3xl leading-snug" style={{ color: "var(--text)" }}>
                Create a nostalgic mobile game fun for all ages
              </p>
            </div>
          </StaggeredContent>


          {/* Wrap all remaining content sections in StaggeredContent with increasing delays */}
          <StaggeredContent delay={500}>
            {" "}
            {/* Changed from 800 */}
            <div className="prose prose-invert prose-green max-w-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div>
                  <h2 id="bk-background" className="text-2xl font-bold mb-4">Background</h2>
                  <p className="text-[var(--text-2)]">
                    Growing up, I spent countless hours on virtual machines, experimenting with old Windows versions. In
                    particular, Windows Vista always stood out to me, especially the game InkBall. The simple yet
                    addictive gameplay, nostalgic visuals, combined with the satisfying physics of bouncing balls and
                    strategic hole placement, made it one of my favorite casual games. Like the rest of Vista, InkBall
                    was ahead of its time and removed in Windows 7. When I started learning game development, I knew I
                    wanted to recreate this nostalgic experience for mobile devices.
                  </p>
                </div>
                <div>
                  <video
                    src="/videos/inkball-gameplay.mp4"
                    aria-label="InkBall gameplay footage"
                    autoPlay
                    loop
                    muted
                    playsInline
                    disablePictureInPicture
                    className="w-full rounded-lg border border-[var(--border-2)]"
                  />
                </div>
              </div>

                <h2 id="bk-design" className="text-2xl font-bold mb-4">Design and Gameplay</h2>
                <video
                  src="/videos/boink-gameplay.MOV"
                  aria-label="Bo!nk gameplay footage"
                  autoPlay
                  loop
                  muted
                  playsInline
                  disablePictureInPicture
                  className="w-full rounded-lg mb-4"
                />

              <p className="text-[var(--text-2)] mb-4">
                As the UX designer who conceived the idea, I directed the vision of the game and created the map of several levels.
                We designed Bo!nk to faithfully recreate the core Inkball experience while adapting it for touch
                interfaces:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-2)]">
                  <h4 className="font-bold mb-2">Touch Controls</h4>
                  <p className="text-[var(--text-2)] text-sm">
                    Intuitive touch-based drawing system that lets players draw lines to guide balls into matching
                    colored holes.
                  </p>
                </div>

                <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-2)]">
                  <h4 className="font-bold mb-2">Physics Engine</h4>
                  <p className="text-[var(--text-2)] text-sm">
                    Realistic ball physics using SpriteKit's physics engine for authentic bouncing and collision
                    detection.
                  </p>
                </div>

                <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-2)]">
                  <h4 className="font-bold mb-2">Progressive Difficulty</h4>
                  <p className="text-[var(--text-2)] text-sm">
                    Multiple levels with increasing complexity, introducing new obstacles and mechanics as players
                    advance.
                  </p>
                </div>

                <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-2)]">
                  <h4 className="font-bold mb-2">Modern Yet Nostalgic Aesthetic</h4>
                  <p className="text-[var(--text-2)] text-sm">
                    Created a new visual style respecting Windows Vista's legacy, with authentic colors, fonts, and UI elements.
                  </p>
                </div>
              </div>
              <p className="text-[var(--text-2)] mb-4">
                We also added a twist: players have a finite amount of ink to draw lines per level. Thus, players must be frugal in their inputs.
              </p>

              <h2 id="bk-technical" className="text-2xl font-bold mb-4">Technical Implementation</h2>
              <p className="text-[var(--text-2)] mb-4">
                The game was built in Unity using C#, ShaderLab, and HLSL. Our team tackled key technical challenges including:
              </p>

              <ul className="text-[var(--text-2)] space-y-2 mb-6">
                <li>• Implementing smooth touch-based line drawing with real-time physics interaction</li>
                <li>• Creating accurate ball physics that felt authentic to the original game</li>
                <li>• Optimizing performance for smooth 60fps gameplay on various iOS devices</li>
                <li>• Designing an intuitive level progression system</li>
                <li>• Implementing proper game state management and save/load functionality</li>
              </ul>

              <h2 id="bk-reviews" className="text-2xl font-bold mb-4">User Reviews</h2>
              <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-2)] mb-8">
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400 mr-2">
                    <span>★★★★★</span>
                  </div>
                  <span className="text-[var(--text-2)] font-bold">小田小田选我不甜</span>
                  <span className="text-[var(--text-4)] ml-2">2021-06-20</span>
                </div>
                <h4 className="font-bold mb-2">Awesome game</h4>
                <p className="text-[var(--text-2)] italic">
                  "This game was extremely fun to play and I has lots of fun. Yes, this is definitely one of the best
                  mobile games I ever played in my life! I would love to see more of these games!"
                </p>
              </div>

              <h2 id="bk-appstore" className="text-2xl font-bold mb-4">App Store Journey</h2>
              <p className="text-[var(--text-2)] mb-4">
                Publishing Bo!nk on the App Store was a significant learning experience. The process involved:
              </p>

              <ul className="text-[var(--text-2)] space-y-2 mb-6">
                <li>• Learning Apple's App Store guidelines and submission requirements</li>
                <li>• Creating app icons, screenshots, and marketing materials</li>
                <li>• Writing compelling app descriptions and metadata</li>
                <li>• Going through the review process and addressing feedback</li>
                <li>• Understanding app analytics and user engagement metrics</li>
                <li>
                  • Renaming the game from "Boink" to "Bo!nk." Unbeknownst to us, the original name is inappropriate in Dutch. This was one of the first
                  pieces of feedback the App Store gave us
                </li>
              </ul>

              <h2 id="bk-takeaways" className="text-2xl font-bold mb-4">Results &amp; Takeaways</h2>
              <p className="text-[var(--text-2)] mb-4">
                Bo!nk successfully launched on the App Store and provided valuable insights into mobile game
                development:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-2)]">
                  <h4 className="font-bold mb-2">Game Development</h4>
                  <p className="text-[var(--text-2)] text-sm">
                    Learned the fundamentals of game design, physics simulation, and creating engaging user experiences
                    that keep players coming back.
                  </p>
                </div>

                <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-2)]">
                  <h4 className="font-bold mb-2">iOS Development</h4>
                  <p className="text-[var(--text-2)] text-sm">Gained deep experience with iOS development patterns.</p>
                </div>

                <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-2)]">
                  <h4 className="font-bold mb-2">Product Launch</h4>
                  <p className="text-[var(--text-2)] text-sm">
                    Experienced the complete product lifecycle from concept to App Store publication, including
                    marketing, user feedback, and iteration.
                  </p>
                </div>

                <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-2)]">
                  <h4 className="font-bold mb-2">User-Centered Design</h4>
                  <p className="text-[var(--text-2)] text-sm">
                    Learned the importance of intuitive interfaces and how to adapt desktop experiences for mobile touch
                    interactions.
                  </p>
                </div>
              </div>

              <p className="text-[var(--text-2)]">
                Bo!nk remains available on the{" "}
                <a
                  href="https://apps.apple.com/ca/app/bo-nk/id1570376501"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  App Store
                </a>{" "}
                and represents an important milestone in my development journey. It sparked my passion for creating
                digital experiences and laid the foundation for my future work in technology and product development.
              </p>

              <p className="text-[var(--text-2)] mt-4">
                Try it out <TrackedExternalLink
                  projectId="boink"
                  linkLabel="Try it out here"
                  location="body CTA"
                  className="font-bold hover:underline"
                  href="https://apps.apple.com/ca/app/bo-nk/id1570376501"
                  target="_blank"
                  rel="noreferrer"
                >here!
                </TrackedExternalLink>{" "}
                
              </p>
            </div>
          </StaggeredContent>
          {!isPanel && (
            <RelatedProjects currentId="boink" />
          )}
        </main>

      </div>
    </AnimatedPage>
  )
}
