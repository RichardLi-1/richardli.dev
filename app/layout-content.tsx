"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
// Lenis smooth/slow scroll disabled for now — re-enable the import + effect below to restore.
// import Lenis from "lenis"
import { WindowsXPProvider } from "@/contexts/windows-xp-context"
import { WindowsXPDesktop } from "@/components/windows-xp/desktop"
import { useWindowsXP } from "@/contexts/windows-xp-context"
import { GifLoadingScreen } from "@/components/gif-loading-screen"
import { ThemeProvider } from "@/components/theme-provider"
import { usePreserveM } from "@/hooks/use-preserve-m"
import { SwissGrid } from "@/components/swiss-grid"
import { Footer } from "@/components/footer"

// LayoutContent is a *separate* inner component so it can call useWindowsXP().
// That hook requires being inside <WindowsXPProvider>, so this can't be merged
// with LayoutClient (which renders the provider).
function LayoutContent({ children }: { children: React.ReactNode }) {
  usePreserveM()
  const { isXPMode, isPersonalized } = useWindowsXP()

  // Sync the "personalized" CSS class onto <body> whenever the toggle changes.
  // This lets global CSS target `.personalized` for cosmetic extras.
  useEffect(() => {
    document.body.classList.toggle("personalized", isPersonalized)
  }, [isPersonalized])
  // Loading screen temporarily disabled
  const [showLoading, setShowLoading] = useState(false)

  // ── Lenis smooth/slow scroll (disabled) ────────────────────────────
  // Refs to the custom scroller (.app-scroll-shell) and its inner content.
  // body has overflow:hidden, so this element — not window — is the real scroller.
  // const scrollShellRef = useRef<HTMLDivElement>(null)
  // const scrollContentRef = useRef<HTMLDivElement>(null)

  // Smooth + slowed scrolling via Lenis, wired to the custom scroller.
  // 📖 Learn: Lenis smooth scroll — https://github.com/darkroomengineering/lenis
  // useEffect(() => {
  //   const wrapper = scrollShellRef.current
  //   const content = scrollContentRef.current
  //   // In XP mode the shell isn't mounted, so the refs are null — skip.
  //   if (!wrapper || !content) return
  //
  //   const lenis = new Lenis({
  //     wrapper, // the scroll container (default would be window)
  //     content, // the element whose height drives the scrollable range
  //     // ── Feel: these three knobs control "how slow" scrolling feels ──
  //     lerp: 0.08, // catch-up speed; lower = smoother & slower to settle (default 0.1)
  //     wheelMultiplier: 0.8, // <1 shortens each wheel step, so the page moves less per scroll
  //     smoothWheel: true, // animate wheel/trackpad scrolling instead of jumping
  //     syncTouch: false, // leave touch devices on native scroll (Lenis touch usually feels worse)
  //     autoRaf: true, // let Lenis run its own requestAnimationFrame loop
  //   })
  //
  //   return () => lenis.destroy()
  // }, [isXPMode, showLoading]) // re-init if the shell remounts (e.g. leaving XP mode)

  // Skip the loading animation on subsequent visits within the same browser session.
  // sessionStorage persists for the tab's lifetime but clears when the tab closes.
  // 📖 Learn: sessionStorage vs localStorage — MDN Web Docs
  // useEffect(() => {
  //   if (sessionStorage.getItem('hasLoaded')) {
  //     setShowLoading(false)
  //   }
  // }, [])

  // const handleLoadingComplete = () => {
  //   sessionStorage.setItem('hasLoaded', '1')
  //   setShowLoading(false)
  // }

  return (
    <>
      {/* SwissGrid is always mounted; it renders nothing until Cmd+G is pressed */}
      <SwissGrid />
      {/* {showLoading && <GifLoadingScreen onComplete={handleLoadingComplete} />} */}
      {!showLoading && (
        <>
          {/* XP mode completely replaces the normal site with the desktop overlay */}
          {isXPMode && <WindowsXPDesktop />}
          {!isXPMode && (
            <div className="app-scroll-shell">
              {children}
              <Footer />
            </div>
          )}
        </>
      )}
    </>
  )
}

// Provider nesting order matters here:
//   ThemeProvider → WindowsXPProvider → LayoutContent
// Each inner layer can safely consume the context(s) provided by outer layers.
// 📖 Learn: React Context — https://react.dev/learn/passing-data-deeply-with-context
export function LayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
      <WindowsXPProvider>
        <LayoutContent>{children}</LayoutContent>
      </WindowsXPProvider>
    </ThemeProvider>
  )
}
