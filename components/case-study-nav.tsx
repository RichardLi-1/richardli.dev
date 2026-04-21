"use client"
import { useEffect, useState } from "react"

export interface NavSection {
  id: string
  label: string
  children?: NavSection[]
}

interface CaseStudyNavProps {
  sections: NavSection[]
}

// Line widths and label offsets per depth level (0, 1, 2)
const LINE_WIDTHS    = [14, 20, 26] as const
const ACTIVE_WIDTHS  = [20, 28, 34] as const
const HOVERED_WIDTHS = [18, 24, 30] as const
const LABEL_OFFSETS  = [28, 38, 48] as const

function collectAllIds(sections: NavSection[]): string[] {
  return sections.flatMap(s => [s.id, ...collectAllIds(s.children ?? [])])
}

export function CaseStudyNav({ sections }: CaseStudyNavProps) {
  const [activeId, setActiveId]   = useState<string>(sections[0]?.id ?? "")
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    const allIds = collectAllIds(sections)
    const scrollShell = document.querySelector<HTMLElement>(".app-scroll-shell")

    const updateActiveId = () => {
      const shellRect = scrollShell?.getBoundingClientRect()
      const viewportTop = shellRect?.top ?? 0
      const viewportHeight = scrollShell?.clientHeight ?? window.innerHeight
      const viewportCenter = viewportTop + viewportHeight / 2
      const maxScrollTop = scrollShell
        ? scrollShell.scrollHeight - scrollShell.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight
      const currentScrollTop = scrollShell
        ? scrollShell.scrollTop
        : window.scrollY

      const sectionElements = allIds
        .map((id) => {
          const element = document.getElementById(id)
          if (!element) return null
          return { id, element }
        })
        .filter((section): section is { id: string; element: HTMLElement } => section !== null)

      if (sectionElements.length === 0) return

      if (maxScrollTop - currentScrollTop <= 8) {
        setActiveId(sectionElements[sectionElements.length - 1].id)
        return
      }

      let nextActiveId = sectionElements[0].id

      for (const section of sectionElements) {
        const rect = section.element.getBoundingClientRect()
        if (rect.top <= viewportCenter) {
          nextActiveId = section.id
        } else {
          break
        }
      }

      setActiveId(nextActiveId)
    }

    updateActiveId()

    const scheduleUpdate = () => window.requestAnimationFrame(updateActiveId)
    const scrollTarget: Window | HTMLElement = scrollShell ?? window

    scrollTarget.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate)

    return () => {
      scrollTarget.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
    }
  }, [sections])

  function renderSections(items: NavSection[], depth = 0): React.ReactNode {
    return items.map((section, i) => {
      const isActive  = activeId === section.id
      const isHovered = hoveredId === section.id

      let lineW: number
      if (isActive)        lineW = ACTIVE_WIDTHS[depth]
      else if (isHovered)  lineW = HOVERED_WIDTHS[depth]
      else                 lineW = LINE_WIDTHS[depth]

      const labelX    = LABEL_OFFSETS[depth]
      const showLabel = isActive || isHovered

      return (
        <div key={section.id}>
          {i > 0 && (
            <div className="h-2 flex items-center" style={{ paddingLeft: depth * 8 }}>
              <div className="h-px w-3" style={{ background: "var(--text-5)" }} />
            </div>
          )}
          <div
            className="relative flex h-2 items-center cursor-pointer"
            style={{ paddingLeft: depth * 8, paddingRight: 120 }}
            onMouseEnter={() => setHoveredId(section.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            <div
              className="h-px transition-all duration-100"
              style={{
                width: lineW,
                background: isActive ? "var(--text)" : isHovered ? "var(--text-2)" : "var(--text-4)",
              }}
            />
            <span
              className="absolute whitespace-nowrap transition-all duration-100"
              style={{
                left: labelX + depth * 8,
                fontSize: depth === 0 ? 12 : 11,
                color: isActive ? "var(--text)" : "var(--text-3)",
                opacity: showLabel ? 1 : 0,
                transform: showLabel ? "translateX(0)" : "translateX(-4px)",
                pointerEvents: "none",
              }}
            >
              {section.label}
            </span>
          </div>
          {section.children && section.children.length > 0 && (
            <div>{renderSections(section.children, depth + 1)}</div>
          )}
        </div>
      )
    })
  }

  return (
    <div className="fixed left-4 top-52 z-50 hidden md:flex flex-col">
      {renderSections(sections)}
    </div>
  )
}
