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

        <main className="max-w-4xl mx-auto p-6" style={{ paddingTop: "60px" }}>
          <StaggeredContent delay={0}>
            {" "}
            {/* Changed from 200 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold italic text-green-400 mb-2 flex items-center justify-center gap-2">
                <img
                  src="/images/jamAsset.PNG"
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
                src=""
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
                  <p className="text-gray-300">May 2025</p>
                </div>
                <div>
                  <h3 className="text-green-400 font-bold mb-2">Tools</h3>
                  <div className="space-y-1 text-gray-300">
                    <p>Next.js (App Router)</p>
<p>Web Speech API</p>
<p>TouchDesigner</p>
<p>Tailwind CSS</p>
<p>face-api.js</p>
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
                    An experimental Next.js application for vision testing that includes gaze tracking and peripheral vision assessments. The app uses the device webcam and microphone, face-api.js models, and a modern UI built with Tailwind CSS and Radix UI.</p>

                  <p>
                    Half of the global population is expected to be myopic by 2050. 4Sight is an accessible, user-friendly way to screen for vision loss without needing a clinic. It provides a convenient, at-home method to track vision changes — see clearly, live fully.
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
              </div>

              <div className=" my-12">
              <iframe width="560" height="315" src="https://www.youtube.com/embed/G-rITGNKfxI?si=7lBqLqzAdgIEbJIf" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                <p>Shoutout Justin for this</p>
                
              </div>

              <h2 className="text-2xl font-bold text-green-400 mb-4">Design</h2>
              <p className="text-gray-300 mb-4">
                
                <ul className="text-gray-300 space-y-2 mb-6">
                  <li></li>
                  <li></li>
                </ul>
              </p>

              

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
