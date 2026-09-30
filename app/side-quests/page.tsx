"use client"
import { useState, useEffect, useRef } from "react"
import Matter from "matter-js" // 2D rigid-body physics — powers the Popup view collisions
import { AnimatedPage } from "@/components/animated-page"
import { AnimatedHeader } from "@/components/animated-header"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"

// ═══════════════════════════════════════════════════════════════════════════
// EDITABLE DATA — all views read from this one shared shape.
// Add / remove / reorder entries here; no need to touch the render code.
// ═══════════════════════════════════════════════════════════════════════════

type SideQuest = {
  title: string
  year: string
  specimen?: string // the big glyph on the left (defaults to "Aa")
  image?: string
  summary?: string
  details?: string[]
  media?: {
    type: "image" | "pdf"
    src: string
    alt?: string
    caption?: string
  }[]
  link?: string // optional external link shown inside the popup
  fontFamily?: string // styles the list specimen/title and popup label
  x: string
  y: string
}

const SIDE_QUESTS: SideQuest[] = [
  {
    title: "Bubble Tea & Retail Management",
    year: "2023",
    summary: "A retail operations side quest around drink workflows, inventory, and everyday storefront management.",
    details: [
      "Mapped the moving parts of a small bubble tea shop: ordering, modifiers, stock checks, and staff-facing routines.",
      "Useful for collecting notes, screenshots, PDFs, or process docs in one place as the project grows.",
    ],
    image: "/placeholder.jpg",
    media: [
      {
        type: "image",
        src: "/placeholder.jpg",
        alt: "Placeholder preview for Bubble Tea & Retail Management",
        caption: "Swap this for a storefront shot, dashboard screenshot, or scanned sketch.",
      },
    ],
    x: "34%",
    y: "24%",
  },
  {
    title: "Weather Reports",
    year: "2018",
    summary: "A smaller archive of weather-report experiments and presentation formats.",
    details: [
      "Good candidate for old forecast graphics, exported images, or a PDF writeup.",
      "The popup supports mixed media, so this entry can hold several images and documents later.",
    ],
    image: "/images/thumbnails/road-snapping.jpg",
    media: [
      {
        type: "image",
        src: "/images/thumbnails/road-snapping.jpg",
        alt: "Placeholder visual for Weather Reports",
        caption: "Example image slot.",
      },
    ],
    x: "52%",
    y: "58%",
  },
]

// The three switchable views
const VIEW_OPTIONS = [
  { id: "list", label: "List View" },
  { id: "grid", label: "Grid View" },
  { id: "popup", label: "Popup View" },
] as const
type ViewId = (typeof VIEW_OPTIONS)[number]["id"]

