"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"

interface AnimatedHeaderProps {
  backHref: string
  backText: string
  rightLinks?: Array<{
    href: string
    text: string
    external?: boolean
  }>
}

export function AnimatedHeader({ backHref, backText, rightLinks = [] }: AnimatedHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50
      setIsScrolled(scrolled)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isScrolled ? "transform scale-95 translate-y-2" : "transform scale-100 translate-y-0"
      }`}
    >
      <div
        className={`mx-auto transition-all duration-500 ease-out ${
          isScrolled
            ? "max-w-md rounded-full backdrop-blur-xl bg-black/30 border border-gray-700/50 shadow-2xl animate-bounce"
            : "max-w-full rounded-none backdrop-blur-none bg-black border-b border-gray-800 shadow-none"
        }`}
      >
        <div className="flex items-center justify-between p-6">
          <Link href={backHref} className="flex items-center text-gray-400 transition-all hover:text-green-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {!isScrolled && backText}
          </Link>

          {!isScrolled && rightLinks.length > 0 && (
            <nav className="flex items-center space-x-4">
              {rightLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  className="flex items-center text-gray-400 transition-all hover:text-green-300"
                  rel={link.external ? "noreferrer" : undefined}
                >
                  {link.text}
                  {link.external && <ExternalLink className="ml-2 h-4 w-4" />}
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}
