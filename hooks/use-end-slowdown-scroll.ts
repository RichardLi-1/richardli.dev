"use client"
import { useEffect } from "react"
import Lenis from "lenis"

// How quickly the page catches up to the scroll target. textql.com covers 16%
// of the remaining distance per *frame*, so on a 120Hz screen (ProMotion
// MacBooks) it eases twice per 60Hz frame: 1 - 0.84² ≈ 0.29. Lenis's lerp is
// per 60Hz frame regardless of the display, so 0.3 matches textql on 120Hz.
// Higher = shorter, harder deceleration at the ends; lower = longer glide.
// 📖 Learn: frame-rate independent damping (Lenis uses 1 - e^(-lerp·60·dt))
const LERP = 0.3

/**
 * Wheel and trackpad scrolling that decelerates gracefully into the top and
 * bottom of the page instead of stopping dead.
 *
 * Same approach as textql.com: every wheel step moves a *target* position,
 * capped at both ends, and each frame the page eases part of the way toward
 * it. When momentum pushes the target into an end, the target stops there
 * while the page keeps easing in, covering less ground each frame. That's
 * the deceleration: no special end-of-page logic needed. Native scrolling,
 * by contrast, stops the moment it hits the limit.
 *
 * An earlier version switched between native scrolling and Lenis near the
 * ends. Each hand-off mid-gesture changed speed suddenly, which felt glitchy,
 * so smoothing now stays on (lightly) for the whole page.
 *
 * Experimental, used only on the case study pages. Lenis is otherwise off
 * site-wide (see app/layout-content.tsx). Touch devices and reduced motion
 * keep native scrolling.
 * 📖 Learn: lerp (linear interpolation) smoothing, trackpad momentum
 */
export function useEndSlowdownScroll() {
  useEffect(() => {
    // The page scrolls inside this element, not the window (body is overflow: hidden)
    const wrapper = document.querySelector<HTMLElement>(".app-scroll-shell")
    if (!wrapper) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const lenis = new Lenis({
      wrapper,
      // Watched for size changes (images loading in), so the ends of the page
      // stay accurate. The shell's first child is the page itself.
      content: (wrapper.firstElementChild as HTMLElement | null) ?? wrapper,
      lerp: LERP,
      smoothWheel: true,
      syncTouch: false, // touch keeps native scrolling, like textql.com
      // Anything with its own scrollbar (e.g. the chat orb's panel) scrolls
      // natively instead of being taken over
      allowNestedScroll: true,
      autoRaf: true,
    })

    // Hand scrolling back to the browser when leaving the page
    return () => lenis.destroy()
  }, [])
}
