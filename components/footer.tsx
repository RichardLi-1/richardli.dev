"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Changelog } from "@/components/changelog"

const small: React.CSSProperties = { fontFamily: "'Toronto Subway', sans-serif", fontSize: "12px", color: "var(--text-3)" }

export function Footer() {
  const [isPanel, setIsPanel] = useState(false)
  const [showChangelog, setShowChangelog] = useState(false)
  useEffect(() => { if (window.location.search.includes("panel=1")) setIsPanel(true) }, [])
  if (isPanel) return null
  return (
    <>
      <footer className="w-full border-t px-6 py-4" style={{ borderColor: "var(--border-2)", background: "var(--bg)" }}>
        <div className="flex flex-col gap-2">
          {/* Top row: name */}
          <span style={{ fontFamily: "'Toronto Subway', sans-serif", fontSize: "18px", color: "var(--text)" }}>Richard Li</span>

          {/* Bottom row: built-with + version */}
          <div className="flex items-center justify-between">
            <span style={small}>Written in TypeScript using Next.js. Animations using Framer Motion. Set in SFCamera and Toronto Subway.</span>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <div className="size-2 rounded-full animate-pulse-custom" style={{ background: "var(--text-3)" }} />
              <button
                onClick={() => setShowChangelog(true)}
                style={{
                  ...small,
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  textDecoration: "underline", textUnderlineOffset: 3,
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--text-2)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
              >
                v2.0.2 — 03/24/2026
              </button>
            </div>
          </div>

          {/* Spacer for mobile floating pill nav */}
          <div className="block md:hidden" style={{ height: "4rem" }} />
        </div>
      </footer>

      {showChangelog && <Changelog onClose={() => setShowChangelog(false)} />}
    </>
  )
}
