import type { ReactNode } from "react"

interface ProjectContentRendererProps {
  projectId: string
}

export function ProjectContentRenderer({ projectId }: ProjectContentRendererProps) {
  const renderProjectContent = (): ReactNode => {
    switch (projectId) {
      case "boink":
        return <BoinkContentExtractor />
      case "futureforward":
        return <FutureForwardContentExtractor />
      case "yrhacks":
        return <YRHacksContentExtractor />
      case "cec":
        return <CECContentExtractor />
      case "markville-rfp":
        return <MarkvilleRFPContentExtractor />
      case "salespatriot":
        return <SalesPatriotContentExtractor />
      default:
        return (
          <div className="p-4 text-center">
            <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
            <p>The project "{projectId}" could not be found.</p>
          </div>
        )
    }
  }

  return <div className="h-full overflow-auto bg-white text-black">{renderProjectContent()}</div>
}

function BoinkContentExtractor() {
  return (
    <div className="p-4 space-y-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/images/boink-logo.webp" alt="Bo!nk Logo" className="w-8 h-8 object-contain rounded-md" />
          <h1 className="text-2xl font-bold">Bo!nk</h1>
        </div>
        <p className="text-gray-600">Game, 2021</p>
      </div>

      <div className="mb-6">
        <img
          src="/images/design-mode/image.png"
          alt="Bo!nk game screenshots"
          className="w-full max-h-64 object-cover rounded border"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-blue-600 mb-1">Timeline</h3>
            <p className="text-sm">6 months, 2021</p>
          </div>
          <div>
            <h3 className="font-bold text-blue-600 mb-1">Tools</h3>
            <div className="space-y-1">
              {["Unity", "C#", "ShaderLab", "HLSL", "App Store Connect"].map((tool, index) => (
                <p key={index} className="text-sm">
                  • {tool}
                </p>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-blue-600 mb-1">Stats</h3>
            <div className="space-y-1">
              <p className="text-sm">• 150+ Downloads</p>
              <p className="text-sm">• 4.6 Star Rating</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-blue-600 mb-2">Overview</h3>
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">
              Bo!nk is a Windows Vista-inspired inkball game that I conceptualized and designed. As the lead UX
              designer, I worked with a team to bring this nostalgic game to the App Store.
            </p>
            <p className="text-sm leading-relaxed">
              The game features classic inkball mechanics with a nostalgic Windows Vista aesthetic, bringing back
              memories of the beloved Microsoft game.
            </p>
            <p className="text-sm leading-relaxed">
              This project taught me valuable lessons about game development, user interface design, and the App Store
              submission process.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-bold text-blue-600 mb-2">Links</h3>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://apps.apple.com/ca/app/bo-nk/id1570376501"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 transition-colors"
          >
            App Store ↗
          </a>
          <a
            href="https://github.com/MarkvilleDev/Boink"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 transition-colors"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </div>
  )
}

function FutureForwardContentExtractor() {
  return (
    <div className="p-4 space-y-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/images/future-forward-logo.png" alt="Future Forward Logo" className="w-8 h-8 object-contain" />
          <h1 className="text-2xl font-bold">Future Forward</h1>
        </div>
        <p className="text-gray-600">Non-profit, 2024-2025</p>
      </div>

      <div className="mb-6">
        <img src="/images/IMG_7745.jpeg" alt="Future Forward" className="w-full max-h-64 object-cover rounded border" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-blue-600 mb-1">Timeline</h3>
            <p className="text-sm">Ongoing, 2024-2025</p>
          </div>
          <div>
            <h3 className="font-bold text-blue-600 mb-1">Tools</h3>
            <div className="space-y-1">
              {["Next.js", "React", "Tailwind CSS", "YouTube API"].map((tool, index) => (
                <p key={index} className="text-sm">
                  • {tool}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-blue-600 mb-2">Overview</h3>
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">
              Future Forward is a non-profit initiative focused on helping students discover their vocations and career
              paths.
            </p>
            <p className="text-sm leading-relaxed">
              We provide resources, mentorship, and guidance to help young people make informed decisions about their
              future.
            </p>
            <p className="text-sm leading-relaxed">
              The organization emphasizes practical experience and real-world connections to bridge the gap between
              education and career.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-bold text-blue-600 mb-2">Links</h3>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://www.futureforward.info"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 transition-colors"
          >
            Website ↗
          </a>
          <a
            href="https://www.youtube.com/@FutureForward.Initiative"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 transition-colors"
          >
            YouTube Channel ↗
          </a>
        </div>
      </div>
    </div>
  )
}

function YRHacksContentExtractor() {
  return (
    <div className="p-4 space-y-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/images/yrhacks-logo.png" alt="YRHacks Logo" className="w-8 h-8 object-contain" />
          <h1 className="text-2xl font-bold">YRHacks</h1>
        </div>
        <p className="text-gray-600">Hackathon, 2024-2025</p>
      </div>

      <div className="mb-6">
        <img
          src="/images/yrhacks crowd.jpeg"
          alt="YRHacks crowd"
          className="w-full max-h-64 object-cover rounded border"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-blue-600 mb-1">Timeline</h3>
            <p className="text-sm">Annual event, 2024-2025</p>
          </div>
          <div>
            <h3 className="font-bold text-blue-600 mb-1">Tools</h3>
            <div className="space-y-1">
              {["Event Management", "Community Building", "Logistics"].map((tool, index) => (
                <p key={index} className="text-sm">
                  • {tool}
                </p>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-blue-600 mb-1">Stats</h3>
            <div className="space-y-1">
              <p className="text-sm">• 500+ Participants</p>
              <p className="text-sm">• Canada's Largest High School Hackathon</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-blue-600 mb-2">Overview</h3>
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">
              YRHacks is Canada's largest high school hackathon, bringing together hundreds of students to build
              innovative projects.
            </p>
            <p className="text-sm leading-relaxed">
              I helped organize this massive event, handling logistics, community building, and ensuring a smooth
              experience for all participants.
            </p>
            <p className="text-sm leading-relaxed">
              The hackathon provides a platform for young developers to showcase their skills and connect with
              like-minded peers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CECContentExtractor() {
  return (
    <div className="p-4 space-y-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/images/cec-logo.webp" alt="CEC Logo" className="w-8 h-8 object-contain" />
          <h1 className="text-2xl font-bold">Career Education Council</h1>
        </div>
        <p className="text-gray-600">Education, 2024-2025</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-blue-600 mb-1">Timeline</h3>
            <p className="text-sm">Ongoing, 2024-2025</p>
          </div>
          <div>
            <h3 className="font-bold text-blue-600 mb-1">Tools</h3>
            <div className="space-y-1">
              {["Education", "Career Development", "Mentorship"].map((tool, index) => (
                <p key={index} className="text-sm">
                  • {tool}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-blue-600 mb-2">Overview</h3>
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">
              The Career Education Council is an educational initiative focused on career development and guidance.
            </p>
            <p className="text-sm leading-relaxed">
              We work to provide students with practical career advice and real-world insights into various industries.
            </p>
            <p className="text-sm leading-relaxed">
              The program emphasizes hands-on learning and direct connections with industry professionals.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function MarkvilleRFPContentExtractor() {
  return (
    <div className="p-4 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">RFP: Rebranding the Markville Secondary Plan</h1>
        <p className="text-gray-600">Urban Planning, 2024</p>
      </div>

      <div className="mb-6">
        <img
          src="/images/markville-rfp-cover.png"
          alt="Markville RFP Cover"
          className="w-full max-h-64 object-cover rounded border"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-blue-600 mb-1">Timeline</h3>
            <p className="text-sm">Hackathon project, 2024</p>
          </div>
          <div>
            <h3 className="font-bold text-blue-600 mb-1">Tools</h3>
            <div className="space-y-1">
              {["Urban Planning", "Design", "Research", "Presentation"].map((tool, index) => (
                <p key={index} className="text-sm">
                  • {tool}
                </p>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-blue-600 mb-1">Achievement</h3>
            <p className="text-sm">• Hackathon Winner</p>
            <p className="text-sm">• Judged by Reid McAlpine, Councillor - Ward 3 Unionville at City of Markham</p>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-blue-600 mb-2">Overview</h3>
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">
              A comprehensive rebranding proposal for the Markville Secondary Plan that won the City Design Challenge
              hackathon.
            </p>
            <p className="text-sm leading-relaxed">
              The project involved extensive research, community analysis, and innovative urban planning solutions.
            </p>
            <p className="text-sm leading-relaxed">
              Judged by Reid McAlpine, Councillor - Ward 3 Unionville at City of Markham, making it also a form of
              advocacy.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-bold text-blue-600 mb-2">Links</h3>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://drive.google.com/file/d/1MNG2sU7dm8WwcadvKp_FIT0mVTRGYa7f/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 transition-colors"
          >
            View Document ↗
          </a>
          <a
            href="https://devpost.com/software/rebranding-the-markville-secondary-plan-with-tod"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 transition-colors"
          >
            Devpost ↗
          </a>
        </div>
      </div>
    </div>
  )
}

function SalesPatriotContentExtractor() {
  return (
    <div className="p-4 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">SalesPatriot (YC W25)</h1>
        <p className="text-gray-600">Internship, 2025</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-blue-600 mb-1">Timeline</h3>
            <p className="text-sm">Current, 2025</p>
          </div>
          <div>
            <h3 className="font-bold text-blue-600 mb-1">Focus Areas</h3>
            <div className="space-y-1">
              {["Product Design", "AI", "Sales Technology"].map((area, index) => (
                <p key={index} className="text-sm">
                  • {area}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-blue-600 mb-2">Overview</h3>
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">
              Currently interning at SalesPatriot, a Y Combinator W25 startup focused on AI-powered sales solutions.
            </p>
            <p className="text-sm leading-relaxed">
              Working on product design and development of innovative sales tools and technologies.
            </p>
            <p className="text-sm leading-relaxed">
              Gaining valuable experience in startup culture and cutting-edge AI applications in sales.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
