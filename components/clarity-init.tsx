"use client"

import { useEffect } from "react"
import Clarity from "@microsoft/clarity"
import { whenIdle } from "@/lib/when-idle"

const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID

export function ClarityInit() {
  useEffect(() => {
    if (!clarityProjectId) return
    // Clarity records the session (it copies the page and watches every
    // change), so start it once the page has loaded and gone quiet rather than
    // in the middle of loading, where it made the first scroll choppy.
    return whenIdle(() => Clarity.init(clarityProjectId), { delay: 3000 })
  }, [])

  return null
}
