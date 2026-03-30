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

function LayoutContent({ children }: { children: React.ReactNode }) {
  usePreserveM()
  const { isXPMode, isPersonalized } = useWindowsXP()

  useEffect(() => {
    document.body.classList.toggle("personalized", isPersonalized)
  }, [isPersonalized])
  const [showLoading, setShowLoading] = useState(true)

  useEffect(() => {
    if (sessionStorage.getItem('hasLoaded')) {
      setShowLoading(false)
    }
  }, [])

  const handleLoadingComplete = () => {
    sessionStorage.setItem('hasLoaded', '1')
    setShowLoading(false)
  }

  return (
    <>
      <SwissGrid />
      {showLoading && <GifLoadingScreen onComplete={handleLoadingComplete} />}
      {!showLoading && (
        <>
          {isXPMode && <WindowsXPDesktop />}
          {!isXPMode && <>{children}<Footer /></>}
        </>
      )}
    </>
  )
}

export function LayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <WindowsXPProvider>
        <LayoutContent>{children}</LayoutContent>
      </WindowsXPProvider>
    </ThemeProvider>
  )
}
