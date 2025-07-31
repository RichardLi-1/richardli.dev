"use client"
import { useEffect, useState } from "react"
import type React from "react"

interface AnimatedPageProps {
  children: React.ReactNode
}

export function AnimatedPage({ children }: AnimatedPageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div
      className={`transition-all duration-1000 ease-out ${
        isLoaded ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-8"
      }`}
    >
      {children}
    </div>
  )
}
