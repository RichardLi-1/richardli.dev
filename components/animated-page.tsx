"use client"
import { useEffect, useState } from "react"
import type React from "react"
import { isAppClosing, isAppLaunching } from "@/components/app-launch"

interface AnimatedPageProps {
  children: React.ReactNode
}

export function AnimatedPage({ children }: AnimatedPageProps) {
  // Arriving via the iOS-style open/close animation? Skip the fade-in: its
  // overlay is already revealing the page.
  const [isLoaded, setIsLoaded] = useState(() => isAppLaunching())

  useEffect(() => {
    // body uses overflow:hidden; the real scroller is .app-scroll-shell. Default
    // hash scrolling targets the document, so /#projects is handled on the homepage.
    // Skip resetting scroll when deep-linking to #projects so we do not wipe that jump.
    // Closing a project back into its homepage card restores the scroll
    // position itself (components/app-launch.tsx), so don't reset it here.
    if (isAppClosing() || (typeof window !== "undefined" && window.location.hash === "#projects")) {
      setIsLoaded(true)
      return
    }
    document.querySelector<HTMLElement>(".app-scroll-shell")?.scrollTo(0, 0)
    window.scrollTo(0, 0)
    setIsLoaded(true)
  }, [])

  return (
    <div
      className={`transition-opacity duration-700 ease-out ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}
    >
      {children}
    </div>
  )
}
