"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Home, Mail, Github, Linkedin, Menu, X } from "lucide-react"
import { useWindowsXP } from "@/contexts/windows-xp-context"

interface AnimatedHeaderProps {
  backHref?: string
  backText?: string
  rightLinks?: Array<{
    href: string
    text: string
    external?: boolean
  }>
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
  const { isXPMode, toggleXPMode } = useWindowsXP()

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50
      setIsScrolled(scrolled)
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }

    handleResize()
    window.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Get contextual navigation based on current page
  const getContextualNav = () => {
    if (isHomepage) {
      return isScrolled ? (
        <>
          <Link
            href="/projects"
            className="text-gray-400 hover:text-green-300 transition-colors text-sm"
            onClick={closeMobileMenu}
          >
            {isMobile ? "Work" : "Work"}
          </Link>
          <Link
            href="/contact"
            className="text-gray-400 hover:text-green-300 transition-colors"
            onClick={closeMobileMenu}
          >
            {isMobile ? <Mail className="w-4 h-4" /> : <span className="text-sm">Contact</span>}
          </Link>
          <a
            href="https://www.linkedin.com/in/richardli0/"
            className="text-gray-400 hover:text-green-300 transition-colors"
            target="_blank"
            rel="noreferrer"
            onClick={closeMobileMenu}
          >
            {isMobile ? <Linkedin className="w-4 h-4" /> : <Linkedin className="w-3 h-3" />}
          </a>
          <a
            href="https://github.com/RichardLi-1"
            className="text-gray-400 hover:text-green-300 transition-colors"
            target="_blank"
            rel="noreferrer"
            onClick={closeMobileMenu}
          >
            {isMobile ? <Github className="w-4 h-4" /> : <Github className="w-3 h-3" />}
          </a>
          <button
            onClick={toggleXPMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
              isXPMode ? "bg-green-600" : "bg-gray-600"
            }`}
          >
            <span className="sr-only">Toggle Windows XP mode</span>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isXPMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </>
      ) : (
        <>
          <Link href="/projects" className="hover:text-green-300 transition-colors" onClick={closeMobileMenu}>
            WORK
          </Link>
          <Link href="/contact" className="hover:text-green-300 transition-colors" onClick={closeMobileMenu}>
            {isMobile ? <Mail className="w-5 h-5" /> : "CONTACT"}
          </Link>
          <a
            href="https://www.linkedin.com/in/richardli0/"
            className="hover:text-green-300 transition-colors flex items-center gap-1"
            target="_blank"
            rel="noreferrer"
            onClick={closeMobileMenu}
          >
            {isMobile ? (
              <Linkedin className="w-5 h-5" />
            ) : (
              <>
                LINKEDIN <ExternalLink className="w-3 h-3" />
              </>
            )}
          </a>
          <a
            href="https://github.com/RichardLi-1"
            className="hover:text-green-300 transition-colors flex items-center gap-1"
            target="_blank"
            rel="noreferrer"
            onClick={closeMobileMenu}
          >
            {isMobile ? (
              <Github className="w-5 h-5" />
            ) : (
              <>
                GITHUB <ExternalLink className="w-3 h-3" />
              </>
            )}
          </a>
          <div className="flex items-center space-x-2">
            <span className={`text-sm transition-colors ${isXPMode ? "text-green-300" : "text-gray-400"}`}>
              {"click here!"}
            </span>
            <button
              onClick={toggleXPMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                isXPMode ? "bg-green-600" : "bg-gray-600"
              }`}
            >
              <span className="sr-only">Toggle Windows XP mode</span>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isXPMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </>
      )
    }

    // For project pages
    if (currentPage.includes("/projects")) {
      return isScrolled ? (
        <>
          <Link href="/" className="text-gray-400 hover:text-green-300 transition-colors" onClick={closeMobileMenu}>
            <Home className="w-3 h-3" />
          </Link>
          {!currentPage.includes("/projects/") && (
            <Link
              href="/contact"
              className="text-gray-400 hover:text-green-300 transition-colors"
              onClick={closeMobileMenu}
            >
              {isMobile ? <Mail className="w-4 h-4" /> : <span className="text-sm">Contact</span>}
            </Link>
          )}
          {currentPage.includes("/projects/") && (
            <Link
              href="/projects"
              className="text-gray-400 hover:text-green-300 transition-colors text-sm"
              onClick={closeMobileMenu}
            >
              Work
            </Link>
          )}
          <a
            href="https://www.linkedin.com/in/richardli0/"
            className="text-gray-400 hover:text-green-300 transition-colors"
            target="_blank"
            rel="noreferrer"
            onClick={closeMobileMenu}
          >
            {isMobile ? <Linkedin className="w-4 h-4" /> : <Linkedin className="w-3 h-3" />}
          </a>
          <a
            href="https://github.com/RichardLi-1"
            className="text-gray-400 hover:text-green-300 transition-colors"
            target="_blank"
            rel="noreferrer"
            onClick={closeMobileMenu}
          >
            {isMobile ? <Github className="w-4 h-4" /> : <Github className="w-3 h-3" />}
          </a>
          <button
            onClick={toggleXPMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
              isXPMode ? "bg-green-600" : "bg-gray-600"
            }`}
          >
            <span className="sr-only">Toggle Windows XP mode</span>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isXPMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </>
      ) : (
        rightLinks.map((link, index) => (
          <a
            key={index}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            className="flex items-center text-gray-400 transition-all hover:text-green-300"
            rel={link.external ? "noreferrer" : undefined}
            onClick={closeMobileMenu}
          >
            {isMobile && link.text === "CONTACT" ? (
              <Mail className="w-5 h-5" />
            ) : isMobile && link.text === "LINKEDIN" ? (
              <Linkedin className="w-5 h-5" />
            ) : isMobile && link.text === "GITHUB" ? (
              <Github className="w-5 h-5" />
            ) : (
              <>
                {link.text}
                {link.external && !isMobile && <ExternalLink className="ml-2 h-4 w-4" />}
              </>
            )}
          </a>
        ))
      )
    }

    // For contact page
    if (currentPage.includes("/contact")) {
      return isScrolled ? (
        <>
          <Link href="/" className="text-gray-400 hover:text-green-300 transition-colors" onClick={closeMobileMenu}>
            <Home className="w-3 h-3" />
          </Link>
          <Link
            href="/projects"
            className="text-gray-400 hover:text-green-300 transition-colors text-sm"
            onClick={closeMobileMenu}
          >
            Work
          </Link>
          <a
            href="https://www.linkedin.com/in/richardli0/"
            className="text-gray-400 hover:text-green-300 transition-colors"
            target="_blank"
            rel="noreferrer"
            onClick={closeMobileMenu}
          >
            {isMobile ? <Linkedin className="w-4 h-4" /> : <Linkedin className="w-3 h-3" />}
          </a>
          <a
            href="https://github.com/RichardLi-1"
            className="text-gray-400 hover:text-green-300 transition-colors"
            target="_blank"
            rel="noreferrer"
            onClick={closeMobileMenu}
          >
            {isMobile ? <Github className="w-4 h-4" /> : <Github className="w-3 h-3" />}
          </a>
          <button
            onClick={toggleXPMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
              isXPMode ? "bg-green-600" : "bg-gray-600"
            }`}
          >
            <span className="sr-only">Toggle Windows XP mode</span>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isXPMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </>
      ) : (
        <>
          <Link href="/" className="hover:text-green-300 transition-colors" onClick={closeMobileMenu}>
            HOME
          </Link>
          <Link href="/projects" className="hover:text-green-300 transition-colors" onClick={closeMobileMenu}>
            WORK
          </Link>
          <a
            href="https://www.linkedin.com/in/richardli0/"
            className="hover:text-green-300 transition-colors flex items-center gap-1"
            target="_blank"
            rel="noreferrer"
            onClick={closeMobileMenu}
          >
            {isMobile ? (
              <Linkedin className="w-5 h-5" />
            ) : (
              <>
                LINKEDIN <ExternalLink className="w-3 h-3" />
              </>
            )}
          </a>
          <a
            href="https://github.com/RichardLi-1"
            className="hover:text-green-300 transition-colors flex items-center gap-1"
            target="_blank"
            rel="noreferrer"
            onClick={closeMobileMenu}
          >
            {isMobile ? (
              <Github className="w-5 h-5" />
            ) : (
              <>
                GITHUB <ExternalLink className="w-3 h-3" />
              </>
            )}
          </a>
          <div className="flex items-center space-x-2">
            <span className={`text-sm transition-colors ${isXPMode ? "text-green-300" : "text-gray-400"}`}>
              {"click here!"}
            </span>
            <button
              onClick={toggleXPMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                isXPMode ? "bg-green-600" : "bg-gray-600"
              }`}
            >
              <span className="sr-only">Toggle Windows XP mode</span>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isXPMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </>
      )
    }

    // Default navigation
    return isScrolled ? (
      <>
        <Link href="/" className="text-gray-400 hover:text-green-300 transition-colors" onClick={closeMobileMenu}>
          <Home className="w-3 h-3" />
        </Link>
        <Link
          href="/contact"
          className="text-gray-400 hover:text-green-300 transition-colors"
          onClick={closeMobileMenu}
        >
          {isMobile ? <Mail className="w-4 h-4" /> : <span className="text-sm">Contact</span>}
        </Link>
        <a
          href="https://www.linkedin.com/in/richardli0/"
          className="text-gray-400 hover:text-green-300 transition-colors"
          target="_blank"
          rel="noreferrer"
          onClick={closeMobileMenu}
        >
          {isMobile ? <Linkedin className="w-4 h-4" /> : <Linkedin className="w-3 h-3" />}
        </a>
        <a
          href="https://github.com/RichardLi-1"
          className="text-gray-400 hover:text-green-300 transition-colors"
          target="_blank"
          rel="noreferrer"
          onClick={closeMobileMenu}
        >
          {isMobile ? <Github className="w-4 h-4" /> : <Github className="w-3 h-3" />}
        </a>
        <button
          onClick={toggleXPMode}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
            isXPMode ? "bg-green-600" : "bg-gray-600"
          }`}
        >
          <span className="sr-only">Toggle Windows XP mode</span>
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isXPMode ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </>
    ) : (
      rightLinks.map((link, index) => (
        <a
          key={index}
          href={link.href}
          target={link.external ? "_blank" : undefined}
          className="flex items-center text-gray-400 transition-all hover:text-green-300"
          rel={link.external ? "noreferrer" : undefined}
          onClick={closeMobileMenu}
        >
          {isMobile && link.text === "CONTACT" ? (
            <Mail className="w-5 h-5" />
          ) : isMobile && link.text === "LINKEDIN" ? (
            <Linkedin className="w-5 h-5" />
          ) : isMobile && link.text === "GITHUB" ? (
            <Github className="w-5 h-5" />
          ) : (
            <>
              {link.text}
              {link.external && !isMobile && <ExternalLink className="ml-2 h-4 w-4" />}
            </>
          )}
        </a>
      ))
    )
  }

  return (
    <>
      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${isScrolled ? "p-4" : "p-0"}`}
      >
        <div
          className={`mx-auto transition-all duration-700 ease-out ${
            isScrolled
              ? "max-w-sm rounded-full backdrop-blur-xl bg-black/40 border border-gray-600/30 shadow-2xl transform scale-95"
              : "max-w-full rounded-none backdrop-blur-none bg-black border-b border-gray-800 shadow-none transform scale-100"
          }`}
        >
          <div
            className={`flex items-center justify-between transition-all duration-700 ${isScrolled ? "p-3" : "p-6"}`}
          >
            {/* Left side */}
            {!isHomepage && backHref && (
              <Link href={backHref} className="flex items-center text-gray-400 transition-all hover:text-green-300">
                <ArrowLeft className={`h-4 w-4 transition-all ${isScrolled ? "mr-0" : "mr-2"}`} />
                {!isScrolled && backText}
              </Link>
            )}

            {isHomepage && (
              <div className="flex items-center space-x-4">
                {!isScrolled && (
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                    <span className="text-green-400 font-bold">RL</span>
                  </div>
                )}
              </div>
            )}

            {/* Right side navigation */}
            {isMobile && !isScrolled ? (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-400 hover:text-green-300 transition-colors p-2"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            ) : (
              <nav
                className={`flex items-center transition-all duration-700 ${isScrolled ? "space-x-2" : "space-x-8"}`}
              >
                {getContextualNav()}
              </nav>
            )}
          </div>
        </div>
      </header>

      {isMobile && isMobileMenuOpen && !isScrolled && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={closeMobileMenu}>
          <div className="absolute top-20 left-0 right-0 bg-black border-b border-gray-800 shadow-2xl">
            <nav className="flex flex-col items-center space-y-6 py-8">{getContextualNav()}</nav>
          </div>
        </div>
      )}
    </>
  )
}
