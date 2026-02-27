"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Home, Menu, X, Sun, Moon } from "lucide-react"
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
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { isXPMode, toggleXPMode } = useWindowsXP()
  const { theme, setTheme } = useTheme()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false)
    }
    handleResize()
    window.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

const getSectionName = () => {
    if (isHomepage) return ""
    if (currentPage.startsWith("/projects/")) return "Project"
    if (currentPage === "/projects") return "Work"
    if (currentPage.startsWith("/contact")) return "Contact"
    if (currentPage.startsWith("/more")) return "More"
    if (currentPage.startsWith("/transit/photography")) return "Photography"
    if (currentPage.startsWith("/transit")) return "Transit"
    return backText || ""
  }

  const getNavItems = (): NavItem[] => {
    if (isHomepage) {
      return [
        { href: "/projects", label: "Work" },
        { href: "/more", label: "More" },
        { href: "https://www.linkedin.com/in/richardli0/", label: "LinkedIn", external: true },
        { href: "https://github.com/RichardLi-1", label: "GitHub", external: true },
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
  const sectionName = getSectionName()

  // Compact pill used for scrolled state
  const PillNav = () => (
    <div className="header-pill max-w-sm mx-auto rounded-full backdrop-blur-xl border shadow-2xl">
      <div className="flex items-center justify-between gap-2 p-3">
        {/* Left: logo / back */}
        {isHomepage ? (
          <Link href="/" style={{ fontFamily: "'SFCamera', 'Toronto Subway', sans-serif", fontSize: "14px", color: "var(--text)", textDecoration: "none" }}>
            RL
          </Link>
        ) : backHref ? (
          <Link href={backHref} style={{ color: "var(--text-3)", display: "flex", alignItems: "center" }}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        ) : null}

        {/* Right: compact nav + XP toggle + theme */}
        <div className="flex items-center gap-2">
          {navItems.map((item, i) => (
            <a
              key={i}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="nav-item"
              style={{ fontSize: "11px", padding: "4px 8px" }}
            >
              {item.label === "Home" ? <Home className="w-3 h-3" /> : item.label}
            </a>
          ))}
          {/* XP toggle switch */}
          <button
            onClick={toggleXPMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              isXPMode ? "bg-green-600" : "bg-gray-600"
            }`}
          >
            <span className="sr-only">Toggle Windows XP mode</span>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isXPMode ? "translate-x-6" : "translate-x-1"}`} />
          </button>
          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="nav-item"
              style={{ padding: "4px 6px" }}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile scrolled: fixed pill at viewport bottom (separate element — position can't animate) */}
      {isScrolled && isMobile && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
          <PillNav />
        </div>
      )}

      {/* Desktop + mobile-unscrolled: single element so the container shape can animate */}
      {(!isScrolled || !isMobile) && (
        <header
          className="sticky top-0 z-50"
          style={{
            padding: isScrolled && !isMobile ? "12px 16px" : "0",
            background: isScrolled && !isMobile ? "transparent" : "var(--bg)",
            borderBottom: isScrolled && !isMobile ? "none" : "1px solid var(--border-2)",
            transition: "padding 0.7s ease-out, background 0.7s ease-out, border-color 0.7s ease-out",
          }}
        >
          {/* Container: animates between full-width bar and centered pill using numeric values */}
          <div
            style={{
              maxWidth: isScrolled && !isMobile ? "384px" : "1200px",
              margin: "0 auto",
              borderRadius: isScrolled && !isMobile ? "9999px" : "0px",
              backdropFilter: isScrolled && !isMobile ? "blur(20px)" : "blur(0px)",
              WebkitBackdropFilter: isScrolled && !isMobile ? "blur(20px)" : "blur(0px)",
              background: isScrolled && !isMobile ? "var(--glass-bg)" : "transparent",
              border: isScrolled && !isMobile ? "1px solid var(--border-2)" : "1px solid transparent",
              boxShadow: isScrolled && !isMobile ? "0 8px 32px rgba(0,0,0,0.12)" : "none",
              transition: "max-width 0.7s ease-out, border-radius 0.7s ease-out, backdrop-filter 0.7s ease-out, background 0.5s ease-out, box-shadow 0.5s ease-out",
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{
                padding: isScrolled && !isMobile ? "10px 16px" : "0 32px",
                height: isScrolled && !isMobile ? "auto" : "64px",
                gap: isScrolled && !isMobile ? "8px" : "0",
                transition: "padding 0.7s ease-out, height 0.7s ease-out",
              }}
            >
              {/* ── Left ── */}
              {isScrolled && !isMobile ? (
                /* Compact: RL or back arrow */
                isHomepage ? (
                  <Link href="/" style={{ fontFamily: "'SFCamera', 'Toronto Subway', sans-serif", fontSize: "14px", color: "var(--text)", textDecoration: "none" }}>
                    RL
                  </Link>
                ) : backHref ? (
                  <Link href={backHref} style={{ color: "var(--text-3)", display: "flex", alignItems: "center" }}>
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                ) : null
              ) : (
                /* Full: avatar circle + wordmark + section */
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "'SFCamera', 'Toronto Subway', sans-serif", fontSize: "12px", color: "var(--text)" }}>RL</span>
                  </div>
                  <Link href="/" className="nav-logo">Richard Li</Link>
                  {sectionName && (
                    <span style={{ fontFamily: "'Toronto Subway', sans-serif", fontSize: "16px", letterSpacing: "0.08em", color: "var(--text-3)" }}>
                      {sectionName}
                    </span>
                  )}
                </div>
              )}

              {/* ── Right ── */}
              {isScrolled && !isMobile ? (
                /* Compact pill nav */
                <div className="flex items-center gap-2">
                  {navItems.map((item, i) => (
                    <a key={i} href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined}
                      className="nav-item" style={{ fontSize: "11px", padding: "4px 8px" }}>
                      {item.label === "Home" ? <Home className="w-3 h-3" /> : item.label}
                    </a>
                  ))}
                  <button onClick={toggleXPMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isXPMode ? "bg-green-600" : "bg-gray-600"}`}>
                    <span className="sr-only">Toggle Windows XP mode</span>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isXPMode ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                  {mounted && (
                    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className="nav-item" style={{ padding: "4px 6px" }} aria-label="Toggle theme">
                      {theme === "dark" ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              ) : isMobile ? (
                /* Mobile: theme + hamburger */
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  {mounted && (
                    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className="nav-item" aria-label="Toggle theme">
                      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                  )}
                  <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="nav-item">
                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                </div>
              ) : (
                /* Desktop full editorial nav */
                <ul style={{ display: "flex", alignItems: "center", gap: "4px", listStyle: "none", margin: 0, padding: 0 }}>
                  {navItems.map((item, i) => (
                    <li key={i}>
                      <a href={item.href} target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                        className={`nav-item${item.active ? " active" : ""}`}>
                        {item.label}
                        {item.external && <ExternalLink className="w-3 h-3" style={{ opacity: 0.5 }} />}
                      </a>
                    </li>
                  ))}
                  {/* XP toggle + label */}
                  <li style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 6px" }}>
                    <span className="nav-item" style={{ background: "none", cursor: "default", color: isXPMode ? "var(--text)" : "var(--text-3)" }}>
                      personalise
                    </span>
                    <button onClick={toggleXPMode}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isXPMode ? "bg-green-600" : "bg-gray-600"}`}>
                      <span className="sr-only">Toggle Windows XP mode</span>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isXPMode ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </li>
                  {/* Theme toggle */}
                  {mounted && (
                    <li>
                      <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "0 6px", color: "var(--text-3)", transition: "color 0.15s", display: "flex", alignItems: "center" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
                        aria-label="Toggle theme">
                        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Mobile menu overlay */}
      {isMobile && isMobileMenuOpen && !isScrolled && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-sm"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="absolute left-0 right-0 shadow-2xl"
            style={{ top: "65px", background: "var(--bg)", borderBottom: "1px solid var(--border-2)" }}
            onClick={e => e.stopPropagation()}
          >
            <nav style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "20px 0" }}>
              {navItems.map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="nav-item"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <button
                onClick={() => { toggleXPMode(); setIsMobileMenuOpen(false) }}
                className={`nav-item${isXPMode ? " active" : ""}`}
              >
                {isXPMode ? "XP On" : "XP Off"}
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
