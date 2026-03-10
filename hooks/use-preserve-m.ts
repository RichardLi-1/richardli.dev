"use client"

import { useEffect } from "react"

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
