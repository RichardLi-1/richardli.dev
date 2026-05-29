"use client"

import { useEffect } from "react"

// Cleans tracking/referral params out of the URL on every page.
//
// This hook runs in the root layout, so it's the ONE place guaranteed to fire on
// all pages — unlike usePageViewTracker, whose param-stripping sits behind several
// early returns (localhost, skip_tracking, etc.) and only runs on tracked pages.
// That's why a referral param like ?z could "stick" before: if tracking was
// skipped, nothing ever cleaned the URL. Doing it here makes stripping reliable.
//
// Functional params that pages actually read must survive — list them in KEEP.
const KEEP = new Set(["panel"]) // ?panel=1 tells child pages they're in the iframe
//
// localStorage persists across tabs and browser restarts, unlike sessionStorage.
// history.replaceState updates the URL bar without triggering a navigation.
// 📖 Learn: history.replaceState — https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState
export function usePreserveM() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    // ?m = "don't track me". Persist the flag so future visits stay silent too.
    if (params.has("m")) {
      localStorage.setItem("skip_tracking", "1")
    }

    // Strip everything that isn't in the keep-list (?m, ?z, ?utm_*, …all go).
    let changed = false
    for (const key of [...params.keys()]) { // spread first: deleting while iterating live keys() skips entries
      if (!KEEP.has(key)) {
        params.delete(key)
        changed = true
      }
    }

    if (changed) {
      const newSearch = params.toString()
      const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : "") + window.location.hash
      window.history.replaceState(null, "", newUrl)
    }
  }, [])
}
