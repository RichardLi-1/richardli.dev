"use client"

import { useEffect } from "react"

// The `?m` parameter signals that this visitor should NOT be tracked by the
// analytics webhook (e.g. Richard visiting his own site from his phone).
//
// When ?m is detected we immediately strip it from the URL (so it never shows)
// and write a flag to localStorage so all webhooks stay silent on this device
// permanently — no need to re-append ?m on every visit or navigation.
//
// localStorage persists across tabs and browser restarts, unlike sessionStorage.
// history.replaceState updates the URL bar without triggering a navigation.
// 📖 Learn: history.replaceState — https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState
export function usePreserveM() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has("m")) {
      // Persist the flag so future visits on this device are also silent.
      localStorage.setItem("skip_tracking", "1")

      // Strip ?m immediately — remove just that param, keep any others.
      params.delete("m")
      const newSearch = params.toString()
      const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : "") + window.location.hash
      window.history.replaceState(null, "", newUrl)
    }
  }, [])
}
