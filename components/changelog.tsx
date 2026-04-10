"use client"
import { useEffect, useState, useRef } from "react"
import { createPortal } from "react-dom"
import { X, ChevronDown, Info } from "lucide-react"

interface ChangeItem {
  text: string
  badge?: string
}

interface ChangelogEntry {
  date: string
  media?: { type: "image" | "video"; src: string; alt?: string }
  changes: (string | ChangeItem)[]
}

export const entries: ChangelogEntry[] = [
  {
    date: "04/10/2026 - v2.3.0",
    media: { type: "video", src: "/videos/2.3.0 changes.mp4", alt: "v2.3.0 feature showcase" },
    changes: [
      "Border radii unified to 40px with squircle corner shape across all project cards and media",
      { text: "AI chat: follow-up question chip appears after every response", badge: "New" },
      { text: "AI chat: proactive link cards — Claude now drops cards for anything mentionable", badge: "New" },
      "AI chat: Apple Music iframe no longer reloads mid-response (React.memo on MessageItem)",
      "AI chat: sound panel built with mute toggle and site-sound previews (hidden for now)",
      "Ask Richard button now toggles the chat window closed too",
    ],
  },
  {
    date: "04/06/2026 - v2.2.1",
    changes: [
      "Renamed /projects → /work and /more → /about across all routes and sitemap",
      "Added inline code comments across the entire codebase for readability",
      "Some API calls moved server-side via new /api/track route — URL no longer exposed in browser bundle",
      "About page layout refactored from absolute positioning to CSS grid",
      "Light high contrast mode — HC button now adapts to current theme (white bg + black text in light mode, yellow focus rings swap to blue)",
    ],
  },
  {
    date: "04/05/2026 - v2.2.0",
    changes: [
      { text: "Targeting Lighthouse performance score", badge: "Ongoing" },
      "Removed render-blocking Google Fonts — all fonts now load from local @font-face",
      "Added preload hints for Toronto Subway and SFCamera to break font dependency chain",
      "fetchPriority=\"high\" on loading GIF to improve LCP",
      "Navigation sound — windows-navigation-start.mp3 plays on route change",
      "About page redesign — two-column layout with bio, Things I love sticker grid, portrait, and Experiences",
      "About page collapses to single column on mobile",
      "Transit Fanning — per-card colorful shimmer skeletons, featured card hero, upgraded photo modal with full metadata",
      "High contrast mode header fix — inline styles now respond correctly to hc toggle",
      "Accessibility: aria-label on icon-only nav links",
      "Shimmer gradient direction changed to horizontal",
    ],
  },
  {
    date: "03/30/2026 - v2.1.0",
    media: { type: "image", src: "/images/changelogs/v2.1.0.png", alt: "v2.1.0 changelog" },
    changes: [
      { text: "Biggest content overhaul to the landing page ever"},
      "Editorial homepage — hero statement, cycling activity line, Currently section with org logos",
      "New Transit Fanning page with Contentful-powered photo gallery",
      "Desktop header glass orb effect — bar fades on scroll, left wordmark and right nav become frosted glass",
      "Universal photography design language merged into globals site-wide",
    ],
  },
  {
    date: "03/24/2026 - v2.0.2",
    media: { type: "image", src: "/images/changelogs/changelogphoto1.png", alt: "Changelog visual" },
    changes: [
      "Added custom 404 page",
      { text: "Added info badge to chat", badge: "Built with Claude API" },
      "Introduced suggestion chips on the /chat page",
      "Fixed inconsistent corner radii across cards",
      "Removed green accent — design is now fully neutral",
      "Added changelogs"
    ],
  },
]

