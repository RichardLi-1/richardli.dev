"use client"
import { Footer } from "@/components/footer"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"

export default function SightProjectPage() {
  return (
    <AnimatedPage>
      <div className="min-h-screen bg-black text-green-400">
        <AnimatedHeader
          backHref="/projects"
          backText="Back"
          currentPage="/projects/4sight"
          rightLinks={[
            { href: "https://eye-tester-app.vercel.app/", text: "Live Demo", external: true },
            { href: "https://github.com/justinwuzijin/eye-tester-app", text: "GITHUB", external: true },
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
                4Sight
              </h1>
              <p className="text-lg text-gray-300">Project, 2025</p>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={100}>
            {" "}
            {/* Changed from 400 */}
            <div className="relative mb-8 aspect-video w-full bg-gray-800 overflow-hidden rounded-lg">
              <img
                src="/images/design-mode/image.png"
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
                  <h3 className="text-green-400 font-bold mb-2">Team</h3>
                  <div className="space-y-1 text-gray-300">
                    <a className="hover:underline" target="_blank" href="https://www.linkedin.com/in/fiona-fangg/"><p>Fiona Fang</p></a>
                    <a className="hover:underline" target="_blank" href="https://www.linkedin.com/in/justin-wu-171481162/"><p>Justin Wu</p></a>
                    <a className="hover:underline" target="_blank" href="https://www.linkedin.com/in/petersen-matthew/"><p>Matthew Petersen</p></a>
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
                  <h2 className="text-2xl font-bold text-green-400 mb-4">Demo</h2>
                  <iframe width="560" height="315" src="https://www.youtube.com/embed/nIDPlmvfIDk?si=uIwV_3CJ0K1jFEXh" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                </div>
                
              </div>

              <div className=" my-12">
              <iframe width="560" height="315" src="https://www.youtube.com/embed/G-rITGNKfxI?si=7lBqLqzAdgIEbJIf" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                
                
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
