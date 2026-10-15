"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
// Lenis smooth/slow scroll disabled for now — re-enable the import + effect below to restore.
// import Lenis from "lenis"
import { WindowsXPProvider } from "@/contexts/windows-xp-context"
import { useWindowsXP } from "@/contexts/windows-xp-context"
import { GifLoadingScreen } from "@/components/gif-loading-screen"
import { ThemeProvider } from "@/components/theme-provider"
import { usePreserveM } from "@/hooks/use-preserve-m"
import { SwissGrid } from "@/components/swiss-grid"
import { Footer } from "@/components/footer"
import { AppLaunchRouteWatcher } from "@/components/app-launch"
import { whenIdle } from "@/lib/when-idle"

// ── Loaded later, so the first load stays light ─────────────────────────────
// A Lighthouse run showed the first scroll was choppy because hydration (React
// attaching its JavaScript to the server-rendered page) ran as one ~600ms block.
// next/dynamic splits each of these into its own file that's only downloaded
// when it first renders, and ssr: false skips them in the server HTML (they're
// all browser-only extras).
// 📖 Learn: next/dynamic, code splitting
const IPadCursor = dynamic(() => import("@/components/ipad-cursor").then((m) => m.IPadCursor), { ssr: false })
const AgentOrb = dynamic(() => import("@/components/agent-orb").then((m) => m.AgentOrb), { ssr: false })
const WebMcpTools = dynamic(() => import("@/components/webmcp-tools").then((m) => m.WebMcpTools), { ssr: false })
const ChatNudge = dynamic(() => import("@/components/chat-nudge").then((m) => m.ChatNudge), { ssr: false })

// LayoutContent is a *separate* inner component so it can call useWindowsXP().
// That hook requires being inside <WindowsXPProvider>, so this can't be merged
// with LayoutClient (which renders the provider).
function LayoutContent({ children }: { children: React.ReactNode }) {
  usePreserveM()
  const { isPersonalized } = useWindowsXP()
  // Windows XP is its own page now (app/xp), with none of the site's chrome
  const isXPPage = usePathname() === "/xp"

  // The extras mount once the page has loaded and the browser is idle, so they
  // don't compete with hydration and the first scroll. The native cursor shows
  // until then (a fraction of a second on a normal load).
  const [extrasReady, setExtrasReady] = useState(false)
  useEffect(() => whenIdle(() => setExtrasReady(true)), [])

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
      {/* iPadOS-style pointer; off in XP mode so the XP desktop keeps its own cursors */}
      {extrasReady && !isXPPage && <IPadCursor />}
      {/* Tells the iOS-style project launch animation when the new page has mounted */}
      <AppLaunchRouteWatcher />
      {/* The chatbot's orb form when it acts on the site ("Let Richard drive").
          Here in the layout so it survives page changes, e.g. during a tour. */}
      {extrasReady && !isXPPage && <AgentOrb />}
      {/* Tools AI agents in the browser can call (WebMCP); does nothing where unsupported */}
      {extrasReady && !isXPPage && <WebMcpTools />}
      {/* Once per visit: the chat button sends out a little orb to say hi */}
      {extrasReady && !isXPPage && <ChatNudge />}
      {/* {showLoading && <GifLoadingScreen onComplete={handleLoadingComplete} />} */}
      {!showLoading && (
        <>
          {/* The XP page is full-screen on its own; every other page gets the
              site's scroll shell and footer */}
          {isXPPage ? (
            children
          ) : (
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
