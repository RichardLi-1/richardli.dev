"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, Home, X, Sun, Moon, Linkedin, Github, Mail, Contrast, MessageCircle } from "lucide-react"
import { ChatBox } from "@/components/chat-box"

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

interface AnimatedHeaderProps {
  backHref?: string
  backText?: string
  rightLinks?: Array<{ href: string; text: string; external?: boolean }>
  isHomepage?: boolean
  currentPage?: string
}

export function AnimatedHeader({
  backHref,
  backText,
  rightLinks = [],
  isHomepage = false,
  currentPage = "",
}: AnimatedHeaderProps) {
  const [isPanel, setIsPanel] = useState(false)
  useEffect(() => { if (window.location.search.includes("panel=1")) setIsPanel(true) }, [])
  
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [themeBounce, setThemeBounce] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatPos, setChatPos] = useState({ x: 0, y: 0 })
  const [chatSize, setChatSize] = useState({ w: 520, h: 540 })
  const [chatDragOffset, setChatDragOffset] = useState({ x: 0, y: 0 })
  const [isDraggingChat, setIsDraggingChat] = useState(false)
  const [isResizingChat, setIsResizingChat] = useState(false)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 520, h: 540 })
  const chatInitialized = useRef(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const pathname = usePathname()

  // Play nav sound on every mount except the very first page load.
  // We use sessionStorage because the header remounts on every navigation
  // (it lives inside each page, not the root layout), so useRef resets each time.
  useEffect(() => {
    if (sessionStorage.getItem("nav_visited")) {
      audioRef.current?.play().catch(() => {})
    } else {
      sessionStorage.setItem("nav_visited", "1")
    }
  }, [pathname])

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark")
    setThemeBounce(true)
    setTimeout(() => setThemeBounce(false), 400)
  }
  const { isPersonalized, togglePersonalizedMode, isHighContrast, toggleHighContrast } = useWindowsXP()
  const { theme, setTheme } = useTheme()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isChatOpen && !chatInitialized.current) {
      chatInitialized.current = true
      setChatPos({
        x: Math.max(20, (window.innerWidth - 520) / 2),
        y: Math.max(20, (window.innerHeight - 560) / 2),
      })
    }
  }, [isChatOpen])

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

