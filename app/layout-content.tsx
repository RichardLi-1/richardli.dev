"use client"
import type React from "react"
import { useState, useEffect } from "react"
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
  const [showLoading, setShowLoading] = useState(true)

  // Skip the loading animation on subsequent visits within the same browser session.
  // sessionStorage persists for the tab's lifetime but clears when the tab closes.
  // 📖 Learn: sessionStorage vs localStorage — MDN Web Docs
  useEffect(() => {
    if (sessionStorage.getItem('hasLoaded')) {
      setShowLoading(false)
    }
  }, [])

  const handleLoadingComplete = () => {
    // Mark this session as already loaded so the GIF won't replay on navigation.
    sessionStorage.setItem('hasLoaded', '1')
    setShowLoading(false)
  }

  return (
    <>
      {/* SwissGrid is always mounted; it renders nothing until Cmd+G is pressed */}
      <SwissGrid />
      {showLoading && <GifLoadingScreen onComplete={handleLoadingComplete} />}
      {!showLoading && (
        <>
          {/* XP mode completely replaces the normal site with the desktop overlay */}
          {isXPMode && <WindowsXPDesktop />}
          {!isXPMode && <>{children}<Footer /></>}
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
