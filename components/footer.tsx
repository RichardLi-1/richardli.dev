"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Changelog, entries } from "@/components/changelog"

const base: React.CSSProperties = { fontFamily: "'Toronto Subway', sans-serif", color: "var(--text-3)" }

export function Footer() {
  const [isPanel, setIsPanel] = useState(false)
  const [showChangelog, setShowChangelog] = useState(false)
  // Hide the footer when rendered inside the /work split-pane iframe —
  // it looks wrong at the bottom of a narrow side panel.
  // Reads window.location in a useEffect to avoid SSR issues.
  useEffect(() => { if (window.location.search.includes("panel=1")) setIsPanel(true) }, [])
  if (isPanel) return null
  return (
    <>
      <footer className="w-full border-t px-10 py-4" style={{ borderColor: "var(--border-2)", background: "var(--bg)" }}>
        {/* Single row on desktop, stacked on mobile */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-0">
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
            <span style={{ ...base, fontSize: "13px", color: "var(--text-2)" }}>RICHARD LI</span>
            <span style={{ ...base, fontSize: "13px" }}>Written in TypeScript using Next.js. Animations using Framer Motion. Set in SFCamera and Toronto Subway. Made with ❤️.</span>
          </div>

          <div className="flex items-center gap-2 shrink-0 md:ml-4">
            <div className="size-2 rounded-full animate-pulse-custom" style={{ background: "var(--text-3)" }} />
            {/* Show the latest changelog date as the clickable version label.
                `entries[0]` is always the most recent entry. */}
            <button
              onClick={() => setShowChangelog(true)}
              style={{
                ...base, fontSize: "13px",
                background: "none", border: "none", cursor: "pointer", padding: 0,
                textDecoration: "underline", textUnderlineOffset: 3,
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text-2)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
            >
              {entries[0].date}
            </button>
          </div>
        </div>

        {/* Spacer for mobile floating pill nav */}
        <div className="block md:hidden" style={{ height: "4rem" }} />
      </footer>

      {showChangelog && <Changelog onClose={() => setShowChangelog(false)} />}
    </>
  )
}
