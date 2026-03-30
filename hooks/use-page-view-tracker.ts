"use client"

import { useEffect, useRef } from "react"

export function usePageViewTracker() {
  const hasTracked = useRef(false)
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

      // Build navigation path trail
      const currentPath = window.location.pathname || "/"
      const stored = sessionStorage.getItem("nav_path")
      const pathHistory: string[] = stored ? JSON.parse(stored) : []
      if (pathHistory[pathHistory.length - 1] !== currentPath) {
        pathHistory.push(currentPath)
      }
      sessionStorage.setItem("nav_path", JSON.stringify(pathHistory))
      const pathTrail = pathHistory.join(" → ")

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

      const message = isBot
        ? `🤖 Bot/crawler on ${window.location.href}\n🛤️ Path: ${pathTrail}\n🕒 ${new Date().toLocaleString()}\n🌐 IP: ${ip}\n🔍 UA: ${navigator.userAgent}`
        : isLinkedIn
        ? `👀 New visitor on ${window.location.href} from **LinkedIn**\n${deviceType} · ${platform}\n🛤️ Path: ${pathTrail}\n🕒 ${new Date().toLocaleString()}\n🌐 IP: ${ip}`
        : `👀 New visitor on ${window.location.href}\n${deviceType} · ${platform}\n🛤️ Path: ${pathTrail}\n🕒 ${new Date().toLocaleString()}\n🌐 IP: ${ip}`

      try {
        await fetch(
          "https://discord.com/api/webhooks/1429248057027067925/Bmd9BlC5bE5QsPlskHhxiLjNjii9lVZ-C23wOmKF5tXLwugP_KRGyniYnIMTbZKtOLdX",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: message }),
          },
        )
      } catch (err) {
        console.error("Failed to send Discord notification:", err)
      }
    }

    sendVisit()

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])
}
