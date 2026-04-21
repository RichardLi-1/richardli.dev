"use client"
import { useEffect, useState } from "react"
import type React from "react"

interface AnimatedPageProps {
  children: React.ReactNode
}

export function AnimatedPage({ children }: AnimatedPageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
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
