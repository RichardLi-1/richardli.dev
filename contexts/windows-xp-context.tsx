"use client"
import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
// 📖 Learn: React Context pattern — https://react.dev/learn/passing-data-deeply-with-context

// Represents one open window on the XP desktop. Each window tracks its own
// position, size, z-index, and minimized/maximized state independently.
interface WindowXPWindow {
  id: string
  title: string
  content: React.ReactNode
  isMinimized: boolean
  isMaximized: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  // zIndex controls which window renders on top when windows overlap.
  // Higher values = closer to the viewer.
  zIndex: number
}

interface WindowsXPContextType {
  isXPMode: boolean
  toggleXPMode: () => void
  isPersonalized: boolean
  togglePersonalizedMode: () => void
  windows: WindowXPWindow[]
  openWindow: (window: Omit<WindowXPWindow, "id" | "zIndex">) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  focusWindow: (id: string) => void
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void
  updateWindowSize: (id: string, size: { width: number; height: number }) => void
  isStartMenuOpen: boolean
  toggleStartMenu: () => void
  isHighContrast: boolean
  toggleHighContrast: () => void
}

// Initializing context with `undefined` (instead of a default value) means any
// consumer that isn't wrapped in the provider will throw a clear error.
const WindowsXPContext = createContext<WindowsXPContextType | undefined>(undefined)

export function WindowsXPProvider({ children }: { children: React.ReactNode }) {
  const [isXPMode, setIsXPMode] = useState(false)
  // Lazy initializer: the function passed to useState runs only once on mount.
  // The `typeof window === "undefined"` guard prevents a crash during server-side
  // rendering, where localStorage doesn't exist.
  // 📖 Learn: lazy state initialization — https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state
  const [isPersonalized, setIsPersonalized] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("isPersonalized") === "true"
  })
  const [isHighContrast, setIsHighContrast] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("isHighContrast") === "true"
  })

  useEffect(() => {
    document.documentElement.classList.toggle("hc", isHighContrast)
  }, [isHighContrast])
  const [windows, setWindows] = useState<WindowXPWindow[]>([])
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false)
  // Starting at 1000 keeps XP windows above normal page content (z-index < 50).
  const [nextZIndex, setNextZIndex] = useState(1000)
  // Capture page load time once (no setter) to compute "time to XP mode" analytics.
  const [pageLoadTime] = useState(Date.now())

  // useCallback memoizes these handlers so child components that receive them as
  // props don't re-render unnecessarily when the provider re-renders.
  // 📖 Learn: useCallback — https://react.dev/reference/react/useCallback
  const toggleXPMode = useCallback(() => {
    setIsXPMode((prev) => {
      if (!prev) {
        const timeTaken = ((Date.now() - pageLoadTime) / 1000).toFixed(2)

        if (window.location.hostname !== "localhost" && !localStorage.getItem("skip_tracking")) {
          fetch(
            "https://discord.com/api/webhooks/1429248057027067925/Bmd9BlC5bE5QsPlskHhxiLjNjii9lVZ-C23wOmKF5tXLwugP_KRGyniYnIMTbZKtOLdX",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                content: `🖥️ **Windows XP Mode Activated**\n⏱️ Time taken: ${timeTaken} seconds after page load\n🕒 ${new Date().toLocaleString()}`,
              }),
            },
          ).catch(console.error)
        }

        const audio = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ytmp3free.cc_microsoft-windows-xp-startup-sound-youtubemp3free.org-jm7S6oGjDVJxF19pr1JBJX95evAsxg.mp3")
        audio.play().catch(console.error)
      } else {
        setWindows([])
        setIsStartMenuOpen(false)
        setNextZIndex(1000)
      }
      return !prev
    })
  }, [pageLoadTime])

  const togglePersonalizedMode = useCallback(() => {
    setIsPersonalized((prev) => {
      const next = !prev
      localStorage.setItem("isPersonalized", String(next))
      return next
    })
  }, [])

  const toggleHighContrast = useCallback(() => {
    setIsHighContrast((prev) => {
      const next = !prev
      localStorage.setItem("isHighContrast", String(next))
      return next
    })
  }, [])

  const openWindow = useCallback(
    (windowData: Omit<WindowXPWindow, "id" | "zIndex">) => {
      // Generate a random short ID for the new window. Using base-36 keeps it compact.
      const id = Math.random().toString(36).substr(2, 9)
      const newWindow: WindowXPWindow = {
        ...windowData,
        id,
        // Assign the current highest z-index so this new window appears on top.
        zIndex: nextZIndex,
      }
      setWindows((prev) => [...prev, newWindow])
      setNextZIndex((prev) => prev + 1)
    },
    [nextZIndex],
  )

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id))
  }, [])

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)))
  }, [])

  const maximizeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)))
  }, [])

  const focusWindow = useCallback(
    (id: string) => {
      // Bring the clicked window to the front by giving it the next z-index,
      // and un-minimize it in case it was minimized to the taskbar.
      setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: nextZIndex, isMinimized: false } : w)))
      setNextZIndex((prev) => prev + 1)
    },
    [nextZIndex],
  )

  const updateWindowPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, position } : w)))
  }, [])

  const updateWindowSize = useCallback((id: string, size: { width: number; height: number }) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, size } : w)))
  }, [])

  const toggleStartMenu = useCallback(() => {
    setIsStartMenuOpen((prev) => !prev)
  }, [])

  return (
    <WindowsXPContext.Provider
      value={{
        isXPMode,
        toggleXPMode,
        isPersonalized,
        togglePersonalizedMode,
        windows,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        focusWindow,
        updateWindowPosition,
        updateWindowSize,
        isStartMenuOpen,
        toggleStartMenu,
        isHighContrast,
        toggleHighContrast,
      }}
    >
      {children}
    </WindowsXPContext.Provider>
  )
}

// Custom hook that wraps useContext and throws a helpful error if used outside
// the provider — better than silently returning undefined.
export function useWindowsXP() {
  const context = useContext(WindowsXPContext)
  if (context === undefined) {
    throw new Error("useWindowsXP must be used within a WindowsXPProvider")
  }
  return context
}
