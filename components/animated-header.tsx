"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, Home, X, Sun, Moon, Linkedin, Github, Mail, Contrast, MessageCircle } from "lucide-react"
import { ChatBox } from "@/components/chat-box"
import { trackEvent } from "@/lib/track"

// Tooltip that appears below any element on hover (desktop only — no touch support needed)
function Tip({ label, children }: { label: string; children: React.ReactNode }) {
  const tipRef = useRef<HTMLSpanElement>(null)
  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => { if (tipRef.current) tipRef.current.style.opacity = "1" }}
      onMouseLeave={() => { if (tipRef.current) tipRef.current.style.opacity = "0" }}
    >
      {children}
      <span ref={tipRef} style={{
        position: "absolute", top: "calc(100% + 6px)", left: "50%",
        transform: "translateX(-50%)",
        background: "var(--card-bg)", border: "1px solid var(--border-2)",
        color: "var(--text-2)", fontSize: 11,
        fontFamily: "'Toronto Subway', sans-serif", letterSpacing: "0.04em",
        padding: "4px 8px", borderRadius: 8, whiteSpace: "nowrap",
        pointerEvents: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        opacity: 0, transition: "opacity 0.12s",
        zIndex: 100,
      }}>
        {label}
      </span>
    </span>
  )
}
import { useWindowsXP } from "@/contexts/windows-xp-context"
import { useTheme } from "next-themes"

interface NavItem {
  href: string
  label: string
  external?: boolean
  active?: boolean
}

// Props passed in by each page to customize the header's nav links and context
interface AnimatedHeaderProps {
  backHref?: string   // If set, shows a back arrow on mobile pointing here
  backText?: string   // Label for the back link (currently unused in PillNav)
  rightLinks?: Array<{ href: string; text: string; external?: boolean }> // Extra links appended to nav (e.g. live demo, source)
  isHomepage?: boolean  // Switches nav to homepage-specific items (Work, More)
  currentPage?: string  // Current route path — used to decide which nav items to show
}

