"use client"
import { Footer } from "@/components/footer"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"

export default function SalesPatriotProjectPage() {
  return (
    <AnimatedPage>
      <div className="min-h-screen page-bg">
        <AnimatedHeader
          backHref="/projects"
          backText="Back"
          currentPage="/projects/fatherfigure"
          rightLinks={[{ href: "https://github.com/fiof25/father-figure-htn", text: "GitHub", external: true }]}
        />

        <main className="max-w-4xl mx-auto p-6" style={{ paddingTop: "60px" }}>
          <StaggeredContent delay={0}>
            {" "}
            {/* Changed from 200 */}
            <div className="mb-4">
              <h1 className="text-4xl mb-2 flex items-left gap-2">
                Father Figure
              </h1>
              <h1 className="text-m text-gray-400">Project, 2025</h1>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={100}>
            {" "}
            {/* Changed from 400 */}
            {/* Hero Image */}
            <div className="relative mb-8 aspect-video w-full bg-gray-800 overflow-hidden rounded-xl" style={{cornerShape: "squircle", borderRadius: 30}}>
              <img src="/images/design-mode/fatherfigurebanner.png" alt="screenshots" className="w-full h-full object-cover" />
            </div>
          </StaggeredContent>

          <StaggeredContent delay={300}>
            {" "}
            {/* Changed from 600 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-2">Timeline</h3>
                  <p className="text-gray-300">Hack the North (September 2025)</p>
                </div>

                <div>
                  <h3 className=" font-bold mb-2">Team</h3>
                  <a href="https://www.linkedin.com/in/fiona-fangg/" target="_blank"><p>Fiona Fang</p></a>
                  <div className="space-y-1 text-gray-300"></div>
                </div>
              </div>

              <div>
                <h3 className="text-green-400 font-bold mb-2">Inspiration</h3>
                <div className="space-y-4 text-gray-300">
                  <p>Fatherlessness makes ripples. Father Figure is not just another Chrome extension... It is a friend, a father and a way to make your doomscrolling even just a little less lonely. 😞</p>
                </div>
              </div>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={300}>
          <p>Watch Dad Sneeze: <a href="https://youtu.be/Pkpd0WDR_sA">https://youtu.be/Pkpd0WDR_sA</a></p>
          </StaggeredContent>

          <StaggeredContent delay={300}>
          <div className="space-y-4 text-gray-300">
                  <p>Designed different personas that were composed of hand-drawn characters with different emotions Created custom event triggers for Dave to pop up on (e.g. tab overload, late night, emotional check-ins) Used Gemini AI to generate conversation and different personalities + ElevenLabs API to simulate dad voice Challenges we ran into but conquered successfully 🥊 Format... we weren't sure how we would display things to ensure convenience and seamlessness, but thank goodness it all worked out Timing the animation and audio correctly for maximum dad-ness 😅 😞</p>
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
