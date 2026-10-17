"use client"

import { useEffect, useRef } from "react"
// The ?z / ?r / … → "Resume" table now lives in its own file, because
// lib/outbound-links.ts uses it too. Edit referral sources there.
import { REFERRAL_SOURCES } from "@/lib/referral-sources"
import { aiAssistantFromHost } from "@/lib/ai-assistants"
import { startHumanSignals } from "@/lib/human-score"

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

    // Read the URL's query params NOW, synchronously, before anything is awaited.
    // usePreserveM (in the root layout) strips every param from the URL as soon
    // as the page mounts. This page's effect runs first (React runs child effects
    // before parent ones), but sendVisit() below awaits the IP lookup before it
    // used to read the params, and by then ?z / ?r / … were already gone, so
    // referrals were never recorded.
    // 📖 Learn: effect ordering (children before parents), async race conditions
    const landingParams = new URLSearchParams(window.location.search)

    // ─── AI-assistant detection (fresh landing only) ──────────────────────────
    // ChatGPT tags every link in its answers with ?utm_source=chatgpt.com; other
    // assistants (Perplexity, Claude…) usually send only a referrer. The prompt
    // the person typed is never passed to us; we only learn WHICH assistant.
    //
    // "Fresh landing" = the first page this tab has tracked. This hook re-runs on
    // every client-side navigation, but document.referrer keeps its original
    // value for the life of the document, so without this check every later
    // page (/projects, /chat…) would also look like a new ChatGPT arrival.
    // nav_path is the per-tab page trail sendVisit() writes below.
    // 📖 Learn: document.referrer — https://developer.mozilla.org/en-US/docs/Web/API/Document/referrer
    const isFreshLanding = !sessionStorage.getItem("nav_path")
    const referrerUrl = isFreshLanding ? document.referrer : ""
    let referrerHost: string | null = null
    try {
      referrerHost = referrerUrl ? new URL(referrerUrl).hostname : null
    } catch {
      referrerHost = null // malformed referrer: treat as none
    }
    const aiAssistant = isFreshLanding
      ? aiAssistantFromHost(landingParams.get("utm_source")) ?? aiAssistantFromHost(referrerHost)
      : null
    // Discord fields shared by the visit and the bounce messages.
    // The mobile apps usually send no referrer, so its absence hints app vs web.
    const aiMeta: Record<string, string> = {
      ...(referrerUrl ? { "↩️ Referrer": referrerUrl } : {}),
      ...(aiAssistant
        ? {
            "🤖 AI assistant": aiAssistantFromHost(referrerHost)
              ? `${aiAssistant} (web, referrer sent)`
              : `${aiAssistant} (no referrer, often the mobile app)`,
          }
        : {}),
    }

    // ─── Human-likelihood signals ─────────────────────────────────────────────
    // Start counting mouse/scroll/touch/key input right away. The visit message
    // waits a few seconds (see VISIT_DELAY_MS) so this has something to report;
    // /api/track turns the raw counts into a 0–100 score.
    const humanSignals = startHumanSignals()

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
      const rawLandingParams = landingParams.toString()
      const payload = {
        event: aiAssistant
          ? `🤖 Quick bounce from **${aiAssistant}** (AI assistant) on ${window.location.pathname}`
          : referral
          ? `👋 Quick bounce from **${referral}** on ${window.location.pathname}`
          : `👋 Quick bounce on ${window.location.pathname}`,
        meta: {
          "🛤️ Path": pages.join(" → ") || window.location.pathname,
          "⏱️ Time on page": `${seconds}s`,
          "🕒 Time": new Date().toLocaleString(),
          // The raw params, so the real landing URL is visible next to the label
          ...(rawLandingParams ? { "🔗 Params": `?${rawLandingParams}` } : {}),
          ...aiMeta,
        },
        humanSignals: humanSignals.snapshot(),
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

    // ─── Visit message: wait, then send once ──────────────────────────────────
    // The visit message waits VISIT_DELAY_MS so the human score has a few
    // seconds of mouse/scroll/touch input to judge. Whichever happens FIRST
    // sends it, and visitSent makes sure it only goes out once:
    //   1. the delay passes (and the IP lookup is done)   → end of sendVisit()
    //   2. the tab closes or navigates away               → "pagehide" below
    //   3. a client-side navigation unmounts this page    → effect cleanup
    //      ("pagehide" doesn't fire for in-app <Link> navigation)
    // sendBeacon instead of trackEvent()'s fetch: a beacon still goes out while
    // the page is being torn down, which case 2 needs.
    const VISIT_DELAY_MS = 5_000
    let visitPayload: { event: string; meta: Record<string, string> } | null = null
    let visitSent = false

    const flushVisit = () => {
      if (visitSent || !visitPayload) return // already sent, or a skip rule stopped it
      visitSent = true
      const body = { ...visitPayload, humanSignals: humanSignals.snapshot() }
      navigator.sendBeacon(
        "/api/track",
        new Blob([JSON.stringify(body)], { type: "application/json" }),
      )
    }

    window.addEventListener("pagehide", flushVisit)

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

      // (The IP lookup moved to the end: the message is now built first, so
      // there's something to send even if the tab closes mid-lookup.)

      // Read ?param from the URL, look it up in REFERRAL_SOURCES, then strip it.
      // replaceState rewrites the URL bar without a page reload or a history entry —
      // so the param disappears immediately and the back button isn't affected.
      // 📖 Learn: history.replaceState — https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState
      const params = landingParams // captured before the IP lookup; see above
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
      let matchedShortKey = false
      for (const key of params.keys()) {
        if (REFERRAL_SOURCES[key]) {
          referralSource = REFERRAL_SOURCES[key]
          localStorage.setItem(REFERRAL_KEY, referralSource) // new param overwrites old
          matchedShortKey = true
          break
        }
      }
      // No ?l / ?r / … key? An AI assistant can be the source instead:
      //   - utm_source=chatgpt.com (or another AI host) → "ChatGPT"
      //   - a bare AI referrer, but only when the URL had no params at all
      // Other utm_source values are left alone and still show as CUSTOM REFERRAL.
      const aiFromUtm = aiAssistantFromHost(params.get("utm_source"))
      const aiIsSource = !matchedShortKey && aiAssistant !== null && (aiFromUtm !== null || !rawParams)
      if (aiIsSource) {
        referralSource = aiAssistant
        localStorage.setItem(REFERRAL_KEY, aiAssistant)
      }
      // Always strip query params so the URL stays clean for the visitor
      if (rawParams) {
        window.history.replaceState({}, "", window.location.pathname)
      }

      // Build the event label and structured metadata for flushVisit().
      // **bold** is Discord markdown — the source name will render bolded in the channel.
      // It posts to /api/track on our own server — the Discord webhook
      // URL never leaves the server, so it can't be scraped from the browser.
      const eventLabel = isBot
        ? `🤖 Bot/crawler on ${window.location.pathname}`
        : aiIsSource
        ? `🤖 New visitor from **${aiAssistant}** (AI assistant) on ${window.location.pathname}`
        : referralSource
        ? `👀 New visitor from **${referralSource}**`
        : rawParams
        ? `👀 New visitor — CUSTOM REFERRAL on ${window.location.pathname}`
        : `👀 New visitor on ${window.location.pathname}`

      // Build the message now; flushVisit() sends it (see the comment above it).
      visitPayload = {
        event: eventLabel,
        meta: {
          "🖥️ Device": `${deviceType} · ${platform}`,
          "🛤️ Path": pathTrail,
          "🕒 Time": new Date().toLocaleString(),
          "🌐 IP": "unknown", // filled in below once ipify answers
          // Always kept, even when the label says "ChatGPT", so the real URL is visible
          ...(rawParams ? { "🔗 Params": `?${rawParams}` } : {}),
          ...aiMeta,
          ...(isBot ? { "🔍 UA": navigator.userAgent } : {}),
        },
      }

      // ipify is a free public API that returns the caller's public IP address.
      // The try/catch ensures a failed IP lookup doesn't block the whole webhook.
      const lookUpIp = async () => {
        try {
          const res = await fetch("https://api.ipify.org?format=json")
          const data = await res.json()
          if (data.ip && visitPayload) visitPayload.meta["🌐 IP"] = data.ip
        } catch (err) {
          console.warn("Failed to get IP, sending notification without it.")
        }
      }
      const waitForSignals = new Promise((resolve) => setTimeout(resolve, VISIT_DELAY_MS))

      // Promise.all waits for BOTH: the IP (usually <1s) and the 5s window.
      // 📖 Learn: Promise.all — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
      await Promise.all([lookUpIp(), waitForSignals])
      flushVisit() // no-op if pagehide or unmount already sent it
    }

    sendVisit()

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("pagehide", reportBounceOnExit)
      window.removeEventListener("pagehide", flushVisit)
      // In-app navigation away from this page: send now with what we have
      // (case 3 above), then stop listening for input.
      flushVisit()
      humanSignals.stop()
    }
  }, [])
}
