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

// Opening animation: every label flashes open as a full list, holds, then the
// list collapses back to the usual ticks (only the current section labelled).
const ROW_HEIGHT       = 8   // a normal tick row (h-2)
const INTRO_ROW_HEIGHT = 20  // rows grow to this while every label is showing
const INTRO_START_MS   = 200 // let the page settle in first
const INTRO_STAGGER_MS = 30  // each row opens this long after the one above
const INTRO_HOLD_MS    = 700 // how long the full list stays open
const INTRO_EASE       = "cubic-bezier(0.2, 0.8, 0.2, 1)" // fast start, soft landing

function collectAllIds(sections: NavSection[]): string[] {
  return sections.flatMap(s => [s.id, ...collectAllIds(s.children ?? [])])
}

export function CaseStudyNav({ sections }: CaseStudyNavProps) {
  const [activeId, setActiveId]   = useState<string>(sections[0]?.id ?? "")
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  // "before" → "open" (all labels showing) → "closing" → "done" (normal nav)
  const [intro, setIntro] = useState<"before" | "open" | "closing" | "done">("before")

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIntro("done")
      return
    }
    const rowCount = collectAllIds(sections).length
    const openFor = rowCount * INTRO_STAGGER_MS + INTRO_HOLD_MS
    const closeFor = rowCount * INTRO_STAGGER_MS + 450
    const timers = [
      setTimeout(() => setIntro("open"), INTRO_START_MS),
      setTimeout(() => setIntro("closing"), INTRO_START_MS + openFor),
      setTimeout(() => setIntro("done"), INTRO_START_MS + openFor + closeFor),
    ]
    return () => timers.forEach(clearTimeout)
  }, [sections])

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

  // Rows are numbered top to bottom across all depths, for the intro's cascade
  const rowCount = collectAllIds(sections).length
  let rowIndex = 0

  function renderSections(items: NavSection[], depth = 0): React.ReactNode {
    return items.map((section, i) => {
      const isActive  = activeId === section.id
      const isHovered = hoveredId === section.id
      const isOpen    = intro === "open" // the intro's "every label showing" moment
      const inIntro   = intro !== "done"

      let lineW: number
      if (isActive)              lineW = ACTIVE_WIDTHS[depth]
      else if (isHovered || isOpen) lineW = HOVERED_WIDTHS[depth]
      else                       lineW = LINE_WIDTHS[depth]

      const labelX    = LABEL_OFFSETS[depth]
      const showLabel = isActive || isHovered || isOpen

      // Intro timing: open top → bottom, close bottom → top
      const row = rowIndex++
      const delay = intro === "open" ? row * INTRO_STAGGER_MS : (rowCount - 1 - row) * INTRO_STAGGER_MS
      const introTransition = (props: string[], ms: number) =>
        props.map((prop) => `${prop} ${ms}ms ${INTRO_EASE} ${delay}ms`).join(", ")

      return (
        <div key={section.id}>
          {i > 0 && (
            // Spacer dash between rows; folds away while the full list is open
            <div
              className="flex items-center overflow-hidden"
              style={{
                paddingLeft: depth * 8,
                height: isOpen ? 0 : ROW_HEIGHT,
                opacity: isOpen ? 0 : 1,
                transition: inIntro ? introTransition(["height", "opacity"], 380) : undefined,
              }}
            >
              <div className="h-px w-3" style={{ background: "var(--text-5)" }} />
            </div>
          )}
          <div
            className="relative flex items-center cursor-pointer"
            style={{
              paddingLeft: depth * 8,
              paddingRight: 120,
              height: isOpen ? INTRO_ROW_HEIGHT : ROW_HEIGHT,
              transition: inIntro ? introTransition(["height"], 380) : undefined,
            }}
            onMouseEnter={() => setHoveredId(section.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            <div
              className="h-px transition-all duration-100"
              style={{
                width: lineW,
                background: isActive ? "var(--text)" : isHovered || isOpen ? "var(--text-2)" : "var(--text-4)",
                transition: inIntro ? introTransition(["width", "background-color"], 380) : undefined,
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
                // During the intro labels slide in further and slower, one after another
                ...(inIntro && {
                  transform: showLabel ? "translateX(0)" : "translateX(-10px)",
                  transition: introTransition(["opacity", "transform", "color"], 320),
                }),
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
