"use client"
import { useEffect, useState } from "react"
import type React from "react"
import { isAppLaunching } from "@/components/app-launch"

interface StaggeredContentProps {
  children: React.ReactNode
  delay?: number
}

export function StaggeredContent({ children, delay = 0 }: StaggeredContentProps) {
  // Opened via the iOS-style launch animation? Then start visible: the launch
  // is the entrance, and content sliding in would move under the landing banner.
  // (A function passed to useState runs once, on the first render only.)
  const [isVisible, setIsVisible] = useState(() => isAppLaunching())

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-6"
      }`}
    >
      {children}
    </div>
  )
}
