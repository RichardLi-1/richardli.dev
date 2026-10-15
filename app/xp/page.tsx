"use client"

// /xp: the Windows XP desktop as its own standalone page.
//
// XP used to be a "mode" layered over the whole site, which meant its code
// downloaded on every page for every visitor. It's nearly retired now, so it
// lives here instead: nothing on the site links to it, search engines are told
// to skip it (app/xp/layout.tsx), and the root layout leaves out the site's
// header, footer, cursor and chat on this route (app/layout-content.tsx).
//
// Arriving here boots XP (startup sound + the usual "XP activated" analytics,
// via the existing toggleXPMode). "Turn Off Computer" / "Log Off" in the start
// menu turn it off as before, and this page then plays the shutdown: XP's blue
// "shutting down" screen, then the classic "safe to turn off" screen with a
// way back to the homepage.

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useWindowsXP } from "@/contexts/windows-xp-context"
import { WindowsXPDesktop } from "@/components/windows-xp/desktop"

const SHUTTING_DOWN_MS = 2500 // how long "Windows is shutting down…" shows

type Phase = "booting" | "on" | "shutting-down" | "off"

export default function XPPage() {
  const { isXPMode, toggleXPMode } = useWindowsXP()
  const [phase, setPhase] = useState<Phase>("booting")
  // React Strict Mode runs effects twice in development; this keeps it from
  // toggling XP on and straight back off
  const booted = useRef(false)

  // Boot once on arrival (if XP isn't already on from an earlier visit)
  useEffect(() => {
    if (booted.current) return
    booted.current = true
    if (!isXPMode) toggleXPMode()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Follow the XP switch: on → desktop; turned off from the start menu → shutdown
  useEffect(() => {
    if (isXPMode) {
      setPhase("on")
      return
    }
    if (phase !== "on") return
    setPhase("shutting-down")
    const timer = setTimeout(() => setPhase("off"), SHUTTING_DOWN_MS)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isXPMode])

  if (phase === "on") return <WindowsXPDesktop />

  if (phase === "shutting-down") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-blue-700 via-blue-600 to-blue-900 text-white">
        <p className="text-4xl italic font-bold tracking-tight">
          Windows<span className="align-super text-lg not-italic font-normal">xp</span>
        </p>
        <p className="text-lg">Windows is shutting down…</p>
      </div>
    )
  }

  if (phase === "off") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 bg-black px-6 text-center">
        <p className="font-mono text-2xl text-orange-400" role="status">
          It&apos;s now safe to turn off your computer.
        </p>
        <Link
          href="/"
          className="rounded-sm border border-gray-500 bg-gradient-to-b from-gray-200 to-gray-400 px-5 py-2 text-sm text-black hover:from-gray-100 hover:to-gray-300"
        >
          Return to the homepage
        </Link>
      </div>
    )
  }

  // "booting": a black screen for the instant before XP comes up
  return <div className="fixed inset-0 z-50 bg-black" />
}
