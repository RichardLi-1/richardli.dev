"use client"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"
import { RelatedProjects } from "@/components/related-projects"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { ExternalLink, X, ArrowUpRight } from "lucide-react"
import { useState, useEffect } from "react"
import { useIsPanel } from "@/hooks/use-is-panel"

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
      <div className="min-h-screen page-bg">
        <AnimatedHeader
          backHref="/work"
          backText="Back"
          currentPage="/work/boink"
          rightLinks={[
            { href: "https://apps.apple.com/ca/app/bo-nk/id1570376501", text: "App Store", external: true },
            { href: "https://github.com/MarkvilleDev/Boink", text: "GITHUB", external: true },
          ]}
        />

        <main className="max-w-6xl mx-auto p-6" style={{ paddingTop: isMobile ? "0px" : "40px" }}>
          <StaggeredContent delay={0}>
            {" "}
            {/* Changed from 200 */}
            <div className="text-left mb-8">
              <h1 className="text-4xl font-bold text-green-400 mb-2 flex items-left justify-left gap-2">
                <img src="/images/projects/boink/logo.webp" alt="Bo!nk Logo" className="w-8 h-8 object-contain rounded-md" />
                Bo!nk
              </h1>
              <p className="text-lg text-gray-300">Game, 2021</p>
              {isPanel && (
                <span className="right-4 top-0.5 absolute">
                  <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "open" }, "*")}><ArrowUpRight className="w-6 h-6" /></button>
                  <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "close" }, "*")}><X className="w-6 h-6" /></button>
                </span>
              )}
            </div>
          </StaggeredContent>

          <StaggeredContent delay={100}>
            {" "}
            {/* Changed from 400 */}
            <div className="relative mb-8 aspect-video w-full bg-gray-800 overflow-hidden rounded-lg">
              <img
                src="/images/projects/boink/hero.png"
                alt="Bo!nk game screenshots"
                className="w-full h-full object-cover"
              />
            </div>
          </StaggeredContent>

          <StaggeredContent delay={300}>
            {" "}
            {/* Changed from 600 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div>
                  <h3 className="text-green-400 font-bold mb-2">Timeline</h3>
                  <p className="text-gray-300">6 months, 2021</p>
                </div>
                <div>
                  <h3 className="text-green-400 font-bold mb-2">Tools</h3>
                  <div className="space-y-1 text-gray-300">
                    <p>Unity</p>
                    <p>C#</p>
                    <p>ShaderLab</p>
                    <p>HLSL</p>
                    <p>App Store Connect</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-green-400 font-bold mb-2">Stats</h3>
                  <div className="space-y-1 text-gray-300">
                    <p>150+ Downloads</p>
                    <p>4.6 Star Rating</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-green-400 font-bold mb-2">Team</h3>
                  <div className="space-y-1 text-gray-300">
                    {allTeam.slice(0, 3).map((m) => (
                      <p key={m.name}>{m.name}{m.role ? <span className="text-gray-500"> — {m.role}</span> : null}</p>
                    ))}
                    {showAllTeam && allTeam.slice(3).map((m) => (
                      <p key={m.name}>{m.name}</p>
                    ))}
                    <p
                      className="underline cursor-pointer hover:text-gray-100 transition-colors"
                      onClick={() => setShowAllTeam(v => !v)}
                    >
                      {showAllTeam ? "Show less" : `And ${allTeam.length - 3} more...`}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-green-400 font-bold mb-2">Overview</h3>
                <div className="space-y-4 text-gray-300">
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
              </div>
            </div>
          </StaggeredContent>

          {/* Wrap all remaining content sections in StaggeredContent with increasing delays */}
          <StaggeredContent delay={500}>
            {" "}
            {/* Changed from 800 */}
            <div className="prose prose-invert prose-green max-w-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div>
                  <h2 className="text-2xl font-bold text-green-400 mb-4">Background</h2>
                  <p className="text-gray-300">
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
                    className="w-full rounded-lg border border-gray-700"
                  />
                </div>
              </div>

                <h2 className="text-2xl font-bold text-green-400 mb-4">Design and Gameplay</h2>
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

              <p className="text-gray-300 mb-4">
                As the UX designer who conceived the idea, I directed the vision of the game and created the map of several levels.
                We designed Bo!nk to faithfully recreate the core Inkball experience while adapting it for touch
                interfaces:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                  <h4 className="text-green-400 font-bold mb-2">Touch Controls</h4>
                  <p className="text-gray-300 text-sm">
                    Intuitive touch-based drawing system that lets players draw lines to guide balls into matching
                    colored holes.
                  </p>
                </div>

                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                  <h4 className="text-green-400 font-bold mb-2">Physics Engine</h4>
                  <p className="text-gray-300 text-sm">
                    Realistic ball physics using SpriteKit's physics engine for authentic bouncing and collision
                    detection.
                  </p>
                </div>

                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                  <h4 className="text-green-400 font-bold mb-2">Progressive Difficulty</h4>
                  <p className="text-gray-300 text-sm">
                    Multiple levels with increasing complexity, introducing new obstacles and mechanics as players
                    advance.
                  </p>
                </div>

                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                  <h4 className="text-green-400 font-bold mb-2">Modern Yet Nostalgic Aesthetic</h4>
                  <p className="text-gray-300 text-sm">
                    Created a new visual style respecting Windows Vista's legacy, with authentic colors, fonts, and UI elements.
                  </p>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                We also added a twist: players have a finite amount of ink to draw lines per level. Thus, players must be frugal in their inputs.
              </p>

              <h2 className="text-2xl font-bold text-green-400 mb-4">Technical Implementation</h2>
              <p className="text-gray-300 mb-4">
                The game was built in Unity using C#, ShaderLab, and HLSL. Our team tackled key technical challenges including:
              </p>

              <ul className="text-gray-300 space-y-2 mb-6">
                <li>• Implementing smooth touch-based line drawing with real-time physics interaction</li>
                <li>• Creating accurate ball physics that felt authentic to the original game</li>
                <li>• Optimizing performance for smooth 60fps gameplay on various iOS devices</li>
                <li>• Designing an intuitive level progression system</li>
                <li>• Implementing proper game state management and save/load functionality</li>
              </ul>

              <h2 className="text-2xl font-bold text-green-400 mb-4">User Reviews</h2>
              <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-8">
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400 mr-2">
                    <span>★★★★★</span>
                  </div>
                  <span className="text-gray-300 font-bold">小田小田选我不甜</span>
                  <span className="text-gray-500 ml-2">2021-06-20</span>
                </div>
                <h4 className="text-green-400 font-bold mb-2">Awesome game</h4>
                <p className="text-gray-300 italic">
                  "This game was extremely fun to play and I has lots of fun. Yes, this is definitely one of the best
                  mobile games I ever played in my life! I would love to see more of these games!"
                </p>
              </div>

              <h2 className="text-2xl font-bold text-green-400 mb-4">App Store Journey</h2>
              <p className="text-gray-300 mb-4">
                Publishing Bo!nk on the App Store was a significant learning experience. The process involved:
              </p>

              <ul className="text-gray-300 space-y-2 mb-6">
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

              <h2 className="text-2xl font-bold text-green-400 mb-4">Results & Takeaways</h2>
              <p className="text-gray-300 mb-4">
                Bo!nk successfully launched on the App Store and provided valuable insights into mobile game
                development:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                  <h4 className="text-green-400 font-bold mb-2">Game Development</h4>
                  <p className="text-gray-300 text-sm">
                    Learned the fundamentals of game design, physics simulation, and creating engaging user experiences
                    that keep players coming back.
                  </p>
                </div>

                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                  <h4 className="text-green-400 font-bold mb-2">iOS Development</h4>
                  <p className="text-gray-300 text-sm">Gained deep experience with iOS development patterns.</p>
                </div>

                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                  <h4 className="text-green-400 font-bold mb-2">Product Launch</h4>
                  <p className="text-gray-300 text-sm">
                    Experienced the complete product lifecycle from concept to App Store publication, including
                    marketing, user feedback, and iteration.
                  </p>
                </div>

                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                  <h4 className="text-green-400 font-bold mb-2">User-Centered Design</h4>
                  <p className="text-gray-300 text-sm">
                    Learned the importance of intuitive interfaces and how to adapt desktop experiences for mobile touch
                    interactions.
                  </p>
                </div>
              </div>

              <p className="text-gray-300">
                Bo!nk remains available on the{" "}
                <a
                  href="https://apps.apple.com/ca/app/bo-nk/id1570376501"
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-400 hover:underline"
                >
                  App Store
                </a>{" "}
                and represents an important milestone in my development journey. It sparked my passion for creating
                digital experiences and laid the foundation for my future work in technology and product development.
              </p>

              <p className="text-gray-300 mt-4">
                Try it out <a className="font-bold hover:underline" href="https://apps.apple.com/ca/app/bo-nk/id1570376501" target="_blank" rel="noreferrer">here!
                </a>{" "}
                
              </p>
            </div>
          </StaggeredContent>
          {!isPanel && (
            <RelatedProjects currentId="boink" />
          )}
        </main>

        <StaggeredContent delay={1100}>
        </StaggeredContent>
      </div>
    </AnimatedPage>
  )
}
