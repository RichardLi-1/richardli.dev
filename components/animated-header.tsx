"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Home, Menu, X, Sun, Moon, Linkedin, Github } from "lucide-react"
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [themeBounce, setThemeBounce] = useState(false)
  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark")
    setThemeBounce(true)
    setTimeout(() => setThemeBounce(false), 400)
  }
  const { isPersonalized, togglePersonalizedMode } = useWindowsXP()
  const { theme, setTheme } = useTheme()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(prev => prev ? window.scrollY > 30 : window.scrollY > 60)
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

  if (isPanel) return null

  // Compact pill used for scrolled state
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
          {navItems.map((item, i) => (
            <a
              key={i}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="nav-item"
              style={{ fontSize: "11px", padding: "4px 8px" }}
            >
              {item.label === "Home" ? <Home className="w-3 h-3" /> : item.label === "LinkedIn" ? <Linkedin className="w-3 h-3" /> : item.label === "GitHub" ? <Github className="w-3 h-3" /> : item.label}
            </a>
          ))}
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
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
          <PillNav />
        </div>
      )}

      {/* Desktop + mobile-unscrolled: single element so the container shape can animate */}
      {(!isScrolled || !isMobile) && (
        <header
          className="sticky top-0 z-50"
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            padding: isScrolled && !isMobile ? "0 12px" : "0",
            background: isScrolled && !isMobile ? "transparent" : "var(--bg)",
            transition: "padding 0.5s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          {/* Container: animates between full-width bar and centered pill using numeric values */}
          {!isMobile && (<div
            style={{
              flex: "1",
              maxWidth: isScrolled && !isMobile ? "480px" : "1200px",
              margin: "0 auto",
              height: isScrolled && !isMobile ? "auto" : "100%",
              borderRadius: isScrolled && !isMobile ? "9999px" : "0px",
              backdropFilter: isScrolled && !isMobile ? "blur(24px) saturate(180%)" : "blur(0px)",
              WebkitBackdropFilter: isScrolled && !isMobile ? "blur(24px) saturate(180%)" : "blur(0px)",
              background: isScrolled && !isMobile
                ? theme === "light"
                  ? "linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.45) 100%)"
                  : "linear-gradient(135deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.18) 100%)"
                : "transparent",
              borderStyle: "solid",
              borderWidth: "1px",
              borderTopColor: isScrolled && !isMobile ? (theme === "light" ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.18)") : "transparent",
              borderRightColor: isScrolled && !isMobile ? (theme === "light" ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.18)") : "transparent",
              borderBottomColor: theme === "light" ? (isScrolled && !isMobile ? "rgba(255,255,255,0.6)" : "var(--border-2)") : (isScrolled && !isMobile ? "rgba(255,255,255,0.18)" : "var(--border-2)"),
              borderLeftColor: isScrolled && !isMobile ? (theme === "light" ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.18)") : "transparent",
              boxShadow: isScrolled && !isMobile ? "0 2px 20px rgba(0,0,0,0.2)" : "none",
              transition: "max-width 0.65s cubic-bezier(0.34,1.56,0.64,1), border-radius 0.65s cubic-bezier(0.34,1.56,0.64,1), border-color 0.4s ease, backdrop-filter 0.4s ease, box-shadow 0.4s ease",
            }}
          >
            <div
              className={`flex items-center justify-between${isScrolled && !isMobile ? " scrolled-pill" : ""}`}
              style={{
                padding: isScrolled && !isMobile ? "10px 16px" : "0 32px",
                height: isScrolled && !isMobile ? "auto" : "100%",
                gap: isScrolled && !isMobile ? "8px" : "0",
                transition: "padding 0.7s ease-out",
              }}
            >
              {/* ── Left ── */}
              {isScrolled && !isMobile ? (
                /* Compact: back arrow + back destination label */
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginRight: "12px" }}>
                  {isHomepage ? (
                    <Link href="/" style={{ fontFamily: "'Toronto Subway', sans-serif", fontSize: "14px", color: "var(--text)", textDecoration: "none" }}>
                      RL
                    </Link>
                  ) : backHref ? (
                    <Link href={backHref} style={{ color: "var(--text-2)", display: "flex", alignItems: "center", gap: "5px", textDecoration: "none" }}>
                      <ArrowLeft className="h-4 w-4" />
                      <span style={{ fontFamily: "'Toronto Subway', sans-serif", fontSize: "13px", letterSpacing: "0.06em" }}>
                        {backText || "Home"}
                      </span>
                    </Link>
                  ) : null}
                </div>
              ) : (
                /* Full: avatar circle + wordmark + section */
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Toronto Subway', 'Toronto Subway', sans-serif", fontSize: "12px", color: "var(--text)" }}>RL</span>
                  </div>
                  <Link href="/" className="nav-logo">Richard Li</Link>
                  {sectionName && (
                    <Link href={currentPage.startsWith("/projects/") ? "/projects" : "/"} style={{ fontFamily: "'Toronto Subway', sans-serif", fontSize: "16px", letterSpacing: "0.08em", color: "var(--text-3)", textDecoration: "none" }}>
                      {sectionName}
                    </Link>
                  )}
                </div>
              )}

              {/* ── Right ── */}
              {isScrolled && !isMobile ? (
                /* Compact pill nav */
                <div className="flex items-center gap-2">
                  {navItems.filter(item => !item.external).map((item, i) => (
                    <a key={i} href={item.href}
                      className="nav-item" style={{ fontSize: "11px", padding: item.label === "Home" ? "4px 4px" : "4px 8px" }}>
                      {item.label === "Home" ? <Home className="w-3 h-3" /> : item.label}
                    </a>
                  ))}
                  <button onClick={togglePersonalizedMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isPersonalized ? "bg-green-600" : "bg-gray-600"}`}>
                    <span className="sr-only">Toggle personalized mode</span>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPersonalized ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                  {mounted && (
                    <button onClick={handleThemeToggle} className="nav-item" style={{ padding: "4px 6px" }} aria-label="Toggle theme">
                      <span style={{ display: "inline-block", animation: themeBounce ? "iconBounce 0.4s cubic-bezier(0.34,1.56,0.64,1)" : "none" }}>
                        {theme === "dark" ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                      </span>
                    </button>
                  )}
                </div>
              ) : isMobile ? (
                /* Mobile: theme + hamburger */
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  {mounted && (
                    <button onClick={handleThemeToggle} className="nav-item" aria-label="Toggle theme">
                      <span style={{ display: "inline-block", animation: themeBounce ? "iconBounce 0.4s cubic-bezier(0.34,1.56,0.64,1)" : "none" }}>
                        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      </span>
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
                    <span className="nav-item" style={{ background: "none", cursor: "default", color: isPersonalized ? "var(--text)" : "var(--text-3)" }}>
                      personalise
                    </span>
                    <button onClick={togglePersonalizedMode}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isPersonalized ? "bg-green-600" : "bg-gray-600"}`}>
                      <span className="sr-only">Toggle personalized mode</span>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPersonalized ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </li>
                  {/* Theme toggle */}
                  {mounted && (
                    <li>
                      <button onClick={handleThemeToggle} className="nav-item" style={{ padding: "4px 6px" }} aria-label="Toggle theme">
                        <span style={{ display: "inline-block", animation: themeBounce ? "iconBounce 0.4s cubic-bezier(0.34,1.56,0.64,1)" : "none" }}>
                          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </span>
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>)}
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
                  {item.label === "LinkedIn" ? <Linkedin className="w-4 h-4" /> : item.label === "GitHub" ? <Github className="w-4 h-4" /> : item.label}
                </a>
              ))}
              <button
                onClick={() => { togglePersonalizedMode(); setIsMobileMenuOpen(false) }}
                className={`nav-item${isPersonalized ? " active" : ""}`}
              >
                {isPersonalized ? "Personalised" : "Personalise"}
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