export function Changelog({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  // menuRef lets us detect clicks outside the dropdown to close it.
  const menuRef = useRef<HTMLDivElement>(null)
  const entry = entries[index]

  // Close the whole modal on Escape key press — standard accessible modal behaviour.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  // Close the version dropdown when the user clicks anywhere outside it.
  // The effect only attaches when the menu is open to avoid an always-on listener.
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      // `contains` checks if the click target is inside the menuRef element.
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [menuOpen])

  // createPortal renders the modal into document.body instead of its parent DOM
  // node. This sidesteps z-index stacking context issues — the modal will always
  // appear on top regardless of where in the component tree it's rendered.
  // 📖 Learn: React portals — https://react.dev/reference/react-dom/createPortal
  return createPortal(
    // Clicking the backdrop (not the card) closes the modal.
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* stopPropagation prevents clicks inside the card from bubbling up to the
          backdrop and accidentally closing the modal. */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 560,
          background: "var(--card-bg)",
          border: "1px solid var(--border-2)",
          borderRadius: 28,
          overflow: "hidden",
          maxHeight: "90vh",
          overflowY: "auto",
          animation: "stickerPop 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 20px 16px",
          borderBottom: "1px solid var(--border-2)",
          position: "relative",
        }}>
          {/* Left: arrow menu + date */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative" }} ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 26, height: 26, borderRadius: "50%",
                background: menuOpen ? "var(--surface-hover)" : "var(--surface)",
                border: "1px solid var(--border-2)",
                color: "var(--text-3)", cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "var(--surface-hover)" }}
              onMouseLeave={e => { if (!menuOpen) { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.background = "var(--surface)" } }}
              title="Browse changelogs"
            >
              <ChevronDown style={{ width: 13, height: 13 }} />
            </button>

            <span style={{
              fontFamily: "'Toronto Subway', sans-serif",
              fontSize: 15, letterSpacing: "0.04em",
              color: "var(--text)",
            }}>
              {entry.date} Changelog
            </span>

            {/* Dropdown menu */}
            {menuOpen && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                background: "var(--card-bg)",
                border: "1px solid var(--border-2)",
                borderRadius: 14,
                overflow: "hidden",
                minWidth: 180,
                zIndex: 10,
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                animation: "dropdownEnter 0.18s ease",
              }}>
                {entries.map((e, i) => (
                  <button
                    key={e.date}
                    onClick={() => { setIndex(i); setMenuOpen(false) }}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "10px 16px",
                      background: i === index ? "var(--surface)" : "transparent",
                      border: "none", cursor: "pointer",
                      fontFamily: "'Toronto Subway', sans-serif",
                      fontSize: 13, letterSpacing: "0.03em",
                      color: i === index ? "var(--text)" : "var(--text-3)",
                      transition: "background 0.12s, color 0.12s",
                      borderBottom: i < entries.length - 1 ? "1px solid var(--border-2)" : "none",
                    }}
                    onMouseEnter={ev => { ev.currentTarget.style.background = "var(--surface-hover)"; ev.currentTarget.style.color = "var(--text)" }}
                    onMouseLeave={ev => { ev.currentTarget.style.background = i === index ? "var(--surface)" : "transparent"; ev.currentTarget.style.color = i === index ? "var(--text)" : "var(--text-3)" }}
                  >
                    {e.date}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: close */}
          <button
            onClick={onClose}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 26, height: 26, borderRadius: "50%",
              background: "var(--surface)", border: "1px solid var(--border-2)",
              color: "var(--text-3)", cursor: "pointer",
              transition: "color 0.15s, background 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-hover)"; e.currentTarget.style.color = "var(--text)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--text-3)" }}
          >
            <X style={{ width: 13, height: 13 }} />
          </button>
        </div>

        {/* Media */}
        {entry.media && (
          <div style={{ width: "100%", aspectRatio: "16/9", background: "var(--surface)", overflow: "hidden" }}>
            {entry.media.type === "image" ? (
              <img
                src={entry.media.src}
                alt={entry.media.alt ?? ""}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <video
                src={entry.media.src}
                aria-label={entry.media.alt ?? "Changelog video"}
                autoPlay loop muted playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            )}
          </div>
        )}

        {/* Changes */}
        <div style={{ padding: "20px 24px" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Each change can be a plain string or a { text, badge } object.
            The typeof check narrows the union type before accessing .badge. */}
        {entry.changes.map((c, i) => {
              const text = typeof c === "string" ? c : c.text
              const badge = typeof c === "string" ? undefined : c.badge
              return (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "var(--text-4)", flexShrink: 0, fontSize: 14 }}>•</span>
                  <span style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, fontFamily: "'Toronto Subway', sans-serif", letterSpacing: "0.01em" }}>
                    {text}
                  </span>
                  {badge && (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0,
                      padding: "3px 8px", borderRadius: 9999,
                      background: "var(--surface)", border: "1px solid var(--border-2)",
                      color: "var(--text-4)", fontSize: 11,
                      fontFamily: "'Toronto Subway', sans-serif", letterSpacing: "0.04em",
                    }}>
                      <Info style={{ width: 9, height: 9 }} />
                      {badge}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        {/* Sign-off */}
        <div style={{
          padding: "20px 24px 24px",
          borderTop: "1px solid var(--border-2)",
          display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16,
        }}>
          <p style={{
            fontFamily: "'SFCamera', sans-serif",
            fontSize: "clamp(18px, 3vw, 22px)",
            color: "var(--text-2)",
            lineHeight: 1.35,
            margin: 0,
          }}>
            Thanks for checking this out,<br />
            <span style={{ color: "var(--text)" }}>Richard Li</span>
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}
