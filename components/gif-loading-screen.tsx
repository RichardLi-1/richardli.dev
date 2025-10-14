"use client"
import { useEffect, useState } from "react"

interface GifLoadingScreenProps {
  onComplete: () => void
}

export function GifLoadingScreen({ onComplete }: GifLoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isLifting, setIsLifting] = useState(false)

  useEffect(() => {
    console.log("[v0] Loading screen mounted, starting timers")

    const pageLoadTimer = setTimeout(() => {
      console.log("[v0] Page content loading started")
      onComplete()
    }, 1840) // Start page content loading 100ms before panel lifts

    const panelLiftTimer = setTimeout(() => {
      console.log("[v0] Panel lifting animation started")
      setIsLifting(true)
    }, 1530)

    const hideTimer = setTimeout(() => {
      console.log("[v0] Loading screen hidden")
      setIsVisible(false)
    }, 2380) // Extended to 1330 + 1000ms for longer animation

    return () => {
      clearTimeout(pageLoadTimer)
      clearTimeout(panelLiftTimer)
      clearTimeout(hideTimer)
    }
  }, [onComplete])

  console.log("[v0] Loading screen render - isVisible:", isVisible, "isLifting:", isLifting)

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-transform duration-1000 ease-in ${
        isLifting ? "-translate-y-full" : "translate-y-0"
      }`}
      style={{
        transform: isLifting ? "translateY(-300vh)" : "translateY(0)",
        transition: "transform 1000ms ease-in",
      }}
    >
      <div className="w-96 h-96 flex items-center justify-center">
        <img src="/images/loading-animation.gif" alt="Loading animation" className="w-full h-full object-contain" />
      </div>
    </div>
  )
}
