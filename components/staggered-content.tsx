"use client"
import { useEffect, useState } from "react"
import type React from "react"

interface StaggeredContentProps {
  children: React.ReactNode
  delay?: number
}

export function StaggeredContent({ children, delay = 0 }: StaggeredContentProps) {
  const [isVisible, setIsVisible] = useState(false)

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
