"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Linkedin, Github, ArrowLeft, Home, ExternalLink } from "lucide-react"
import { useWindowsXP } from "@/contexts/windows-xp-context"

interface MobileHeaderProps {
  isHomepage?: boolean
  currentPage?: string
  backHref?: string
  backText?: string
  rightLinks?: Array<{ href: string; text: string; external?: boolean }>
}

export function MobileHeader({
  isHomepage = false,
  currentPage = "",
  backHref,
  backText,
  rightLinks = [],
}: MobileHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isXPMode, toggleXPMode } = useWindowsXP()

  // Scroll detection
  useEffect(() => {
    setIsScrolled(true)
  }, [])

  const closeMenu = () => setIsMenuOpen(false)

  // Contextual nav items
  const renderNavLinks = () => {
    if (isHomepage) {
      return (
        <>
          <Link href="/projects" onClick={closeMenu} className="hover:text-green-300 transition-colors">
            WORK
          </Link>
          <a
            href="https://www.linkedin.com/in/richardli0/"
            target="_blank"
            rel="noreferrer"
            onClick={closeMenu}
            className="hover:text-green-300 transition-colors flex items-center gap-1"
          >
            <Linkedin className="w-5 h-5" />
          </a>
          <a
            href="https://github.com/RichardLi-1"
            target="_blank"
            rel="noreferrer"
            onClick={closeMenu}
            className="hover:text-green-300 transition-colors flex items-center gap-1"
          >
            <Github className="w-5 h-5" />
          </a>
          <button
            onClick={toggleXPMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              isXPMode ? "bg-green-600" : "bg-gray-600"
            }`}
          >
            <span className="sr-only">Toggle XP Mode</span>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isXPMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </>
      )
    }

    return rightLinks.map((link, i) => (
      <a
        key={i}
        href={link.href}
        target={link.external ? "_blank" : undefined}
        rel={link.external ? "noreferrer" : undefined}
        onClick={closeMenu}
        className="hover:text-green-300 transition-colors flex items-center gap-1"
      >
        {link.text === "LINKEDIN" ? <Linkedin className="w-5 h-5" /> : link.text === "GITHUB" ? <Github className="w-5 h-5" /> : link.text}
      </a>
    ))
  }

  return (
    <>
      {/* Header */}
      <header
        className={`fixed left-0 right-0 z-50 mx-auto transition-all duration-500 ease-out
          ${isScrolled ? "bottom-4 top-auto" : "top-0 bottom-auto"}
        `}
      >
        <div
          className={`mx-4 rounded-full backdrop-blur-xl bg-black/60 border border-gray-700 shadow-lg transition-all duration-500 flex items-center justify-between p-4`}
        >
          {/* Left side */}
          {!isHomepage && backHref ? (
            <Link href={backHref} className="flex items-center gap-2 text-gray-400 hover:text-green-300" onClick={closeMenu}>
              <ArrowLeft className="w-5 h-5" /> {backText}
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2 text-green-400 font-bold">
              {isScrolled ? <Home className="w-5 h-5" /> : "RL"}
            </Link>
          )}

          {/* Right side */}
          {!isScrolled ? (
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-green-300 p-2">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          ) : (
            <nav className="flex items-center gap-4">{renderNavLinks()}</nav>
          )}
        </div>
      </header>

      {/* Mobile overlay menu */}
      {isMenuOpen && !isScrolled && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-6">
          {renderNavLinks()}
        </div>
      )}
    </>
  )
}
