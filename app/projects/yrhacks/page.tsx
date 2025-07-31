"use client"
import { Footer } from "@/components/footer"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"

export default function BoinkProjectPage() {
  return (
    <AnimatedPage>
      <div className="min-h-screen bg-black text-green-400 font-mono">
        <AnimatedHeader
          backHref="/projects"
          backText="Back"
          rightLinks={[{ href: "https://www.yrhacks.ca", text: "Website", external: true }]}
        />

        <main className="max-w-4xl mx-auto p-6 pt-32">
          <StaggeredContent delay={200}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold italic text-green-400 mb-2">YRHacks</h1>
              <p className="text-lg text-gray-300">Community, 2025</p>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={400}>
            {/* Hero Image */}
            <div className="relative mb-8 aspect-video w-full bg-gray-800 overflow-hidden rounded-lg">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-OFGQDkrP2BvNmhLieOxExwEZBsCGcq.png"
                alt="Bo!nk game screenshots"
                className="w-full h-full object-cover"
              />
            </div>
          </StaggeredContent>

          {/* Project Details Grid */}
          <StaggeredContent delay={600}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div>
                  <h3 className="text-green-400 font-bold mb-2">Timeline</h3>
                  <p className="text-gray-300">10 months, June 2024-April 2025</p>
                </div>

                <div>
                  <h3 className="text-green-400 font-bold mb-2">Team</h3>
                  <div className="space-y-1 text-gray-300">
                    <a href="https://www.linkedin.com/in/fiona--cai/" className="underline">
                      <p>Fiona Cai</p>
                    </a>
                    <a href="https://www.linkedin.com/in/cici-guo/" className="underline">
                      <p>Cici Guo</p>
                    </a>
                    <a href="https://www.linkedin.com/in/aayan-karmali/" className="underline">
                      <p>Aayan Karmali</p>
                    </a>
                    <a href="https://www.linkedin.com/in/ray-tan-054ab4228/" className="underline">
                      <p>Ray Tan</p>
                    </a>
                    <a href="https://www.linkedin.com/in/matthew-huang-26385b276/" className="underline">
                      <p>Matthew Huang</p>
                    </a>
                    <a href="https://www.linkedin.com/in/tristan-pinzari-7aa10b2b4/" className="underline">
                      <p>Tristan Pinzari</p>
                    </a>
                    <a href="https://www.linkedin.com/in/vincentqu888/" className="underline">
                      <p>Vincent Qu</p>
                    </a>
                    <a href="https://www.linkedin.com/in/matthewkkimm/" className="underline">
                      <p>Conan </p>
                    </a>
                    <a href="https://www.linkedin.com/in/aubree-lianto/" className="underline">
                      <p>Aubree Lianto</p>
                    </a>
                    <a href="https://www.linkedin.com/in/edward-drobnis/" className="underline">
                      <p>Edward Drobnis</p>
                    </a>
                    <a href="https://www.linkedin.com/in/maha-jamil-a83409289/" className="underline">
                      <p>Maha Jamil</p>
                    </a>
                    <p>Vivian Wu</p>
                    <p>Tommy Shan</p>
                    <p>Alex Chan</p>
                    <p>Abigail Choy</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-green-400 font-bold mb-2">Overview</h3>
                <div className="space-y-4 text-gray-300">
                  <p>YRHacks is Canada's largest high school hackathon. This year, we had 250+ hackers.</p>
                </div>
              </div>
            </div>
          </StaggeredContent>

          {/* Content Sections */}
          <StaggeredContent delay={800}>
            <div className="prose prose-invert prose-green max-w-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div>
                  <h2 className="text-2xl font-bold text-green-400 mb-4">Overview</h2>
                  <p className="text-gray-300">
                    SalesPatriot is a San Francisco-based B2B SaaS platform that simplifies the complexities of bidding
                    on and managing contracts for NSNs for distributors and contractors. I did a project for them summer
                    of 2025.
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
            </div>
          </StaggeredContent>

          <StaggeredContent delay={1000}>
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
          </StaggeredContent>

          <StaggeredContent delay={1200}>
            <div className="prose prose-invert prose-green max-w-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div>
                  <h2 className="text-2xl font-bold text-green-400 mb-4">Lanyard Design</h2>
                  <p className="text-gray-300 mb-4">
                    A few hackers told us they noticed that the lanyards improved this year!
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

                  <h2 className="text-2xl font-bold text-green-400 mb-4">Technical Implementation</h2>
                  <p className="text-gray-300 mb-4">
                    The game was built in Unity using C#, ShaderLab, and HLSL. While I focused on the UX design and
                    concept, our development team tackled key technical challenges including:
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
                      "This game was extremely fun to play and I has lots of fun. Yes, this is definitely one of the
                      best mobile games I ever played in my life! I would love to see more of these games!"
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
                  </ul>

                  <p className="text-gray-300 mb-4">
                    Fun Fact: the original name of the game was "Boink," a swear word in Dutch. App Store forced us to
                    change this to "Bo!nk".
                  </p>

                  <h2 className="text-2xl font-bold text-green-400 mb-4">Results & Takeaways</h2>
                  <p className="text-gray-300 mb-4">
                    Bo!nk successfully launched on the App Store and provided valuable insights into mobile game
                    development:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                    <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                      <h4 className="text-green-400 font-bold mb-2">Game Development</h4>
                      <p className="text-gray-300 text-sm">
                        Learned the fundamentals of game design, physics simulation, and creating engaging user
                        experiences that keep players coming back.
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
                        Learned the importance of intuitive interfaces and how to adapt desktop experiences for mobile
                        touch interactions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={1300}>
            {/* Hero Image */}
            <div className="relative mb-8 aspect-video w-full bg-gray-800 overflow-hidden rounded-lg">
              <img
                src="https://richardli-1.github.io/Personal-Website/PXL_20240927_153504407.jpg"
                alt="Bo!nk game screenshots"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-gray-300">
              Getting to know the team over these 10 months was amazing, and I'm grateful to them for taking a chance on
              me. There was a lot to learn from everyone there, and I'm sure the future is bright.
            </p>
          </StaggeredContent>
        </main>

        <StaggeredContent delay={1400}>
          <Footer />
        </StaggeredContent>
      </div>
    </AnimatedPage>
  )
}