const getSectionName = () => {
    if (isHomepage) return ""
    if (currentPage.startsWith("/projects/")) return "Project"
    if (currentPage === "/projects") return "Work"
    if (currentPage.startsWith("/contact")) return "Contact"
    if (currentPage.startsWith("/more")) return "More"
    if (currentPage.startsWith("/transit/photography")) return "Photography"
    if (currentPage.startsWith("/transit/fanning")) return "Fanning"
    if (currentPage.startsWith("/transit")) return "Transit"
    return backText || ""
  }

  const getNavItems = (): NavItem[] => {
    if (isHomepage) {
      return [
        { href: "/projects", label: "Work" },
        { href: "/more", label: "More" },
      ]
    }
    if (currentPage.startsWith("/projects")) {
      return [
        { href: "/", label: "Home" },
        ...(currentPage !== "/projects" ? [{ href: "/projects", label: "Work" }] : []),
        ...rightLinks.map(l => ({ href: l.href, label: l.text, external: l.external })),
      ]
    }
    return [
      { href: "/", label: "Home" },
      ...rightLinks.map(l => ({ href: l.href, label: l.text, external: l.external })),
    ]
  }

  const navItems = getNavItems()

  if (isPanel) return null

  // Compact pill used for mobile
  const PillNav = () => (
    <div className="header-pill max-w-xl mx-auto rounded-full backdrop-blur-xl border shadow-2xl">
      <div className="flex items-center justify-between gap-2 p-3">
        {/* Left: logo / back */}
        {isHomepage ? (
          <Link href="/" style={{ fontFamily: "'Toronto Subway', 'Toronto Subway', sans-serif", fontSize: "14px", color: "var(--text)", textDecoration: "none" }}>
            RL
          </Link>
        ) : backHref ? (
          <Link href={backHref} style={{ color: "var(--text-3)", display: "flex", alignItems: "center" }}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        ) : null}
        
        {/* Right: compact nav + XP toggle + theme */}
        <div className="flex items-center gap-2">
          {navItems.filter(item => item.label.toLowerCase() !== "linkedin" && item.label.toLowerCase() !== "github").map((item, i) => (
            <a
              key={i}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="nav-item"
              style={{ fontSize: "14px", padding: "4px 8px" }}
            >
              {item.label === "Home" ? <Home className="w-3 h-3" /> : item.label}
            </a>
          ))}
          <a href="https://www.linkedin.com/in/richardli0/" target="_blank" rel="noopener noreferrer" className="nav-item" style={{ padding: "4px 8px" }} aria-label="LinkedIn"><Linkedin className="w-3 h-3" /></a>
          <a href="https://github.com/RichardLi-1" target="_blank" rel="noopener noreferrer" className="nav-item" style={{ padding: "4px 8px" }} aria-label="GitHub"><Github className="w-3 h-3" /></a>
          {/* Personalise toggle switch */}
          <button
            onClick={togglePersonalizedMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              isPersonalized ? "bg-green-600" : "bg-gray-600"
            }`}
          >
            <span className="sr-only">Toggle personalized mode</span>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPersonalized ? "translate-x-6" : "translate-x-1"}`} />
          </button>
          {/* Theme toggle */}
          {mounted && (
            <>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="nav-item"
                style={{ padding: "4px 6px" }}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
              </button>
              <button
                onClick={toggleHighContrast}
                className="nav-item"
                style={{ padding: "4px 6px", color: isHighContrast ? "var(--text)" : "var(--text-2)" }}
                aria-label="Toggle high contrast"
              >
                <Contrast className="w-3 h-3" />
              </button>
              <button
                onClick={() => setIsChatOpen(true)}
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
      {/* Hidden audio element for nav click sound */}
      <audio ref={audioRef} src="/sounds/windows-navigation-start.mp3" preload="auto" style={{ display: "none" }} />

      {/* Mobile scrolled: fixed pill at viewport bottom (separate element — position can't animate) ────────────────────── */}
      {isMobile && (
        <div className="h-5">
          <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
            <PillNav />
          </div>
        </div>
        
      )}

      {/* ────────────────────── Chat window (draggable) ────────────────────── */}
      {isChatOpen && (
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
            userSelect: isDraggingChat || isResizingChat ? "none" : "auto",
          }}
        >
          {/* Title bar — drag handle */}
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
          {/* Body */}
          <div style={{ flex: 1, overflow: "hidden", padding: "16px 18px", minHeight: 0 }}>
            <ChatBox fullHeight />
          </div>
          {/* Resize handle — SE corner */}
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

      {/* ────────────────────── Desktop ────────────────────── */}
      {!isMobile && (
        <header
          className="sticky top-0 z-50"
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            borderBottom: isScrolled? "0px" : "1px solid var(--border-2)",
          }}
        >
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%", padding: "0 32px" }}>
            {/* ── Left: wordmark ── */}
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
              {/* Avatar <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Toronto Subway', sans-serif", fontSize: "12px", color: "var(--text)" }}>RL</span>
              </div>*/}
              <Link href="/" className="nav-logo">Richard Li</Link>
            </div>

            {/* ── Right: nav + toggles ── */}
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
                { href: "/projects", label: "Work" },
                { href: "/transit/fanning", label: "Transit" },
                // { href: "/more", label: "More" },
              ].map((item, i) => (
                <li key={i}>
                  <a href={item.href} className="nav-item">
                    {item.label}
                  </a>
                </li>
              ))}
              <li style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                <Tip label="Email"><a href="mailto:richardli0@outlook.com" className="nav-item" style={{ padding: "4px 8px" }} aria-label="Email"><Mail className="w-4 h-4" /></a></Tip>
                <Tip label="GitHub"><a href="https://github.com/RichardLi-1" target="_blank" rel="noopener noreferrer" className="nav-item" style={{ padding: "4px 8px" }} aria-label="GitHub"><Github className="w-4 h-4" /></a></Tip>
                <Tip label="LinkedIn"><a href="https://www.linkedin.com/in/richardli0/" target="_blank" rel="noopener noreferrer" className="nav-item" style={{ padding: "4px 8px" }} aria-label="LinkedIn"><Linkedin className="w-4 h-4" /></a></Tip>
              </li>
              {mounted && (
                <>
                  <li>
                    <Tip label={theme === "dark" ? "Light mode" : "Dark mode"}>
                      <button onClick={handleThemeToggle} className="nav-item" style={{ padding: "4px 6px" }} aria-label="Toggle theme">
                        <span style={{ display: "inline-block", animation: themeBounce ? "iconBounce 0.4s cubic-bezier(0.34,1.56,0.64,1)" : "none" }}>
                          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </span>
                      </button>
                    </Tip>
                  </li>
                  <li>
                    <Tip label="High contrast">
                      <button onClick={toggleHighContrast} className="nav-item" style={{ padding: "4px 6px", color: isHighContrast ? "var(--text)" : "var(--text-2)" }} aria-label="Toggle high contrast">
                        <Contrast className="w-4 h-4" />
                      </button>
                    </Tip>
                  </li>
                  <li>
                    <Tip label="Ask Richard">
                      <button onClick={() => setIsChatOpen(true)} className="nav-item" style={{ padding: "4px 6px" }} aria-label="Open chat">
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
