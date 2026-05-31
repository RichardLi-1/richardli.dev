"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Mail, Github, Linkedin } from "lucide-react"
import { Changelog, entries } from "@/components/changelog"
import { trackEvent } from "@/lib/track"

const base: React.CSSProperties = { fontFamily: "'Toronto Subway', sans-serif", color: "var(--text-3)" }

// Shared icon-link styling — mirrors the header's social buttons so footer feels of-a-piece.
// Hover lightens to --text (full opacity) for a subtle "press" effect on cold links.
function SocialIcon({
  href, label, external, onClick, children,
}: { href: string; label: string; external?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={onClick}
      aria-label={label}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 28, height: 28, borderRadius: 8,
        color: "var(--text-3)", transition: "color 0.15s, background 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "var(--surface-hover)" }}
      onMouseLeave={e => { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.background = "transparent" }}
    >
      {children}
    </a>
  )
}

export function Footer() {
  const [isPanel, setIsPanel] = useState(false)
  const [showChangelog, setShowChangelog] = useState(false)
  // Hide the footer when rendered inside a split-pane project iframe (?panel=1) —
  // it looks wrong at the bottom of a narrow side panel.
  // Reads window.location in a useEffect to avoid SSR issues.
  useEffect(() => { if (window.location.search.includes("panel=1")) setIsPanel(true) }, [])
  if (isPanel) return null
  return (
    <>
      <footer className="w-full border-t px-10 py-6 md:py-8" style={{ borderColor: "var(--border-2)", background: "var(--bg)" }}>
        {/* Top row: wordmark on left, socials on right (icons sit higher than the credits line) */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 md:gap-8">
          <div className="flex flex-col gap-2 max-w-2xl">
            {/* Copyright wordmark — uppercase + tracked to match the rest of the brand styling.
                Year derives from `new Date().getFullYear()` so it self-updates each Jan 1.
                📖 Learn: this runs at both SSR and hydration; safe except for the few-hour
                window around midnight Dec 31 when server (UTC) and client (local TZ) might
                disagree on the year. Acceptable trade-off for a portfolio site. */}
            <span style={{ ...base, fontSize: "14px", color: "var(--text-2)", letterSpacing: "0.08em" }}>
              © RICHARD LI {new Date().getFullYear()}
            </span>
            <span style={{ ...base, fontSize: "14px", lineHeight: 1.4 }}>
              Written in TypeScript using Next.js. Animations using Framer Motion. Set in SFCamera and Toronto Subway. Made with ❤️.
            </span>
          </div>
        </div>

        {/* Bottom row: social icons on the left, version pill on the right.
            Removed the hairline divider above this row for a less boxy look —
            the social icons now provide the visual anchor on the bottom-left. */}
        <div className="mt-8 flex items-center justify-between gap-4">
          {/* Social icons — same handles/tracking as the desktop nav at animated-header.tsx:653-655 */}
          <div className="flex items-center gap-1 shrink-0">
            <SocialIcon
              href="mailto:richardli0@outlook.com?subject=Greetings!&body=Hi%20Richard%2C%0A%0A%0A%5BYour%20Name%5D"
              label="Email"
              onClick={() => trackEvent("✉️ Email clicked", { location: "footer" })}
            >
              <Mail className="w-4 h-4" />
            </SocialIcon>
            <SocialIcon
              href="https://github.com/RichardLi-1"
              label="GitHub"
              external
              onClick={() => trackEvent("🐙 GitHub clicked", { location: "footer" })}
            >
              <Github className="w-4 h-4" />
            </SocialIcon>
            <SocialIcon
              href="https://www.linkedin.com/in/richardli0/"
              label="LinkedIn"
              external
              onClick={() => trackEvent("🔗 LinkedIn clicked", { location: "footer" })}
            >
              <Linkedin className="w-4 h-4" />
            </SocialIcon>
          </div>

          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-green-400 animate-pulse-custom" />
            {/* Show the latest changelog date as the clickable version label.
                `entries[0]` is always the most recent entry. */}
            <button
              onClick={() => setShowChangelog(true)}
              style={{
                ...base, fontSize: "14px",
                background: "none", border: "none", cursor: "pointer", padding: 0,
                textDecoration: "underline", textUnderlineOffset: 3,
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text-2)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
            >
              Last updated {entries[0].date}
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
