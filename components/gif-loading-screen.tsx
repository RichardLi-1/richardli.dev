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
    }, 1230) // Start page content loading 100ms before panel lifts

    const panelLiftTimer = setTimeout(() => {
      console.log("[v0] Panel lifting animation started - setting isLifting to true")
      setIsLifting(true)
      setTimeout(() => {
        console.log("[v0] State after lifting:", { isLifting: true })
      }, 50)
    }, 1330)

    const hideTimer = setTimeout(() => {
      console.log("[v0] Loading screen hidden")
      setIsVisible(false)
    }, 3330) // Extended to allow full animation to complete

    return () => {
      clearTimeout(pageLoadTimer)
      clearTimeout(panelLiftTimer)
      clearTimeout(hideTimer)
    }
  }, [onComplete])

  useEffect(() => {
    console.log("[v0] isLifting state changed to:", isLifting)
  }, [isLifting])

  console.log("[v0] Loading screen render - isVisible:", isVisible, "isLifting:", isLifting)

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      style={{
        transform: isLifting ? "translateY(-100vh)" : "translateY(0)",
        transition: isLifting ? "transform 2000ms ease-in" : "none",
        willChange: "transform",
      }}
    >
      <div className="w-96 h-96 flex items-center justify-center">
        <img src="/images/loading-animation.gif" alt="Loading animation" className="w-full h-full object-contain" />
      </div>
    </div>
  )
}
