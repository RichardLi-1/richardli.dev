import type React from "react"

const small: React.CSSProperties = { fontFamily: "'Toronto Subway', sans-serif", fontSize: "12px", color: "var(--text-3)" }

export function Footer() {
  return (
    <footer className="w-full border-t px-6 py-4" style={{ borderColor: "var(--border-2)", background: "var(--bg)" }}>
      <div className="flex flex-col gap-2">
        {/* Top row: name */}
        <span style={{ fontFamily: "'Toronto Subway', sans-serif", fontSize: "18px", color: "var(--text)" }}>Richard Li</span>

        {/* Bottom row: built-with + version */}
        <div className="flex items-center justify-between">
          <span style={small}>Written in TypeScript using Next.js. Set in SFCamera and Toronto Subway.</span>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <div className="size-2 rounded-full bg-green-400 animate-pulse-custom" />
            <span style={small}>v2.0.2 — 03/20/2025</span>
          </div>
        </div>

        {/* Spacer for mobile floating pill nav */}
        <div className="block md:hidden" style={{ height: "4rem" }} />
      </div>
    </footer>
  )
}