// ═══════════════════════════════════════════════════════════════════════════
// Popup view — physics canvas
// ═══════════════════════════════════════════════════════════════════════════
// Each label is mirrored by a matter-js rectangle body. The engine simulates
// drag, collisions, and wall bounces; a requestAnimationFrame loop copies each
// body's position + rotation back onto its DOM element as a CSS transform.
// We move DOM nodes directly (instead of setState) so React doesn't re-render
// 60 times per second.
function PopupPhysicsCanvas({
  items,
  onOpen,
}: {
  items: SideQuest[]
  onOpen: (index: number) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const labelRefs = useRef<(HTMLDivElement | null)[]>([])
  // Where the pointer went down — used to tell a click from a drag
  const downPos = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    // 📖 Learn: matter-js Engine — steps the physics world; gravity.y = 0 makes
    // labels float where you leave them (set to 1 and they'd fall to the floor)
    const engine = Matter.Engine.create()
    engine.gravity.y = 0

    // One rectangle body per label, sized from the real rendered element so
    // long labels like "Helvetica (NYC Subway)" collide along their full width
    const bodies = items.map((item, i) => {
      const el = labelRefs.current[i]
      const w = el?.offsetWidth ?? 100
      const h = el?.offsetHeight ?? 28
      // Convert the percentage start position (top-left) to a body center
      const cx = (parseFloat(item.x) / 100) * width + w / 2
      const cy = (parseFloat(item.y) / 100) * height + h / 2
      return Matter.Bodies.rectangle(cx, cy, w, h, {
        restitution: 0.9, // bounciness on impact
        frictionAir: 0.04, // air drag so thrown labels glide to a stop
      })
    })

    // Four static walls just outside the canvas edges keep labels inside.
    // Extra thickness stops fast throws from tunnelling through.
    const t = 100
    const wall = { isStatic: true }
    const walls = [
      Matter.Bodies.rectangle(width / 2, -t / 2, width + t * 2, t, wall), // top
      Matter.Bodies.rectangle(width / 2, height + t / 2, width + t * 2, t, wall), // bottom
      Matter.Bodies.rectangle(-t / 2, height / 2, t, height + t * 2, wall), // left
      Matter.Bodies.rectangle(width + t / 2, height / 2, t, height + t * 2, wall), // right
    ]

    // 📖 Learn: Matter.MouseConstraint — a spring between the pointer and the
    // grabbed body. Dragging fast and letting go transfers momentum = throwing.
    const mouse = Matter.Mouse.create(container)
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2 },
    })
    // matter-js grabs the wheel event for its own renderer's zoom, which would
    // block normal page scrolling over the canvas — give the wheel back
    mouse.element.removeEventListener("wheel", (mouse as unknown as { mousewheel: EventListener }).mousewheel)

    Matter.Composite.add(engine.world, [...bodies, ...walls, mouseConstraint])

    // Labels were laid out with percentage left/top for the first paint;
    // from here on the physics loop owns their position via transform
    labelRefs.current.forEach((el) => {
      if (el) {
        el.style.left = "0px"
        el.style.top = "0px"
      }
    })

    // Single loop: step the simulation, then write transforms to the DOM
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      // Cap the timestep so a background tab doesn't explode the simulation
      Matter.Engine.update(engine, Math.min(now - last, 33))
      last = now
      bodies.forEach((b, i) => {
        const el = labelRefs.current[i]
        if (!el) return
        el.style.transform = `translate(${b.position.x - el.offsetWidth / 2}px, ${
          b.position.y - el.offsetHeight / 2
        }px) rotate(${b.angle}rad)`
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      Matter.Composite.clear(engine.world, false)
      Matter.Engine.clear(engine)
      // Mouse listeners die with the container element on unmount
    }
  }, [items])

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        height: 340,
        maxWidth: 700,
        border: "1px solid var(--border-2)",
        borderRadius: 16,
        overflow: "hidden",
        // 📖 Learn: touch-action: none — lets touch drags reach the physics
        // engine instead of scrolling the page
        touchAction: "none",
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          ref={(el) => { labelRefs.current[i] = el }}
          // Click (pointer barely moved) opens the popup; a real drag doesn't
          onPointerDown={(e) => { downPos.current = { x: e.clientX, y: e.clientY } }}
          onPointerUp={(e) => {
            const d = downPos.current
            if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6) onOpen(i)
            downPos.current = null
          }}
          style={{
            position: "absolute",
            left: item.x, // percentage start position, replaced once physics takes over
            top: item.y,
            padding: "4px 8px",
            fontFamily: item.fontFamily || "inherit",
            fontSize: 15,
            color: "var(--text-2)",
            whiteSpace: "nowrap",
            cursor: "grab",
            userSelect: "none",
            willChange: "transform",
          }}
        >
          {item.title}
        </div>
      ))}

      {/* Hint in the corner */}
      <p
        style={{
          position: "absolute",
          bottom: 10,
          right: 14,
          fontFamily: "'Toronto Subway', sans-serif",
          fontSize: 10,
          letterSpacing: "0.06em",
          color: "var(--text-5)",
          margin: 0,
          pointerEvents: "none",
        }}
      >
        drag &amp; throw
      </p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════════════════

