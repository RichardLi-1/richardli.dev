"use client"
import { useState, useEffect } from "react"
import { Footer } from "@/components/footer"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"
import { RelatedProjects } from "@/components/related-projects"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"
import { useIsPanel } from "@/hooks/use-is-panel"
import { X, ArrowUpRight } from "lucide-react"

export default function YRHacksProjectPage() {
  usePageViewTracker()
  const isPanel = useIsPanel()
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  const [showAllTeam, setShowAllTeam] = useState(false) // State to manage visibility

  const fullTeamMembers = [
    { name: "Ray Tan", linkedin: "https://www.linkedin.com/in/ray-tan-054ab4228/" },
    { name: "Matthew Huang", linkedin: "https://www.linkedin.com/in/matthew-huang-26385b276/" },
    { name: "Tristan Pinzari", linkedin: "https://www.linkedin.com/in/tristan-pinzari-7aa10b2b4/" },
    { name: "Vincent Qu", linkedin: "https://www.linkedin.com/in/vincentqu888/" },
    { name: "Conan Yu" },
    { name: "Aubree Lianto", linkedin: "https://www.linkedin.com/in/aubree-lianto/" },
    { name: "Edward Drobnis", linkedin: "https://www.linkedin.com/in/edward-drobnis/" },
    { name: "Maha Jamil", linkedin: "https://www.linkedin.com/in/maha-jamil-a83409289/" },
    { name: "Vivian Wu" },
    { name: "Tommy Shan" },
    { name: "Alex Chan" },
    { name: "Abigail Choy" },
  ]

  return (
    <AnimatedPage>
      <div className="min-h-screen page-bg">
        <AnimatedHeader
          backHref="/projects"
          backText="Back"
          currentPage="/projects/yrhacks"
          rightLinks={[{ href: "", text: "Website", external: true }]}
        />
        {isPanel && <div style={{ position: "fixed", top: 16, right: 16, display: "flex", gap: 6, zIndex: 50 }}>
          <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "open" }, "*")} className="nav-item" style={{ padding: "6px" }}><ArrowUpRight className="w-4 h-4" /></button>
          <button onClick={() => window.parent.postMessage({ type: "panel-action", action: "close" }, "*")} className="nav-item" style={{ padding: "6px" }}><X className="w-4 h-4" /></button>
        </div>}

        <main className="max-w-4xl mx-auto p-6 space-y-8" style={{ paddingTop: isMobile ? "0px" : "60px" }}>
          <StaggeredContent delay={0}>
            {" "}
            {/* Changed from 200 */}
            <div className="text-left mb-8">
              <h1 className="text-3xl font-bold italic text-green-400 mb-2 flex items-left justify-left gap-2">
                <img
                  src="/images/yrhacks-logo.png"
                  alt="YRHacks Logo"
                  className="w-8 h-8 object-contain" // Adjusted size for title
                />
                YRHacks
              </h1>
              <p className="text-lg text-gray-300">Community, 2025</p>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={100}>
            {" "}
            {/* Changed from 400 */}
            {/* Hero Image */}
            <div className="relative mb-8 aspect-video w-full bg-gray-800 overflow-hidden rounded-lg">
              <img src="/images/yrhacks crowd.jpeg" alt="YRHacks event photos" className="w-full h-full object-cover" />
            </div>
          </StaggeredContent>

          {/* Project Details Grid */}
          <StaggeredContent delay={300}>
            {" "}
            {/* Changed from 600 */}
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
                    {!showAllTeam && (
                      <p
                        className="underline cursor-pointer hover:text-green-300 transition-colors"
                        onClick={() => setShowAllTeam(true)}
                      >
                        And many more amazing team members...
                      </p>
                    )}
                    {showAllTeam && (
                      <>
                        {fullTeamMembers.map((member, index) => (
                          <div key={index}>
                            {member.linkedin ? (
                              <a href={member.linkedin} className="underline" target="_blank" rel="noopener noreferrer">
                                <p>{member.name}</p>
                              </a>
                            ) : (
                              <p>{member.name}</p>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-green-400 font-bold mb-2">Overview</h3>
                <div className="space-y-4 text-gray-300">
                  <p>YRHacks is Canada's largest high school hackathon, and a unique offering from the York Region District School Board. This year, we had 250+ hackers.</p>
                </div>
              </div>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={1000}>
            {" "}
            {/* Changed from 1300 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <img
                  src="/images/yrhacksphoto1.jpeg"
                  alt="Preparing bubble tea"
                />
              </div>

              <div>
                <h3 className="text-green-400 font-bold mb-2">Fiona put it best</h3>
                <div className="space-y-4 text-gray-300">
                  <p>
                    "What makes YRHacks truly special isn’t just the 71 awesome projects that are created within 24
                    hours—it’s the energy. It feels like a thriving school club, yet it brings together students from
                    all over the board and supports them with resources that go far beyond what any club could offer. I
                    absolutely love witnessing teams that form on the spot, the late nights, the last-minute pivots, and
                    all the small wins that add up to an unforgettable experience. If there’s one thing I’ve learned in
                    my three years of organizing YRHacks, it’s that the moments that stick aren’t always the milestones
                    — it’s the tiny, chaotic, hilarious in-betweens. The hallway chats, the group laughs, and the bubble
                    tea marathon (400 cups, to be exact — 🍵 matcha, OG, and taro). These are the memories I’ll carry
                    with me."
                  </p>
                </div>
              </div>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={1000}>
            {" "}
            {/* Changed from 1300 */}
            {/* Team Photo */}
            <div className="relative mb-8 aspect-video w-full bg-gray-800 overflow-hidden">
              <img src="/placeholder.svg" alt="YRHacks lanyards" className="w-full h-full object-cover" />
            </div>
            <p className="text-gray-300">
              I designed lanyards! YRHacks regulars noted that the lanyards improved from last year.
            </p>
          </StaggeredContent>

          <StaggeredContent delay={1000}>
            {" "}
            {/* Changed from 1300 */}
            {/* Team Photo */}
            <div className="relative aspect-video w-full bg-gray-800 overflow-hidden">
              <img src="/images/yrhacksphoto2.jpeg" alt="YRHacks image 2" className="w-full h-full object-cover" />
            </div>
            <p className="text-gray-300">
              Organizing YRHacks was truly a fun experience. Knowing how transformative YRHacks was for me as my first hackathon, I'm glad to have helped make the same experience happen for everyone who participated this year.
            </p>
          </StaggeredContent>

          <StaggeredContent delay={1000}>
            {" "}
            {/* Changed from 1300 */}
            {/* Team Photo */}
            <div className="relative mb-8 aspect-video w-full bg-gray-800 overflow-hidden">
              <img
                src="/images/design-mode/PXL_20240927_153504407.jpg"
                alt="YRHacks team photo"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-gray-300">
              This was one of the most talent-packed teams I've been apart of. There was a lot to learn from everyone there, and getting to know everyone over these 10 months was amazing. I'm grateful to them for taking a chance on
              me.
            </p>
          </StaggeredContent>
          <RelatedProjects currentId="yrhacks" />
        </main>

        <StaggeredContent delay={1100}>
          <Footer />
        </StaggeredContent>
      </div>
    </AnimatedPage>
  )
}
