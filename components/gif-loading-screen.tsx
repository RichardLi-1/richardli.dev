"use client"
import { useEffect, useRef, useState } from "react"

interface GifLoadingScreenProps {
  onComplete: () => void
}

export function GifLoadingScreen({ onComplete }: GifLoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isLifting, setIsLifting] = useState(false)
  const [gifLoaded, setGifLoaded] = useState(false)
  const gifSrc = useRef(`/images/loading-animation.gif?t=${Date.now()}`)

  useEffect(() => {
    const img = new Image()
    img.src = gifSrc.current

    img.onload = () => {
      // Add a small delay to ensure the GIF starts from the beginning
      setTimeout(() => {
        setGifLoaded(true)
      }, 100)
    }

    // Fallback in case the image fails to load
    img.onerror = () => {
      setGifLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!gifLoaded) return

    const pageLoadTimer = setTimeout(() => {
      onComplete()
    }, 2000)

    const panelLiftTimer = setTimeout(() => {
      setIsLifting(true)
    }, 1700)

    const hideTimer = setTimeout(() => {
      setIsVisible(false)
    }, 2700)

    return () => {
      clearTimeout(pageLoadTimer)
      clearTimeout(panelLiftTimer)
      clearTimeout(hideTimer)
    }
  }, [onComplete, gifLoaded])

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
        {gifLoaded && (
          <img
            src={gifSrc.current}
            alt="Loading animation"
            className="w-full h-full object-contain"
            fetchPriority="high"
          />
        )}
      </div>
    </div>
  )
}
