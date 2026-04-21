import type { ReactNode } from "react"

interface ProjectContent {
  title: string
  year: string
  description: string
  image?: string
  logo?: string
  timeline?: string
  tools?: string[]
  stats?: string[]
  overview?: string[]
  links?: { href: string; text: string; external?: boolean }[]
  sections?: { title: string; content: ReactNode }[]
}

const projectsData: Record<string, ProjectContent> = {
  boink: {
    title: "Bo!nk",
    year: "2021",
    description: "A Windows Vista-inspired inkball game published on the App Store",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-OFGQDkrP2BvNmhLieOxExwEZBsCGcq.png",
    logo: "/images/projects/boink/logo.webp",
    timeline: "6 months, 2021",
    tools: ["Unity", "C#", "ShaderLab", "HLSL", "App Store Connect"],
    stats: ["150+ Downloads", "4.6 Star Rating"],
    overview: [
      "Bo!nk is a Windows Vista-inspired inkball game that I conceptualized and designed. As the lead UX designer, I worked with a team to bring this nostalgic game to the App Store.",
      "The game features classic inkball mechanics with a nostalgic Windows Vista aesthetic, bringing back memories of the beloved Microsoft game.",
      "This project taught me valuable lessons about game development, user interface design, and the App Store submission process.",
    ],
    links: [
      { href: "https://apps.apple.com/ca/app/bo-nk/id1570376501", text: "App Store", external: true },
      { href: "https://github.com/MarkvilleDev/Boink", text: "GitHub", external: true },
    ],
  },
  futureforward: {
    title: "Future Forward",
    year: "2024-2025",
    description: "Non-profit focusing on helping students discover their vocations",
    image: "/images/projects/future-forward/workshop-hero.jpeg",
    logo: "/images/projects/future-forward/logo.png",
    timeline: "Ongoing, 2024-2025",
    tools: ["Next.js", "React", "Tailwind CSS", "YouTube API"],
    overview: [
      "Future Forward is a non-profit initiative focused on helping students discover their vocations and career paths.",
      "We provide resources, mentorship, and guidance to help young people make informed decisions about their future.",
      "The organization emphasizes practical experience and real-world connections to bridge the gap between education and career.",
    ],
    links: [
      { href: "https://www.futureforward.info", text: "Website", external: true },
      { href: "https://www.youtube.com/@FutureForward.Initiative", text: "YouTube Channel", external: true },
    ],
  },
  yrhacks: {
    title: "YRHacks",
    year: "2024-2025",
    description: "Helped organize Canada's largest high school hackathon",
    image: "/images/projects/yrhacks/crowd.jpeg",
    logo: "/images/projects/yrhacks/logo.png",
    timeline: "Annual event, 2024-2025",
    tools: ["Event Management", "Community Building", "Logistics"],
    stats: ["500+ Participants", "Canada's Largest High School Hackathon"],
    overview: [
      "YRHacks is Canada's largest high school hackathon, bringing together hundreds of students to build innovative projects.",
      "I helped organize this massive event, handling logistics, community building, and ensuring a smooth experience for all participants.",
      "The hackathon provides a platform for young developers to showcase their skills and connect with like-minded peers.",
    ],
  },
  cec: {
    title: "Career Education Council",
    year: "2024-2025",
    description: "Educational initiative for career development",
    logo: "/images/projects/cec/logo.webp",
    timeline: "Ongoing, 2024-2025",
    tools: ["Education", "Career Development", "Mentorship"],
    overview: [
      "The Career Education Council is an educational initiative focused on career development and guidance.",
      "We work to provide students with practical career advice and real-world insights into various industries.",
      "The program emphasizes hands-on learning and direct connections with industry professionals.",
    ],
  },
  "markville-rfp": {
    title: "RFP: Rebranding the Markville Secondary Plan",
    year: "2024",
    description: "City Design Challenge hackathon winner - comprehensive rebranding proposal",
    image: "/images/markville-rfp-cover.png",
    timeline: "Hackathon project, 2024",
    tools: ["Urban Planning", "Design", "Research", "Presentation"],
    stats: ["Hackathon Winner", "Judged by Reid McAlpine"],
    overview: [
      "A comprehensive rebranding proposal for the Markville Secondary Plan that won the City Design Challenge hackathon.",
      "The project involved extensive research, community analysis, and innovative urban planning solutions.",
      "Judged by Reid McAlpine, Councillor - Ward 3 Unionville at City of Markham, making it also a form of advocacy.",
    ],
    links: [
      {
        href: "https://drive.google.com/file/d/1MNG2sU7dm8WwcadvKp_FIT0mVTRGYa7f/view?usp=sharing",
        text: "View Document",
        external: true,
      },
      {
        href: "https://devpost.com/software/rebranding-the-markville-secondary-plan-with-tod",
        text: "Devpost",
        external: true,
      },
    ],
  },
  salespatriot: {
    title: "SalesPatriot (YC W25)",
    year: "2025",
    description: "Internship at Y Combinator startup focusing on AI-powered sales solutions",
    timeline: "Current, 2025",
    tools: ["Product Design", "AI", "Sales Technology"],
    overview: [
      "Currently interning at SalesPatriot, a Y Combinator W25 startup focused on AI-powered sales solutions.",
      "Working on product design and development of innovative sales tools and technologies.",
      "Gaining valuable experience in startup culture and cutting-edge AI applications in sales.",
    ],
  },
}

export function ProjectContentExtractor({ projectSlug }: { projectSlug: string }) {
  const project = projectsData[projectSlug]

  if (!project) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
        <p>The project "{projectSlug}" could not be found.</p>
      </div>
    )
  }

  return (
    <div className="p-4 h-full overflow-auto bg-white text-black">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          {project.logo && (
            <img
              src={project.logo || "/placeholder.svg"}
              alt={`${project.title} logo`}
              className="w-8 h-8 object-contain"
            />
          )}
          <h1 className="text-2xl font-bold">{project.title}</h1>
        </div>
        <p className="text-gray-600">
          {project.description} • {project.year}
        </p>
      </div>

      {/* Main Image */}
      {project.image && (
        <div className="mb-6">
          <img
            src={project.image || "/placeholder.svg"}
            alt={project.title}
            className="w-full max-h-64 object-cover rounded border"
          />
        </div>
      )}

      {/* Project Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          {project.timeline && (
            <div>
              <h3 className="font-bold text-blue-600 mb-1">Timeline</h3>
              <p className="text-sm">{project.timeline}</p>
            </div>
          )}

          {project.tools && (
            <div>
              <h3 className="font-bold text-blue-600 mb-1">Tools & Technologies</h3>
              <div className="space-y-1">
                {project.tools.map((tool, index) => (
                  <p key={index} className="text-sm">
                    • {tool}
                  </p>
                ))}
              </div>
            </div>
          )}

          {project.stats && (
            <div>
              <h3 className="font-bold text-blue-600 mb-1">Key Stats</h3>
              <div className="space-y-1">
                {project.stats.map((stat, index) => (
                  <p key={index} className="text-sm">
                    • {stat}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-bold text-blue-600 mb-2">Overview</h3>
          <div className="space-y-3">
            {project.overview?.map((paragraph, index) => (
              <p key={index} className="text-sm leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Links */}
      {project.links && (
        <div className="border-t pt-4">
          <h3 className="font-bold text-blue-600 mb-2">Links</h3>
          <div className="flex flex-wrap gap-2">
            {project.links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target={link.external ? "_blank" : "_self"}
                rel={link.external ? "noopener noreferrer" : ""}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 transition-colors"
              >
                {link.text} {link.external && "↗"}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
