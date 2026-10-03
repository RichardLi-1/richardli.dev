"use client"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import type React from "react"
import { instantBlockSelector } from "@/components/app-launch"

interface StaggeredContentProps {
  children: React.ReactNode
  delay?: number
}

export function StaggeredContent({ children, delay = 0 }: StaggeredContentProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  // "instant" = shown straight away with no transition at all
  const [isInstant, setIsInstant] = useState(false)

  // Arriving via the iOS-style open/close animation (components/app-launch.tsx)?
  // The block holding what the flying icon lands on (the banner when opening,
  // the cards when closing back home) must not slide, or it would move under
  // the landing icon. Every other block still staggers in as usual.
  // useLayoutEffect runs after React inserts the DOM but before the browser
  // paints, so the switch to visible happens before anything is drawn.
  // 📖 Learn: useEffect vs useLayoutEffect timing
  useLayoutEffect(() => {
    const selector = instantBlockSelector()
    if (selector && ref.current?.querySelector(selector)) {
      setIsInstant(true)
      setIsVisible(true)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      ref={ref}
      className={`${isInstant ? "" : "transition-all duration-700 ease-out"} ${
        isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-6"
      }`}
    >
      {children}
    </div>
  )
}
