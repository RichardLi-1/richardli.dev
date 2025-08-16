"use client"
import { useEffect, useState } from "react"

interface GifLoadingScreenProps {
  onComplete: () => void
}

export function GifLoadingScreen({ onComplete }: GifLoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Show loading screen for 2.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete()
    }, 1330)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-transform duration-500 ease-in ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="w-96 h-96 flex items-center justify-center">
        <img src="/images/loading-animation.gif" alt="Loading animation" className="w-full h-full object-contain" />
      </div>
    </div>
  )
}
