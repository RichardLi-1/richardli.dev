"use client"
import { useEffect, useRef, useState } from "react"

// Returns a ref to attach to a DOM element and a boolean that flips true once
// the element scrolls into view. Once triggered, it never resets — this is
// intentional for "animate in once" patterns.
// 📖 Learn: IntersectionObserver — https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver
export function useInView(threshold = 0.15) {
  // `ref` is attached to the DOM element we want to observe.
  // Using a ref (not a state) avoids re-renders when the element reference changes.
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          // Disconnect after the first intersection — no need to keep watching.
          obs.disconnect()
        }
      },
      // threshold: fraction of the element that must be visible before firing.
      // 0.15 = fire when 15% of the element is on screen.
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    // Cleanup: disconnect the observer when the component unmounts.
    return () => obs.disconnect()
  }, [threshold])

  return { ref, inView }
}
