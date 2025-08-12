"use client"
import { useEffect, useState } from "react"
import { useWindowsXP } from "@/contexts/windows-xp-context"
import { Taskbar } from "./taskbar"
import { StartMenu } from "./start-menu"
import { WindowXPWindow } from "./window"
import { DesktopIcon } from "./desktop-icon"

export function WindowsXPDesktop() {
  const { windows, openWindow, isStartMenuOpen } = useWindowsXP()
  const [showWhyXP, setShowWhyXP] = useState(false)

  useEffect(() => {
    // Open "About Me" window by default
    openWindow({
      title: "About Me - Richard Li",
      content: <AboutMeContent />,
      isMinimized: false,
      isMaximized: false,
      position: { x: 100, y: 100 },
      size: { width: 600, height: 400 },
    })

    const timer = setTimeout(() => {
      // Play Windows XP error sound
      const audio = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Windows%20XP%20Error-8o0fMisJfb1IUupzn1eg9cQWGg7uGA.mp3")
      audio.play().catch(console.error)

      setShowWhyXP(true)
      openWindow({
        title: "Why Windows XP?",
        content: <WhyWindowsXPContent />,
        isMinimized: false,
        isMaximized: false,
        position: { x: 750, y: 150 },
        size: { width: 400, height: 300 },
      })
    }, 7000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(/images/windows-xp-wallpaper-wide.jpeg)" }}
    >
      {/* Desktop Icons */}
      <div className="absolute top-4 left-4 space-y-4">
        <DesktopIcon
          icon="🏠"
          label="About Me"
          onDoubleClick={() =>
            openWindow({
              title: "About Me - Richard Li",
              content: <AboutMeContent />,
              isMinimized: false,
              isMaximized: false,
              position: { x: 150, y: 150 },
              size: { width: 600, height: 400 },
            })
          }
        />
        <DesktopIcon
          icon={<img src="/images/internet-explorer-icon.png" alt="IE" className="w-8 h-8" />}
          label="Projects - Internet Explorer"
          onDoubleClick={() =>
            openWindow({
              title: "Projects - Internet Explorer",
              content: <InternetExplorerContent />,
              isMinimized: false,
              isMaximized: false,
              position: { x: 200, y: 200 },
              size: { width: 800, height: 600 },
            })
          }
        />
        <DesktopIcon
          icon="📁"
          label="My Computer"
          onDoubleClick={() =>
            openWindow({
              title: "My Computer",
              content: <div className="p-4">My Computer - Coming Soon!</div>,
              isMinimized: false,
              isMaximized: false,
              position: { x: 250, y: 250 },
              size: { width: 500, height: 350 },
            })
          }
        />
        {showWhyXP && (
          <DesktopIcon
            icon="❓"
            label="Why Windows XP?"
            onDoubleClick={() =>
              openWindow({
                title: "Why Windows XP?",
                content: <WhyWindowsXPContent />,
                isMinimized: false,
                isMaximized: false,
                position: { x: 300, y: 300 },
                size: { width: 400, height: 300 },
              })
            }
          />
        )}
      </div>

      {/* Windows */}
      {windows.map((window) => (
        <WindowXPWindow key={window.id} window={window} />
      ))}

      {/* Start Menu */}
      {isStartMenuOpen && <StartMenu />}

      {/* Taskbar */}
      <Taskbar />
    </div>
  )
}

function AboutMeContent() {
  return (
    <div className="p-4 h-full overflow-auto bg-white">
      <h2 className="text-xl font-bold mb-4 text-black">About Richard Li</h2>
      <div className="space-y-3 text-black text-sm">
        <p>Hey, I'm Richard! I'm 18, based in Toronto.</p>
        <p>I'm interested in public transportation, AI, design, and front-end development.</p>

        <h3 className="font-bold mt-4">Currently:</h3>
        <ul className="list-disc ml-4 space-y-1">
          <li>Incoming Systems Design Engineering student at University of Waterloo</li>
          <li>Interning at a YC-backed SaaS startup, analyzing AI trends and working on product design</li>
        </ul>

        <h3 className="font-bold mt-4">Previously:</h3>
        <ul className="list-disc ml-4 space-y-1">
          <li>Helped organize YRHacks, Canada's largest high school hackathon</li>
          <li>Tutored a second year university student Python and CS principles</li>
          <li>Conceptualized and designed Bo!nk, a Windows Vista-inspired inkball game</li>
        </ul>

        <h3 className="font-bold mt-4">Contact:</h3>
        <p>
          Email:{" "}
          <a href="mailto:richardli0@outlook.com" className="text-blue-600 underline hover:text-blue-800">
            richardli0@outlook.com
          </a>
        </p>
        <p>
          LinkedIn:{" "}
          <a
            href="https://www.linkedin.com/in/richardli0"
            className="text-blue-600 underline hover:text-blue-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            linkedin.com/in/richardli0
          </a>
        </p>
      </div>
    </div>
  )
}

function InternetExplorerContent() {
  const { openWindow } = useWindowsXP()

  const handleProjectClick = (projectSlug: string, title: string) => {
    openWindow({
      title: `${title} - Internet Explorer`,
      content: <ProjectDetailContent projectSlug={projectSlug} title={title} />,
      isMinimized: false,
      isMaximized: false,
      position: { x: 300, y: 150 },
      size: { width: 700, height: 500 },
    })
  }

  return (
    <div className="h-full bg-white">
      {/* IE Toolbar */}
      <div className="bg-gray-100 border-b border-gray-300 p-2">
        <div className="flex items-center space-x-2 text-sm">
          <button className="px-2 py-1 bg-gray-200 border border-gray-400 text-black">Back</button>
          <button className="px-2 py-1 bg-gray-200 border border-gray-400 text-black">Forward</button>
          <button className="px-2 py-1 bg-gray-200 border border-gray-400 text-black">Stop</button>
          <button className="px-2 py-1 bg-gray-200 border border-gray-400 text-black">Refresh</button>
          <div className="flex-1 mx-2">
            <input
              type="text"
              value="http://richardli.dev/projects"
              readOnly
              className="w-full px-2 py-1 border border-gray-400 text-black"
            />
          </div>
          <button className="px-2 py-1 bg-gray-200 border border-gray-400 text-black">Go</button>
        </div>
      </div>

      {/* Projects Content */}
      <div className="p-4 h-full overflow-auto bg-white">
        <h1 className="text-2xl font-bold mb-6 text-black">My Projects</h1>

        <div className="grid gap-6">
          <ProjectCard
            title="Bo!nk"
            description="A Windows Vista-inspired inkball game published on the App Store"
            tags={["Swift", "iOS", "Game Development"]}
            onClick={() => handleProjectClick("boink", "Bo!nk")}
          />
          <ProjectCard
            title="YRHacks"
            description="Canada's largest high school hackathon"
            tags={["Event Organization", "Community"]}
            onClick={() => handleProjectClick("yrhacks", "YRHacks")}
          />
          <ProjectCard
            title="Future Forward"
            description="Non-profit focusing on helping students discover their vocations"
            tags={["Non-profit", "Education"]}
            onClick={() => handleProjectClick("futureforward", "Future Forward")}
          />
          <ProjectCard
            title="Career Education Council"
            description="Educational initiative for career development"
            tags={["Education", "Career Development"]}
            onClick={() => handleProjectClick("cec", "Career Education Council")}
          />
          <ProjectCard
            title="RFP: Rebranding the Markville Secondary Plan"
            description="Urban planning project that won a City Design Challenge hackathon"
            tags={["Urban Planning", "Design", "Hackathon Winner"]}
            onClick={() => handleProjectClick("markville-rfp", "RFP: Rebranding the Markville Secondary Plan")}
          />
        </div>
      </div>
    </div>
  )
}

function ProjectCard({
  title,
  description,
  tags,
  onClick,
}: {
  title: string
  description: string
  tags: string[]
  onClick: () => void
}) {
  return (
    <div
      className="border border-gray-300 p-4 bg-gray-50 cursor-pointer hover:bg-blue-50 transition-colors"
      onClick={onClick}
    >
      <h3 className="font-bold text-lg text-black mb-2">{title}</h3>
      <p className="text-gray-700 mb-3">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function ProjectDetailContent({ projectSlug, title }: { projectSlug: string; title: string }) {
  return (
    <div className="p-4 h-full overflow-auto bg-white">
      <h2 className="text-xl font-bold mb-4 text-black">{title}</h2>
      <div className="text-black">
        <p className="mb-4">Loading project details for {title}...</p>
        <p className="text-sm text-gray-600">
          This would normally load the full project page content from /{projectSlug}
        </p>
      </div>
    </div>
  )
}

// Added new "Why Windows XP?" window component
function WhyWindowsXPContent() {
  return (
    <div className="p-4 h-full overflow-auto bg-white">
      <h2 className="text-lg font-bold mb-4 text-black">Why Windows XP?</h2>
      <div className="space-y-3 text-black text-sm">
        <p>
          As a kid, one of my major hobbies was experimenting with virtual machines and installing different operating
          systems like Windows XP, Vista, and various Linux distributions.
        </p>
        <p>
          I spent countless hours exploring different desktop environments, customizing themes, and understanding how
          user interfaces worked. This early fascination with operating systems and their design languages—from the
          skeumorphic elements of early Windows to the glossy, translucent aesthetics of Frutiger Aero—is what initially
          sparked my deep interest in UI/UX design.
        </p>
        <p>
          Windows XP, with its distinctive visual style and intuitive interface, holds a special place in that journey.
          Recreating it here is both a nostalgic tribute and a demonstration of how those early experiences shaped my
          design sensibilities.
        </p>
        <p>
          To leave, open the start menu and log out or shut down.
        </p>
        <p>
          I hope you enjoy your stay.
        </p>
      </div>
    </div>
  )
}
