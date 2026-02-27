"use client"
import { Footer } from "@/components/footer"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"
import { useWindowsXP } from "@/contexts/windows-xp-context"
import { DraggableSticker } from "@/components/draggable-sticker"

export default function SalesPatriotProjectPage() {
  const { isPersonalized } = useWindowsXP()
  return (
    <AnimatedPage>
      <div className="min-h-screen page-bg" style={{ position: "relative" }}>
        <AnimatedHeader
          backHref="/projects"
          backText="Back"
          currentPage="/projects/fatherfigure"
          rightLinks={[{ href: "https://github.com/fiof25/father-figure-htn", text: "GitHub", external: true }]}
        />

        <main className="max-w-6xl mx-auto p-6" style={{ paddingTop: "60px" }}>
          <StaggeredContent delay={0}>
            <div className="mb-4">
              <h1 className="text-4xl mb-2 flex gap-2 text-[#00A6E3] [.light_&]:text-[#0082b12]/70">
                Father Figure
              </h1>
              <h1 className="text-m text-gray-400">Project, 2025</h1>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={100}>
            <div className="relative mb-8 aspect-video w-full bg-gray-800 overflow-hidden rounded-xl" style={{ borderRadius: 25 }}>
              <img src="/images/design-mode/fatherfigurebanner.png" alt="screenshots" className="w-full h-full object-cover" />
            </div>
          </StaggeredContent>

          <StaggeredContent delay={300}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-2">Timeline</h3>
                  <p className="text-gray-300">Hack the North (September 2025)</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Team</h3>
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
          <Footer />
        </StaggeredContent>

        {isPersonalized && (
          <>
            <DraggableSticker src="/images/fatherfigure/Sneeze.png"       ix={0.72} iy={0.55} size={150} />
            <DraggableSticker src="/images/fatherfigure/Sneeze_Chang.png" ix={0.80} iy={0.25} size={130} />
            <DraggableSticker src="/images/fatherfigure/Sneeze_Dave.png"  ix={0.06} iy={0.45} size={140} />
          </>
        )}
      </div>
    </AnimatedPage>
  )
}
