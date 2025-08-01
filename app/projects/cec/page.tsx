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
          currentPage="/projects/cec"
          rightLinks={[{ href: "https://www.careereducationcouncil.ca/", text: "Website", external: true }]}
        />

        <main className="max-w-4xl mx-auto p-6" style={{ paddingTop: "120px" }}>
          <StaggeredContent delay={0}>
            {" "}
            {/* Changed from 200 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold italic text-green-400 mb-2">Career Education Council</h1>
              <p className="text-lg text-gray-300">Work, 2024-2025</p>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={100}>
            {" "}
            {/* Changed from 400 */}
            {/* Hero Image */}
            <div className="relative mb-8 aspect-video w-full bg-gray-800 overflow-hidden rounded-lg">
              <img src="/placeholder.svg" alt="screenshots" className="w-full h-full object-cover" />
            </div>
          </StaggeredContent>

          <StaggeredContent delay={300}>
            {" "}
            {/* Changed from 600 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div>
                  <h3 className="text-green-400 font-bold mb-2">Timeline</h3>
                  <p className="text-gray-300">5 months, September 2024-January 2025</p>
                </div>

                <div>
                  <h3 className="text-green-400 font-bold mb-2">Team</h3>
                  <div className="space-y-1 text-gray-300"></div>
                </div>
              </div>

              <div>
                <h3 className="text-green-400 font-bold mb-2">Overview</h3>
                <div className="space-y-4 text-gray-300">
                  <p>Page is WIP. Career Education Council is based in Guelph, Ontario.</p>
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