export function AnimatedHeader({
  backHref,
  rightLinks = [],
  isHomepage = false,
  currentPage = "",
}: AnimatedHeaderProps) {
  // Hide the header entirely when rendered inside the split-pane project iframe (?panel=1)
  const [isPanel, setIsPanel] = useState(false)
  useEffect(() => { if (window.location.search.includes("panel=1")) setIsPanel(true) }, [])

  // Tracks whether the user has scrolled past 10px — triggers the glass pill style on desktop
  const [isScrolled, setIsScrolled] = useState(false)
  // True when viewport width < 768px — switches between desktop sticky header and mobile bottom pill
  const [isMobile, setIsMobile] = useState(false)
  // Prevents the theme toggle from rendering on the server (avoids hydration mismatch with next-themes)
  // 📖 Learn: hydration mismatch — https://nextjs.org/docs/messages/react-hydration-error
  const [mounted, setMounted] = useState(false)
  // Briefly true after theme toggle to fire the bounce animation on the sun/moon icon
  const [themeBounce, setThemeBounce] = useState(false)

  // ── Chat window state ──
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatPos, setChatPos] = useState({ x: 0, y: 0 })              // top-left position of the floating window
  const [chatSize, setChatSize] = useState({ w: 520, h: 540 })        // current dimensions
  const [chatDragOffset, setChatDragOffset] = useState({ x: 0, y: 0 }) // cursor offset from window corner at drag start
  const [isDraggingChat, setIsDraggingChat] = useState(false)
  const [isResizingChat, setIsResizingChat] = useState(false)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 520, h: 540 }) // snapshot of size + cursor at resize start
  // Ensures the window is only centered on the very first open, not re-centered on re-renders
  const chatInitialized = useRef(false)

  // ── Mobile sheet swipe-to-dismiss ──
  // Using refs (not state) so touch drag doesn't trigger React re-renders at 60fps.
  // 📖 Learn: direct DOM mutation vs. setState for animation — https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style
  const mobileSheetRef = useRef<HTMLDivElement>(null)
  const pillNavRef = useRef<HTMLDivElement>(null)  // ref to the pill nav wrapper so it can follow the sheet drag
  const sheetDragStartY = useRef(0)
  const sheetDragStartTime = useRef(0)

  const audioRef = useRef<HTMLAudioElement>(null)
  const pathname = usePathname()

  // Play a navigation sound on every page transition except the very first load.
  // sessionStorage persists across navigations within a tab (unlike useRef, which resets on remount).
  // 📖 Learn: sessionStorage vs localStorage — sessionStorage clears when the tab closes
  useEffect(() => {
    if (sessionStorage.getItem("nav_visited")) {
      audioRef.current?.play().catch(() => {})
    } else {
      sessionStorage.setItem("nav_visited", "1")
    }
  }, [pathname])

  const { isHighContrast, toggleHighContrast } = useWindowsXP()
  const { theme, setTheme } = useTheme()

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark")
    setThemeBounce(true)
    setTimeout(() => setThemeBounce(false), 400)
  }

  // Set mounted = true after first client render so theme-dependent UI can appear safely
  useEffect(() => { setMounted(true) }, [])

  // Keep isMobile in sync with window width; cleans up the listener on unmount
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Track scroll position to toggle the glass pill style on the desktop header
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Center the chat window on first open; skip re-centering on subsequent opens
  useEffect(() => {
    if (isChatOpen && !chatInitialized.current) {
      chatInitialized.current = true
      setChatPos({
        x: Math.max(20, (window.innerWidth - 520) / 2),
        y: Math.max(20, (window.innerHeight - 560) / 2),
      })
    }
  }, [isChatOpen])

  // While dragging: track mouse globally so the window follows even if cursor leaves the title bar
  useEffect(() => {
    if (!isDraggingChat) return
    const handleMove = (e: MouseEvent) => {
      setChatPos({
        x: Math.max(0, e.clientX - chatDragOffset.x),
        y: Math.max(0, e.clientY - chatDragOffset.y),
      })
    }
    const handleUp = () => setIsDraggingChat(false)
    document.addEventListener("mousemove", handleMove)
    document.addEventListener("mouseup", handleUp)
    return () => {
      document.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseup", handleUp)
    }
  }, [isDraggingChat, chatDragOffset])

  // While resizing: compute new dimensions from how far the cursor has moved since resize started
  useEffect(() => {
    if (!isResizingChat) return
    const handleMove = (e: MouseEvent) => {
      setChatSize({
        w: Math.max(320, resizeStart.w + (e.clientX - resizeStart.x)),
        h: Math.max(240, resizeStart.h + (e.clientY - resizeStart.y)),
      })
    }
    const handleUp = () => setIsResizingChat(false)
    document.addEventListener("mousemove", handleMove)
    document.addEventListener("mouseup", handleUp)
    return () => {
      document.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseup", handleUp)
    }
  }, [isResizingChat, resizeStart])

  // Builds the nav link list for the mobile pill.
  // Always Home + any extra links the page passed in via the `rightLinks` prop (e.g. live demo, source repo).
  const getNavItems = (): NavItem[] => {
    return [
      //{ href: "/", label: "Home" },
      { href: "/work", label: "Work" },
      { href: "/about", label: "About" },
      ...rightLinks.map(l => ({ href: l.href, label: l.text, external: l.external })),
    ]
  }

  const navItems = getNavItems()

  // Return nothing if inside the project split-pane iframe
  if (isPanel) return null

  // ── Mobile bottom pill ──
  // This is a fixed pill pinned to the bottom of the viewport on mobile.
  // It's a separate component defined inline so it can close over all the state above.
  const PillNav = () => (
    <div className="header-pill max-w-xl mx-auto rounded-full backdrop-blur-xl border shadow-2xl h-[54px]">
      <div className="flex items-center justify-between gap-2 p-3">
        {/* Left side: "RL" logo on homepage, back arrow on detail pages, nothing otherwise */}
        {isHomepage ? (
          <Link href="/" style={{ fontFamily: "'Toronto Subway', 'Toronto Subway', sans-serif", fontSize: "14px", color: "var(--text)", textDecoration: "none" }}>
            RL
          </Link>
        ) : (
          <Link href={"/"} style={{ color: "var(--text-3)", display: "flex", alignItems: "center" }}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        )}

        {/* Right side: nav links + social icons + toggles */}
        <div className="flex items-center gap-2">
          {/* Nav links from getNavItems(), but drop any that are labelled LinkedIn/GitHub
              since those are hardcoded as icon buttons below */}
          {navItems.filter(item => item.label.toLowerCase() !== "linkedin" && item.label.toLowerCase() !== "github").map((item, i) => (
            <a
              key={i}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="nav-item"
              style={{ fontSize: "14px", padding: "4px 8px" }}
            >
              {/* Render a home icon instead of the word "Home" to save space */}
              {item.label === "Home" ? <Home className="w-3 h-3" /> : item.label}
            </a>
          ))}
          {/* Social icons — always shown regardless of page */}
          <a onClick={() => trackEvent("🔗 LinkedIn clicked", { location: "mobile pill" })} href="https://www.linkedin.com/in/richardli0/" target="_blank" rel="noopener noreferrer" className="nav-item" style={{ padding: "4px 8px" }} aria-label="LinkedIn"><Linkedin className="w-3 h-3" /></a>
          <a onClick={() => trackEvent("🐙 GitHub clicked", { location: "mobile pill" })} href="https://github.com/RichardLi-1" target="_blank" rel="noopener noreferrer" className="nav-item" style={{ padding: "4px 8px" }} aria-label="GitHub"><Github className="w-3 h-3" /></a>
          {/* Theme-dependent buttons only render after mount to avoid hydration mismatch */}
          {mounted && (
            <>
              <button
                onClick={() => { setTheme(theme === "dark" ? "light" : "dark"); trackEvent("🌓 Theme toggled", { from: theme ?? "dark", location: "mobile pill" }) }}
                className="nav-item"
                style={{ padding: "4px 6px" }}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
              </button>
              <button
                onClick={() => { toggleHighContrast(); trackEvent("◑ High contrast toggled", { location: "mobile pill" }) }}
                className="nav-item"
                style={{ padding: "4px 6px", color: isHighContrast ? "var(--text)" : "var(--text-2)" }}
                aria-label="Toggle high contrast"
              >
                <Contrast className="w-3 h-3" />
              </button>
              <button
                onClick={() => { setIsChatOpen(true); trackEvent("💬 Chat opened", { location: "mobile pill" }) }}
                className="nav-item"
                style={{ padding: "4px 6px" }}
                aria-label="Open chat"
              >
                <MessageCircle className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Hidden audio element — src swapped at runtime for the nav click sound */}
      <audio ref={audioRef} src="/sounds/windows-navigation-start.mp3" preload="auto" style={{ display: "none" }} />

      {/* ── Mobile: fixed bottom pill ── */}
      {/* h-5 spacer pushes page content up so it isn't hidden behind the fixed pill */}
      {isMobile && (
        <div className="h-5">
          <div
            ref={pillNavRef}
            className="fixed left-0 right-0 p-4 z-[70]"
            style={{
              bottom: isChatOpen ? "50vh" : 0,
              transition: "bottom 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
            }}
          >
            <PillNav />
          </div>
        </div>
      )}

      {/* ── Chat window: bottom sheet on mobile, draggable window on desktop ── */}
      {isChatOpen && isMobile && (
        // Mobile: fixed bottom sheet, slides up to cover the bottom half of the screen.
        // z-index 62 keeps it above page content but below the pill nav (z-index 70).
        // borderRadius only on top corners — it's flush with the bottom edge.
        <div
          ref={mobileSheetRef}
          style={{
            position: "fixed",
            bottom: 0, left: 0,
            width: "100%",
            height: "50vh",
            zIndex: 62,
            display: "flex", flexDirection: "column",
            background: "var(--glass-bg)",
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
            border: "1px solid var(--border-2)",
            borderRadius: "20px 20px 0 0",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.35)",
            overflow: "hidden",
            animation: "slideUpSheet 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
          }}
        >
          {/* Title bar — swipe down here to dismiss the sheet.
              Touch handlers update the sheet + pill transforms directly via refs (no setState)
              so we get 60fps drag without React re-renders on every touchmove.
              📖 Learn: cubic-bezier spring — https://cubic-bezier.com/#.34,1.56,.64,1 */}
          <div
            onTouchStart={(e) => {
              sheetDragStartY.current = e.touches[0].clientY
              sheetDragStartTime.current = Date.now()
              // Disable CSS transitions while finger is down so the sheet follows instantly
              if (mobileSheetRef.current) mobileSheetRef.current.style.transition = "none"
              if (pillNavRef.current) pillNavRef.current.style.transition = "none"
            }}
            onTouchMove={(e) => {
              const dy = e.touches[0].clientY - sheetDragStartY.current
              // Only allow dragging downward (dy > 0); ignore upward swipes
              if (dy > 0) {
                if (mobileSheetRef.current) mobileSheetRef.current.style.transform = `translateY(${dy}px)`
                if (pillNavRef.current) pillNavRef.current.style.transform = `translateY(${dy}px)`
              }
            }}
            onTouchEnd={(e) => {
              const dy = e.changedTouches[0].clientY - sheetDragStartY.current
              const velocity = dy / (Date.now() - sheetDragStartTime.current) // px/ms
              const dismiss = "cubic-bezier(0.32, 0.72, 0, 1)"
              // Spring overshoot (for the sheet): goes slightly past translateY(0) then settles.
              // This overshoots upward which is fine on a bottom-pinned sheet.
              const sheetSpring = "cubic-bezier(0.34, 1.56, 0.64, 1)"
              // Plain deceleration (for the pill nav): no overshoot.
              // The spring curve would make the pill briefly shoot above its rest position and
              // then fall back down, which reads as a confusing "up then down" jitter in mid-screen.
              // 📖 Learn: iOS deceleration curve — cubic-bezier(0.25, 0.46, 0.45, 0.94)
              const pillEase = "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
              if (dy > 80 || velocity > 0.4) {
                // Animate out, then actually close
                if (mobileSheetRef.current) {
                  mobileSheetRef.current.style.transition = `transform 0.28s ${dismiss}`
                  mobileSheetRef.current.style.transform = "translateY(100%)"
                }
                if (pillNavRef.current) {
                  pillNavRef.current.style.transition = `transform 0.28s ${dismiss}`
                  pillNavRef.current.style.transform = "translateY(100%)"
                }
                setTimeout(() => {
                  setIsChatOpen(false)
                  // Reset transforms so the elements are clean when next opened
                  if (mobileSheetRef.current) { mobileSheetRef.current.style.transform = ""; mobileSheetRef.current.style.transition = "" }
                  if (pillNavRef.current) { pillNavRef.current.style.transform = ""; pillNavRef.current.style.transition = "" }
                }, 280)
              } else {
                // Sheet snaps back with spring (upward overshoot looks natural on a bottom sheet)
                if (mobileSheetRef.current) {
                  mobileSheetRef.current.style.transition = `transform 0.4s ${sheetSpring}`
                  mobileSheetRef.current.style.transform = "translateY(0)"
                }
                // Pill snaps back with plain ease-out — no overshoot so it doesn't jitter
                if (pillNavRef.current) {
                  pillNavRef.current.style.transition = `transform 0.35s ${pillEase}`
                  pillNavRef.current.style.transform = "translateY(0)"
                }
              }
            }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: "1px solid var(--border-2)",
              flexShrink: 0,
              cursor: "grab",
              touchAction: "none", // prevents the browser's own scroll-on-drag from competing
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span style={{ fontFamily: "'Toronto Subway', sans-serif", fontSize: 13, color: "var(--text)", letterSpacing: "0.03em" }}>Ask Richard anything</span>
              <span style={{ fontFamily: "'Toronto Subway', sans-serif", fontSize: 11, color: "var(--text-4)", letterSpacing: "0.04em" }}>Powered by Claude Haiku</span>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="nav-item"
              style={{ padding: "4px 6px", cursor: "pointer" }}
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div style={{ flex: 1, overflow: "hidden", padding: "16px 18px", minHeight: 0 }}>
            <ChatBox fullHeight />
          </div>
        </div>
      )}

      {isChatOpen && !isMobile && (
        // Desktop: draggable + resizable floating window (unchanged behaviour)
        <div
          style={{
            position: "fixed",
            left: chatPos.x,
            top: chatPos.y,
            zIndex: 61,
            width: chatSize.w,
            height: chatSize.h,
            display: "flex", flexDirection: "column",
            background: "var(--card-bg)",
            border: "1px solid var(--border-2)",
            borderRadius: 20,
            boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
            overflow: "hidden",
            // Disable text selection while dragging/resizing to avoid accidental highlights
            userSelect: isDraggingChat || isResizingChat ? "none" : "auto",
          }}
        >
          {/* Title bar — mousedown here starts a drag */}
          <div
            onMouseDown={e => {
              setChatDragOffset({ x: e.clientX - chatPos.x, y: e.clientY - chatPos.y })
              setIsDraggingChat(true)
            }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: "1px solid var(--border-2)",
              cursor: isDraggingChat ? "grabbing" : "grab",
              flexShrink: 0,
              userSelect: "none",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span style={{ fontFamily: "'Toronto Subway', sans-serif", fontSize: 13, color: "var(--text)", letterSpacing: "0.03em" }}>Ask Richard anything</span>
              <span style={{ fontFamily: "'Toronto Subway', sans-serif", fontSize: 11, color: "var(--text-4)", letterSpacing: "0.04em" }}>Powered by Claude Haiku</span>
            </div>
            {/* stopPropagation prevents the close button click from also starting a drag */}
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={() => setIsChatOpen(false)}
              className="nav-item"
              style={{ padding: "4px 6px", cursor: "pointer" }}
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Chat body — flex: 1 so it fills remaining height; minHeight: 0 prevents flex overflow */}
          <div style={{ flex: 1, overflow: "hidden", padding: "16px 18px", minHeight: 0 }}>
            <ChatBox fullHeight />
          </div>
          {/* SE corner resize handle — mousedown here starts a resize */}
          <div
            onMouseDown={e => {
              e.stopPropagation()
              setResizeStart({ x: e.clientX, y: e.clientY, w: chatSize.w, h: chatSize.h })
              setIsResizingChat(true)
            }}
            style={{
              position: "absolute", bottom: 0, right: 0,
              width: 18, height: 18,
              cursor: "se-resize",
              background: "linear-gradient(-45deg, var(--text-5) 30%, transparent 30%)",
              borderBottomRightRadius: 20,
            }}
          />
        </div>
      )}

      {/* ── Desktop: sticky top header ── */}
      {/* Not shown on mobile — PillNav handles mobile instead */}
      {!isMobile && (
        <header
          className="sticky top-0 z-50"
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            // Hide the bottom border once scrolled — the glass pill provides enough visual separation
            borderBottom: isScrolled ? "0px" : "1px solid var(--border-2)",
          }}
        >
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%", padding: "0 32px" }}>
            {/* ── Left pill: wordmark ── */}
            {/* Gains a glass background + border when the user scrolls */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 12px",
              borderRadius: "20px",
              border: isHighContrast ? "2px solid #fff" : isScrolled ? "1px solid rgba(255,255,255,0.18)" : "1px solid transparent",
              background: isHighContrast ? "#000" : isScrolled ? (theme === "dark" ? "linear-gradient(135deg, rgba(0,0,0,0.32), rgba(0,0,0,0.18))" : "linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,255,255,0.45))") : "transparent",
              backdropFilter: isHighContrast ? "none" : isScrolled ? "blur(24px) saturate(180%)" : "none",
              WebkitBackdropFilter: isHighContrast ? "none" : isScrolled ? "blur(24px) saturate(180%)" : "none",
              boxShadow: isHighContrast ? "none" : isScrolled ? "0 2px 20px rgba(0,0,0,0.2)" : "none",
              transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
            }}>
              <Link href="/" className="nav-logo">Richard Li</Link>
            </div>

            {/* ── Right pill: nav links + icon buttons + toggles ── */}
            {/* Desktop nav is hardcoded (Home, Work, Transit) — it doesn't use getNavItems() */}
            <ul style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              listStyle: "none",
              margin: 0,
              padding: "8px 12px",
              borderRadius: "20px",
              border: isHighContrast ? "2px solid #fff" : isScrolled ? "1px solid rgba(255,255,255,0.18)" : "1px solid transparent",
              background: isHighContrast ? "#000" : isScrolled ? (theme === "dark" ? "linear-gradient(135deg, rgba(0,0,0,0.32), rgba(0,0,0,0.18))" : "linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,255,255,0.45))") : "transparent",
              backdropFilter: isHighContrast ? "none" : isScrolled ? "blur(24px) saturate(180%)" : "none",
              WebkitBackdropFilter: isHighContrast ? "none" : isScrolled ? "blur(24px) saturate(180%)" : "none",
              boxShadow: isHighContrast ? "none" : isScrolled ? "0 2px 20px rgba(0,0,0,0.2)" : "none",
              transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
            }}>
              {[
                { href: "/", label: "Home" },
                { href: "/work", label: "Work" },
                { href: "/transit/fanning", label: "Transit" },
                // { href: "/about", label: "About" },
              ].map((item, i) => (
                <li key={i}>
                  <a href={item.href} className="nav-item">
                    {item.label}
                  </a>
                </li>
              ))}
              <li style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                <Tip label="Email"><a onClick={() => trackEvent("✉️ Email clicked", { location: "desktop nav" })} href="mailto:richardli0@outlook.com" className="nav-item" style={{ padding: "4px 8px" }} aria-label="Email"><Mail className="w-4 h-4" /></a></Tip>
                <Tip label="GitHub"><a onClick={() => trackEvent("🐙 GitHub clicked", { location: "desktop nav" })} href="https://github.com/RichardLi-1" target="_blank" rel="noopener noreferrer" className="nav-item" style={{ padding: "4px 8px" }} aria-label="GitHub"><Github className="w-4 h-4" /></a></Tip>
                <Tip label="LinkedIn"><a onClick={() => trackEvent("🔗 LinkedIn clicked", { location: "desktop nav" })} href="https://www.linkedin.com/in/richardli0/" target="_blank" rel="noopener noreferrer" className="nav-item" style={{ padding: "4px 8px" }} aria-label="LinkedIn"><Linkedin className="w-4 h-4" /></a></Tip>
              </li>
              {/* Theme-dependent buttons only render after mount */}
              {mounted && (
                <>
                  <li>
                    <Tip label={theme === "dark" ? "Light mode" : "Dark mode"}>
                      <button onClick={() => { handleThemeToggle(); trackEvent("🌓 Theme toggled", { from: theme ?? "dark", location: "desktop nav" }) }} className="nav-item" style={{ padding: "4px 6px" }} aria-label="Toggle theme">
                        <span style={{ display: "inline-block", animation: themeBounce ? "iconBounce 0.4s cubic-bezier(0.34,1.56,0.64,1)" : "none" }}>
                          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </span>
                      </button>
                    </Tip>
                  </li>
                  <li>
                    <Tip label="High contrast">
                      <button onClick={() => { toggleHighContrast(); trackEvent("◑ High contrast toggled", { location: "desktop nav" }) }} className="nav-item" style={{ padding: "4px 6px", color: isHighContrast ? "var(--text)" : "var(--text-2)" }} aria-label="Toggle high contrast">
                        <Contrast className="w-4 h-4" />
                      </button>
                    </Tip>
                  </li>
                  <li>
                    <Tip label="Ask Richard">
                      <button onClick={() => { setIsChatOpen(true); trackEvent("💬 Chat opened", { location: "desktop nav" }) }} className="nav-item" style={{ padding: "4px 6px" }} aria-label="Open chat">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </Tip>
                  </li>
                </>
              )}
            </ul>
          </div>
        </header>
      )}
    </>
  )
}
