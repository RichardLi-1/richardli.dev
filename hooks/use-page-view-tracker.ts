"use client"

import { useEffect, useRef } from "react"
import { trackEvent } from "@/lib/track"

// ─── Edit this to add/rename referral sources ─────────────────────────────────
// key   = the URL query param (e.g. "l" matches "?l" or "?l=anything")
// value = display name that gets **bolded** in the Discord message
const REFERRAL_SOURCES: Record<string, string> = {
  c: "Cover Letter",
  l: "LinkedIn",
  r: "Resume",
  t: "Twitter/X",
  e: "Email",
  g: "GitHub",
  z: "Resume",
}
// ──────────────────────────────────────────────────────────────────────────────

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

    // ─── Bounce detection ─────────────────────────────────────────────────────
    // A "bounce" = the visitor saw only this one page and left quickly (<10s)
    // without clicking through anywhere. We check at the moment the page is
    // unloading. `pagehide` is the reliable "page is going away" signal (covers
    // tab close + navigation); we keep it to a real exit rather than tab-switching
    // so we don't over-report. 📖 Learn: Page Lifecycle — https://developer.chrome.com/docs/web-platform/page-lifecycle-api
    const BOUNCE_THRESHOLD_MS = 10_000 // under 10s on a single page = a quick bounce
    const pageEnteredAt = Date.now()

    const reportBounceOnExit = () => {
      // Same skip rules as the page-view tracker.
      if (slashKeyHeld.current) return
      if (window.location.hostname === "localhost") return
      if (localStorage.getItem("skip_tracking")) return
      if (/bot|crawler|spider/i.test(navigator.userAgent)) return

      // Only a bounce if they never left this first page…
      const stored = sessionStorage.getItem("nav_path")
      const pages: string[] = stored ? JSON.parse(stored) : []
      if (pages.length > 1) return
      // …and they left quickly.
      const elapsed = Date.now() - pageEnteredAt
      if (elapsed > BOUNCE_THRESHOLD_MS) return
      // Fire at most once per visit.
      if (sessionStorage.getItem("bounce_sent")) return
      sessionStorage.setItem("bounce_sent", "1")

      const seconds = Math.round(elapsed / 1000)
      // Carry the referral source so we still know where the bouncer came from.
      const referral = localStorage.getItem("referral_source")
      const payload = {
        event: referral
          ? `👋 Quick bounce from **${referral}** on ${window.location.pathname}`
          : `👋 Quick bounce on ${window.location.pathname}`,
        meta: {
          "🛤️ Path": pages.join(" → ") || window.location.pathname,
          "⏱️ Time on page": `${seconds}s`,
          "🕒 Time": new Date().toLocaleString(),
        },
      }

      // sendBeacon queues the request so it survives the page unload — a normal
      // fetch() gets cancelled when the page is tearing down. The Blob's JSON type
      // lets /api/track's req.json() parse it on the server.
      // 📖 Learn: navigator.sendBeacon — https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon
      navigator.sendBeacon(
        "/api/track",
        new Blob([JSON.stringify(payload)], { type: "application/json" }),
      )
    }

    window.addEventListener("pagehide", reportBounceOnExit)

    const sendVisit = async () => {
      if (slashKeyHeld.current) {
        return
      }

      // Skip vusercontent.net URLs
      if (window.location.href.includes("vusercontent.net")) return

      // Skip localhost
      if (window.location.hostname === "localhost") return

      // Skip if ?m was ever seen on this device (stored in localStorage by usePreserveM)
      if (localStorage.getItem("skip_tracking")) return

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

      // Read ?param from the URL, look it up in REFERRAL_SOURCES, then strip it.
      // replaceState rewrites the URL bar without a page reload or a history entry —
      // so the param disappears immediately and the back button isn't affected.
      // 📖 Learn: history.replaceState — https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState
      const params = new URLSearchParams(window.location.search)
      // Capture the raw query string before stripping so it's always logged.
      // This preserves unrecognized params (e.g. ?utm_source=foo) in the Discord message.
      const rawParams = params.toString()
      // Referral source sticks for the whole visit (and future visits) instead of
      // just the landing page. We persist it in localStorage and fall back to the
      // stored value when the current URL has no param — so a page view on /projects
      // still reports "from Resume". A fresh referral param always wins and
      // overwrites the stored one (e.g. arriving via ?l after a past ?r → LinkedIn).
      // localStorage (not sessionStorage) → survives new tabs and return visits.
      // 📖 Learn: Web Storage API — https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
      const REFERRAL_KEY = "referral_source"
      let referralSource: string | null = localStorage.getItem(REFERRAL_KEY)
      for (const key of params.keys()) {
        if (REFERRAL_SOURCES[key]) {
          referralSource = REFERRAL_SOURCES[key]
          localStorage.setItem(REFERRAL_KEY, referralSource) // new param overwrites old
          break
        }
      }
      // Always strip query params so the URL stays clean for the visitor
      if (rawParams) {
        window.history.replaceState({}, "", window.location.pathname)
      }

      // Build the event label and pass structured metadata to trackEvent.
      // **bold** is Discord markdown — the source name will render bolded in the channel.
      // trackEvent() calls /api/track on our own server — the Discord webhook
      // URL never leaves the server, so it can't be scraped from the browser.
      const eventLabel = isBot
        ? `🤖 Bot/crawler on ${window.location.pathname}`
        : referralSource
        ? `👀 New visitor from **${referralSource}**`
        : rawParams
        ? `👀 New visitor — CUSTOM REFERRAL on ${window.location.pathname}`
        : `👀 New visitor on ${window.location.pathname}`

      trackEvent(eventLabel, {
        "🖥️ Device": `${deviceType} · ${platform}`,
        "🛤️ Path": pathTrail,
        "🕒 Time": new Date().toLocaleString(),
        "🌐 IP": ip,
        ...(rawParams ? { "🔗 Params": `?${rawParams}` } : {}),
        ...(isBot ? { "🔍 UA": navigator.userAgent } : {}),
      })
    }

    sendVisit()

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("pagehide", reportBounceOnExit)
    }
  }, [])
}
