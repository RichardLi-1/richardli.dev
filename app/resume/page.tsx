"use client"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Download } from 'lucide-react'
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"

export default function ResumePage() {
  usePageViewTracker()

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-black text-green-400">
        <AnimatedHeader
          backHref="/projects"
          backText="Back to Projects"
          currentPage="/resume"
          rightLinks={[
            { href: "mailto:richardli0@outlook.com", text: "CONTACT" },
            { href: "https://www.linkedin.com/in/richardli0/", text: "LINKEDIN", external: true },
            { href: "https://github.com/RichardLi-1", text: "GITHUB", external: true },
          ]}
        />

        <main className="max-w-4xl mx-auto p-6" style={{ paddingTop: "120px" }}>
          <StaggeredContent delay={0}>
            <div className="mb-8 flex justify-between items-center">
              <h1 className="text-4xl font-bold">Resume</h1>
              <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
                <a href="/resume.pdf" download="Richard_Li_Resume.pdf">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </a>
              </Button>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={100}>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 space-y-8">
              {/* Header */}
              <div className="text-center border-b border-gray-700 pb-6">
                <h2 className="text-3xl font-bold text-green-400 mb-2">Richard Li</h2>
                <div className="text-gray-300 text-sm space-x-2">
                  <a href="mailto:r575li@uwaterloo.ca" className="hover:text-green-400">
                    r575li@uwaterloo.ca
                  </a>
                  <span>|</span>
                  <a
                    href="https://linkedin.com/in/richardli0/"
                    className="hover:text-green-400"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    linkedin.com/in/richardli0/
                  </a>
                  <span>|</span>
                  <a
                    href="https://github.com/richardli-1"
                    className="hover:text-green-400"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    github.com/richardli-1
                  </a>
                  <span>|</span>
                  <a
                    href="https://richardli.dev"
                    className="hover:text-green-400"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    richardli.dev
                  </a>
                </div>
              </div>

              {/* Technical Skills */}
              <section>
                <h3 className="text-xl font-bold text-green-400 mb-3 border-b border-gray-700 pb-2">
                  Technical Skills
                </h3>
                <div className="space-y-2 text-gray-300">
                  <p>
                    <strong className="text-green-400">Languages:</strong> Python, Java, C++, Swift, JavaScript,
                    TypeScript, HTML, CSS
                  </p>
                  <p>
                    <strong className="text-green-400">Tools and Frameworks:</strong> Vite, Angular, React, Node.js,
                    PostgreSQL, OpenAI, SwiftUI, Git, GitHub, Figma, Solidworks
                  </p>
                  <p>
                    <strong className="text-green-400">Courses:</strong> Digital Computation (C++), Apple App
                    Development with Swift Certification
                  </p>
                </div>
              </section>

              {/* Experience */}
              <section>
                <h3 className="text-xl font-bold text-green-400 mb-3 border-b border-gray-700 pb-2">Experience</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-green-400">Full Stack Developer (Incoming)</h4>
                        <p className="text-gray-400 text-sm">SaFuture Inc. • Burlington, ON</p>
                      </div>
                      <span className="text-gray-400 text-sm">Jan 2026 – Apr 2026</span>
                    </div>
                    <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                      <li>Recruited to join SaFuture Inc on the GIS technologies team</li>
                    </ul>
                  </div>

                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-green-400">Full Stack Developer</h4>
                        <p className="text-gray-400 text-sm">FormulaTech Hacks • Waterloo, ON</p>
                      </div>
                      <span className="text-gray-400 text-sm">Oct 2025 – Present</span>
                    </div>
                    <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                      <li>Building front-end and back-end for website and coordinating sponsorships for hackathon</li>
                    </ul>
                  </div>

                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-green-400">iOS App Developer</h4>
                        <p className="text-gray-400 text-sm">Career Education Council • Guelph, ON</p>
                      </div>
                      <span className="text-gray-400 text-sm">Sep 2024 – Jan 2025</span>
                    </div>
                    <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                      <li>
                        Built productivity iOS app in Swift that gauges user's happiness using Likert scale and
                        open-ended survey questions upon completing tasks, and integrated OpenAI API to suggest careers
                        aligned with user's personality
                      </li>
                      <li>
                        Re-implemented project fully from UIKit to SwiftUI to ensure future-proof project architecture
                      </li>
                      <li>Designed UI/UX through 3 rounds of wireframes and pitches to engineers and designers</li>
                    </ul>
                  </div>

                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-green-400">Lead UI/UX Intern</h4>
                        <p className="text-gray-400 text-sm">
                          SalesPatriot (YC W25) via Harvard UVTSP • San Francisco, CA (Remote)
                        </p>
                      </div>
                      <span className="text-gray-400 text-sm">Jul 2025 – Aug 2025</span>
                    </div>
                    <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                      <li>
                        Conducted 3 user tests observing qualitative and 6 quantitative metrics, identifying user
                        journey gap, and designed an AI-based proposal editor using Figma to fill gap to decrease
                        contract bidding time by predicted 20%
                      </li>
                      <li>
                        Led team of 8 interns to develop prototype from ideation to pitch to founders by facilitating
                        meetings and ensuring task completion, initiating the development of 2 new features
                      </li>
                      <li>
                        Guided product direction by analyzing AI trends and competitor offerings, in line with HBS
                        business practices
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Projects */}
              <section>
                <h3 className="text-xl font-bold text-green-400 mb-3 border-b border-gray-700 pb-2">Projects</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-green-400">Class Data Profile</h4>
                        <p className="text-gray-400 text-sm">React, TypeScript, HTML, Tailwind CSS</p>
                      </div>
                      <span className="text-gray-400 text-sm">Sept 2025 – Present</span>
                    </div>
                    <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                      <li>
                        Collecting and democratizing anonymous personal and academic data from students in the
                        University of Waterloo Systems Design Engineering Class of 2030 to promote transparency for
                        prospective students
                      </li>
                      <li>Developed webpage with React, Vite, TypeScript, and Tailwind CSS</li>
                    </ul>
                  </div>

                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-green-400">Virtual Father Figure</h4>
                        <p className="text-gray-400 text-sm">JavaScript, HTML, CSS</p>
                      </div>
                      <span className="text-gray-400 text-sm">Sep 2025 – Present</span>
                    </div>
                    <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                      <li>
                        Developed emotionally intelligent father Chrome extension featuring 3 distinct personalities and
                        5 event triggers
                      </li>
                      <li>
                        Implemented advanced DOM manipulation to build responsive pop-up interface with draggable UI
                        elements, chatting features, chess game functionality, and contextual advice/dad joke generation
                        based on webpage content
                      </li>
                      <li>
                        Integrated Google Gemini API for conversation and ElevenLabs API for natural text-to-speech
                        synthesis
                      </li>
                    </ul>
                  </div>

                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-green-400">4Sight</h4>
                        <p className="text-gray-400 text-sm">
                          React, Next.js (App Router), TypeScript, TouchDesigner, face-api.js
                        </p>
                      </div>
                      <span className="text-gray-400 text-sm">May 2025 – May 2025</span>
                    </div>
                    <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                      <li>
                        Developed and calibrated digital Snellen eye test based on screen pixel density, viewing
                        distance, and angular size, and added reminders when head distance is out of range
                      </li>
                      <li>Plotted results on graph in results view to track vision decline</li>
                      <li>Integrated audio input and Web Speech API for hands-free control and live audio feedback</li>
                      <li>
                        Designed responsive UI with Tailwind CSS, Radix UI components, and dark mode support via
                        next-themes
                      </li>
                    </ul>
                  </div>

                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-green-400">Bo!nk</h4>
                        <p className="text-gray-400 text-sm">iOS, Unity</p>
                      </div>
                      <span className="text-gray-400 text-sm">Jan 2021 – Jun 2021</span>
                    </div>
                    <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                      <li>
                        Designed and published Windows Vista Inkball-like iOS Game, and ensured balanced gameplay
                        mechanics
                      </li>
                      <li>Rated 4.6/5 stars on App Store</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Education */}
              <section>
                <h3 className="text-xl font-bold text-green-400 mb-3 border-b border-gray-700 pb-2">Education</h3>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-green-400">University of Waterloo</h4>
                    <p className="text-gray-300 text-sm">
                      Bachelor's of Applied Science in Systems Design Engineering, BASc
                    </p>
                    <p className="text-gray-400 text-sm">Academic Representative</p>
                  </div>
                  <span className="text-gray-400 text-sm">Waterloo, ON</span>
                </div>
              </section>
            </div>
          </StaggeredContent>
          <Footer />
        </main>
      </div>
    </AnimatedPage>
  )
}
