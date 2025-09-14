"use client"
import { Footer } from "@/components/footer"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"

export default function SalesPatriotProjectPage() {
  return (
    <AnimatedPage>
      <div className="min-h-screen bg-black text-green-400">
        <AnimatedHeader
          backHref="/projects"
          backText="Back"
          currentPage="/projects/fatherfigure"
          rightLinks={[{ href: "https://github.com/fiof25/father-figure-htn", text: "Github", external: true }]}
        />

        <main className="max-w-4xl mx-auto p-6" style={{ paddingTop: "120px" }}>
          <StaggeredContent delay={0}>
            {" "}
            {/* Changed from 200 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold italic text-green-400 mb-2 flex items-center justify-center gap-2">
                <img
                  src="https://raw.githubusercontent.com/fiof25/father-figure-htn/refs/heads/main/assets/Logo.png"
                  alt="Father Figure Logo"
                  className="w-8 h-8 object-contain" // Adjusted size for title
                />
                Father Figure
              </h1>
              <p className="text-lg text-gray-300">Project, 2025</p>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={100}>
            {" "}
            {/* Changed from 400 */}
            {/* Hero Image */}
            <div className="relative mb-8 aspect-video w-full bg-gray-800 overflow-hidden rounded-lg">
              <img src="https://raw.githubusercontent.com/fiof25/father-figure-htn/refs/heads/main/assets/fatherfigurebanner.png" alt="screenshots" className="w-full h-full object-cover" />
            </div>
          </StaggeredContent>

          <StaggeredContent delay={300}>
            {" "}
            {/* Changed from 600 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div>
                  <h3 className="text-green-400 font-bold mb-2">Timeline</h3>
                  <p className="text-gray-300">Hack the North (September 2025)</p>
                </div>

                <div>
                  <h3 className="text-green-400 font-bold mb-2">Team</h3>
                  <p>Fiona Fang</p>
                  <div className="space-y-1 text-gray-300"></div>
                </div>
              </div>

              <div>
                <h3 className="text-green-400 font-bold mb-2">Inspiration</h3>
                <div className="space-y-4 text-gray-300">
                  <p>Absent fatherhood makes ripples.</p>
                </div>
              </div>
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