export default function SideQuestsPage() {
  usePageViewTracker()

  const [view, setView] = useState<ViewId>("list")
  // Which popup item is open (index into SIDE_QUESTS), or null when closed
  const [openPopup, setOpenPopup] = useState<number | null>(null)

  // 📖 Learn: keydown listener + cleanup — same Escape-to-close pattern as PhotoModal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPopup(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const openItem = openPopup !== null ? SIDE_QUESTS[openPopup] : null

  return (
    <AnimatedPage>
      <div className="page-bg min-h-screen">
        <AnimatedHeader currentPage="/side-quests" />

        {/* Same centered column pattern as the about page */}
        <div className="md:px-[17px]" style={{ maxWidth: 1000, width: "100%", margin: "0 auto" }}>

          {/* ── Hero ── */}
          <section style={{ padding: "80px var(--page-gutter) 0" }}>
            {/* h1 gets SFCamera globally via globals.css */}
            <h1
              style={{
                fontSize: "clamp(44px, 6vw, 64px)",
                fontWeight: "normal",
                lineHeight: 1.05,
                color: "var(--text)",
                margin: 0,
              }}
            >
              Side Quests
            </h1>
            <p
              style={{
                fontFamily: "'SFCamera', sans-serif",
                fontSize: 17,
                lineHeight: 1.6,
                color: "var(--text-2)",
                margin: "20px 0 0",
              }}
            >
              Exploring and obsessing since 2006.
            </p>
          </section>

          {/* ── View switcher ── one view renders at a time */}
          <div style={{ display: "flex", gap: 6, padding: "40px var(--page-gutter) 0" }}>
            {VIEW_OPTIONS.map((opt) => {
              const active = view === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setView(opt.id)}
                  style={{
                    fontFamily: "'Toronto Subway', sans-serif",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    padding: "7px 14px",
                    borderRadius: 999,
                    cursor: "pointer",
                    // Active pill = card surface; inactive = ghost
                    background: active ? "var(--card-bg)" : "transparent",
                    border: `1px solid ${active ? "var(--border-2)" : "transparent"}`,
                    color: active ? "var(--text)" : "var(--text-4)",
                    transition: "color 0.2s ease, background 0.2s ease",
                  }}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>

          {/* ── List view ── */}
          {view === "list" && (
            <section style={{ padding: "28px var(--page-gutter) 120px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 700 }}>
                {SIDE_QUESTS.map((p, i) => {
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setOpenPopup(i)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 24,
                        width: "100%",
                        padding: "18px 24px",
                        background: "var(--card-bg)",
                        border: "1px solid var(--border-2)",
                        borderRadius: 12,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      {/* Type specimen — rendered in the entry's own font */}
                      <span
                        aria-hidden
                        style={{
                          fontFamily: p.fontFamily || "inherit",
                          fontSize: 44,
                          lineHeight: 1,
                          color: "var(--text)",
                          flexShrink: 0,
                        }}
                      >
                        {p.specimen || "Aa"}
                      </span>

                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <p
                          style={{
                            fontFamily: p.fontFamily || "inherit",
                            fontSize: "clamp(18px, 2.5vw, 24px)",
                            color: "var(--text)",
                            margin: 0,
                          }}
                        >
                          {p.title}
                        </p>
                        <p
                          style={{
                            fontFamily: "'Toronto Subway', sans-serif",
                            fontSize: 12,
                            color: "var(--text-4)",
                            letterSpacing: "0.05em",
                            margin: 0,
                          }}
                        >
                          {p.year}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Grid view ── */}
          {view === "grid" && (
            <section style={{ padding: "28px var(--page-gutter) 120px" }}>
              {/* flex-wrap so tiles flow onto new rows naturally on any viewport */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, maxWidth: 700 }}>
                {SIDE_QUESTS.map((p, i) => {
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setOpenPopup(i)}
                      title={p.title}
                      style={{
                        width: 128,
                        aspectRatio: "1 / 1",
                        background: "var(--card-bg)",
                        border: "1px solid var(--border-2)",
                        borderRadius: 8,
                        overflow: "hidden",
                        padding: 0,
                        cursor: "pointer",
                      }}
                    >
                      {p.image && (
                        <img
                          src={p.image}
                          alt={p.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Popup view ── physics playground */}
          {view === "popup" && (
            <section style={{ padding: "28px var(--page-gutter) 120px" }}>
              <PopupPhysicsCanvas items={SIDE_QUESTS} onOpen={setOpenPopup} />
            </section>
          )}
        </div>

        {/* ── Popup card ── clicking (not dragging) a Popup view label opens this */}
        {openItem && (
          // Backdrop — clicking anywhere outside the card closes it
          <div
            onClick={() => setOpenPopup(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              background: "rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            {/* 📖 Learn: e.stopPropagation() — keeps clicks inside the card from
                bubbling to the backdrop's onClick and closing the popup */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border-2)",
                borderRadius: 16,
                padding: "28px 30px",
                maxHeight: "82vh",
                maxWidth: 760,
                overflow: "auto",
                width: "100%",
              }}
            >
              {openItem.image && (
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    border: "1px solid var(--border-2)",
                    borderRadius: 10,
                    overflow: "hidden",
                    marginBottom: 22,
                    background: "var(--bg)",
                  }}
                >
                  <img
                    src={openItem.image}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              )}

              <p
                style={{
                  fontFamily: openItem.fontFamily || "inherit",
                  fontSize: 28,
                  color: "var(--text)",
                  margin: 0,
                }}
              >
                {openItem.title}
              </p>
              <p
                style={{
                  fontFamily: "'Toronto Subway', sans-serif",
                  fontSize: 12,
                  letterSpacing: "0.05em",
                  color: "var(--text-4)",
                  margin: "8px 0 0",
                }}
              >
                {openItem.year}
              </p>

              {openItem.summary && (
                <p
                  style={{
                    fontFamily: "'SFCamera', sans-serif",
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "var(--text-2)",
                    margin: "18px 0 0",
                  }}
                >
                  {openItem.summary}
                </p>
              )}

              {openItem.details?.map((detail, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: "'SFCamera', sans-serif",
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: "var(--text-3)",
                    margin: "12px 0 0",
                  }}
                >
                  {detail}
                </p>
              ))}

              {openItem.media && openItem.media.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 22 }}>
                  {openItem.media.map((media, i) => (
                    <figure key={`${media.src}-${i}`} style={{ margin: 0 }}>
                      <div
                        style={{
                          border: "1px solid var(--border-2)",
                          borderRadius: 10,
                          overflow: "hidden",
                          background: "var(--bg)",
                        }}
                      >
                        {media.type === "image" ? (
                          <img
                            src={media.src}
                            alt={media.alt || ""}
                            style={{ display: "block", width: "100%", maxHeight: 420, objectFit: "cover" }}
                          />
                        ) : (
                          <iframe
                            src={media.src}
                            title={media.alt || `${openItem.title} PDF`}
                            style={{ display: "block", width: "100%", height: 520, border: 0 }}
                          />
                        )}
                      </div>
                      {media.caption && (
                        <figcaption
                          style={{
                            fontFamily: "'Toronto Subway', sans-serif",
                            fontSize: 10,
                            letterSpacing: "0.05em",
                            color: "var(--text-5)",
                            marginTop: 8,
                          }}
                        >
                          {media.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              )}

              {openItem.link && (
                <a
                  href={openItem.link}
                  style={{
                    display: "inline-flex",
                    marginTop: 22,
                    fontFamily: "'Toronto Subway', sans-serif",
                    fontSize: 11,
                    letterSpacing: "0.05em",
                    color: "var(--text)",
                  }}
                >
                  open project link
                </a>
              )}

              <p
                style={{
                  fontFamily: "'Toronto Subway', sans-serif",
                  fontSize: 11,
                  letterSpacing: "0.05em",
                  color: "var(--text-4)",
                  margin: "20px 0 0",
                }}
              >
                esc or click outside to close
              </p>
            </div>
          </div>
        )}
      </div>
    </AnimatedPage>
  )
}
