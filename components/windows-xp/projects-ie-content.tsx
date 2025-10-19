"use client"
import { useState } from "react"
import { useWindowsXP } from "@/contexts/windows-xp-context"
import { ProjectContentRenderer } from "./project-content-renderer" // Import new content renderer
import { mainProjects } from "../mainProjects" // Fixed import path to use relative path instead of alias

const additionalProjects = [
  {
    id: "markville-rfp",
    title: "RFP: Rebranding the Markville Secondary Plan",
    year: "2024",
    description:
      "City Design Challenge hackathon winner - comprehensive rebranding proposal for Markville Secondary Plan",
    image: "/images/markville-rfp-cover.png",
    tags: ["Design", "Urban Planning", "Hackathon Winner"],
  },
]

export function ProjectsIEContent() {
  const [showAdditional, setShowAdditional] = useState(false)
  const { openWindow } = useWindowsXP()

  const allProjects = showAdditional ? [...mainProjects, ...additionalProjects] : mainProjects

  const openProjectWindow = (project: any) => {
    openWindow({
      title: `${project.title} - Internet Explorer`,
      content: <ProjectDetailContent project={project} />,
      isMinimized: false,
      isMaximized: false,
      position: { x: 250, y: 250 },
      size: { width: 700, height: 500 },
    })
  }

  return (
    <div className="h-full bg-white">
      {/* IE Toolbar */}
      <div className="bg-gradient-to-b from-gray-100 to-gray-200 border-b border-gray-300 p-2">
        <div className="flex items-center space-x-2 text-sm">
          <button className="px-2 py-1 hover:bg-gray-300 rounded">File</button>
          <button className="px-2 py-1 hover:bg-gray-300 rounded">Edit</button>
          <button className="px-2 py-1 hover:bg-gray-300 rounded">View</button>
          <button className="px-2 py-1 hover:bg-gray-300 rounded">Favorites</button>
          <button className="px-2 py-1 hover:bg-gray-300 rounded">Tools</button>
          <button className="px-2 py-1 hover:bg-gray-300 rounded">Help</button>
        </div>
        <div className="flex items-center mt-2 space-x-2">
          <button className="px-3 py-1 bg-gray-200 border border-gray-400 rounded text-sm">Back</button>
          <button className="px-3 py-1 bg-gray-200 border border-gray-400 rounded text-sm">Forward</button>
          <div className="flex-1 bg-white border border-gray-400 px-2 py-1 text-sm">richardli.dev/projects</div>
          <button className="px-3 py-1 bg-gray-200 border border-gray-400 rounded text-sm">Go</button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto h-full bg-white">
        <h1 className="text-2xl font-bold mb-4 text-black">Work</h1>
        <p className="text-gray-600 mb-6">
          A collection of work I've done and projects I've built, from mobile games to non-profit initiatives.
        </p>

        <div className="grid grid-cols-1 gap-4">
          {allProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => openProjectWindow(project)}
              className="border border-gray-300 p-4 hover:bg-gray-50 cursor-pointer rounded"
            >
              <div className="flex items-start space-x-4">
                {project.logo && !project.logo.includes("placeholder.svg") && (
                  <img
                    src={project.logo || "/placeholder.svg"}
                    alt={`${project.title} logo`}
                    className="w-12 h-12 rounded object-contain flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-blue-600 hover:underline">{project.title}</h3>
                    <span className="text-gray-500 text-sm">{project.year}</span>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">{project.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {project.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!showAdditional && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowAdditional(true)}
              className="px-4 py-2 bg-gradient-to-b from-gray-200 to-gray-400 hover:from-gray-100 hover:to-gray-300 border border-gray-500 text-black rounded-sm"
            >
              Load More Work
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ProjectDetailContent({ project }: { project: any }) {
  return (
    <div className="h-full bg-white overflow-hidden">
      {/* IE Toolbar for project detail */}
      <div className="bg-gradient-to-b from-gray-100 to-gray-200 border-b border-gray-300 p-2">
        <div className="flex items-center space-x-2 text-sm">
          <button className="px-2 py-1 hover:bg-gray-300 rounded">File</button>
          <button className="px-2 py-1 hover:bg-gray-300 rounded">Edit</button>
          <button className="px-2 py-1 hover:bg-gray-300 rounded">View</button>
        </div>
        <div className="flex items-center mt-2 space-x-2">
          <button className="px-3 py-1 bg-gray-200 border border-gray-400 rounded text-sm">Back</button>
          <div className="flex-1 bg-white border border-gray-400 px-2 py-1 text-sm">
            richardli.dev/projects/{project.id}
          </div>
        </div>
      </div>

      <div className="h-full" style={{ height: "calc(100% - 80px)" }}>
        <ProjectContentRenderer projectId={project.id} />
      </div>
    </div>
  )
}
