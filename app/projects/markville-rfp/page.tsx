"use client"
import { Footer } from "@/components/footer"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"
import { Button } from "@/components/ui/button"
import { ExternalLink, Award, FileText } from "lucide-react"

export default function MarkvilleRFPProjectPage() {
  return (
    <AnimatedPage>
      <div className="min-h-screen bg-black text-green-400">
        <AnimatedHeader
          backHref="/projects"
          backText="Back"
          currentPage="/projects/markville-rfp"
          rightLinks={[
            {
              href: "https://devpost.com/software/rebranding-the-markville-secondary-plan-with-tod",
              text: "Devpost",
              external: true,
            },
            {
              href: "https://drive.google.com/file/d/1MNG2sU7dm8WwcadvKp_FIT0mVTRGYa7f/view?usp=sharing",
              text: "View Document",
              external: true,
            },
          ]}
        />

        <main className="max-w-4xl mx-auto p-6" style={{ paddingTop: "60px" }}>
          <StaggeredContent delay={0}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold italic text-green-400 mb-2">
                RFP: Rebranding the Markville Secondary Plan
              </h1>
              <p className="text-lg text-gray-300">Urban Planning Design, 2024</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">City Design Challenge Winner</span>
              </div>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={100}>
            {/* Hero Image */}
            <div className="relative mb-8 aspect-video w-full bg-gray-800 overflow-hidden rounded-lg">
              <img
                src="/images/markville-rfp-cover.png"
                alt="RFP: Rebranding the Markville Secondary Plan cover"
                className="w-full h-full object-cover"
              />
            </div>
          </StaggeredContent>

          <StaggeredContent delay={300}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div>
                  <h3 className="text-green-400 font-bold mb-2">Timeline</h3>
                  <p className="text-gray-300">Hackathon project, 2024</p>
                </div>

                <div>
                  <h3 className="text-green-400 font-bold mb-2">Achievement</h3>
                  <div className="space-y-2 text-gray-300">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span>Winner - City Design Challenge Hackathon</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-green-400 font-bold mb-2">Tools</h3>
                  <div className="space-y-1 text-gray-300">
                    <p>Urban Planning Research</p>
                    <p>Design Strategy</p>
                    <p>Transit-Oriented Development (TOD)</p>
                    <p>Community Engagement</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-green-400 font-bold mb-2">Overview</h3>
                <div className="space-y-4 text-gray-300">
                  <p>
                    A comprehensive rebranding proposal for the Markville Secondary Plan that won the City Design
                    Challenge hackathon. This project focused on reimagining urban development through transit-oriented
                    design principles.
                  </p>
                  <p>
                    The proposal addresses key urban planning challenges and presents innovative solutions for
                    sustainable community development, integrating transportation, housing, and commercial spaces.
                  </p>
                  <p>
                    The hackathon was judged by Reid McAlpine, Councillor - Ward 3 Unionville at City of Markham, making
                    this project also a form of advocacy.
                  </p>
                </div>
              </div>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={500}>
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-8">
              <h3 className="text-green-400 font-bold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Project Documentation
              </h3>
              <p className="text-gray-300 mb-4">
                View the complete RFP document detailing our comprehensive rebranding strategy and urban planning
                proposals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <a
                    href="https://drive.google.com/file/d/1MNG2sU7dm8WwcadvKp_FIT0mVTRGYa7f/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Full Document
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black bg-transparent"
                >
                  <a
                    href="https://devpost.com/software/rebranding-the-markville-secondary-plan-with-tod"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    View on Devpost
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={700}>
            <div className="prose prose-invert prose-green max-w-none">
              <h2 className="text-2xl font-bold text-green-400 mb-4">Project Highlights</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                  <h4 className="text-green-400 font-bold mb-2">Transit-Oriented Development</h4>
                  <p className="text-gray-300 text-sm">
                    Integrated transportation planning with residential and commercial development to create
                    sustainable, walkable communities.
                  </p>
                </div>

                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                  <h4 className="text-green-400 font-bold mb-2">Community Engagement</h4>
                  <p className="text-gray-300 text-sm">
                    Developed strategies for meaningful community involvement in the planning process, ensuring resident
                    voices are heard.
                  </p>
                </div>

                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                  <h4 className="text-green-400 font-bold mb-2">Sustainable Design</h4>
                  <p className="text-gray-300 text-sm">
                    Incorporated environmental sustainability principles and green infrastructure throughout the
                    planning proposal.
                  </p>
                </div>

                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                  <h4 className="text-green-400 font-bold mb-2">Economic Viability</h4>
                  <p className="text-gray-300 text-sm">
                    Balanced ambitious planning goals with practical economic considerations and implementation
                    strategies.
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-green-400 mb-4">Impact & Recognition</h2>
              <p className="text-gray-300 mb-4">
                This project was recognized as the winner of the City Design Challenge hackathon, demonstrating
                innovative approaches to urban planning and community development. The comprehensive proposal showcases
                the potential for reimagining suburban development through transit-oriented design principles.
              </p>

              <p className="text-gray-300">
                The project represents a collaborative effort to address real-world urban planning challenges while
                considering the needs of diverse community stakeholders and long-term sustainability goals.
              </p>
            </div>
          </StaggeredContent>
        </main>

        <StaggeredContent delay={1100}>
          <Footer />
        </StaggeredContent>
      </div>
    </AnimatedPage>
  )
}
