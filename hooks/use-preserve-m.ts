"use client"

import { useEffect } from "react"

// The `?m` parameter signals that this visitor should NOT be tracked by the
// analytics webhook (e.g. Richard visiting his own site from his phone).
//
// The problem: Next.js client-side navigation doesn't reload the page, so ?m
// gets lost when navigating between pages. This hook preserves it by:
//   1. On first load with ?m: storing a flag in sessionStorage.
//   2. On subsequent pages (no ?m in URL): re-injecting ?m into the URL via
//      history.replaceState so the tracker hook still sees it.
//
// history.replaceState updates the URL bar without triggering a navigation.
// 📖 Learn: history.replaceState — https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState
export function usePreserveM() {
  useEffect(() => {
    const hasM = new URLSearchParams(window.location.search).has("m")

    if (hasM) {
      sessionStorage.setItem("preserve_m", "1")
    } else if (sessionStorage.getItem("preserve_m")) {
      const url = new URL(window.location.href)
      url.searchParams.set("m", "")
      window.history.replaceState(null, "", url.toString())
    }
  }, [])
}
