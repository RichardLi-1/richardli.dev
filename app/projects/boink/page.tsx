"use client"
import { Footer } from "@/components/footer"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"

export default function BoinkProjectPage() {
  return (
    <AnimatedPage>
      <div className="min-h-screen bg-black text-green-400">
        <AnimatedHeader
          backHref="/projects"
          backText="Back"
          currentPage="/projects/boink"
          rightLinks={[
            { href: "https://apps.apple.com/ca/app/bo-nk/id1570376501", text: "App Store", external: true },
            { href: "https://github.com/MarkvilleDev/Boink", text: "GITHUB", external: true },
          ]}
        />

        <main className="max-w-4xl mx-auto p-6" style={{ paddingTop: "120px" }}>
          <StaggeredContent delay={0}>
            {" "}
            {/* Changed from 200 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold italic text-green-400 mb-2 flex items-center justify-center gap-2">
                <img
                  src="/images/boink-logo.webp"
                  alt="Bo!nk Logo"
                  className="w-8 h-8 object-contain rounded-md" // Adjusted size for title
                />
                Bo!nk
              </h1>
              <p className="text-lg text-gray-300">Game, 2021</p>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={100}>
            {" "}
            {/* Changed from 400 */}
            <div className="relative mb-8 aspect-video w-full bg-gray-800 overflow-hidden rounded-lg">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-OFGQDkrP2BvNmhLieOxExwEZBsCGcq.png"
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
              </div>
              <div>
                <h3 className="text-green-400 font-bold mb-2">Overview</h3>
                <div className="space-y-4 text-gray-300">
                  <p>
                    Bo!nk is a Windows Vista-inspired inkball game that I conceptualized and designed. As the lead UX
                    designer, I worked with a team to bring this nostalgic game to the App Store.
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
                    wanted to recreate this experience for mobile devices.
                  </p>
                </div>
                <div>
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ZUJyZyI83WUGEZ9nU0RdxPEVUDbARU.png"
                    alt="Original InkBall game from Windows Vista"
                    className="w-full rounded-lg border border-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                  <h3 className="text-green-400 font-bold mb-4">App Icon</h3>
                  <div className="flex justify-center">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rkyVDxMvXu4RUtPFm3ina9TXp4zgjS.png"
                      alt="Bo!nk App Icon"
                      className="w-48 h-48"
                    />
                  </div>
                </div>
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                  <h3 className="text-green-400 font-bold mb-4">Gameplay</h3>
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-pHgRTYl7aZCA3qlByQN5Hnwb9oV7KS.png"
                    alt="Bo!nk gameplay screenshot showing line drawing mechanics"
                    className="w-full rounded-lg"
                  />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-green-400 mb-4">Game Design</h2>
              <p className="text-gray-300 mb-4">
                As the UX designer who conceived the idea, I
                <ul className="text-gray-300 space-y-2 mb-6">
                  <li>• Directed the vision of the game</li>
                  <li>• Created the map of several levels</li>
                </ul>
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
                  <h4 className="text-green-400 font-bold mb-2">Vista Aesthetic</h4>
                  <p className="text-gray-300 text-sm">
                    Carefully recreated Windows Vista visual style with authentic colors, fonts, and UI elements.
                  </p>
                </div>
              </div>
              <p>
                Yet we also added a twist: players have a finite amount of ink to draw lines per level, adding a layer
                of challenge.
              </p>

              <h2 className="text-2xl font-bold text-green-400 mb-4">Technical Implementation</h2>
              <p className="text-gray-300 mb-4">
                The game was built in Unity using C#, ShaderLab, and HLSL. While I focused on the UX design and concept,
                our development team tackled key technical challenges including:
              </p>

              <ul className="text-gray-300 space-y-2 mb-6">
                <li>• Implementing smooth touch-based line drawing with real-time physics interaction</li>
                <li>• Creating accurate ball physics that felt authentic to the original game</li>
                <li>• Optimizing performance for smooth 60fps gameplay on various iOS devices</li>
                <li>• Designing an intuitive level progression system</li>
                <li>• Implementing proper game state management and save/load functionality</li>
              </ul>

              <h2 className="text-2xl font-bold text-green-400 mb-4">Team</h2>
              <p className="text-gray-300 mb-4">Bo!nk was developed by a talented team at Markville Dev:</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <h4 className="text-green-400 font-bold mb-2">Core Team</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Dorian Chen (Project Lead)</li>
                    <li>• Richard Li (Lead UX Designer, Concept)</li>
                    <li>• Jacqueline Ho</li>
                    <li>• Jonathan Feng</li>
                    <li>• Emily Lim</li>
                    <li>• Sky Chen</li>
                  </ul>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <h4 className="text-green-400 font-bold mb-2">Contributors</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Cynthia Feng</li>
                    <li>• Jerry Zhou</li>
                    <li>• Tim Yuan</li>
                    <li>• Brandon Chen</li>
                    <li>• Sarina Li</li>
                    <li>• Conan Wang</li>
                  </ul>
                </div>
              </div>

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
                  • Renaming the game from "Boink" to "Bo!nk," because the original name is a swear word in Dutch. The
                  App Store forced us to change this
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
            </div>
          </StaggeredContent>
        </main>

        <StaggeredContent delay={1100}>
          {" "}
          {/* Changed from 1400 */}
          <Footer />
        </StaggeredContent>
      </div>
    </AnimatedPage>
  )
}
