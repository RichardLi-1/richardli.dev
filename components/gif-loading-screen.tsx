"use client"
import { useEffect, useRef, useState } from "react"

interface GifLoadingScreenProps {
  onComplete: () => void
}

export function GifLoadingScreen({ onComplete }: GifLoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isLifting, setIsLifting] = useState(false)
  const [gifLoaded, setGifLoaded] = useState(false)
  // Append a timestamp query string to bust the browser cache so the GIF always
  // restarts from frame 1. Without this, a cached GIF might start mid-animation.
  // Using useRef means the timestamp is computed once and never changes.
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

  // Three staggered timers orchestrate the exit sequence:
  //   1700 ms — start the CSS lift animation (panel slides up)
  //   2000 ms — call onComplete so the page content below begins rendering
  //   2700 ms — set isVisible=false to fully unmount this overlay from the DOM
  // Returning the clearTimeout calls ensures the timers are cancelled if the
  // component unmounts early (e.g. fast navigation).
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
    // The overlay slides upward off-screen using a CSS transform rather than
    // opacity fade, giving a more dramatic "curtain lift" feel.
    // Both the Tailwind class and inline style set the transform — the inline
    // style takes precedence; the class is a fallback in case inline is stripped.
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
