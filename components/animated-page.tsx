"use client"
import { useEffect, useState } from "react"
import type React from "react"

interface AnimatedPageProps {
  children: React.ReactNode
}

export function AnimatedPage({ children }: AnimatedPageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // body uses overflow:hidden; the real scroller is .app-scroll-shell. Default
    // hash scrolling targets the document, so /#projects is handled on the homepage.
    // Skip resetting scroll when deep-linking to #projects so we do not wipe that jump.
    if (typeof window !== "undefined" && window.location.hash === "#projects") {
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
