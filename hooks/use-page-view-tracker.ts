"use client"

import { useEffect, useRef } from "react"
import { trackEvent } from "@/lib/track"

// Fires a Discord webhook once per page load to log visitor info.
// Using a ref (not state) for `hasTracked` avoids triggering a re-render —
// it's a mutable value we only need internally.
// 📖 Learn: useRef for mutable values — https://react.dev/reference/react/useRef#referencing-a-value-with-a-ref
export function usePageViewTracker() {
  const hasTracked = useRef(false)
  // Holding "/" suppresses the tracker, useful when testing locally without
  // resorting to localhost (which is already skipped).
  const slashKeyHeld = useRef(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        slashKeyHeld.current = true
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "/") {
        slashKeyHeld.current = false
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    const sendVisit = async () => {
      if (slashKeyHeld.current) {
        return
      }

      // Skip vusercontent.net URLs
      if (window.location.href.includes("vusercontent.net")) return

      // Skip localhost
      if (window.location.hostname === "localhost") return

      // Skip ?m parameter (current URL or carried over from session)
      if (new URLSearchParams(window.location.search).has("m") || sessionStorage.getItem("preserve_m")) return

      // Only track once per page load
      if (hasTracked.current) return
      hasTracked.current = true

      const isBot = /bot|crawler|spider/i.test(navigator.userAgent)

      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
      const deviceType = isMobile ? "📱 Mobile" : "🖥️ Desktop"
      const platform = /iPhone|iPad/.test(navigator.userAgent) ? "iOS"
        : /Android/.test(navigator.userAgent) ? "Android"
        : /Mac/.test(navigator.platform) ? "macOS"
        : /Win/.test(navigator.platform) ? "Windows"
        : /Linux/.test(navigator.platform) ? "Linux"
        : "Unknown"

      // Accumulate visited paths across navigations within the same session so the
      // Discord message shows the full journey (e.g. "/" → "/projects" → "/chat").
      const currentPath = window.location.pathname || "/"
      const stored = sessionStorage.getItem("nav_path")
      const pathHistory: string[] = stored ? JSON.parse(stored) : []
      if (pathHistory[pathHistory.length - 1] !== currentPath) {
        pathHistory.push(currentPath)
      }
      sessionStorage.setItem("nav_path", JSON.stringify(pathHistory))
      const pathTrail = pathHistory.join(" → ")

      // ipify is a free public API that returns the caller's public IP address.
      // The try/catch ensures a failed IP lookup doesn't block the whole webhook.
      let ip = "unknown"
      try {
        const res = await fetch("https://api.ipify.org?format=json")
        const data = await res.json()
        ip = data.ip || "unknown"
      } catch (err) {
        console.warn("Failed to get IP, sending notification without it.")
      }

      // Check if URL is LinkedIn referral
      const isLinkedIn = window.location.href === "https://www.richardli.dev/?l"

      // Build the event label and pass structured metadata to trackEvent.
      // trackEvent() calls /api/track on our own server — the Discord webhook
      // URL never leaves the server, so it can't be scraped from the browser.
      const eventLabel = isBot
        ? `🤖 Bot/crawler on ${window.location.href}`
        : isLinkedIn
        ? `👀 New visitor from LinkedIn on ${window.location.href}`
        : `👀 New visitor on ${window.location.href}`

      trackEvent(eventLabel, {
        "🖥️ Device": `${deviceType} · ${platform}`,
        "🛤️ Path": pathTrail,
        "🕒 Time": new Date().toLocaleString(),
        "🌐 IP": ip,
        ...(isBot ? { "🔍 UA": navigator.userAgent } : {}),
      })
    }

    sendVisit()

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])
}
